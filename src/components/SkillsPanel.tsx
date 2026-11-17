import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { SKILLS, SKILL_LIST, xpForLevel, type SkillId } from '../data/skills';
import { isTechUnlocked, hasBuilding, getAvailableResidents } from '../store/gameState';
import { RESOURCES } from '../data/resources';
import { getCalendarInfo } from '../data/calendar';
import { masteryXpForNext } from '../store/gameState';
import { TOOLS } from '../data/tools';

export function SkillsPanel() {
  const { state, startAct, stopAct, doChooseSpecialization } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('tala');
  const [target, setTarget] = useState<string>('');
  const [selectedResidentId, setSelectedResidentId] = useState<string>('');
  const skill = SKILLS[selectedSkill];
  const skillState = state.skills[selectedSkill];
  const xpNeeded = xpForLevel(skillState.level);
  const xpPct = Math.min(100, (skillState.xp / xpNeeded) * 100);
  const availableSkills = SKILL_LIST.filter(s => s.id !== 'metalurgia' || isTechUnlocked(state, 'metalurgia_basica'));
  const activeActivities = state.activeActivities;
  const availableResidents = getAvailableResidents(state);
  const availableWorkers = availableResidents.length;
  const selectedResident = availableResidents.find(r => r.id === selectedResidentId) || availableResidents[0];
  const season = getCalendarInfo(state.calendar).season;

  return (
    <div className="panel skills-panel">
      <div className="skill-list">
        {availableSkills.map(s => {
          const st = state.skills[s.id];
          return (
            <button key={s.id} className={`skill-item ${selectedSkill === s.id ? 'selected' : ''}`} onClick={() => setSelectedSkill(s.id)}>
              <span className="skill-icon">{s.icon}</span>
              <div className="skill-info">
                <div className="skill-name">{s.name}</div>
                <div className="skill-level">Nv. {st.level}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="skill-detail">
        <div className="skill-header">
          <h2>{skill.icon} {skill.name}</h2>
          <p className="desc">{skill.description}</p>
          <div className="xp-bar-container">
            <div className="xp-bar" style={{ width: xpPct + '%' }} />
            <span className="xp-text">{Math.floor(skillState.xp)} / {xpNeeded} XP · Nivel {skillState.level}</span>
          </div>
          <div className="mastery-card">
            <div className="mastery-heading">
              <strong>Maestría {skillState.masteryLevel}/20</strong>
              <span>{Math.floor(skillState.masteryXp)} / {masteryXpForNext(skillState.masteryLevel)} XP</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: Math.min(100, skillState.masteryXp / masteryXpForNext(skillState.masteryLevel) * 100) + '%' }} /></div>
            <small>La maestría mejora el rendimiento de esta habilidad. Cada nivel otorga +1,5% de producción.</small>
            <div className="mastery-bonuses">
              <span>{skillState.level >= 10 ? '✓ +5% rendimiento por nivel 10' : 'Nivel 10: +5% rendimiento'}</span>
              <span>{skillState.level >= 20 ? '✓ +5% velocidad por nivel 20' : 'Nivel 20: +5% velocidad'}</span>
              <span>{skillState.level >= 40 ? '✓ +5% rendimiento por nivel 40' : 'Nivel 40: +5% rendimiento'}</span>
            </div>
            {skillState.specialization ? (
              <p className="good-text">Especialización: {skillState.specialization === 'velocidad' ? '⚡ Velocidad (-15% duración)' : '📦 Rendimiento (+20% producción)'}</p>
            ) : skillState.level >= 25 ? (
              <div className="specialization-picker">
                <strong>Elegí una especialización permanente</strong>
                <button className="btn" onClick={() => doChooseSpecialization(selectedSkill, 'velocidad')}>⚡ Velocidad · Acciones 15% más rápidas</button>
                <button className="btn" onClick={() => doChooseSpecialization(selectedSkill, 'rendimiento')}>📦 Rendimiento · +20% recursos</button>
              </div>
            ) : (
              <small>Al nivel 25 podrás elegir una especialización permanente.</small>
            )}
          </div>
        </div>

        <p className="recipe-meta">Las herramientas se equipan individualmente desde la ficha de cada aldeano en Población.</p>

        <h3>Actividades · {season}</h3>
        <p className={availableWorkers > 0 ? 'good-text' : 'warning-text'}>
          Trabajadores libres: {availableWorkers} · Tareas manuales en curso: {activeActivities.length}
        </p>
        <div className="activities">
          {skill.activities.map(act => {
            const levelReady = skillState.level >= act.requiredLevel;
            const techReady = !act.unlockTech || isTechUnlocked(state, act.unlockTech);
            const buildingReady = !act.requiredBuilding || hasBuilding(state, act.requiredBuilding);
            const seasonReady = !act.seasonsAvailable || act.seasonsAvailable.includes(season);
            const materialsReady = !act.inputs || act.inputs.every(i => (state.resources[i.resourceId] || 0) >= i.amount);
            const unlocked = levelReady && techReady && buildingReady && seasonReady;
            const activeTasksForActivity = activeActivities.filter(task => task.skillId === selectedSkill && task.activityId === act.id);
            const isActive = activeTasksForActivity.length > 0;
            const lockMessage = !levelReady ? 'Requiere nivel ' + act.requiredLevel
              : !techReady ? 'Requiere tecnología: ' + act.unlockTech
              : !buildingReady ? 'Requiere instalación: ' + act.requiredBuilding
              : !seasonReady ? 'No disponible durante ' + season
              : '';
            const resourceText = (id: keyof typeof RESOURCES) => RESOURCES[id]?.name || id;
            return (
              <div key={act.id} className={`activity-card ${!unlocked ? 'locked' : ''} ${isActive ? 'active' : ''}`}>
                <div className="act-header">
                  <strong>{act.name}</strong>
                  <span className="act-meta">Nv.{act.requiredLevel} · {(act.durationMs / 1000).toFixed(1)}s · +{act.xp} XP</span>
                </div>
                <p className="act-desc">{act.description}</p>
                <div className="act-outputs">
                  {act.outputs.map((o, i) => (
                    <span key={i} className="out-chip">{o.amount} {RESOURCES[o.resourceId]?.icon} {resourceText(o.resourceId)}{o.chance && o.chance < 1 ? ' (' + Math.round(o.chance * 100) + '%)' : ''}</span>
                  ))}
                </div>
                {act.inputs && act.inputs.length > 0 && (
                  <p className={materialsReady ? 'act-meta' : 'locked-msg'}>
                    Consume por acción: {act.inputs.map(i => i.amount + ' ' + resourceText(i.resourceId)).join(', ')}
                    {!materialsReady ? ' · Faltan materiales' : ''}
                  </p>
                )}
                {!unlocked ? (
                  <div className="locked-msg">{lockMessage}</div>
                ) : (
                  <div className="act-actions">
                    <select className="field-select activity-worker-select" value={selectedResident?.id || ''} disabled={availableWorkers < 1} onChange={e => setSelectedResidentId(e.target.value)}>
                      {availableWorkers === 0 && <option value="">Sin trabajadores libres</option>}
                      {availableResidents.map(resident => <option key={resident.id} value={resident.id}>{resident.name}</option>)}
                    </select>
                    <button className="btn primary" disabled={!materialsReady || !selectedResident} onClick={() => selectedResident && startAct(selectedSkill, act.id, selectedResident.id)}>
                      {isActive ? 'Asignar trabajador' : 'Iniciar'}
                    </button>
                    <input type="number" placeholder="Acciones" min={1} value={target}
                      onChange={e => setTarget(e.target.value)} className="target-input" />
                    <button className="btn" disabled={!materialsReady || !selectedResident || !Number.isFinite(Number(target)) || Number(target) < 1}
                      onClick={() => selectedResident && startAct(selectedSkill, act.id, selectedResident.id, Number(target))}>Hasta X acciones</button>
                    {selectedResident && act.requiredTool && (() => {
                      const tool = selectedResident.equipment?.tool ? TOOLS[selectedResident.equipment.tool] : undefined;
                      return <small className="act-meta">{tool && tool.category === act.requiredTool ? `${tool.icon} ${selectedResident.name}: ${tool.name} · ${Math.round((1 - (tool.bonuses.speedMult ?? 1)) * 100)}% más rápido · ${Math.round(((tool.bonuses.yieldMult ?? 1) - 1) * 100)}% más recursos` : `${selectedResident.name} no tiene una herramienta compatible (${act.requiredTool}).`}</small>;
                    })()}
                    {isActive && <small className="good-text">En curso: {activeTasksForActivity.length} trabajador(es) · podés asignar otro.</small>}
                    {availableWorkers < 1 && <small className="warning-text">No hay trabajadores libres. Liberá uno de una instalación o detené una tarea.</small>}
                  </div>
                )}
              </div>
            );
          })}
          {skill.activities.length === 0 && <p className="empty">Esta habilidad se utiliza principalmente mediante fabricación o construcción.</p>}
        </div>


        {activeActivities.length > 0 && (
          <div className="active-status">
            <h4>Tareas en curso</h4>
            {activeActivities.map(active => {
              const activeDef = SKILLS[active.skillId]?.activities.find(a => a.id === active.activityId);
              const duration = activeDef?.durationMs || 1;
              return (
                <div key={active.id} className="active-task-row">
                  <p>
                    <strong>{SKILLS[active.skillId]?.name}: {activeDef?.name || active.activityId}</strong>
                    {' · Trabajador: '}{state.population.residents.find(r => r.id === active.residentId)?.name || 'Aldeano'}
                    {' · Acciones: '}{active.actionsDone}{active.targetAmount ? ` / ${active.targetAmount}` : ''}
                    <button className="btn danger" onClick={() => stopAct(active.id)}>Detener</button>
                  </p>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: Math.min(100, active.progressMs / duration * 100) + '%' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
