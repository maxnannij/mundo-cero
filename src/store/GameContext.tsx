import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import type { GameState } from './gameState';
import {
  loadGame,
  saveGame,
  tick,
  processOffline,
  startActivity,
  stopActivity,
  queueCraft,
  buildBuilding,
  upgradeBuilding,
  researchTech,
  equipTool,
  resetGame,
  exportSave,
  importSave,
} from '../systems/gameEngine';
import type { SkillId } from '../data/skills';

type Action =
  | { type: 'SET_STATE'; payload: GameState }
  | { type: 'TICK'; delta: number }
  | { type: 'START_ACTIVITY'; skillId: SkillId; activityId: string; target?: number }
  | { type: 'STOP_ACTIVITY' }
  | { type: 'QUEUE_CRAFT'; recipeId: string; qty: number }
  | { type: 'BUILD'; buildingId: string }
  | { type: 'UPGRADE'; buildingId: string }
  | { type: 'RESEARCH'; techId: string }
  | { type: 'EQUIP'; toolId: string }
  | { type: 'ADD_LOG'; message: string }
  | { type: 'RESET' }
  | { type: 'IMPORT'; state: GameState };

function reducer(state: GameState, action: Action): GameState {
  const next = { ...state };
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'TICK': {
      tick(next, action.delta);
      return { ...next };
    }
    case 'START_ACTIVITY': {
      startActivity(next, action.skillId, action.activityId, action.target);
      return { ...next };
    }
    case 'STOP_ACTIVITY': {
      stopActivity(next);
      return { ...next };
    }
    case 'QUEUE_CRAFT': {
      queueCraft(next, action.recipeId, action.qty);
      return { ...next };
    }
    case 'BUILD': {
      buildBuilding(next, action.buildingId);
      return { ...next };
    }
    case 'UPGRADE': {
      upgradeBuilding(next, action.buildingId);
      return { ...next };
    }
    case 'RESEARCH': {
      researchTech(next, action.techId);
      return { ...next };
    }
    case 'EQUIP': {
      equipTool(next, action.toolId);
      return { ...next };
    }
    case 'RESET':
      return resetGame();
    case 'IMPORT':
      return action.state;
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  startAct: (skillId: SkillId, activityId: string, target?: number) => void;
  stopAct: () => void;
  doCraft: (recipeId: string, qty: number) => void;
  doBuild: (id: string) => void;
  doUpgrade: (id: string) => void;
  doResearch: (id: string) => void;
  doEquip: (id: string) => void;
  doReset: () => void;
  doExport: () => string;
  doImport: (json: string) => boolean;
  saveNow: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, () => {
    const loaded = loadGame();
    processOffline(loaded);
    return loaded;
  });

  const lastTime = useRef(Date.now());
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    let frame: number;
    const loop = () => {
      const now = Date.now();
      const delta = now - lastTime.current;
      lastTime.current = now;
      if (delta > 0 && delta < 5000) {
        dispatch({ type: 'TICK', delta });
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    saveTimer.current = window.setInterval(() => {
      saveGame(state);
    }, 15000);
    return () => {
      if (saveTimer.current) clearInterval(saveTimer.current);
    };
  }, [state]);

  useEffect(() => {
    const handler = () => saveGame(state);
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state]);

  const startAct = useCallback((skillId: SkillId, activityId: string, target?: number) => {
    dispatch({ type: 'START_ACTIVITY', skillId, activityId, target });
  }, []);

  const stopAct = useCallback(() => dispatch({ type: 'STOP_ACTIVITY' }), []);
  const doCraft = useCallback((recipeId: string, qty: number) => dispatch({ type: 'QUEUE_CRAFT', recipeId, qty }), []);
  const doBuild = useCallback((id: string) => dispatch({ type: 'BUILD', buildingId: id }), []);
  const doUpgrade = useCallback((id: string) => dispatch({ type: 'UPGRADE', buildingId: id }), []);
  const doResearch = useCallback((id: string) => dispatch({ type: 'RESEARCH', techId: id }), []);
  const doEquip = useCallback((id: string) => dispatch({ type: 'EQUIP', toolId: id }), []);
  const doReset = useCallback(() => {
    if (confirm('¿Reiniciar partida? Se perderá todo el progreso.')) {
      dispatch({ type: 'RESET' });
    }
  }, []);
  const doExport = useCallback(() => exportSave(state), [state]);
  const doImport = useCallback((json: string) => {
    const s = importSave(json);
    if (s) {
      dispatch({ type: 'IMPORT', state: s });
      return true;
    }
    return false;
  }, []);
  const saveNow = useCallback(() => saveGame(state), [state]);

  return (
    <GameContext.Provider
      value={{
        state,
        dispatch,
        startAct,
        stopAct,
        doCraft,
        doBuild,
        doUpgrade,
        doResearch,
        doEquip,
        doReset,
        doExport,
        doImport,
        saveNow,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
