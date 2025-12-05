import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
} from 'recharts';
import { useDataViewPreference, sortDataByPreference } from '../utils/useDataViewPreference';

const CompanyPriceNegativeBarChart = ({ data, previousDayData }) => {
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

  // Calculate price change from previous day
  // Note: CompanyDetail should fetch one extra day to calculate first day's change
  // We'll use the full dataset (which includes one extra day) to calculate changes
  const chartData = sortedData.map((item, index) => {
    let change = 0;
    let changePercent = 0;
    let prevPrice = null;
    
    if (index > 0) {
      prevPrice = sortedData[index - 1].price;
      if (prevPrice && item.price) {
        change = item.price - prevPrice;
        changePercent = ((change / prevPrice) * 100).toFixed(2);
      }
    } else {
      // For first day, use previousDayData if provided
      if (previousDayData && previousDayData.price && item.price) {
        prevPrice = previousDayData.price;
        change = item.price - prevPrice;
        changePercent = ((change / prevPrice) * 100).toFixed(2);
      } else {
        change = 0;
        changePercent = 0;
        prevPrice = null;
      }
    }

    return {
      ...item,
      change,
      changePercent: parseFloat(changePercent),
      prevPrice,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ left: -20, right: 8, top: 8, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
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
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.dateLabel === label);
              return item?.fullDateLabel || label;
            }}
            formatter={(value, name, props) => {
              if (name === 'change') {
                const item = chartData[props.payload.index];
                const changeColor = value > 0 ? 'hsl(142, 76%, 36%)' : value < 0 ? 'hsl(0, 84%, 60%)' : 'hsl(var(--muted-foreground))';
                return [
                  <span key="change" style={{ color: changeColor }}>
                    ₹{value >= 0 ? '+' : ''}{value.toFixed(2)} ({item?.changePercent >= 0 ? '+' : ''}{item?.changePercent}%)
                  </span>,
                  'Change',
                ];
              }
              return [value, name];
            }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const changeValue = data.change;
                const changeColor = changeValue > 0 ? 'hsl(142, 76%, 36%)' : changeValue < 0 ? 'hsl(0, 84%, 60%)' : 'hsl(var(--muted-foreground))';
                
                return (
                  <div className="rounded-lg border bg-popover p-2 shadow-md">
                    <p className="font-medium text-foreground">{data.fullDateLabel || label}</p>
                    <p className="text-sm text-foreground mt-1">Price: ₹{data.price.toFixed(2)}</p>
                    <p className="text-sm mt-1" style={{ color: changeColor }}>
                      Change: ₹{changeValue >= 0 ? '+' : ''}{changeValue.toFixed(2)} ({data.changePercent >= 0 ? '+' : ''}{data.changePercent}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="change" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry.change > 0
                    ? 'hsl(142, 76%, 36%)' // green-600
                    : entry.change < 0
                    ? 'hsl(0, 84%, 60%)' // red-500
                    : 'hsl(var(--muted-foreground))' // neutral for no change
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompanyPriceNegativeBarChart;

