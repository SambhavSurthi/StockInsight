import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, TrendingDown, Building2, Folder, BarChart3, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { API_ENDPOINTS } from '../config/api';
import { fetchMultipleCompaniesSequentially } from '../utils/priceDataService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [futureAnalysis, setFutureAnalysis] = useState([]);
  const [portfolioPrices, setPortfolioPrices] = useState({});
  const [futurePrices, setFuturePrices] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchStats = async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      
      // Fetch portfolio and future analysis
      const [portfolioRes, futureRes] = await Promise.all([
        fetch(API_ENDPOINTS.PORTFOLIO.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (portfolioRes.status === 401 || futureRes.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setPortfolio(portfolioData);
        
        // Fetch prices for portfolio (2 days for today vs yesterday comparison)
        // Use a small cache-busting approach by adding a timestamp to ensure fresh data
        if (portfolioData.length > 0) {
          // Clear cache for dashboard stats to get fresh data
          const prices = await fetchMultipleCompaniesSequentially(
            portfolioData,
            2,
            token
          );
          // Ensure data is sorted by date (newest first)
          const sortedPrices = {};
          Object.keys(prices).forEach((screenerId) => {
            sortedPrices[screenerId] = [...prices[screenerId]].sort((a, b) => new Date(b.date) - new Date(a.date));
          });
          setPortfolioPrices(sortedPrices);
        }
      }

      if (futureRes.ok) {
        const futureData = await futureRes.json();
        setFutureAnalysis(futureData);
        
        // Fetch prices for future analysis (2 days for today vs yesterday comparison)
        if (futureData.length > 0) {
          const prices = await fetchMultipleCompaniesSequentially(
            futureData,
            2,
            token
          );
          // Ensure data is sorted by date (newest first)
          const sortedPrices = {};
          Object.keys(prices).forEach((screenerId) => {
            sortedPrices[screenerId] = [...prices[screenerId]].sort((a, b) => new Date(b.date) - new Date(a.date));
          });
          setFuturePrices(sortedPrices);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !query) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_ENDPOINTS.MARKET.SEARCH}?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );
        if (res.status === 401) {
          localStorage.removeItem('token');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to search companies');
        }
        const data = await res.json();
        setResults(Array.isArray(data) ? data.filter((item) => item.id) : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          toast.error(error.message || 'Search failed');
        }
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchResults, 300);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, navigate]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Portfolio stats
    const portfolioTotal = portfolio.length;
    
    // Today's profit/loss for portfolio with amounts
    // Prices are sorted newest first (most recent at index 0)
    const portfolioProfitCompanies = portfolio.map((c) => {
      const prices = portfolioPrices[c.screenerId] || [];
      if (prices.length < 2) return null;
      // Sort by date to ensure newest is first
      const sortedPrices = [...prices].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = sortedPrices[0];
      const yesterday = sortedPrices[1];
      if (today.price && yesterday.price && today.price > yesterday.price) {
        const profit = today.price - yesterday.price;
        const profitPercent = ((profit / yesterday.price) * 100).toFixed(2);
        return {
          company: c,
          profit,
          profitPercent,
          todayPrice: today.price,
          yesterdayPrice: yesterday.price,
          todayDate: today.dateLabel,
          yesterdayDate: yesterday.dateLabel,
        };
      }
      return null;
    }).filter(Boolean);
    
    const portfolioLossCompanies = portfolio.map((c) => {
      const prices = portfolioPrices[c.screenerId] || [];
      if (prices.length < 2) return null;
      // Sort by date to ensure newest is first
      const sortedPrices = [...prices].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = sortedPrices[0];
      const yesterday = sortedPrices[1];
      if (today.price && yesterday.price && today.price < yesterday.price) {
        const loss = today.price - yesterday.price;
        const lossPercent = ((loss / yesterday.price) * 100).toFixed(2);
        return {
          company: c,
          loss: Math.abs(loss),
          lossPercent: Math.abs(lossPercent),
          todayPrice: today.price,
          yesterdayPrice: yesterday.price,
          todayDate: today.dateLabel,
          yesterdayDate: yesterday.dateLabel,
        };
      }
      return null;
    }).filter(Boolean);

    // Future analysis stats with amounts
    const futureProfitCompanies = futureAnalysis.map((c) => {
      const prices = futurePrices[c.screenerId] || [];
      if (prices.length < 2) return null;
      // Sort by date to ensure newest is first
      const sortedPrices = [...prices].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = sortedPrices[0];
      const yesterday = sortedPrices[1];
      if (today.price && yesterday.price && today.price > yesterday.price) {
        const profit = today.price - yesterday.price;
        const profitPercent = ((profit / yesterday.price) * 100).toFixed(2);
        return {
          company: c,
          profit,
          profitPercent,
          todayPrice: today.price,
          yesterdayPrice: yesterday.price,
          todayDate: today.dateLabel,
          yesterdayDate: yesterday.dateLabel,
        };
      }
      return null;
    }).filter(Boolean);
    
    const futureLossCompanies = futureAnalysis.map((c) => {
      const prices = futurePrices[c.screenerId] || [];
      if (prices.length < 2) return null;
      // Sort by date to ensure newest is first
      const sortedPrices = [...prices].sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = sortedPrices[0];
      const yesterday = sortedPrices[1];
      if (today.price && yesterday.price && today.price < yesterday.price) {
        const loss = today.price - yesterday.price;
        const lossPercent = ((loss / yesterday.price) * 100).toFixed(2);
        return {
          company: c,
          loss: Math.abs(loss),
          lossPercent: Math.abs(lossPercent),
          todayPrice: today.price,
          yesterdayPrice: yesterday.price,
          todayDate: today.dateLabel,
          yesterdayDate: yesterday.dateLabel,
        };
      }
      return null;
    }).filter(Boolean);

    // Get reference date (most recent date from portfolio or future analysis)
    let referenceDate = null;
    if (portfolio.length > 0) {
      const firstCompanyPrices = portfolioPrices[portfolio[0]?.screenerId] || [];
      if (firstCompanyPrices.length > 0) {
        const sortedPrices = [...firstCompanyPrices].sort((a, b) => new Date(b.date) - new Date(a.date));
        referenceDate = sortedPrices[0]?.fullDateLabel || sortedPrices[0]?.dateLabel;
      }
    }
    if (!referenceDate && futureAnalysis.length > 0) {
      const firstCompanyPrices = futurePrices[futureAnalysis[0]?.screenerId] || [];
      if (firstCompanyPrices.length > 0) {
        const sortedPrices = [...firstCompanyPrices].sort((a, b) => new Date(b.date) - new Date(a.date));
        referenceDate = sortedPrices[0]?.fullDateLabel || sortedPrices[0]?.dateLabel;
      }
    }
    if (!referenceDate) {
      referenceDate = new Date().toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }

    // Most profit making category (portfolio)
    const categoryProfits = {};
    portfolioProfitCompanies.forEach((item) => {
      const catName = item.company.categoryId?.name || 'Uncategorized';
      categoryProfits[catName] = (categoryProfits[catName] || 0) + 1;
    });
    const mostProfitCategory = Object.entries(categoryProfits).sort((a, b) => b[1] - a[1])[0];

    return {
      portfolioTotal,
      portfolioProfit: portfolioProfitCompanies,
      portfolioLoss: portfolioLossCompanies,
      futureProfit: futureProfitCompanies,
      futureLoss: futureLossCompanies,
      mostProfitCategory: mostProfitCategory ? { name: mostProfitCategory[0], count: mostProfitCategory[1] } : null,
      totalCategories: new Set([...portfolio, ...futureAnalysis].map(c => c.categoryId?._id?.toString() || c.categoryId?.toString() || 'uncategorized')).size,
      totalCompanies: portfolioTotal + futureAnalysis.length,
      referenceDate,
    };
  }, [portfolio, futureAnalysis, portfolioPrices, futurePrices]);

  const handleSelectCompany = (company) => {
    navigate(`/company/${company.id}?name=${encodeURIComponent(company.name)}`);
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, iconColor = 'text-primary', bgColor = 'bg-primary/10', companies = null, referenceDate = null }) => (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">{title}</p>
            {referenceDate && (
              <p className="text-[10px] text-muted-foreground">Ref: {referenceDate}</p>
            )}
          </div>
          {companies && companies.length > 0 ? (
            <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
              {companies.slice(0, 3).map((item, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-medium">{item.company.name}</p>
                  {item.profit !== undefined ? (
                    <p className="text-green-500">+₹{item.profit.toFixed(2)} (+{item.profitPercent}%)</p>
                  ) : (
                    <p className="text-red-500">-₹{item.loss.toFixed(2)} (-{item.lossPercent}%)</p>
                  )}
                </div>
              ))}
              {companies.length > 3 && (
                <p className="text-[10px] text-muted-foreground">+{companies.length - 3} more</p>
              )}
            </div>
          ) : (
            <>
              <p className="mt-1 text-2xl font-bold">{value}</p>
              {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            </>
          )}
        </div>
        <div className={`rounded-full ${bgColor} p-3 ml-2`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold sm:text-2xl">Dashboard</h1>
        <p className="text-xs text-muted-foreground sm:text-sm">
          Overview of your portfolio and market insights.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        <label className="mb-2 flex items-center justify-between text-xs font-medium text-muted-foreground sm:text-sm">
          <span>Search company</span>
          <span className="text-[10px] sm:text-xs">Powered by Screener.in</span>
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 1 letter..."
            className="h-10 w-full rounded-full border border-input bg-background pl-9 pr-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="mt-3 max-h-72 space-y-1 overflow-y-auto rounded-lg border bg-background/60 p-1">
          {loading && (
            <div className="px-2 py-2 text-xs text-muted-foreground">Searching...</div>
          )}
          {!loading && query && results.length === 0 && (
            <div className="px-2 py-2 text-xs text-muted-foreground">
              No companies found for "{query}".
            </div>
          )}
          {!loading &&
            results.map((company) => (
              <button
                key={company.id}
                type="button"
                onClick={() => handleSelectCompany(company)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs sm:text-sm hover:bg-accent"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{company.name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    Screener ID: {company.id}
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>

      {loadingStats ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-muted-foreground">Loading statistics...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <StatCard
            icon={Building2}
            title="Total Companies (Portfolio)"
            value={stats.portfolioTotal}
            subtitle={`${futureAnalysis.length} in Future Analysis`}
            iconColor="text-primary"
            bgColor="bg-primary/10"
          />
          <StatCard
            icon={TrendingUp}
            title="Today's Profit (Portfolio)"
            value={stats.portfolioProfit.length}
            subtitle={`${stats.portfolioTotal > 0 ? ((stats.portfolioProfit.length / stats.portfolioTotal) * 100).toFixed(1) : 0}% of portfolio`}
            iconColor="text-green-500"
            bgColor="bg-green-500/10"
            companies={stats.portfolioProfit}
            referenceDate={stats.referenceDate}
          />
          <StatCard
            icon={TrendingDown}
            title="Today's Loss (Portfolio)"
            value={stats.portfolioLoss.length}
            subtitle={`${stats.portfolioTotal > 0 ? ((stats.portfolioLoss.length / stats.portfolioTotal) * 100).toFixed(1) : 0}% of portfolio`}
            iconColor="text-red-500"
            bgColor="bg-red-500/10"
            companies={stats.portfolioLoss}
            referenceDate={stats.referenceDate}
          />
          <StatCard
            icon={Folder}
            title="Most Profit Category"
            value={stats.mostProfitCategory?.name || 'N/A'}
            subtitle={stats.mostProfitCategory ? `${stats.mostProfitCategory.count} companies` : 'No data'}
            iconColor="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={TrendingUp}
            title="Today's Profit (Future)"
            value={stats.futureProfit.length}
            subtitle={futureAnalysis.length > 0 ? `${((stats.futureProfit.length / futureAnalysis.length) * 100).toFixed(1)}% of future list` : 'No data'}
            iconColor="text-green-500"
            bgColor="bg-green-500/10"
            companies={stats.futureProfit}
            referenceDate={stats.referenceDate}
          />
          <StatCard
            icon={TrendingDown}
            title="Today's Loss (Future)"
            value={stats.futureLoss.length}
            subtitle={futureAnalysis.length > 0 ? `${((stats.futureLoss.length / futureAnalysis.length) * 100).toFixed(1)}% of future list` : 'No data'}
            iconColor="text-red-500"
            bgColor="bg-red-500/10"
            companies={stats.futureLoss}
            referenceDate={stats.referenceDate}
          />
          <StatCard
            icon={Package}
            title="Total Categories"
            value={stats.totalCategories}
            subtitle="Across portfolio & future"
            iconColor="text-purple-500"
            bgColor="bg-purple-500/10"
          />
          <StatCard
            icon={BarChart3}
            title="Total Companies"
            value={stats.totalCompanies}
            subtitle="Portfolio + Future Analysis"
            iconColor="text-orange-500"
            bgColor="bg-orange-500/10"
          />
        </div>
      )}

    </div>
  );
};

export default Dashboard;
