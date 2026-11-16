import { useState } from 'react';
import { useGame } from '../store/GameContext';

export function SettingsPanel() {
  const { state, doReset, doExport, doImport, saveNow } = useGame();
  const [importText, setImportText] = useState('');
  const [msg, setMsg] = useState('');

  const handleExport = () => {
    const data = doExport();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mundo-cero-save-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg('Partida exportada.');
  };

  const handleImport = () => {
    if (doImport(importText)) {
      setMsg('Partida importada correctamente.');
      setImportText('');
    } else {
      setMsg('Error: JSON inválido.');
    }
  };

  return (
    <div className="panel">
      <h2>⚙️ Ajustes</h2>

      <div className="settings-section">
        <h3>Guardado</h3>
        <p>Último guardado: {new Date(state.lastSave).toLocaleString()}</p>
        <button className="btn" onClick={saveNow}>Guardar ahora</button>
        <button className="btn" onClick={handleExport}>Exportar partida (JSON)</button>
      </div>

      <div className="settings-section">
        <h3>Importar partida</h3>
        <textarea
          value={importText}
          onChange={e => setImportText(e.target.value)}
          placeholder="Pegá el JSON de la partida aquí..."
          rows={6}
          className="import-area"
        />
        <button className="btn primary" onClick={handleImport}>Importar</button>
      </div>

      <div className="settings-section">
        <h3>Progreso offline</h3>
        <p>Máximo actual: {state.settings.offlineCapHours} horas.</p>
      </div>

      <div className="settings-section danger-zone">
        <h3>Zona de peligro</h3>
        <button className="btn danger" onClick={doReset}>Reiniciar partida</button>
      </div>

      {msg && <p className="msg">{msg}</p>}

      <div className="about">
        <h3>Acerca de</h3>
        <p>MUNDO CERO v0.1 — Idle RPG Text-Based</p>
        <p>Reconstruí la civilización desde cero.</p>
      </div>
    </div>
  );
}
