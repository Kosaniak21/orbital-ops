import { useState } from 'react';
import { getTelemetry } from '../api/client';
import { useApiResource } from '../hooks/useApiResource';
import { downsampleTelemetry, getLatestValue } from '../domain/telemetry';
import { TELEMETRY_MAX_POINTS, COLOR_CRITICAL, COLOR_INFO } from '../config';

export default function TelemetryChart() {
  const { data, loading, error } = useApiResource(getTelemetry);
  const [selected, setSelected] = useState('o2');

  if (loading) {
    return (
      <section className="panel">
        <h2>Telemetry</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading telemetry…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Telemetry</h2>
        <div className="panel-error">
          <p>⚠ {error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const series = data.series[selected as keyof typeof data.series];
  const points = downsampleTelemetry(series.points, TELEMETRY_MAX_POINTS);

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 320;
  const h = 80;
  const step = w / (points.length - 1);
  const coords = points
    .map((p, i) => {
      const x = (i * step).toFixed(1);
      const y = (h - ((p - min) / range) * (h - 8) - 4).toFixed(1);
      return x + ',' + y;
    })
    .join(' ');

  const latest = getLatestValue(points);
  const breach = selected === 'o2' && latest < 19.5;

  return (
    <section className="panel">
      <h2>Telemetry</h2>
      <div className="chart-tabs">
        {Object.entries(data.series).map(([key]) => (
          <button
            key={key}
            className={key === selected ? 'chart-tab chart-tab-active' : 'chart-tab'}
            onClick={() => setSelected(key)}
          >
            {data.series[key as keyof typeof data.series].label}
          </button>
        ))}
      </div>
      <div className="chart-body">
        <svg viewBox={'0 0 ' + w + ' ' + h} className="sparkline" preserveAspectRatio="none">
          <polyline points={coords} fill="none" stroke={breach ? COLOR_CRITICAL : COLOR_INFO} strokeWidth="2" />
        </svg>
        <div className="chart-stats">
          <span>
            latest <strong>{latest.toFixed(1)}</strong> {series.unit}
          </span>
          <span>min {min.toFixed(1)}</span>
          <span>max {max.toFixed(1)}</span>
          {breach && <span className="chart-breach">below floor!</span>}
        </div>
      </div>
    </section>
  );
}
