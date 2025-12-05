import { useDataViewPreference, sortDataByPreference } from '../utils/useDataViewPreference';

const CompanyPriceTable = ({ companyName, rows, displayMode = 'price' }) => {
  const [dataViewType] = useDataViewPreference();
  
  if (!rows || rows.length === 0) {
    return (
      <div className="flex h-24 items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  // Sort data based on preference
  const sortedRows = sortDataByPreference(rows, dataViewType);
  const headers = sortedRows.map((r) => r.fullDateLabel || r.dateLabel);

  const getChangeData = (currentPrice, currentIdx) => {
    if (currentPrice === null || currentPrice === undefined || isNaN(currentPrice)) {
      return { amount: null, percent: null, prevPrice: null };
    }
    
    let prevPrice = null;
    if (dataViewType === 'left-to-right') {
      // Newest first: next index is previous (older) day
      if (currentIdx < sortedRows.length - 1) {
        prevPrice = sortedRows[currentIdx + 1].price;
      }
    } else {
      // Oldest first: previous index is previous (older) day
      if (currentIdx > 0) {
        prevPrice = sortedRows[currentIdx - 1].price;
      }
    }
    
    if (prevPrice != null && !isNaN(prevPrice) && prevPrice !== 0) {
      const amount = currentPrice - prevPrice;
      const percent = ((amount / prevPrice) * 100);
      return { amount, percent, prevPrice };
    }
    return { amount: null, percent: null, prevPrice: null };
  };

  const getPriceColor = (currentPrice, currentIdx) => {
    if (currentPrice === null || currentPrice === undefined || isNaN(currentPrice)) {
      return 'text-muted-foreground';
    }
    
    let prevPrice = null;
    if (dataViewType === 'left-to-right') {
      if (currentIdx < sortedRows.length - 1) {
        prevPrice = sortedRows[currentIdx + 1].price;
      }
    } else {
      if (currentIdx > 0) {
        prevPrice = sortedRows[currentIdx - 1].price;
      }
    }
    
    if (prevPrice != null && !isNaN(prevPrice)) {
      if (currentPrice > prevPrice) return 'text-green-500';
      if (currentPrice < prevPrice) return 'text-red-500';
    }
    return 'text-foreground';
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg border bg-card">
      <table className="min-w-full border-collapse text-xs sm:text-sm">
        <thead className="bg-muted/60">
          <tr>
            <th className=" whitespace-nowrap px-3 py-2 text-left font-semibold text-foreground">
              {companyName}
            </th>
            {headers.map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-2 py-2 text-center font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2  text-left font-medium text-muted-foreground">Price</td>
            {sortedRows.map((r, idx) => {
              const colorClass = getPriceColor(r.price, idx);
              const changeData = getChangeData(r.price, idx);
              
              let displayText = '-';
              if (r.price !== null && r.price !== undefined && !isNaN(r.price)) {
                if (displayMode === 'price') {
                  displayText = `₹${r.price.toFixed(2)}`;
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
                  const parts = [`₹${r.price.toFixed(2)}`];
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
                <td key={r.dateLabel || r.fullDateLabel} className={`px-2 py-2 text-center font-semibold ${colorClass}`}>
                  {displayText}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CompanyPriceTable;


