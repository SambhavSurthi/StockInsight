const DisplayModeSelector = ({ value, onChange }) => {
  const modes = [
    { value: 'price', label: 'Price' },
    { value: 'amount', label: 'Amount' },
    { value: 'percentage', label: 'Percentage' },
    { value: 'all', label: 'All' },
  ];

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs font-medium text-muted-foreground sm:text-sm">
        Display:
      </label>
      <div className="inline-flex rounded-full border border-input bg-background p-0.5 text-xs">
        {modes.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`rounded-full px-3 py-1 transition ${
              value === mode.value
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-accent/60'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DisplayModeSelector;

