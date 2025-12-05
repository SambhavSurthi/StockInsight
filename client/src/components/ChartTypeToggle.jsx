import { LineChart, BarChart3, TrendingUp } from 'lucide-react';

const ChartTypeToggle = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-full border border-input bg-muted/60 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onChange('line')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
          value === 'line'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent/60'
        }`}
      >
        <LineChart className="h-3 w-3" />
        <span>Line</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('bar')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
          value === 'bar'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent/60'
        }`}
      >
        <BarChart3 className="h-3 w-3" />
        <span>Bar</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('negative')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1 transition ${
          value === 'negative'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent/60'
        }`}
      >
        <TrendingUp className="h-3 w-3" />
        <span>Change</span>
      </button>
    </div>
  );
};

export default ChartTypeToggle;

