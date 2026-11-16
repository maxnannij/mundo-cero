import { useMemo, useState } from 'react';
import { useGame } from '../store/GameContext';
import { RECIPE_LIST } from '../data/recipes';
import { BUILDING_LIST } from '../data/buildings';
import { RESOURCES } from '../data/resources';
import { isTechUnlocked } from '../store/gameState';

export function AutomationPanel() {
  const { state, doCreateAutomation, doToggleAutomation, doRemoveAutomation } = useGame();
  const [recipeId, setRecipeId] = useState(RECIPE_LIST[0]?.id || '');
  const [buildingId, setBuildingId] = useState('');
  const [mode, setMode] = useState<'continuo' | 'mantener'>('continuo');
  const [target, setTarget] = useState('100');

  const facilities = useMemo(
    () => state.buildings.filter(b => b.count > 0).map(b => ({ ...b, def: BUILDING_LIST.find(d => d.id === b.id) })).filter(b => b.def),
    [state.buildings],
  );
  const availableRecipes = RECIPE_LIST.filter(r =>
    state.skills[r.skillId]?.level >= r.requiredLevel &&
    (!r.requiredTech || isTechUnlocked(state, r.requiredTech)) &&
    r.outputs.some(o => o.resourceId !== 'tool') && (!r.requiredBuilding || r.requiredBuilding === selectedFacility),
  );
  const selectedFacility = buildingId || facilities[0]?.id || '';

  return (
    <div className="panel automation-panel">
      <h2>⚙️ Gestión de producción</h2>
      <p className="panel-desc">Configurá instalaciones para fabricar automáticamente. Cada orden mantiene como máximo una fabricación pendiente, así evitás consumir todos los materiales de golpe.</p>
      <div className="automation-create">
        <h3>Nueva línea de producción</h3>
        {facilities.length === 0 ? (
          <p className="empty">Todavía no hay instalaciones. Construí un Taller, Aserradero, Horno o Fogata para comenzar a automatizar.</p>
        ) : (
          <>
            <label className="field-label">Instalación</label>
            <select className="field-select" value={selectedFacility} onChange={e => setBuildingId(e.target.value)}>
              {facilities.map(f => <option key={f.id} value={f.id}>{f.def?.name} · {f.count} construida(s)</option>)}
            </select>
            <label className="field-label">Receta</label>
            <select className="field-select" value={recipeId} onChange={e => setRecipeId(e.target.value)}>
              {availableRecipes.map(r => <option key={r.id} value={r.id}>{r.name} · {r.durationMs / 1000}s</option>)}
            </select>
            <label className="field-label">Modo de producción</label>
            <select className="field-select" value={mode} onChange={e => setMode(e.target.value as 'continuo' | 'mantener')}>
              <option value="continuo">Producción continua (hasta detener)</option>
              <option value="mantener">Mantener una cantidad en inventario</option>
            </select>
            {mode === 'mantener' && (
              <>
                <label className="field-label">Cantidad objetivo del primer producto</label>
                <input className="field-input" type="number" min="1" value={target} onChange={e => setTarget(e.target.value)} />
              </>
            )}
            <button
              className="btn primary"
              disabled={!recipeId || !selectedFacility || state.automationOrders.some(o => o.recipeId === recipeId && o.buildingId === selectedFacility)}
              onClick={() => doCreateAutomation(recipeId, selectedFacility, mode, Math.max(1, Number(target) || 1))}
            >+ Crear automatización</button>
            <p className="recipe-meta">Las órdenes consumen los ingredientes de a una fabricación por vez. Necesitan materiales y una instalación construida.</p>
          </>
        )}
      </div>

      <h3>Órdenes configuradas ({state.automationOrders.length})</h3>
      {state.automationOrders.length === 0 ? (
        <p className="empty">No configuraste líneas de producción todavía.</p>
      ) : (
        <div className="automation-list">
          {state.automationOrders.map(order => {
            const recipe = RECIPE_LIST.find(r => r.id === order.recipeId);
            const building = BUILDING_LIST.find(b => b.id === order.buildingId);
            const queued = state.craftQueue.some(q => q.automationOrderId === order.id);
            const output = recipe?.outputs.find(o => o.resourceId !== 'tool');
            const current = output ? state.resources[output.resourceId as keyof typeof state.resources] || 0 : 0;
            const modeText = order.mode === 'continuo'
              ? 'Producción continua'
              : 'Mantener ' + order.targetAmount + ' ' + (output ? RESOURCES[output.resourceId as keyof typeof RESOURCES]?.name : 'unidades');
            return (
              <div className="automation-card" key={order.id}>
                <div className="automation-card-head">
                  <strong>{recipe?.name || order.recipeId}</strong>
                  <span className={order.enabled ? 'automation-on' : 'automation-off'}>{order.enabled ? '● Activa' : '○ Pausada'}</span>
                </div>
                <p className="recipe-meta">{building?.icon} {building?.name} · {modeText}</p>
                {order.mode === 'mantener' && <p className="recipe-meta">Inventario actual: {Math.floor(current)} / {order.targetAmount}</p>}
                <p className="recipe-meta">{queued ? 'Fabricación automática en curso o en cola.' : 'Esperando materiales para iniciar.'}</p>
                <div className="b-actions">
                  <button className="btn" onClick={() => doToggleAutomation(order.id)}>{order.enabled ? 'Pausar' : 'Reanudar'}</button>
                  <button className="btn danger" onClick={() => doRemoveAutomation(order.id)}>Eliminar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <h3>Cola de fabricación</h3>
      {state.craftQueue.length === 0 ? <p className="empty">No hay objetos en fabricación.</p> : (
        <div className="automation-queue">
          {state.craftQueue.map((item, index) => {
            const recipe = RECIPE_LIST.find(r => r.id === item.recipeId);
            const progress = recipe ? Math.min(100, item.progressMs / recipe.durationMs * 100) : 0;
            return <div className="queue-item" key={index}>
              <span>{recipe?.name} ×{item.remaining}{item.automationOrderId ? ' · Automático' : ' · Manual'}</span>
              <div className="mini-bar"><div style={{ width: progress + '%' }} /></div>
            </div>;
          })}
        </div>
      )}
      {availableRecipes.length === 0 && <p className="empty">Desbloqueá recetas y habilidades para configurar nuevas líneas.</p>}
    </div>
  );
}
