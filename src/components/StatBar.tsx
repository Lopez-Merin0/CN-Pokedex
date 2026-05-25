interface StatBarProps {
  name: string;
  label: string;
  value: number;
}

function StatBar({ name, label, value }: StatBarProps) {
  const width = (Math.min(value, 150) / 150) * 100;

  return (
    <div className="stat-row">
      <span>{label}</span>
      <strong>{value}</strong>
      <div className="stat-row__bar" aria-hidden="true">
        <span className={`stat-row__fill stat-row__fill--${name}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export default StatBar;
