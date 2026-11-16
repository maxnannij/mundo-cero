import { useGame } from '../store/GameContext';
import { SKILLS } from '../data/skills';
import { BUILDINGS } from '../data/buildings';

export function HomePanel() {
  const { state, stopAct } = useGame();
  const active = state.activeActivity;

  return (
    <div className="panel home-panel">
      <h2>Bienvenido a MUNDO CERO</h2>
      <p className="intro">
        La civilización se ha perdido. Despertás rodeado de naturaleza y ruinas. 
        Debés reconstruir el conocimiento y la tecnología de la humanidad desde cero.
      </p>

      <div className="home-grid">
        <div className="home-card">
          <h3>Estado actual</h3>
          {active ? (
            <div>
              <p>
                Realizando: <strong>{SKILLS[active.skillId]?.activities.find(a => a.id === active.activityId)?.name}</strong>
              </p>
              <p>Acciones completadas: {active.actionsDone}{active.targetAmount ? ` / ${active.targetAmount}` : ''}</p>
              <button className="btn danger" onClick={stopAct}>Detener actividad</button>
            </div>
          ) : (
            <p>Ninguna actividad manual en curso. Elegí una en Habilidades.</p>
          )}
        </div>

        <div className="home-card">
          <h3>Producción pasiva</h3>
          {state.buildings.length === 0 ? (
            <p>Sin edificios productivos aún. Construí un Aserradero o Cantera.</p>
          ) : (
            <ul>
              {state.buildings.map(b => {
                const def = BUILDINGS[b.id];
                if (!def?.production) return null;
                return (
                  <li key={b.id}>
                    {def.icon} {def.name} x{b.count} (Nv.{b.level})
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="home-card">
          <h3>Registro reciente</h3>
          <div className="log">
            {state.log.slice(0, 12).map((entry, i) => (
              <div key={i} className="log-entry">
                <span className="log-time">{new Date(entry.time).toLocaleTimeString()}</span>
                {entry.message}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tips">
        <h3>Consejos iniciales</h3>
        <ol>
          <li>Empezá talando madera y minando piedra.</li>
          <li>Recolectá fibras y fabricá una hacha rudimentaria.</li>
          <li>Generá conocimiento con Investigación.</li>
          <li>Investigá Control del fuego y Construcción primitiva.</li>
          <li>Construí un Refugio y luego un Aserradero para automatizar.</li>
        </ol>
      </div>
    </div>
  );
}
