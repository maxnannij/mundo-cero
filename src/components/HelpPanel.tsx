import { RESOURCE_LIST } from '../data/resources';
import { SKILL_LIST } from '../data/skills';
import { BUILDING_LIST } from '../data/buildings';
import { RECIPE_LIST } from '../data/recipes';
import { TECH_LIST } from '../data/techs';
import { TOOL_LIST } from '../data/tools';

function obtainment(resourceId: string): string[] {
  const sources: string[] = [];
  for (const skill of SKILL_LIST) {
    for (const activity of skill.activities) {
      if (activity.outputs.some(output => output.resourceId === resourceId)) {
        const season = activity.seasonsAvailable ? ' (primavera, verano y otoño)' : '';
        const inputs = activity.inputs?.length ? `; requiere ${activity.inputs.map(input => `${input.amount} ${RESOURCE_LIST.find(r => r.id === input.resourceId)?.name ?? input.resourceId}`).join(', ')}` : '';
        sources.push(`${activity.name} — Habilidad: ${skill.name}${season}${inputs}`);
      }
    }
  }
  for (const recipe of RECIPE_LIST) {
    if (recipe.outputs.some(output => output.resourceId === resourceId)) {
      const inputs = recipe.inputs.map(input => `${input.amount} ${RESOURCE_LIST.find(r => r.id === input.resourceId)?.name ?? input.resourceId}`).join(', ');
      const building = recipe.requiredBuilding ? `; necesita ${BUILDING_LIST.find(b => b.id === recipe.requiredBuilding)?.name ?? recipe.requiredBuilding}` : '';
      sources.push(`${recipe.name} — Fabricación: ${inputs}${building}`);
    }
  }
  for (const building of BUILDING_LIST) {
    if (building.production?.some(output => output.resourceId === resourceId)) sources.push(`${building.name} — producción automática; asigná trabajadores`);
  }
  return [...new Set(sources)];
}

function GuideCard({ icon, name, description, detail }: { icon: string; name: string; description: string; detail?: string }) {
  return <article className="guide-card"><div className="guide-card-heading"><span className="guide-icon" aria-hidden="true">{icon}</span><strong>{name}</strong></div><p>{description}</p>{detail && <small>{detail}</small>}</article>;
}

export function HelpPanel() {
  return <div className="panel guide-panel">
    <h2>📖 Guía e índice de iconos</h2>
    <p className="panel-desc">Consultá qué representa cada símbolo, para qué sirve y cómo conseguir cada recurso o desbloquear cada elemento. Incluye también contenido que todavía puede estar bloqueado en tu partida.</p>
    <section className="guide-section"><h3>📦 Recursos</h3><div className="guide-grid">
      {RESOURCE_LIST.map(resource => { const sources = obtainment(resource.id); return <GuideCard key={resource.id} icon={resource.icon} name={resource.name} description={resource.description} detail={sources.length ? `Cómo conseguirlo: ${sources.join(' · ')}` : 'Cómo conseguirlo: fuente aún no implementada o se obtiene mediante otro sistema.'} />; })}
    </div></section>
    <section className="guide-section"><h3>⚡ Habilidades y actividades</h3><div className="guide-grid">
      {SKILL_LIST.map(skill => <GuideCard key={skill.id} icon={skill.icon} name={skill.name} description={skill.description} detail={skill.activities.length ? skill.activities.map(activity => `${activity.name} (nivel ${activity.requiredLevel})${activity.seasonsAvailable ? ', primavera, verano y otoño' : ''}`).join(' · ') : 'Se utiliza desde Fabricación o Construcción.'} />)}
    </div></section>
    <section className="guide-section"><h3>🏘️ Edificios</h3><div className="guide-grid">
      {BUILDING_LIST.map(building => <GuideCard key={building.id} icon={building.icon} name={building.name} description={building.description} detail={`Se construye desde Construcción. Coste inicial: ${building.baseCost.map(cost => `${cost.amount} ${RESOURCE_LIST.find(r => r.id === cost.resourceId)?.name ?? cost.resourceId}`).join(', ')}.${building.requiredTech ? ` Requiere tecnología: ${TECH_LIST.find(tech => tech.id === building.requiredTech)?.name ?? building.requiredTech}.` : ''}${building.workersRequired ? ` Personal: ${building.workersRequired} trabajador(es) por edificio.` : ''}`} />)}
    </div></section>
    <section className="guide-section"><h3>🛠️ Herramientas</h3><div className="guide-grid">
      {TOOL_LIST.map(tool => { const recipe = RECIPE_LIST.find(item => item.outputs.some(output => output.toolId === tool.id)); return <GuideCard key={tool.id} icon={tool.icon} name={tool.name} description={tool.description} detail={`Cómo conseguirla: ${recipe ? `fabricar usando ${recipe.inputs.map(input => `${input.amount} ${RESOURCE_LIST.find(r => r.id === input.resourceId)?.name ?? input.resourceId}`).join(', ')}${recipe.requiredBuilding ? ` en ${BUILDING_LIST.find(b => b.id === recipe.requiredBuilding)?.name ?? recipe.requiredBuilding}` : ''}` : 'se desbloquea y fabrica en etapas posteriores'}.`} />; })}
    </div></section>
    <section className="guide-section"><h3>🧪 Tecnologías</h3><div className="guide-grid">
      {TECH_LIST.map(tech => <GuideCard key={tech.id} icon={tech.icon} name={tech.name} description={tech.description} detail={`Investigación: ${tech.knowledgeCost} conocimiento. ${tech.prerequisites.length ? `Requisitos previos: ${tech.prerequisites.map(id => TECH_LIST.find(item => item.id === id)?.name ?? id).join(', ')}. ` : 'Sin requisitos previos. ' }Desbloquea: ${tech.unlocks.map(id => BUILDING_LIST.find(b => b.id === id)?.name ?? RECIPE_LIST.find(r => r.id === id)?.name ?? SKILL_LIST.find(s => s.id === id)?.name ?? TOOL_LIST.find(t => t.id === id)?.name ?? id).join(', ')}.`} />)}
    </div></section>
    <section className="guide-section"><h3>🍲 Fabricación y recetas</h3><div className="guide-grid">
      {RECIPE_LIST.map(recipe => <GuideCard key={recipe.id} icon={recipe.category === 'alimento' ? '🍲' : recipe.category === 'herramienta' ? '🔨' : '⚒️'} name={recipe.name} description={recipe.description} detail={`Habilidad: ${SKILL_LIST.find(skill => skill.id === recipe.skillId)?.name ?? recipe.skillId}. Insumos: ${recipe.inputs.map(input => `${input.amount} ${RESOURCE_LIST.find(r => r.id === input.resourceId)?.name ?? input.resourceId}`).join(', ')}.${recipe.requiredBuilding ? ` Instalación: ${BUILDING_LIST.find(b => b.id === recipe.requiredBuilding)?.name ?? recipe.requiredBuilding}.` : ''}${recipe.requiredTech ? ` Tecnología: ${TECH_LIST.find(tech => tech.id === recipe.requiredTech)?.name ?? recipe.requiredTech}.` : ''}`} />)}
    </div></section>
    <section className="guide-section"><h3>🌦️ Estaciones</h3><div className="guide-grid">
      <GuideCard icon="🌱" name="Primavera" description="Renacen las plantas. Hay recolección de bayas y semillas." />
      <GuideCard icon="☀️" name="Verano" description="Temporada cálida y favorable para recolectar y cultivar." />
      <GuideCard icon="🍂" name="Otoño" description="Última oportunidad estacional para recolectar bayas antes del invierno." />
      <GuideCard icon="❄️" name="Invierno" description="No crecen bayas silvestres. La población necesita consumir madera para mantener el calor." />
    </div></section>
  </div>;
}
