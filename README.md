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
- Actividades manuales simultáneas: cada tarea ocupa un trabajador libre hasta detenerse o completarse, con progreso individual.
- Inventario y almacenamiento compartido.
- Fabricación con cola, consumo real de ingredientes y recetas ligadas a instalaciones.
- Construcción y edificios mejorables.
- Producción pasiva fraccionaria, con personal asignado, salud de la población y modificadores estacionales.
- Automatización configurable: producción continua o mantener una cantidad objetivo.
- Cadenas productivas: madera → tablas, mineral + carbón → lingotes, bayas → comida cocida.
- Investigación y árbol tecnológico.
- Población inicial de dos adultos, reproducción, embarazos, nacimientos y crecimiento.
- Consumo diario por habitante: 3 comidas cocidas o 20 bayas equivalentes, priorizando siempre la comida cocida; cada día sin completar la ración resta 20 puntos de salud.
- Calendario acelerado: un día de juego cada 2 minutos; estaciones de 30 días y años de 120 días.
- Primavera, verano, otoño e invierno. Las bayas silvestres no están disponibles en invierno y los huertos reducen su producción estacionalmente.
- Guardado automático, migración desde partidas v1 y v2, importación/exportación JSON.
- Progreso offline de hasta 8 horas.
- Interfaz responsive y text-based.

## Estructura

- `src/data/` — Recursos, habilidades, actividades, recetas, edificios y calendario.
- `src/store/` — Estado del juego y persistencia.
- `src/systems/gameEngine.ts` — Simulación, producción, población, estaciones, automatización y guardado.
- `src/components/` — Paneles de interfaz.

## Ritmo de tiempo y población

El calendario utiliza un tiempo acelerado para que las estaciones tengan impacto durante una partida Idle. Cada día de juego equivale a 2 minutos reales; cada estación dura 30 días de juego y cada año 120 días.

Cada habitante consume 3 unidades de comida cocida por día o, en su defecto, 20 bayas equivalentes. Se prioriza siempre la comida cocida y las bayas completan la ración cuando las comidas no alcanzan. Cada día sin completar la ración reduce la salud en 20 puntos; al llegar a cero, el habitante fallece. En invierno se consume madera para calefacción; una fogata reduce ese gasto. Cada residente tiene una longevidad individual aleatoria entre 70 y 110 años, con una distribución centrada en 90 años.

La reproducción requiere un refugio, salud, alimento y condiciones de calefacción adecuadas. La concepción requiere 45 días favorables y el embarazo dura 280 días de juego. Los niños se convierten en adultos a los 18 años de juego. Cada actividad manual reserva un trabajador adulto libre; varias pueden avanzar en paralelo si hay suficiente personal. Al detenerla, completarla o interrumpirse, el trabajador vuelve a estar disponible. La población máxima inicial es 30.

## Publicación

El proyecto está configurado para GitHub Pages mediante GitHub Actions y Vite con base `/mundo-cero/`.

Inspirado en juegos incrementales y ficción de reconstrucción científica, con universo y contenido originales.
