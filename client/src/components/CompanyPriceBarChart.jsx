import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useDataViewPreference, sortDataByPreference } from '../utils/useDataViewPreference';

const CompanyPriceBarChart = ({ data }) => {
  const [dataViewType] = useDataViewPreference();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  // Sort data based on preference
  const sortedData = sortDataByPreference(data, dataViewType);

  // Add color and change calculation based on price change
  const dataWithColor = sortedData.map((item, index) => {
    const prevPrice = index > 0 ? sortedData[index - 1].price : null;
    let fillColor = 'hsl(var(--muted-foreground))';
    let change = 0;
    let changePercent = 0;
    
    if (prevPrice != null) {
      if (item.price > prevPrice) {
        fillColor = 'hsl(142, 76%, 36%)'; // green-600
        change = item.price - prevPrice;
        changePercent = ((change / prevPrice) * 100).toFixed(2);
      } else if (item.price < prevPrice) {
        fillColor = 'hsl(0, 84%, 60%)'; // red-500
        change = item.price - prevPrice;
        changePercent = ((change / prevPrice) * 100).toFixed(2);
      }
    }
    return { 
      ...item, 
      fill: fillColor,
      change,
      changePercent: parseFloat(changePercent),
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dataWithColor} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 10 }}
            tickMargin={6}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            tickMargin={4}
            stroke="hsl(var(--muted-foreground))"
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              fontSize: 12,
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const price = data.price;
                const change = data.change || 0;
                const changePercent = data.changePercent || 0;
                const changeColor = change > 0 ? 'hsl(142, 76%, 36%)' : change < 0 ? 'hsl(0, 84%, 60%)' : 'hsl(var(--muted-foreground))';
                
                return (
                  <div className="rounded-lg border bg-popover p-2 shadow-md">
                    <p className="font-medium text-foreground">{data.fullDateLabel || label}</p>
                    <p className="text-sm text-foreground mt-1">Price: ₹{price.toFixed(2)}</p>
                    {change !== 0 && (
                      <p className="text-sm mt-1" style={{ color: changeColor }}>
                        Change: ₹{change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent >= 0 ? '+' : ''}{changePercent}%)
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />

          <Bar dataKey="price" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompanyPriceBarChart;

