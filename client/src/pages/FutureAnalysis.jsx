import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LineChart } from 'lucide-react';
import PortfolioTable from '../components/PortfolioTable';
import DisplayModeSelector from '../components/DisplayModeSelector';
import { API_ENDPOINTS } from '../config/api';
import { fetchMultipleCompaniesSequentially } from '../utils/priceDataService';

const FutureAnalysis = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [prices, setPrices] = useState({});
  const [days, setDays] = useState(15);
  const [customDays, setCustomDays] = useState('');
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [comparisonSelectedIds, setComparisonSelectedIds] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [categoricalColor, setCategoricalColor] = useState(false);
  const [categoricalSorting, setCategoricalSorting] = useState(false);
  const [displayMode, setDisplayMode] = useState('price');

  const effectiveDays = useMemo(() => {
    if (customDays && !isNaN(customDays) && Number(customDays) > 0) {
      const numDays = Number(customDays);
      // Ensure minimum is 7 days (backend enforces this too)
      return Math.max(7, Math.min(numDays, 365));
    }
    return days;
  }, [days, customDays]);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [navigate, token]);

  const fetchFutureList = async () => {
    if (!token) return;
    try {
      setLoadingList(true);
      const res = await fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to load future analysis list');
      const data = await res.json();
      setCompanies(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load future analysis');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchFutureList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrices = async () => {
    if (!token || companies.length === 0) return;
    try {
      setLoadingPrices(true);
      
      // Check for 401 before starting
      const testRes = await fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (testRes.status === 401) {
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
        return;
      }

      const results = await fetchMultipleCompaniesSequentially(
        companies,
        effectiveDays,
        token,
        (current, total, companyName, success) => {
          // Optional: Show progress if needed
          if (current === total) {
            toast.success(`Loaded data for ${total} companies`);
          }
        }
      );
      
      setPrices(results);
    } catch (error) {
      toast.error('Failed to refresh prices');
    } finally {
      setLoadingPrices(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveDays, companies.length]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );

    // Apply categorical sorting if enabled
    if (categoricalSorting) {
      filtered = [...filtered].sort((a, b) => {
        const catA = a.categoryId?.name || 'Uncategorized';
        const catB = b.categoryId?.name || 'Uncategorized';
        return catA.localeCompare(catB);
      });
    }

    return filtered;
  }, [companies, search, categoricalSorting]);

  const toggleSelect = (screenerId) => {
    setSelectedIds((prev) =>
      prev.includes(screenerId) ? prev.filter((id) => id !== screenerId) : [...prev, screenerId]
    );
  };

  const handleBulkDelete = async () => {
    if (!token || selectedIds.length === 0) return;
    try {
      const res = await fetch(API_ENDPOINTS.FUTURE_ANALYSIS.BULK_DELETE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ screenerIds: selectedIds }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Removed from Future Analysis');
        setCompanies((prev) => prev.filter((c) => !selectedIds.includes(c.screenerId)));
        setSelectedIds([]);
      } else {
        toast.error(data.message || 'Failed to remove');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleMoveToPortfolio = async () => {
    if (!token || selectedIds.length === 0) return;
    try {
      const res = await fetch(
        API_ENDPOINTS.FUTURE_ANALYSIS.MOVE_TO_PORTFOLIO,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ screenerIds: selectedIds }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Moved to portfolio');
        setCompanies((prev) => prev.filter((c) => !selectedIds.includes(c.screenerId)));
        setSelectedIds([]);
      } else {
        toast.error(data.message || 'Failed to move');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Future Analysis</h1>
          <p className="text-xs text-muted-foreground sm:text-sm">
            Companies you are tracking for possible future investment.
          </p>
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
            {customDays && (
              <span className="text-xs text-muted-foreground">days</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="h-9 flex-1 rounded-full border border-input bg-background px-3 text-xs outline-none ring-offset-background placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/40 sm:text-sm"
          />
        <button
          type="button"
          onClick={fetchPrices}
          disabled={loadingPrices}
          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm"
        >
          {loadingPrices ? (
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
        <button
          type="button"
          onClick={() => {
            setEditMode((prev) => !prev);
            setSelectedIds([]);
            if (comparisonMode) setComparisonMode(false);
          }}
          className="inline-flex items-center justify-center rounded-full border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground sm:text-sm"
        >
          {editMode ? 'Done' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={() => {
            setComparisonMode((prev) => !prev);
            setComparisonSelectedIds([]);
            if (editMode) setEditMode(false);
          }}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-input bg-background px-3 py-1 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground sm:text-sm"
        >
          <LineChart className="h-3.5 w-3.5" />
          {comparisonMode ? 'Cancel' : 'Compare'}
        </button>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-muted-foreground sm:text-sm">
            Categorical Color:
          </label>
          <div className="inline-flex rounded-full border border-input bg-background p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setCategoricalColor(true)}
              className={`rounded-full px-3 py-1 transition ${
                categoricalColor
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => setCategoricalColor(false)}
              className={`rounded-full px-3 py-1 transition ${
                !categoricalColor
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent/60'
              }`}
            >
              No
            </button>
          </div>
        </div>
        </div>
        
        {categoricalColor && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-muted-foreground sm:text-sm">
              Categorical Sorting:
            </label>
            <div className="inline-flex rounded-full border border-input bg-background p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setCategoricalSorting(true)}
                className={`rounded-full px-3 py-1 transition ${
                  categoricalSorting
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/60'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setCategoricalSorting(false)}
                className={`rounded-full px-3 py-1 transition ${
                  !categoricalSorting
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent/60'
                }`}
              >
                No
              </button>
            </div>
          </div>
        )}
        <DisplayModeSelector value={displayMode} onChange={setDisplayMode} />
      </div>

      {editMode && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            {selectedIds.length} selected
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleMoveToPortfolio}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 sm:text-sm"
            >
              Move to portfolio
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={selectedIds.length === 0}
              className="inline-flex items-center justify-center rounded-full bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground shadow hover:bg-destructive/90 disabled:opacity-50 sm:text-sm"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {loadingList ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          Loading future analysis list...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-xs text-muted-foreground">
          No companies in Future Analysis yet.
        </div>
      ) : (
        <PortfolioTable
          companies={filteredCompanies}
          prices={prices}
          editMode={editMode}
          comparisonMode={comparisonMode}
          selectedIds={selectedIds}
          comparisonSelectedIds={comparisonSelectedIds}
          categoricalColor={categoricalColor}
          displayMode={displayMode}
          onToggleSelect={toggleSelect}
          onComparisonToggle={(screenerId) => {
            setComparisonSelectedIds((prev) =>
              prev.includes(screenerId)
                ? prev.filter((id) => id !== screenerId)
                : prev.length < 3
                  ? [...prev, screenerId]
                  : prev
            );
          }}
          onCompanyClick={(company) =>
            navigate(`/company/${company.screenerId}?name=${encodeURIComponent(company.name)}&from=future`)
          }
        />
      )}
    </div>
  );
};

export default FutureAnalysis;


