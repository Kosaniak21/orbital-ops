import type { ReactNode } from 'react';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  sub: ReactNode;
  tileClass: string;
}

export function MetricTile({ label, value, unit, trend, sub, tileClass }: Props) {
  return (
    <div className={'tile ' + tileClass}>
      <div className="tile-label">{label}</div>
      <div className="tile-value">
        {value}
        {unit && <span className="tile-unit">{unit}</span>}
        {trend && <span className="tile-trend">{trend}</span>}
      </div>
      <div className="tile-sub">{sub}</div>
    </div>
  );
}
