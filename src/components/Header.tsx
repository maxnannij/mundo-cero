import { useGame } from '../store/GameContext';
import { RESOURCES } from '../data/resources';
import type { ResourceId } from '../data/resources';

const MAIN_RESOURCES: ResourceId[] = ['madera', 'piedra', 'fibra', 'bayas', 'conocimiento'];

export function Header() {
  const { state, saveNow } = useGame();
  const era = state.unlockedTechs.includes('metalurgia_basica')
    ? 3
    : state.unlockedTechs.includes('aserradero') || state.unlockedTechs.includes('cantera')
      ? 2
      : 1;

  const eraNames = ['', 'Supervivencia', 'Primer Asentamiento', 'Metalurgia'];

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="logo">MUNDO CERO</h1>
        <span className="era">Era {era}: {eraNames[era]}</span>
      </div>
      <div className="header-resources">
        {MAIN_RESOURCES.map(id => {
          const r = RESOURCES[id];
          const val = state.resources[id] || 0;
          return (
            <div key={id} className="res-chip" title={r.description}>
              <span className="res-icon">{r.icon}</span>
              <span className="res-val">{Math.floor(val)}</span>
            </div>
          );
        })}
      </div>
      <div className="header-right">
        {state.activeActivity ? (
          <span className="status active">● En actividad</span>
        ) : (
          <span className="status idle">○ Idle</span>
        )}
        <button className="btn-sm" onClick={saveNow} title="Guardar ahora">
          💾
        </button>
      </div>
    </header>
  );
}
