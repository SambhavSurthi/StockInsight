import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useDataViewPreference, sortDatesByPreference } from '../utils/useDataViewPreference';

const PortfolioTable = ({ companies, prices, editMode, comparisonMode, selectedIds, comparisonSelectedIds, categoricalColor = false, displayMode = 'price', onToggleSelect, onComparisonToggle, onCompanyClick }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dataViewType] = useDataViewPreference();

  // Collect all unique dates from all companies
  const allDates = useMemo(() => {
    const dateSet = new Set();
    const dateMap = new Map(); // Store original date string for sorting
    const fullDateMap = new Map(); // Store full date label
    
    companies.forEach((c) => {
      (prices[c.screenerId] || []).forEach((r) => {
        const dateKey = r.fullDateLabel || r.dateLabel;
        dateSet.add(dateKey);
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, r.date); // Store ISO date string
          fullDateMap.set(dateKey, r.fullDateLabel || r.dateLabel);
        }
      });
    });
    
    const sortedDates = Array.from(dateSet).sort((a, b) => {
      // Use ISO date strings for proper sorting
      const dateA = new Date(dateMap.get(a));
      const dateB = new Date(dateMap.get(b));
      return dateB - dateA; // Most recent first
    });
    
    // Apply user preference for date ordering
    return sortDatesByPreference(sortedDates, dateMap, dataViewType);
  }, [companies, prices, dataViewType]);

  // Prepare table data
  const tableData = useMemo(() => {
    return companies.map((c, idx) => {
      const rowPrices = prices[c.screenerId] || [];
      const priceMap = Object.fromEntries(rowPrices.map((r) => {
        const dateKey = r.fullDateLabel || r.dateLabel;
        return [dateKey, r.price];
      }));
      const priceArray = allDates.map((date) => priceMap[date] ?? null);
      
      return {
        serial: idx + 1,
        company: c,
        prices: priceArray,
        priceMap,
      };
    });
  }, [companies, prices, allDates]);

  // Sorting logic
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return tableData;

    const sorted = [...tableData].sort((a, b) => {
      let aVal, bVal;

      if (sortConfig.key === 'company') {
        aVal = a.company.name.toLowerCase();
        bVal = b.company.name.toLowerCase();
      } else if (sortConfig.key.startsWith('date_')) {
        const dateKey = sortConfig.key.replace('date_', '');
        aVal = a.priceMap[dateKey] ?? 0;
        bVal = b.priceMap[dateKey] ?? 0;
      } else {
        return 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [tableData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  const getPriceColor = (price, dateKey, priceMap) => {
    if (price === null) return 'text-muted-foreground';
    
    // Find previous day's price
    // For left-to-right (newest first): compare with next index (older date)
    // For right-to-left (oldest first): compare with previous index (older date)
    const dateIdx = allDates.indexOf(dateKey);
    let prevDate = null;
    
    if (dataViewType === 'left-to-right') {
      // Newest first: next index is previous (older) day
      if (dateIdx < allDates.length - 1) {
        prevDate = allDates[dateIdx + 1];
      }
    } else {
      // Oldest first: previous index is previous (older) day
      if (dateIdx > 0) {
        prevDate = allDates[dateIdx - 1];
      }
    }
    
    if (prevDate) {
      const prevPrice = priceMap[prevDate];
      if (prevPrice != null && !isNaN(prevPrice)) {
        if (price > prevPrice) return 'text-green-500';
        if (price < prevPrice) return 'text-red-500';
      }
    }
    return 'text-foreground';
  };

  const getChangeData = (price, dateKey, priceMap) => {
    if (price === null || price === undefined || isNaN(price)) {
      return { amount: null, percent: null, prevPrice: null };
    }
    
    const dateIdx = allDates.indexOf(dateKey);
    let prevDate = null;
    
    if (dataViewType === 'left-to-right') {
      if (dateIdx < allDates.length - 1) {
        prevDate = allDates[dateIdx + 1];
      }
    } else {
      if (dateIdx > 0) {
        prevDate = allDates[dateIdx - 1];
      }
    }
    
    if (prevDate) {
      const prevPrice = priceMap[prevDate];
      if (prevPrice != null && !isNaN(prevPrice) && prevPrice !== 0) {
        const amount = price - prevPrice;
        const percent = ((amount / prevPrice) * 100);
        return { amount, percent, prevPrice };
      }
    }
    return { amount: null, percent: null, prevPrice: null };
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <table className="min-w-full border-collapse text-xs sm:text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th className="sticky left-0 z-10 whitespace-nowrap bg-muted/100 px-2 py-2 text-left font-semibold text-foreground sm:px-3">
              S.No
            </th>
            <th className="sticky left-8 z-10 whitespace-nowrap bg-muted/100 px-2 py-2 text-left font-semibold text-foreground sm:left-12 sm:px-3">
              <button
                type="button"
                onClick={() => handleSort('company')}
                className="flex items-center hover:text-primary"
              >
                Company
                {getSortIcon('company')}
              </button>
            </th>
            {allDates.map((date) => (
              <th
                key={date}
                className="whitespace-nowrap px-2 py-2 text-center font-medium text-muted-foreground"
              >
                <button
                  type="button"
                  onClick={() => handleSort(`date_${date}`)}
                  className="flex items-center justify-center hover:text-primary"
                >
                  {date}
                  {getSortIcon(`date_${date}`)}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr
              key={row.company._id}
              className="border-t hover:bg-muted/30 transition-colors"
            >
              <td className="sticky left-0 z-10 whitespace-nowrap bg-card px-2 py-2 text-center text-muted-foreground sm:px-3">
                {row.serial}
              </td>
              <td className="sticky left-8 z-10 whitespace-wrap bg-card px-2 py-2 sm:left-12 sm:px-3">
                <div className="flex items-center gap-2">
                  {(editMode || comparisonMode) && (
                    <input
                      type="checkbox"
                      checked={
                        editMode
                          ? selectedIds.includes(row.company.screenerId)
                          : comparisonSelectedIds.includes(row.company.screenerId)
                      }
                      onChange={() =>
                        editMode
                          ? onToggleSelect(row.company.screenerId)
                          : onComparisonToggle(row.company.screenerId)
                      }
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => onCompanyClick(row.company)}
                    className="text-left font-medium hover:text-primary hover:underline"
                    style={
                      categoricalColor && row.company.categoryId?.color
                        ? { color: row.company.categoryId.color }
                        : {}
                    }
                  >
                    {row.company.name}
                  </button>
                </div>
              </td>
              {allDates.map((date) => {
                const price = row.priceMap[date];
                const colorClass = getPriceColor(price, date, row.priceMap);
                const changeData = getChangeData(price, date, row.priceMap);
                
                let displayText = '-';
                if (price !== null && price !== undefined && !isNaN(price)) {
                  if (displayMode === 'price') {
                    displayText = `₹${price.toFixed(2)}`;
                  } else if (displayMode === 'amount') {
                    if (changeData.amount !== null) {
                      displayText = `${changeData.amount >= 0 ? '+' : ''}₹${changeData.amount.toFixed(2)}`;
                    } else {
                      displayText = '-';
                    }
                  } else if (displayMode === 'percentage') {
                    if (changeData.percent !== null) {
                      displayText = `${changeData.percent >= 0 ? '+' : ''}${changeData.percent.toFixed(2)}%`;
                    } else {
                      displayText = '-';
                    }
                  } else if (displayMode === 'all') {
                    const parts = [`₹${price.toFixed(2)}`];
                    if (changeData.amount !== null) {
                      parts.push(`(${changeData.amount >= 0 ? '+' : ''}₹${changeData.amount.toFixed(2)})`);
                    }
                    if (changeData.percent !== null) {
                      parts.push(`(${changeData.percent >= 0 ? '+' : ''}${changeData.percent.toFixed(2)}%)`);
                    }
                    displayText = parts.join(' ');
                  }
                }
                
                return (
                  <td
                    key={date}
                    className={`px-2 py-2 text-center font-semibold ${colorClass}`}
                  >
                    {displayText}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioTable;

