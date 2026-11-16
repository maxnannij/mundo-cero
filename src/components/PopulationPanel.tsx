import { useGame } from '../store/GameContext';
import { BUILDING_LIST } from '../data/buildings';
import { getCalendarInfo, DAYS_PER_SEASON, DAYS_PER_YEAR } from '../data/calendar';
import { ADULT_AGE_DAYS, getAssignedWorkers, getAvailableWorkers } from '../store/gameState';

function yearsOld(ageDays: number): number { return Math.floor(ageDays / DAYS_PER_YEAR); }

export function PopulationPanel() {
  const { state, doAssignWorker, doSetReproduction } = useGame();
  const calendar = getCalendarInfo(state.calendar);
  const residents = state.population.residents;
  const adults = residents.filter(r => r.ageDays >= ADULT_AGE_DAYS).length;
  const children = residents.length - adults;
  const dailyFood = residents.length * 20;
  const foodStored = (state.resources.bayas || 0) + (state.resources.comida_cocida || 0) * (20 / 3);
  const foodDays = dailyFood > 0 ? foodStored / dailyFood : 0;
  const totalWorkers = getAssignedWorkers(state);
  const available = getAvailableWorkers(state);
  const winter = calendar.season === 'invierno';
  const woodPerDay = winter ? adults * 0.35 + children * 0.18 : 0;
  const hasFire = state.buildings.some(b => b.id === 'fogata' && b.count > 0);
  const estimatedWood = woodPerDay * (hasFire ? 0.55 : 1);

  return (
    <div className="panel population-panel">
      <h2>👥 Población y asentamiento</h2>
      <p className="panel-desc">Administrá a los primeros habitantes, sus necesidades y la fuerza de trabajo de la comunidad.</p>
      <div className="population-summary">
        <div className="population-stat"><strong>{residents.length}</strong><span>Habitantes</span></div>
        <div className="population-stat"><strong>{adults}</strong><span>Adultos</span></div>
        <div className="population-stat"><strong>{children}</strong><span>Niños</span></div>
        <div className="population-stat"><strong>{available}</strong><span>Trabajadores libres</span></div>
      </div>

      <section className="season-card">
        <div className="season-heading">
          <div><span className="season-icon">{calendar.seasonIcon}</span><strong>{calendar.seasonName}</strong></div>
          <span>Año {calendar.year} · Día {calendar.dayOfSeason}/{DAYS_PER_SEASON}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: (calendar.progress * 100) + '%' }} /></div>
        <p>{calendar.seasonDescription}</p>
        <small>Un día de juego equivale a 2 minutos reales. Cada estación dura 30 días de juego y cada año tiene 120 días.</small>
      </section>

      <section className="needs-grid">
        <div className="need-card">
          <strong>🍲 Alimentación</strong>
          <span>{foodStored.toFixed(1)} bayas equivalentes en reserva</span>
          <b className={foodDays < 2 ? 'warning-text' : 'good-text'}>{foodDays.toFixed(1)} días de reserva</b>
          <small>Consumo del asentamiento: {dailyFood} bayas equivalentes/día ({residents.length * 3} comidas cocidas). Se prioriza la comida cocida; las bayas completan lo que falte.</small>
        </div>
        <div className="need-card">
          <strong>🪵 Calefacción</strong>
          <span>{winter ? 'Necesaria durante el invierno' : 'No necesaria en esta estación'}</span>
          <b className={winter && state.resources.madera < estimatedWood * 3 ? 'warning-text' : 'good-text'}>
            {winter ? estimatedWood.toFixed(2) + ' madera/día' : '0 madera/día'}
          </b>
          <small>{hasFire ? 'La fogata reduce el consumo de leña.' : 'Construí una fogata para mejorar la eficiencia térmica.'}</small>
        </div>
      </section>

      <section className="population-section">
        <div className="section-heading">
          <h3>Habitantes</h3>
          <label className="toggle-row">
            <input type="checkbox" checked={state.population.reproductionEnabled} onChange={e => doSetReproduction(e.target.checked)} />
            Permitir reproducción
          </label>
        </div>
        {residents.map(resident => {
          const pregnant = (resident.pregnancyDaysRemaining || 0) > 0;
          const progress = Math.min(100, ((resident.conceptionProgressDays || 0) / 45) * 100);
          const adult = resident.ageDays >= ADULT_AGE_DAYS;
          return (
            <div className="resident-card" key={resident.id}>
              <div className="resident-main">
                <span className="resident-icon">{adult ? (resident.sex === 'hombre' ? '👨' : '👩') : '🧒'}</span>
                <div>
                  <strong>{resident.name}</strong>
                  <small>{resident.sex} · {yearsOld(resident.ageDays)} años · vida estimada {Math.round(resident.lifeExpectancyYears || 90)} años · Salud {Math.round(resident.health)}%</small>
                </div>
                <span className="resident-condition">{resident.hungerDays > 0 ? '🍽️ Hambre' : resident.coldDays > 0 ? '🥶 Frío' : '✓ Bien'}</span>
              </div>
              {resident.sex === 'mujer' && resident.partnerId && (
                <div className="reproduction-progress">
                  {pregnant ? <span>🤰 Embarazo: {resident.pregnancyDaysRemaining} días restantes</span> :
                    state.population.reproductionEnabled ? <span>Progreso de concepción: {resident.conceptionProgressDays || 0}/45 días</span> : <span>Reproducción pausada</span>}
                  {!pregnant && <div className="progress-bar"><div className="progress-fill" style={{ width: progress + '%' }} /></div>}
                </div>
              )}
            </div>
          );
        })}
        <p className="recipe-meta">Los niños consumen menos comida y no trabajan hasta cumplir 18 años de juego.</p>
      </section>

      <section className="population-section">
        <h3>Asignación de trabajadores</h3>
        <p className="panel-desc">Cada instalación productiva necesita trabajadores para funcionar. La producción se ajusta a la proporción de personal asignado.</p>
        {state.buildings.filter(b => BUILDING_LIST.find(d => d.id === b.id)?.production).length === 0 ? (
          <p className="empty">Construí un Aserradero, Cantera o Huerto para asignar trabajadores.</p>
        ) : state.buildings.filter(b => BUILDING_LIST.find(d => d.id === b.id)?.production).map(building => {
          const def = BUILDING_LIST.find(d => d.id === building.id)!;
          const max = (def.workersRequired || 1) * building.count;
          return (
            <div className="worker-row" key={building.id}>
              <div><strong>{def.icon} {def.name}</strong><small>{building.workersAssigned}/{max} trabajadores</small></div>
              <div className="worker-controls">
                <button className="btn" disabled={building.workersAssigned <= 0} onClick={() => doAssignWorker(building.id, -1)}>−</button>
                <button className="btn" disabled={available <= 0 || building.workersAssigned >= max} onClick={() => doAssignWorker(building.id, 1)}>+</button>
              </div>
            </div>
          );
        })}
        <div className="staff-footer">En instalaciones: {totalWorkers} · En tareas: {state.activeActivities.length} · Disponible: {available}</div>
      </section>

      <section className="population-section">
        <h3>Reglas de crecimiento</h3>
        <ul className="population-rules">
          <li>El asentamiento comienza con Aren y Lira, una pareja adulta.</li>
          <li>Para tener hijos necesitan un refugio, alimentos suficientes y buena salud.</li>
          <li>La concepción requiere 45 días favorables y el embarazo dura 280 días de juego.</li>
          <li>La esperanza de vida es individual y aleatoria, con una media cercana a 90 años.</li>
          <li>La población está limitada inicialmente a 30 habitantes.</li>
          <li>La falta de alimentos o calefacción reduce la salud y pausa el crecimiento familiar.</li>
        </ul>
        <small>El tiempo está acelerado: 1 día de juego equivale a 2 minutos reales. La simulación continúa al volver, hasta el límite offline configurado.</small>
      </section>
    </div>
  );
}
