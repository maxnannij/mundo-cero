import { useGame } from '../store/GameContext';
import { BUILDING_LIST } from '../data/buildings';
import { RESOURCES } from '../data/resources';
import { isTechUnlocked, canAfford } from '../store/gameState';

export function BuildPanel() {
  const { state, doBuild, doUpgrade } = useGame();

  return (
    <div className="panel">
      <h2>🏗️ Construcción</h2>
      <p className="panel-desc">Construye instalaciones que producen recursos automáticamente y mejoran tu asentamiento.</p>

      <div className="building-grid">
        {BUILDING_LIST.map(def => {
          const unlocked = !def.requiredTech || isTechUnlocked(state, def.requiredTech);
          const instance = state.buildings.find(b => b.id === def.id);
          const count = instance?.count || 0;
          const level = instance?.level || 1;
          const costMult = Math.pow(def.costScale, count);
          const costs = def.baseCost.map(c => ({
            ...c,
            amount: Math.ceil(c.amount * costMult),
          }));
          const canBuild = unlocked && count < def.maxCount && canAfford(state, costs);
          const canUpgrade = instance && level < def.maxLevel;

          return (
            <div key={def.id} className={`building-card ${!unlocked ? 'locked' : ''}`}>
              <div className="b-header">
                <span className="b-icon">{def.icon}</span>
                <div>
                  <strong>{def.name}</strong>
                  <div className="b-meta">
                    {count}/{def.maxCount} · Nv.{level}
                  </div>
                </div>
              </div>
              <p className="b-desc">{def.description}</p>
              {def.production && (
                <div className="b-prod">
                  Producción: {def.production.map(p => (
                    <span key={p.resourceId}>
                      {(p.amountPerMinute * (1 + (level - 1) * 0.35) * Math.max(count, 1)).toFixed(1)} {RESOURCES[p.resourceId]?.name}/min
                    </span>
                  ))}
                </div>
              )}
              {def.storageBonus && (
                <div className="b-prod">+{def.storageBonus * count * level} almacenamiento</div>
              )}
              {!unlocked ? (
                <div className="locked-msg">Requiere: {def.requiredTech}</div>
              ) : (
                <>
                  <div className="b-costs">
                    {costs.map(c => (
                      <span key={c.resourceId} className={state.resources[c.resourceId] < c.amount ? 'missing' : ''}>
                        {RESOURCES[c.resourceId]?.icon}{c.amount}
                      </span>
                    ))}
                  </div>
                  <div className="b-actions">
                    <button className="btn primary" disabled={!canBuild} onClick={() => doBuild(def.id)}>
                      Construir
                    </button>
                    {instance && (
                      <button className="btn" disabled={!canUpgrade} onClick={() => doUpgrade(def.id)}>
                        Mejorar
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
