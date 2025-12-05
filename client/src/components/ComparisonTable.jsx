import { X } from 'lucide-react';
import { useMemo } from 'react';
import { useDataViewPreference, sortDatesByPreference } from '../utils/useDataViewPreference';

const ComparisonTable = ({ companies, prices, onRemove, displayMode = 'price' }) => {
  const [dataViewType] = useDataViewPreference();

  // Collect all unique dates
  const allDates = useMemo(() => {
    const dateSet = new Set();
    const dateMap = new Map();
    
    companies.forEach((c) => {
      (prices[c.screenerId] || []).forEach((r) => {
        const dateKey = r.fullDateLabel || r.dateLabel;
        dateSet.add(dateKey);
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, r.date);
        }
      });
    });
    
    const sortedDates = Array.from(dateSet).sort((a, b) => {
      const dateA = new Date(dateMap.get(a));
      const dateB = new Date(dateMap.get(b));
      return dateB - dateA;
    });
    
    // Apply user preference for date ordering
    return sortDatesByPreference(sortedDates, dateMap, dataViewType);
  }, [companies, prices, dataViewType]);

  // Prepare table data
  const tableData = useMemo(() => {
    return companies.map((c) => {
      const rowPrices = prices[c.screenerId] || [];
      const priceMap = Object.fromEntries(rowPrices.map((r) => {
        const dateKey = r.fullDateLabel || r.dateLabel;
        return [dateKey, r.price];
      }));
      return {
        company: c,
        priceMap,
      };
    });
  }, [companies, prices]);

  const getPriceColor = (price, dateKey, priceMap) => {
    if (price === null || price === undefined || isNaN(price)) return 'text-muted-foreground';
    
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
            <th className="sticky left-0 z-10 whitespace-wrap bg-muted/100 px-3 py-2 text-left font-semibold text-foreground">
              Company
            </th>
            {allDates.map((date) => (
              <th
                key={date}
                className="whitespace-nowrap px-2 py-2 text-center font-medium text-muted-foreground"
              >
                {date}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row) => (
            <tr
              key={row.company.screenerId}
              className="border-t hover:bg-muted/30 transition-colors"
            >
              <td className="sticky left-0 z-10 whitespace-wrap bg-card px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{row.company.name}</span>
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(row.company.screenerId)}
                      className="rounded p-0.5 hover:bg-destructive/10 text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
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

export default ComparisonTable;

