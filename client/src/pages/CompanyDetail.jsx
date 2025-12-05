import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import CompanyPriceChart from '../components/CompanyPriceChart';
import CompanyPriceBarChart from '../components/CompanyPriceBarChart';
import CompanyPriceNegativeBarChart from '../components/CompanyPriceNegativeBarChart';
import CompanyPriceTable from '../components/CompanyPriceTable';
import DisplayModeSelector from '../components/DisplayModeSelector';
import ViewToggle from '../components/ViewToggle';
import ChartTypeToggle from '../components/ChartTypeToggle';
import CategorySelectModal from '../components/CategorySelectModal';
import { API_ENDPOINTS } from '../config/api';
import { fetchPriceDataWithRetry } from '../utils/priceDataService';

const parsePriceDataset = (datasets) => {
  if (!datasets || !Array.isArray(datasets)) return [];
  const priceDataset = datasets.find((d) => d.metric === 'Price');
  if (!priceDataset || !Array.isArray(priceDataset.values)) return [];

  return priceDataset.values.map(([date, priceStr]) => {
    const dateObj = new Date(date);
    const dateLabel = dateObj.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
    });
    const fullDateLabel = dateObj.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return {
      date,
      dateLabel,
      fullDateLabel,
      price: Number(priceStr),
    };
  });
};

const CompanyDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const nameFromQuery = searchParams.get('name');
  const from = searchParams.get('from');

  const [days, setDays] = useState(15);
  const [customDays, setCustomDays] = useState('');
  const [view, setView] = useState('graph');
  const [chartType, setChartType] = useState('line');
  const [loading, setLoading] = useState(false);
  const [priceRows, setPriceRows] = useState([]);
  const [priceRowsWithExtra, setPriceRowsWithExtra] = useState([]); // For negative chart calculation
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'portfolio' or 'future'
  const [displayMode, setDisplayMode] = useState('price');

  const companyName = useMemo(
    () => nameFromQuery || `Company ${id}`,
    [nameFromQuery, id]
  );

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const effectiveDays = useMemo(() => {
    if (customDays && !isNaN(customDays) && Number(customDays) > 0) {
      const numDays = Number(customDays);
      // Ensure minimum is 7 days (backend enforces this too)
      return Math.max(7, Math.min(numDays, 365)); // Cap at 365 days
    }
    return days;
  }, [days, customDays]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !id) return;

    let cancelled = false;

    const fetchChart = async () => {
      try {
        setLoading(true);
        // Fetch one extra day if negative chart is selected to calculate first day's change
        const daysToFetch = chartType === 'negative' ? effectiveDays + 1 : effectiveDays;
        const data = await fetchPriceDataWithRetry(
          Number(id),
          daysToFetch,
          token
        );
        if (!cancelled) {
          // If negative chart, fetch one extra day for calculation
          if (chartType === 'negative' && data.length > effectiveDays) {
            setPriceRowsWithExtra(data); // Store full data including extra day
            setPriceRows(data.slice(0, effectiveDays)); // Display data without extra day
          } else {
            setPriceRows(data);
            setPriceRowsWithExtra([]);
          }
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || 'Failed to load data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchChart();
    return () => {
      cancelled = true;
    };
  }, [id, effectiveDays, chartType]);

  const handleAddClick = (type) => {
    setPendingAction(type);
    setShowCategoryModal(true);
  };

  const handleCategoryConfirm = async (categoryId) => {
    const token = localStorage.getItem('token');
    if (!token || !pendingAction) {
      navigate('/login');
      return;
    }

    const endpoint =
      pendingAction === 'portfolio'
        ? API_ENDPOINTS.PORTFOLIO.BASE
        : API_ENDPOINTS.FUTURE_ANALYSIS.BASE;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          screenerId: Number(id),
          name: companyName,
          categoryId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(
          pendingAction === 'portfolio'
            ? 'Added to portfolio'
            : 'Added to Future Analysis'
        );
        setShowCategoryModal(false);
        setPendingAction(null);
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const showActionButtons = !from;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold sm:text-xl">{companyName}</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Screener ID: {id} · Last {effectiveDays} days of closing prices
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground sm:text-sm">
          Days
        </span>
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
                setDays(0); // Reset preset days when custom is used
              }
            }}
            placeholder="Custom"
            min="7"
            max="365"
            className="h-7 w-20 rounded-full border border-input bg-background px-3 text-xs text-center outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40"
          />
          {customDays && (
            <span className="text-xs text-muted-foreground">days</span>
          )}
        </div>
      </div>

      {view === 'graph' && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            Chart Type
          </span>
          <ChartTypeToggle value={chartType} onChange={setChartType} />
        </div>
      )}
      {view === 'table' && (
        <DisplayModeSelector value={displayMode} onChange={setDisplayMode} />
      )}

      <div className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
            Loading data...
          </div>
        ) : view === 'graph' ? (
          chartType === 'line' ? (
            <CompanyPriceChart data={priceRows} />
          ) : chartType === 'bar' ? (
            <CompanyPriceBarChart data={priceRows} />
          ) : (
            <CompanyPriceNegativeBarChart 
              data={priceRows} 
              previousDayData={priceRowsWithExtra.length > priceRows.length ? priceRowsWithExtra[priceRows.length] : null} 
            />
          )
        ) : (
          <CompanyPriceTable companyName={companyName} rows={priceRows} displayMode={displayMode} />
        )}
      </div>

      {showActionButtons && (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={() => handleAddClick('portfolio')}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
            >
              Add to Portfolio
            </button>
            <button
              type="button"
              onClick={() => handleAddClick('future')}
              className="inline-flex flex-1 items-center justify-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
            >
              Add to Future Analysis
            </button>
          </div>
          <CategorySelectModal
            isOpen={showCategoryModal}
            onClose={() => {
              setShowCategoryModal(false);
              setPendingAction(null);
            }}
            onConfirm={handleCategoryConfirm}
            type={pendingAction}
          />
        </>
      )}
    </div>
  );
};

export default CompanyDetail;


