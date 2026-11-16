import { useState } from 'react';
import { GameProvider, useGame } from './store/GameContext';
import { Header } from './components/Header';
import { Nav } from './components/Nav';
import { HomePanel } from './components/HomePanel';
import { SkillsPanel } from './components/SkillsPanel';
import { CraftPanel } from './components/CraftPanel';
import { BuildPanel } from './components/BuildPanel';
import { TechPanel } from './components/TechPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { ObjectivesPanel } from './components/ObjectivesPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { AutomationPanel } from './components/AutomationPanel';
import { PopulationPanel } from './components/PopulationPanel';
import { HelpPanel } from './components/HelpPanel';
import './App.css';

function GameApp() {
  const [tab, setTab] = useState('inicio');
  const { state, doRestart } = useGame();
  const gameOver = state.population.residents.length === 0;

  return (
    <div className="app">
      <Header />
      <Nav tab={tab} setTab={setTab} />
      <main className="main">
        {tab === 'inicio' && <HomePanel />}
        {tab === 'habilidades' && <SkillsPanel />}
        {tab === 'fabricacion' && <CraftPanel />}
        {tab === 'construccion' && <BuildPanel />}
        {tab === 'automatizacion' && <AutomationPanel />}
        {tab === 'poblacion' && <PopulationPanel />}
        {tab === 'tecnologia' && <TechPanel />}
        {tab === 'inventario' && <InventoryPanel />}
        {tab === 'objetivos' && <ObjectivesPanel />}
        {tab === 'ajustes' && <SettingsPanel />}
        {tab === 'ayuda' && <HelpPanel />}
      </main>
      {gameOver && (
        <div className="gameover-backdrop" role="dialog" aria-modal="true" aria-labelledby="gameover-title">
          <div className="gameover-panel">
            <div className="gameover-mark">MUNDO CERO</div>
            <p className="gameover-kicker">FIN DE LA CIVILIZACIÓN</p>
            <h2 id="gameover-title">GAME OVER</h2>
            <p className="gameover-message">
              El último habitante ha desaparecido. Ya no queda nadie para continuar la reconstrucción.
            </p>
            <div className="gameover-divider" />
            <p className="gameover-prompt">Pero la historia puede comenzar otra vez.</p>
            <button className="gameover-restart" onClick={doRestart}>
              ↻ Comenzar una nueva partida
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}
