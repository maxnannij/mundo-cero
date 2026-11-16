import { useState } from 'react';
import { GameProvider } from './store/GameContext';
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
import './App.css';

function GameApp() {
  const [tab, setTab] = useState('inicio');

  return (
    <div className="app">
      <Header />
      <Nav tab={tab} setTab={setTab} />
      <main className="main">
        {tab === 'inicio' && <HomePanel />}
        {tab === 'habilidades' && <SkillsPanel />}
        {tab === 'fabricacion' && <CraftPanel />}
        {tab === 'construccion' && <BuildPanel />}
        {tab === 'tecnologia' && <TechPanel />}
        {tab === 'inventario' && <InventoryPanel />}
        {tab === 'objetivos' && <ObjectivesPanel />}
        {tab === 'ajustes' && <SettingsPanel />}
      </main>
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
