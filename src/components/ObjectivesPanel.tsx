import { useGame } from '../store/GameContext';
import { OBJECTIVES } from '../data/objectives';

export function ObjectivesPanel() {
  const { state } = useGame();

  return (
    <div className="panel">
      <h2>🎯 Objetivos y Logros</h2>
      <div className="obj-list">
        {OBJECTIVES.map(obj => {
          const done = state.completedObjectives.includes(obj.id);
          return (
            <div key={obj.id} className={`obj-card ${done ? 'done' : ''}`}>
              <div className="obj-header">
                <strong>{done ? '✓ ' : ''}{obj.name}</strong>
                <span className="obj-cat">{obj.category}</span>
              </div>
              <p>{obj.description}</p>
              {done && <div className="obj-reward">Completado</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
