import { useState } from 'react';
import { getIncidents } from '../api/client';
import type { Incident } from '../api/types';
import { useApiResource } from '../hooks/useApiResource';
import { formatTimestamp } from '../domain/formatting';
import { getSeverityColor, rankIncidents } from '../domain/incidents';

export default function IncidentFeed() {
  const { data, loading, error } = useApiResource(getIncidents);
  const [showResolved, setShowResolved] = useState(false);

  if (loading) {
    return (
      <section className="panel">
        <h2>Incidents</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading incident feed…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Incidents</h2>
        <div className="panel-error">
          <p>⚠ {error}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  const allIncidents = data.items;
  const ranked = rankIncidents(allIncidents);
  const items = ranked.filter((i) => showResolved || !i.resolved);

  return (
    <section className="panel">
      <h2>
        Incidents
        <label className="toggle">
          <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
          show resolved
        </label>
      </h2>
      <ul className="incident-list">
        {items.map((inc: Incident) => (
          <li key={inc.id} className={inc.resolved ? 'incident-row incident-resolved' : 'incident-row'}>
            <span className="incident-sev" style={{ background: getSeverityColor(inc.severity) }}>
              {inc.severity}
            </span>
            <div className="incident-main">
              <span className="incident-title">
                {inc.id} · {inc.title}
              </span>
              <span className="incident-meta">
                {inc.system} · {formatTimestamp(inc.timestamp)} · {inc.resolved ? 'resolved' : 'open'}
              </span>
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="incident-empty">No incidents to show.</li>}
      </ul>
    </section>
  );
}
