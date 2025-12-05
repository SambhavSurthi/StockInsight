import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, Save, FolderOpen, X, Trash2, Folder } from 'lucide-react';
import ComparisonTable from '../components/ComparisonTable';
import ComparisonAreaChart from '../components/ComparisonAreaChart';
import ComparisonBarChart from '../components/ComparisonBarChart';
import DisplayModeSelector from '../components/DisplayModeSelector';
import ViewToggle from '../components/ViewToggle';
import ChartTypeToggle from '../components/ChartTypeToggle';
import { API_ENDPOINTS } from '../config/api';
import { fetchMultipleCompaniesSequentially } from '../utils/priceDataService';
import { useDataViewPreference, sortDataByPreference } from '../utils/useDataViewPreference';

const Compare = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [companies, setCompanies] = useState([]);
  const [prices, setPrices] = useState({});
  const [days, setDays] = useState(15);
  const [customDays, setCustomDays] = useState('');
  const [view, setView] = useState('graph');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [dataViewType] = useDataViewPreference();
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [categories, setCategories] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  const [futureAnalysis, setFutureAnalysis] = useState([]);
  const [displayMode, setDisplayMode] = useState('price');

  const token = localStorage.getItem('token');

  const effectiveDays = useMemo(() => {
    if (customDays && !isNaN(customDays) && Number(customDays) > 0) {
      return Math.max(7, Math.min(Number(customDays), 365));
    }
    return days;
  }, [days, customDays]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Load companies from location state if available
    if (location.state?.companies) {
      setCompanies(location.state.companies);
    }

    fetchSavedComparisons();
    fetchCategories();
    fetchPortfolioAndFuture();
  }, [navigate, token, location]);

  useEffect(() => {
    if (companies.length > 0) {
      fetchPrices();
    }
  }, [companies, effectiveDays]);

  const fetchSavedComparisons = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.COMPARISONS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedComparisons(data);
      }
    } catch {
      // Silent fail
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.CATEGORIES.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      // Silent fail
    }
  };

  const fetchPortfolioAndFuture = async () => {
    try {
      const [portfolioRes, futureRes] = await Promise.all([
        fetch(API_ENDPOINTS.PORTFOLIO.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (portfolioRes.ok) {
        const data = await portfolioRes.json();
        setPortfolio(data);
      }
      if (futureRes.ok) {
        const data = await futureRes.json();
        setFutureAnalysis(data);
      }
    } catch {
      // Silent fail
    }
  };

  const fetchPrices = async () => {
    if (!token || companies.length === 0) return;
    try {
      setLoading(true);
      
      const results = await fetchMultipleCompaniesSequentially(
        companies,
        effectiveDays,
        token,
        (current, total, companyName, success) => {
          // Show progress
          if (current === total) {
            toast.success(`Loaded data for ${total} companies`);
          }
        }
      );
      
      setPrices(results);
    } catch {
      toast.error('Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (screenerId) => {
    if (companies.length <= 2) {
      toast.error('You need at least 2 companies to compare');
      return;
    }
    setCompanies((prev) => prev.filter((c) => c.screenerId !== screenerId));
    toast.success('Company removed from comparison');
  };

  const handleSave = async () => {
    if (!saveName.trim()) {
      toast.error('Please enter a name for the comparison');
      return;
    }

    if (companies.length < 2 || companies.length > 3) {
      toast.error('You can only save comparisons with 2-3 companies');
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.COMPARISONS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: saveName.trim(),
          screenerIds: companies.map((c) => c.screenerId),
          companyNames: companies.map((c) => c.name),
          type: 'mixed',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Comparison saved successfully');
        setShowSaveModal(false);
        setSaveName('');
        fetchSavedComparisons();
      } else {
        toast.error(data.message || 'Failed to save comparison');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleLoad = async (comparison) => {
    if (companies.length > 0) {
      if (!window.confirm('Loading this comparison will replace the current one. Continue?')) {
        return;
      }
    }

    const loadedCompanies = comparison.screenerIds.map((id, idx) => ({
      screenerId: id,
      name: comparison.companyNames[idx] || `Company ${id}`,
    }));

    setCompanies(loadedCompanies);
    setShowLoadModal(false);
    toast.success('Comparison loaded');
  };

  const handleDeleteSaved = async (comparisonId) => {
    if (!window.confirm('Are you sure you want to delete this saved comparison?')) {
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.COMPARISONS.BY_ID(comparisonId), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success('Comparison deleted');
        fetchSavedComparisons();
      } else {
        toast.error('Failed to delete comparison');
      }
    } catch {
      toast.error('Server error');
    }
  };

  const handleCompareCategory = (categoryId) => {
    const categoryCompanies = [
      ...portfolio.filter((c) => (c.categoryId?._id || c.categoryId) === categoryId),
      ...futureAnalysis.filter((c) => (c.categoryId?._id || c.categoryId) === categoryId),
    ];

    if (categoryCompanies.length < 2) {
      toast.error('Category must have at least 2 companies to compare');
      return;
    }

    if (categoryCompanies.length > 3) {
      toast.error('Category has more than 3 companies. Please select manually.');
      return;
    }

    if (companies.length > 0) {
      if (!window.confirm('This will replace the current comparison. Continue?')) {
        return;
      }
    }

    const companiesData = categoryCompanies.map((c) => ({
      screenerId: c.screenerId,
      name: c.name,
    }));

    setCompanies(companiesData);
    setShowCategoryModal(false);
    toast.success('Category companies loaded');
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (companies.length === 0) return [];

    // Get all unique dates
    const dateSet = new Set();
    companies.forEach((c) => {
      (prices[c.screenerId] || []).forEach((r) => dateSet.add(r.dateLabel));
    });

    // Create a date map for sorting
    const dateMap = new Map();
    companies.forEach((c) => {
      (prices[c.screenerId] || []).forEach((r) => {
        if (!dateMap.has(r.dateLabel)) {
          dateMap.set(r.dateLabel, r.date);
        }
      });
    });

    const sortedDates = Array.from(dateSet).sort((a, b) => {
      const dateA = new Date(dateMap.get(a));
      const dateB = new Date(dateMap.get(b));
      return dateB - dateA; // Newest first
    });

    // Apply user preference for date ordering
    const allDates = dataViewType === 'right-to-left' ? sortedDates.reverse() : sortedDates;

    return allDates.map((dateLabel) => {
      // Find the first price data to get fullDateLabel
      const firstPriceData = companies
        .map((c) => prices[c.screenerId]?.find((r) => r.dateLabel === dateLabel))
        .find((r) => r);
      
      const row = { 
        dateLabel,
        fullDateLabel: firstPriceData?.fullDateLabel || dateLabel,
        date: firstPriceData?.date,
      };
      companies.forEach((c) => {
        const priceData = prices[c.screenerId]?.find((r) => r.dateLabel === dateLabel);
        row[c.name] = priceData?.price ?? null;
      });
      return row;
    });
  }, [companies, prices, dataViewType]);

  if (companies.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Make Comparison</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Select 2-3 companies from Portfolio or Future Analysis to compare.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowLoadModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          >
            <FolderOpen className="h-4 w-4" />
            Load Saved
          </button>
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          >
            <Folder className="h-4 w-4" />
            Compare Category
          </button>
        </div>

        {/* Load Modal */}
        {showLoadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-xl border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-lg font-semibold">Load Saved Comparison</h2>
                <button
                  type="button"
                  onClick={() => setShowLoadModal(false)}
                  className="rounded-full p-1 hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {savedComparisons.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No saved comparisons
                  </p>
                ) : (
                  <div className="space-y-2">
                    {savedComparisons.map((comp) => (
                      <div
                        key={comp._id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-medium">{comp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {comp.companyNames.join(', ')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleLoad(comp)}
                            className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSaved(comp._id)}
                            className="rounded-lg p-1 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md rounded-xl border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-lg font-semibold">Compare by Category</h2>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-full p-1 hover:bg-accent"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {categories.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No categories available
                  </p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const categoryCompanies = [
                        ...portfolio.filter(
                          (c) => (c.categoryId?._id || c.categoryId) === category._id
                        ),
                        ...futureAnalysis.filter(
                          (c) => (c.categoryId?._id || c.categoryId) === category._id
                        ),
                      ];
                      return (
                        <button
                          key={category._id}
                          type="button"
                          onClick={() => handleCompareCategory(category._id)}
                          disabled={categoryCompanies.length < 2 || categoryCompanies.length > 3}
                          className="w-full rounded-lg border p-3 text-left disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="h-4 w-4 rounded-full"
                              style={{ backgroundColor: category.color || '#3b82f6' }}
                            />
                            <span className="font-medium">{category.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({categoryCompanies.length} companies)
                            </span>
                          </div>
                          {categoryCompanies.length < 2 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Need at least 2 companies
                            </p>
                          )}
                          {categoryCompanies.length > 3 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              Too many companies (max 3)
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Comparison</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Comparing {companies.length} {companies.length === 1 ? 'company' : 'companies'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSaveModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </button>
          <button
            type="button"
            onClick={() => setShowLoadModal(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-input bg-background px-3 py-1.5 text-xs font-medium shadow-sm hover:bg-accent"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            Load
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border border-input bg-muted/60 p-0.5 text-xs">
          {[7, 15, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDays(d);
                setCustomDays('');
              }}
              className={`rounded-full px-3 py-1 transition ${
                days === d && !customDays
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={customDays}
            onChange={(e) => {
              const val = e.target.value;
              setCustomDays(val);
              if (val && !isNaN(val) && Number(val) > 0) {
                setDays(0);
              }
            }}
            placeholder="Custom"
            min="7"
            max="365"
            className="h-7 w-20 rounded-full border border-input bg-background px-3 text-xs text-center outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          {customDays && <span className="text-xs text-muted-foreground">days</span>}
        </div>
        <button
          type="button"
          onClick={fetchPrices}
          disabled={loading}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
        >
          {loading ? (
            <>
              <svg className="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <ViewToggle value={view} onChange={setView} />
        {view === 'graph' && <ChartTypeToggle value={chartType} onChange={setChartType} />}
        {view === 'table' && <DisplayModeSelector value={displayMode} onChange={setDisplayMode} />}
      </div>

      <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading data...
          </div>
        ) : view === 'graph' ? (
          chartType === 'line' ? (
            <ComparisonAreaChart data={chartData} />
          ) : (
            <ComparisonBarChart data={chartData} />
          )
        ) : (
          <ComparisonTable
            companies={companies}
            prices={prices}
            onRemove={handleRemove}
            displayMode={displayMode}
          />
        )}
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Save Comparison</h2>
              <button
                type="button"
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveName('');
                }}
                className="rounded-full p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Comparison Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter a name for this comparison"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveName('');
                  }}
                  className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal - same as above but shown when companies exist */}
      {showLoadModal && companies.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border bg-card shadow-lg">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <h2 className="text-lg font-semibold">Load Saved Comparison</h2>
              <button
                type="button"
                onClick={() => setShowLoadModal(false)}
                className="rounded-full p-1 hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {savedComparisons.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No saved comparisons
                </p>
              ) : (
                <div className="space-y-2">
                  {savedComparisons.map((comp) => (
                    <div
                      key={comp._id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {comp.companyNames.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleLoad(comp)}
                          className="rounded-lg bg-primary px-3 py-1 text-xs text-primary-foreground hover:bg-primary/90"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSaved(comp._id)}
                          className="rounded-lg p-1 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;
