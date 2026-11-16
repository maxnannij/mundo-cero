import { useState } from 'react';
import { useGame } from '../store/GameContext';
import { SKILLS, SKILL_LIST, xpForLevel, type SkillId } from '../data/skills';
import { isTechUnlocked } from '../store/gameState';
import { TOOLS } from '../data/tools';

export function SkillsPanel() {
  const { state, startAct, stopAct, doEquip } = useGame();
  const [selectedSkill, setSelectedSkill] = useState<SkillId>('tala');
  const [target, setTarget] = useState<string>('');

  const skill = SKILLS[selectedSkill];
  const skillState = state.skills[selectedSkill];
  const xpNeeded = xpForLevel(skillState.level);
  const xpPct = Math.min(100, (skillState.xp / xpNeeded) * 100);

  const availableSkills = SKILL_LIST.filter(s => {
    if (s.id === 'metalurgia') return isTechUnlocked(state, 'metalurgia_basica');
    return true;
  });

  const active = state.activeActivity;

  return (
    <div className="panel skills-panel">
      <div className="skill-list">
        {availableSkills.map(s => {
          const st = state.skills[s.id];
          return (
            <button
              key={s.id}
              className={`skill-item ${selectedSkill === s.id ? 'selected' : ''}`}
              onClick={() => setSelectedSkill(s.id)}
            >
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
            <div className="xp-bar" style={{ width: `${xpPct}%` }} />
            <span className="xp-text">
              {Math.floor(skillState.xp)} / {xpNeeded} XP · Nivel {skillState.level}
            </span>
          </div>
        </div>

        {(selectedSkill === 'tala' || selectedSkill === 'mineria') && (
          <div className="tool-section">
            <h3>Herramienta equipada</h3>
            <div className="tool-row">
              {Object.values(TOOLS)
                .filter(t => t.category === (selectedSkill === 'tala' ? 'hacha' : 'pico'))
                .map(t => {
                  const owned = state.ownedTools.includes(t.id);
                  const equipped = state.equippedTools[t.category] === t.id;
                  return (
                    <button
                      key={t.id}
                      className={`tool-btn ${equipped ? 'equipped' : ''} ${!owned ? 'locked' : ''}`}
                      disabled={!owned}
                      onClick={() => doEquip(t.id)}
                      title={t.description}
                    >
                      {t.icon} {t.name} {equipped ? '✓' : ''}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <h3>Actividades</h3>
        <div className="activities">
          {skill.activities.map(act => {
            const unlocked =
              skillState.level >= act.requiredLevel &&
              (!act.unlockTech || isTechUnlocked(state, act.unlockTech));
            const isActive =
              active?.skillId === selectedSkill && active?.activityId === act.id;

            return (
              <div key={act.id} className={`activity-card ${!unlocked ? 'locked' : ''} ${isActive ? 'active' : ''}`}>
                <div className="act-header">
                  <strong>{act.name}</strong>
                  <span className="act-meta">Nv.{act.requiredLevel} · {(act.durationMs / 1000).toFixed(1)}s · +{act.xp} XP</span>
                </div>
                <p className="act-desc">{act.description}</p>
                <div className="act-outputs">
                  {act.outputs.map((o, i) => (
                    <span key={i} className="out-chip">
                      {o.amount} {o.resourceId}{o.chance && o.chance < 1 ? ` (${Math.round(o.chance * 100)}%)` : ''}
                    </span>
                  ))}
                </div>
                {!unlocked ? (
                  <div className="locked-msg">
                    {skillState.level < act.requiredLevel
                      ? `Requiere nivel ${act.requiredLevel}`
                      : `Requiere tecnología: ${act.unlockTech}`}
                  </div>
                ) : (
                  <div className="act-actions">
                    {isActive ? (
                      <button className="btn danger" onClick={stopAct}>Detener</button>
                    ) : (
                      <>
                        <button
                          className="btn primary"
                          onClick={() => startAct(selectedSkill, act.id)}
                        >
                          Iniciar
                        </button>
                        <input
                          type="number"
                          placeholder="Meta"
                          min={1}
                          value={target}
                          onChange={e => setTarget(e.target.value)}
                          className="target-input"
                        />
                        <button
                          className="btn"
                          onClick={() => {
                            const n = parseInt(target, 10);
                            if (n > 0) startAct(selectedSkill, act.id, n);
                          }}
                        >
                          Hasta X
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {skill.activities.length === 0 && (
            <p className="empty">Esta habilidad se usa principalmente a través de Fabricación o Construcción.</p>
          )}
        </div>

        {active && active.skillId === selectedSkill && (
          <div className="active-status">
            <h4>Actividad en curso</h4>
            <p>
              {SKILLS[active.skillId].activities.find(a => a.id === active.activityId)?.name} ·
              Acciones: {active.actionsDone}
              {active.targetAmount ? ` / ${active.targetAmount}` : ''}
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min(100, (active.progressMs / (SKILLS[active.skillId].activities.find(a => a.id === active.activityId)?.durationMs || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
