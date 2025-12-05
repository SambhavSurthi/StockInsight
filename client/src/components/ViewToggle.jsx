const ViewToggle = ({ value, onChange }) => {
  return (
    <div className="inline-flex items-center rounded-full border border-input bg-muted/60 p-0.5 text-xs">
      <button
        type="button"
        onClick={() => onChange('graph')}
        className={`rounded-full px-3 py-1 transition ${
          value === 'graph'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent/60'
        }`}
      >
        Graph
      </button>
      <button
        type="button"
        onClick={() => onChange('table')}
        className={`rounded-full px-3 py-1 transition ${
          value === 'table'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-accent/60'
        }`}
      >
        Table
      </button>
    </div>
  );
};

export default ViewToggle;


