import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { SKILLS, SKILL_LIST, xpForLevel, type SkillId } from '../data/skills';
import { isTechUnlocked, hasBuilding } from '../store/gameState';
import { TOOLS } from '../data/tools';
import { RESOURCES } from '../data/resources';
import { getCalendarInfo } from '../data/calendar';
import { masteryXpForNext } from '../store/gameState';

export function SkillsPanel() {
  const { state, startAct, stopAct, doEquip, doChooseSpecialization } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('tala');
  const [target, setTarget] = useState<string>('');
  const skill = SKILLS[selectedSkill];
  const skillState = state.skills[selectedSkill];
  const xpNeeded = xpForLevel(skillState.level);
  const xpPct = Math.min(100, (skillState.xp / xpNeeded) * 100);
  const availableSkills = SKILL_LIST.filter(s => s.id !== 'metalurgia' || isTechUnlocked(state, 'metalurgia_basica'));
  const active = state.activeActivity;
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

        {(selectedSkill === 'tala' || selectedSkill === 'mineria') && (
          <div className="tool-section">
            <h3>Herramienta equipada</h3>
            <div className="tool-row">
              {Object.values(TOOLS).filter(t => t.category === (selectedSkill === 'tala' ? 'hacha' : 'pico')).map(t => {
                const owned = state.ownedTools.includes(t.id);
                const equipped = state.equippedTools[t.category] === t.id;
                return (
                  <button key={t.id} className={`tool-btn ${equipped ? 'equipped' : ''} ${!owned ? 'locked' : ''}`}
                    disabled={!owned} onClick={() => doEquip(t.id)} title={t.description}>
                    {t.icon} {t.name} {equipped ? '✓' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <h3>Actividades · {season}</h3>
        <div className="activities">
          {skill.activities.map(act => {
            const levelReady = skillState.level >= act.requiredLevel;
            const techReady = !act.unlockTech || isTechUnlocked(state, act.unlockTech);
            const buildingReady = !act.requiredBuilding || hasBuilding(state, act.requiredBuilding);
            const seasonReady = !act.seasonsAvailable || act.seasonsAvailable.includes(season);
            const materialsReady = !act.inputs || act.inputs.every(i => (state.resources[i.resourceId] || 0) >= i.amount);
            const unlocked = levelReady && techReady && buildingReady && seasonReady;
            const isActive = active?.skillId === selectedSkill && active?.activityId === act.id;
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
                    {isActive ? (
                      <button className="btn danger" onClick={stopAct}>Detener</button>
                    ) : (
                      <>
                        <button className="btn primary" disabled={!materialsReady} onClick={() => startAct(selectedSkill, act.id)}>Iniciar</button>
                        <input type="number" placeholder="Acciones" min={1} value={target}
                          onChange={e => setTarget(e.target.value)} className="target-input" />
                        <button className="btn" disabled={!materialsReady || !Number.isFinite(Number(target)) || Number(target) < 1}
                          onClick={() => startAct(selectedSkill, act.id, Number(target))}>Hasta X acciones</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {skill.activities.length === 0 && <p className="empty">Esta habilidad se utiliza principalmente mediante fabricación o construcción.</p>}
        </div>

        {active && active.skillId === selectedSkill && (
          <div className="active-status">
            <h4>Actividad en curso</h4>
            <p>{SKILLS[active.skillId].activities.find(a => a.id === active.activityId)?.name} · Acciones: {active.actionsDone}{active.targetAmount ? ' / ' + active.targetAmount : ''}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: Math.min(100, active.progressMs / (SKILLS[active.skillId].activities.find(a => a.id === active.activityId)?.durationMs || 1) * 100) + '%' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
