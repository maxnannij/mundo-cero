import { useGame } from '../store/GameContext';
import { RESOURCE_LIST } from '../data/resources';
import { getMaxStorage } from '../store/gameState';
import { TOOLS } from '../data/tools';

export function InventoryPanel() {
  const { state } = useGame();
  const max = getMaxStorage(state);

  const byCategory = RESOURCE_LIST.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, typeof RESOURCE_LIST>);

  const catNames: Record<string, string> = {
    natural: 'Materiales naturales',
    mineral: 'Minerales',
    alimento: 'Alimentos',
    componente: 'Componentes',
    fabricado: 'Fabricados',
    cientifico: 'Científicos',
  };

  return (
    <div className="panel">
      <h2>📦 Inventario</h2>
      <p className="panel-desc">Capacidad de almacenamiento: {max} (mejorable con Refugios)</p>

      {Object.entries(byCategory).map(([cat, list]) => (
        <div key={cat} className="inv-section">
          <h3>{catNames[cat] || cat}</h3>
          <div className="inv-grid">
            {list.map(r => {
              const amount = Math.floor(state.resources[r.id] || 0);
              if (amount === 0 && !['madera', 'piedra', 'fibra', 'bayas', 'conocimiento'].includes(r.id)) return null;
              return (
                <div key={r.id} className="inv-item" title={r.description}>
                  <span className="inv-icon">{r.icon}</span>
                  <div>
                    <div className="inv-name">{r.name}</div>
                    <div className="inv-amount">{amount}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="inv-section">
        <h3>Herramientas poseídas</h3>
        <div className="inv-grid">
          {state.ownedTools.length === 0 && <p className="empty">Ninguna aún.</p>}
          {state.ownedTools.map(id => {
            const t = TOOLS[id];
            if (!t) return null;
            const available = state.toolInventory[id] || 0;
            const equippedCount = state.population.residents.filter(resident => resident.equipment?.tool === id).length;
            const equipped = equippedCount > 0;
            return (
              <div key={id} className={`inv-item ${equipped ? 'equipped' : ''}`}>
                <span className="inv-icon">{t.icon}</span>
                <div>
                  <div className="inv-name">{t.name}</div>
                  <div className="inv-amount">{available} en depósito · {equippedCount} equipada(s)</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
