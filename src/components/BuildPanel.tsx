import { useGame } from '../store/GameContext';
import { BUILDING_LIST } from '../data/buildings';
import { RESOURCES } from '../data/resources';
import { isTechUnlocked, canAfford } from '../store/gameState';
import { getBuildingUpgradeCosts } from '../systems/gameEngine';

export function BuildPanel() {
  const { state, doBuild, doUpgrade } = useGame();
  return (
    <div className="panel">
      <h2>🏗️ Construcción</h2>
      <p className="panel-desc">Construí instalaciones para producir, almacenar y transformar recursos. Las instalaciones productivas necesitan trabajadores asignados.</p>
      <div className="building-grid">
        {BUILDING_LIST.map(def => {
          const unlocked = !def.requiredTech || isTechUnlocked(state, def.requiredTech);
          const instance = state.buildings.find(b => b.id === def.id);
          const count = instance?.count || 0;
          const level = instance?.level || 1;
          const costs = def.baseCost.map(c => ({ ...c, amount: Math.ceil(c.amount * Math.pow(def.costScale, count)) }));
          const canBuild = unlocked && count < def.maxCount && canAfford(state, costs);
          const upgradeCosts = instance ? getBuildingUpgradeCosts(state, def.id) : [];
          const canUpgrade = !!instance && level < def.maxLevel && canAfford(state, upgradeCosts);
          const staffingMax = (def.workersRequired || 1) * count;
          const staffingRatio = staffingMax > 0 ? Math.min(1, (instance?.workersAssigned || 0) / staffingMax) : 0;
          return (
            <div key={def.id} className={`building-card ${!unlocked ? 'locked' : ''}`}>
              <div className="b-header">
                <span className="b-icon">{def.icon}</span>
                <div><strong>{def.name}</strong><div className="b-meta">{count}/{def.maxCount} · Nv.{level}</div></div>
              </div>
              <p className="b-desc">{def.description}</p>
              {def.production && (
                <>
                  <div className="b-prod">
                    {def.production.map(p => (
                      <span key={p.resourceId}>{(p.amountPerMinute * (1 + (level - 1) * 0.35) * count * staffingRatio).toFixed(2)} {RESOURCES[p.resourceId]?.name}/min</span>
                    ))}
                  </div>
                  <div className="b-meta">Personal: {instance?.workersAssigned || 0}/{staffingMax} · {staffingRatio >= 1 ? 'Dotación completa' : 'Asigná trabajadores en Población'}</div>
                </>
              )}
              {def.storageBonus && <div className="b-prod">+{def.storageBonus * count * level} almacenamiento</div>}
              {!unlocked ? (
                <div className="locked-msg">Requiere tecnología: {def.requiredTech}</div>
              ) : (
                <>
                  <div className="b-costs">
                    {costs.map(c => <span key={c.resourceId} className={state.resources[c.resourceId] < c.amount ? 'missing' : ''}>{RESOURCES[c.resourceId]?.icon}{c.amount}</span>)}
                  </div>
                  <div className="b-actions">
                    <button className="btn primary" disabled={!canBuild} onClick={() => doBuild(def.id)}>Construir</button>
                    {instance && (
                      <button className="btn" disabled={!canUpgrade} onClick={() => doUpgrade(def.id)}>
                        Mejorar {upgradeCosts.length ? '· ' + upgradeCosts.map(c => c.amount + ' ' + (RESOURCES[c.resourceId]?.name || c.resourceId)).join(', ') : ''}
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
