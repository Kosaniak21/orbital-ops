import { getCrew } from '../api/client';
import type { CrewMember } from '../api/types';
import { useApiResource } from '../hooks/useApiResource';
import { COLOR_NOMINAL, COLOR_MUTED } from '../config';

export default function CrewPanel() {
  const { data, loading, error } = useApiResource(getCrew);

  const sorted = data?.members.sort((a: CrewMember, b: CrewMember) => {
    if (a.onDuty !== b.onDuty) return a.onDuty ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });

  if (loading) {
    return (
      <section className="panel">
        <h2>Crew</h2>
        <div className="panel-loading">
          <div className="spinner" />
          <p>Loading crew roster…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="panel">
        <h2>Crew</h2>
        <div className="panel-error">
          <p>⚠ {error}</p>
        </div>
      </section>
    );
  }

  if (!sorted) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Crew</h2>
      <ul className="crew-list">
        {sorted.map((m) => (
          <li key={m.id} className={m.onDuty ? 'crew-row crew-on' : 'crew-row'}>
            <span className="crew-dot" style={{ background: m.onDuty ? COLOR_NOMINAL : COLOR_MUTED }} />
            <div className="crew-main">
              <span className="crew-name">{m.name}</span>
              <span className="crew-role">{m.role} · shift {m.shift}</span>
            </div>
            <div className="crew-vitals">
              <span title="heart rate">♥ {m.heartRate}</span>
              <span title="sleep last night">☾ {m.sleepHours}h</span>
              <span title="mission day">d{m.missionDay}</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
