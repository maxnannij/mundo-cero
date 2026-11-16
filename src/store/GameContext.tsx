import React, { createContext, useContext, useEffect, useReducer, useRef, useCallback } from 'react';
import type { GameState, AutomationMode } from './gameState';
import {
  loadGame, saveGame, tick, processOffline, startActivity, stopActivity, queueCraft,
  buildBuilding, upgradeBuilding, researchTech, equipTool, resetGame, exportSave, importSave,
  assignWorker, setReproduction, createAutomationOrder, toggleAutomationOrder, removeAutomationOrder,
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
  | { type: 'ASSIGN_WORKER'; buildingId: string; delta: number }
  | { type: 'SET_REPRODUCTION'; enabled: boolean }
  | { type: 'CREATE_AUTOMATION'; recipeId: string; buildingId: string; mode: AutomationMode; target: number }
  | { type: 'TOGGLE_AUTOMATION'; orderId: string }
  | { type: 'REMOVE_AUTOMATION'; orderId: string }
  | { type: 'RESET' }
  | { type: 'IMPORT'; state: GameState };

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'SET_STATE') return action.payload;
  if (action.type === 'IMPORT') return action.state;
  if (action.type === 'RESET') return resetGame();

  // The simulation mutates its working state. Clone nested data so React state
  // remains immutable and StrictMode can safely replay reducer calls.
  const next = structuredClone(state);
  switch (action.type) {
    case 'TICK': tick(next, action.delta); break;
    case 'START_ACTIVITY': startActivity(next, action.skillId, action.activityId, action.target); break;
    case 'STOP_ACTIVITY': stopActivity(next); break;
    case 'QUEUE_CRAFT': queueCraft(next, action.recipeId, action.qty); break;
    case 'BUILD': buildBuilding(next, action.buildingId); break;
    case 'UPGRADE': upgradeBuilding(next, action.buildingId); break;
    case 'RESEARCH': researchTech(next, action.techId); break;
    case 'EQUIP': equipTool(next, action.toolId); break;
    case 'ASSIGN_WORKER': assignWorker(next, action.buildingId, action.delta); break;
    case 'SET_REPRODUCTION': setReproduction(next, action.enabled); break;
    case 'CREATE_AUTOMATION': createAutomationOrder(next, action.recipeId, action.buildingId, action.mode, action.target); break;
    case 'TOGGLE_AUTOMATION': toggleAutomationOrder(next, action.orderId); break;
    case 'REMOVE_AUTOMATION': removeAutomationOrder(next, action.orderId); break;
    default: return state;
  }
  return next;
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
  doAssignWorker: (buildingId: string, delta: number) => void;
  doSetReproduction: (enabled: boolean) => void;
  doCreateAutomation: (recipeId: string, buildingId: string, mode: AutomationMode, target: number) => void;
  doToggleAutomation: (orderId: string) => void;
  doRemoveAutomation: (orderId: string) => void;
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
  const stateRef = useRef(state);
  stateRef.current = state;
  const lastTime = useRef(Date.now());

  // A modest fixed tick prevents a render on every animation frame. Large
  // deltas after a background tab are simulated (up to the offline cap).
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.max(0, Math.min(now - lastTime.current, 8 * 60 * 60 * 1000));
      lastTime.current = now;
      if (delta > 0) dispatch({ type: 'TICK', delta });
    }, 250);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const save = () => saveGame(stateRef.current);
    const timer = window.setInterval(save, 15000);
    const onVisibility = () => { if (document.visibilityState === 'hidden') save(); };
    window.addEventListener('beforeunload', save);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', save);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const startAct = useCallback((skillId: SkillId, activityId: string, target?: number) => dispatch({ type: 'START_ACTIVITY', skillId, activityId, target }), []);
  const stopAct = useCallback(() => dispatch({ type: 'STOP_ACTIVITY' }), []);
  const doCraft = useCallback((recipeId: string, qty: number) => dispatch({ type: 'QUEUE_CRAFT', recipeId, qty }), []);
  const doBuild = useCallback((id: string) => dispatch({ type: 'BUILD', buildingId: id }), []);
  const doUpgrade = useCallback((id: string) => dispatch({ type: 'UPGRADE', buildingId: id }), []);
  const doResearch = useCallback((id: string) => dispatch({ type: 'RESEARCH', techId: id }), []);
  const doEquip = useCallback((id: string) => dispatch({ type: 'EQUIP', toolId: id }), []);
  const doAssignWorker = useCallback((buildingId: string, delta: number) => dispatch({ type: 'ASSIGN_WORKER', buildingId, delta }), []);
  const doSetReproduction = useCallback((enabled: boolean) => dispatch({ type: 'SET_REPRODUCTION', enabled }), []);
  const doCreateAutomation = useCallback((recipeId: string, buildingId: string, mode: AutomationMode, target: number) => dispatch({ type: 'CREATE_AUTOMATION', recipeId, buildingId, mode, target }), []);
  const doToggleAutomation = useCallback((orderId: string) => dispatch({ type: 'TOGGLE_AUTOMATION', orderId }), []);
  const doRemoveAutomation = useCallback((orderId: string) => dispatch({ type: 'REMOVE_AUTOMATION', orderId }), []);
  const doReset = useCallback(() => {
    if (confirm('¿Reiniciar partida? Se perderá todo el progreso.')) dispatch({ type: 'RESET' });
  }, []);
  const doExport = useCallback(() => exportSave(stateRef.current), []);
  const doImport = useCallback((json: string) => {
    const imported = importSave(json);
    if (!imported) return false;
    dispatch({ type: 'IMPORT', state: imported });
    saveGame(imported);
    return true;
  }, []);
  const saveNow = useCallback(() => saveGame(stateRef.current), []);

  return (
    <GameContext.Provider value={{
      state, dispatch, startAct, stopAct, doCraft, doBuild, doUpgrade, doResearch, doEquip,
      doAssignWorker, doSetReproduction, doCreateAutomation, doToggleAutomation, doRemoveAutomation,
      doReset, doExport, doImport, saveNow,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
