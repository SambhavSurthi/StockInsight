import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useDataViewPreference, sortDataByPreference } from '../utils/useDataViewPreference';

const ComparisonAreaChart = ({ data }) => {
  const [dataViewType] = useDataViewPreference();
  
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-muted-foreground">
        No data available
      </div>
    );
  }

  // Sort data based on preference
  const sortedData = sortDataByPreference(data, dataViewType);

  // Get all company names from data
  const companyNames = Object.keys(sortedData[0] || {}).filter((key) => key !== 'date' && key !== 'dateLabel' && key !== 'fullDateLabel');

  const colors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
  ];

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={sortedData} margin={{ left: -20, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="fullDateLabel"
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
          />
          <Legend />
          {companyNames.map((companyName, index) => (
            <Area
              key={companyName}
              type="monotone"
              dataKey={companyName}
              stackId="1"
              stroke={colors[index % colors.length]}
              fill={colors[index % colors.length]}
              fillOpacity={0.6}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonAreaChart;

