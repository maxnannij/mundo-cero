import { useGame } from '../store/GameContext';
import { TECH_LIST } from '../data/techs';
import { RESOURCES } from '../data/resources';
import { isTechUnlocked, canAfford } from '../store/gameState';

export function TechPanel() {
  const { state, doResearch } = useGame();

  return (
    <div className="panel">
      <h2>🔬 Tecnología e Investigación</h2>
      <p className="panel-desc">
        Generá conocimiento con la habilidad Investigación y desbloqueá tecnologías clave.
        Conocimiento actual: <strong>{Math.floor(state.resources.conocimiento || 0)}</strong> 🧠
      </p>

      <div className="tech-grid">
        {TECH_LIST.map(tech => {
          const unlocked = isTechUnlocked(state, tech.id);
          const prereqsMet = tech.prerequisites.every(p => isTechUnlocked(state, p));
          const can = !unlocked && prereqsMet && canAfford(state, tech.cost) && (state.resources.conocimiento || 0) >= tech.knowledgeCost;

          return (
            <div key={tech.id} className={`tech-card ${unlocked ? 'unlocked' : ''} ${!prereqsMet ? 'locked' : ''}`}>
              <div className="tech-header">
                <span>{tech.icon}</span>
                <strong>{tech.name}</strong>
                <span className="era-tag">Era {tech.era}</span>
              </div>
              <p>{tech.description}</p>
              {unlocked ? (
                <div className="unlocked-badge">✓ Desbloqueada</div>
              ) : (
                <>
                  <div className="tech-costs">
                    {tech.cost.map(c => (
                      <span key={c.resourceId} className={state.resources[c.resourceId] < c.amount ? 'missing' : ''}>
                        {RESOURCES[c.resourceId]?.icon}{c.amount}
                      </span>
                    ))}
                    <span className={(state.resources.conocimiento || 0) < tech.knowledgeCost ? 'missing' : ''}>
                      🧠{tech.knowledgeCost}
                    </span>
                  </div>
                  {tech.prerequisites.length > 0 && (
                    <div className="prereqs">
                      Requiere: {tech.prerequisites.map(p => (
                        <span key={p} className={isTechUnlocked(state, p) ? 'ok' : 'missing'}>{p}</span>
                      ))}
                    </div>
                  )}
                  <button className="btn primary" disabled={!can} onClick={() => doResearch(tech.id)}>
                    Investigar
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
