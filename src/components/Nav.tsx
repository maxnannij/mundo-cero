interface NavProps {
  tab: string;
  setTab: (t: string) => void;
}

const TABS = [
  { id: 'inicio', label: 'Inicio', icon: '🏠' },
  { id: 'habilidades', label: 'Habilidades', icon: '⚡' },
  { id: 'fabricacion', label: 'Fabricación', icon: '🛠️' },
  { id: 'construccion', label: 'Construcción', icon: '🏗️' },
  { id: 'automatizacion', label: 'Producción', icon: '⚙️' },
  { id: 'poblacion', label: 'Población', icon: '👥' },
  { id: 'tecnologia', label: 'Tecnología', icon: '🔬' },
  { id: 'inventario', label: 'Inventario', icon: '📦' },
  { id: 'objetivos', label: 'Objetivos', icon: '🎯' },
  { id: 'ajustes', label: 'Ajustes', icon: '⚙️' },
];

export function Nav({ tab, setTab }: NavProps) {
  return (
    <nav className="nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={`nav-btn ${tab === t.id ? 'active' : ''}`}
          onClick={() => setTab(t.id)}
        >
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
