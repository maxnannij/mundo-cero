import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { RECIPE_LIST } from '../data/recipes';
import { RESOURCES } from '../data/resources';
import { isTechUnlocked, canAfford } from '../store/gameState';

export function CraftPanel() {
  const { state, doCraft } = useGame();
  const [qty, setQty] = useState(1);

  const available = RECIPE_LIST.filter(r => {
    if (r.skillId === 'cocina') return false;
    if (state.skills[r.skillId].level < r.requiredLevel) return false;
    if (r.requiredTech && !isTechUnlocked(state, r.requiredTech)) return false;
    if (r.requiredBuilding && !state.buildings.some(b => b.id === r.requiredBuilding && b.count > 0)) return false;
    return true;
  });

  return (
    <div className="panel">
      <h2>🛠️ Fabricación</h2>
      <p className="panel-desc">Crea herramientas, componentes y materiales. Los objetos se añaden a una cola.</p>

      {state.craftQueue.length > 0 && (
        <div className="queue-box">
          <h3>Cola actual</h3>
          {state.craftQueue.map((item, i) => {
            const r = RECIPE_LIST.find(x => x.id === item.recipeId);
            const pct = r ? Math.min(100, (item.progressMs / r.durationMs) * 100) : 0;
            return (
              <div key={i} className="queue-item">
                <span>{r?.name} x{item.remaining}</span>
                <div className="mini-bar"><div style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      )}

      <div className="recipe-grid">
        {available.map(r => {
          const can = canAfford(state, r.inputs);
          return (
            <div key={r.id} className={`recipe-card ${!can ? 'cant' : ''}`}>
              <div className="recipe-title">{r.name}</div>
              <p className="recipe-desc">{r.description}</p>
              <div className="recipe-inputs">
                {r.inputs.map(inp => (
                  <span key={inp.resourceId} className={state.resources[inp.resourceId] < inp.amount ? 'missing' : ''}>
                    {RESOURCES[inp.resourceId]?.icon} {inp.amount} {RESOURCES[inp.resourceId]?.name}
                  </span>
                ))}
              </div>
              <div className="recipe-inputs recipe-outputs">
                {r.outputs.map((out, i) => (
                  <span key={`${out.resourceId}-${i}`}>
                    {out.amount} {out.resourceId === 'tool' ? '🛠️ herramienta' : out.resourceId === 'clothing' ? '🧥 abrigo' : `${RESOURCES[out.resourceId]?.icon || ''} ${RESOURCES[out.resourceId]?.name || out.resourceId}`}
                  </span>
                ))}
              </div>
              <div className="recipe-meta">
                {(r.durationMs / 1000).toFixed(0)}s · +{r.xp} XP · Nv.{r.requiredLevel}
                {r.outputs.some(out => out.resourceId === 'plato_completo') && ' · 1 ración completa'}
                {r.outputs.some(out => out.resourceId === 'carne_cocinada') && ' · ½ ración por porción'}
              </div>
              <div className="recipe-actions">
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="qty-input"
                />
                <button className="btn primary" disabled={!can} onClick={() => doCraft(r.id, qty)}>
                  Fabricar
                </button>
                <button className="btn" disabled={!can} onClick={() => doCraft(r.id, 1)}>
                  x1
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {available.length === 0 && <p className="empty">No hay recetas disponibles aún. Sube de nivel o investiga.</p>}
    </div>
  );
}
