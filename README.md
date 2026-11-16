# MUNDO CERO

**Idle RPG Text-Based** para navegador. Reconstruí la civilización desde cero.

## Jugar ahora

**https://maxnannij.github.io/mundo-cero/**

## Cómo ejecutar en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Estructura

- `src/data/` — Recursos, habilidades, actividades, recetas, edificios, tecnologías, objetivos
- `src/store/` — Estado del juego + React Context
- `src/systems/gameEngine.ts` — Tick, offline, crafting, construcción, investigación, guardado
- `src/components/` — UI por paneles

## Características (v0.1)

- Habilidades de recolección, producción y ciencia con XP y niveles
- Actividades repetitivas + objetivos de cantidad
- Herramientas equipables con bonos reales
- Fabricación con cola
- Construcción con producción pasiva (Aserradero, Cantera, Huerto...)
- Árbol tecnológico
- Objetivos y logros
- Guardado automático + export/import JSON
- Progreso offline (hasta 8 h)
- Interfaz responsive, text-based

Inspirado en la progresión científica y sistemas idle, con universo original.
