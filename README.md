# MUNDO CERO

**Idle RPG Text-Based** para navegador. Reconstruí la civilización desde cero.

## Jugar ahora

https://maxnannij.github.io/mundo-cero/

## Ejecutar en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Sistemas del juego

- Habilidades con niveles, XP, maestría hasta nivel 20, hitos y especializaciones permanentes desde nivel 25.
- Actividades repetitivas con metas de producción, requisitos de herramientas, materiales, edificios y estaciones.
- Inventario y almacenamiento compartido.
- Fabricación con cola, consumo real de ingredientes y recetas ligadas a instalaciones.
- Construcción y edificios mejorables.
- Producción pasiva fraccionaria, con personal asignado, salud de la población y modificadores estacionales.
- Automatización configurable: producción continua o mantener una cantidad objetivo.
- Cadenas productivas: madera → tablas, mineral + carbón → lingotes, bayas → comida cocida.
- Investigación y árbol tecnológico.
- Población inicial de dos adultos, reproducción, embarazos, nacimientos y crecimiento.
- Consumo diario de alimentos y calefacción durante el invierno.
- Calendario acelerado: un día de juego cada 2 minutos; estaciones de 30 días y años de 120 días.
- Primavera, verano, otoño e invierno. Las bayas silvestres no están disponibles en invierno y los huertos reducen su producción estacionalmente.
- Guardado automático, migración desde partidas v1, importación/exportación JSON.
- Progreso offline de hasta 8 horas.
- Interfaz responsive y text-based.

## Estructura

- `src/data/` — Recursos, habilidades, actividades, recetas, edificios y calendario.
- `src/store/` — Estado del juego y persistencia.
- `src/systems/gameEngine.ts` — Simulación, producción, población, estaciones, automatización y guardado.
- `src/components/` — Paneles de interfaz.

## Ritmo de tiempo y población

El calendario utiliza un tiempo acelerado para que las estaciones tengan impacto durante una partida Idle. Cada día de juego equivale a 2 minutos reales; cada estación dura 30 días de juego y cada año 120 días.

La población consume 0,6 raciones por adulto y día y 0,35 por niño. Una unidad de bayas equivale a una ración; una comida cocida equivale a dos. En invierno se consume madera para calefacción; una fogata reduce ese gasto.

La reproducción requiere un refugio, salud, alimento y condiciones de calefacción adecuadas. La concepción requiere 45 días favorables y el embarazo dura 280 días de juego. Los niños se convierten en adultos a los 18 años de juego. La población máxima inicial es 30.

## Publicación

El proyecto está configurado para GitHub Pages mediante GitHub Actions y Vite con base `/mundo-cero/`.

Inspirado en juegos incrementales y ficción de reconstrucción científica, con universo y contenido originales.
