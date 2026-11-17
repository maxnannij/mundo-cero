# Mundo Cero — diseño de habilidades, acciones y recetas

**Estado:** especificación de diseño para el prototipo  
**Fecha:** 17 de noviembre de 2026  
**Alcance:** MVP jugable desde la supervivencia inicial hasta la metalurgia de cobre; el hierro y la industrialización quedan para futuras actualizaciones.

---

## 1. Decisiones de diseño

Mundo Cero debe sentirse como una reconstrucción progresiva, no como una lista de clics inconexos. Cada habilidad produce algo que alimenta otra habilidad, una receta, un edificio o una investigación.

### Reglas que se mantienen

1. **Una actividad manual ocupa un habitante adulto.** Cada habitante puede ejecutar una sola actividad o trabajar en un edificio a la vez. Varias tareas avanzan en paralelo si hay suficientes habitantes libres.
2. **Las acciones son repetibles y temporizadas.** Al terminar una acción se entregan sus recursos y XP; si la orden no tiene límite, comienza otra acción.
3. **La fabricación usa recetas y una cola global.** Se conserva una sola cola de fabricación en el MVP; no se simula una cola independiente por edificio.
4. **La producción pasiva necesita instalaciones y personal.** Los edificios producen por minuto, con multiplicadores de nivel, salud y estación.
5. **La automatización reutiliza las recetas existentes.** Cada orden puede trabajar en modo continuo o mantener una cantidad objetivo. No debe existir una fórmula de producción distinta para la fabricación automática.
6. **El progreso offline usa el mismo motor que el progreso online**, limitado actualmente a 8 horas.
7. **La producción pasiva no otorga XP de habilidad.** Evita subir habilidades sin realizar ni fabricar nada. La fabricación automática sí otorga el XP normal de la receta, porque consume ingredientes y ocupa una instalación.
8. **No hay desgaste de herramientas en el MVP.** Las herramientas son desbloqueos permanentes que se asignan a habitantes; no hay durabilidad, reparación ni rotura.

### Contexto de balance que debe respetarse

- La partida comienza con Aren y Lira, ambos adultos, y 40 bayas.
- Cada adulto consume 20 puntos de alimento por día de juego; un día de juego dura 2 minutos reales.
- Tres unidades de comida cocida equivalen actualmente a una ración diaria de adulto. El invierno reduce o elimina fuentes de recolección y agrega presión sobre la leña.
- El límite inicial de población es 30. Las tareas manuales y los edificios compiten por la misma población adulta disponible.

Estas reglas hacen que alimento, trabajadores y estaciones sean parte de la economía. No conviene balancear una receta como si sus ingredientes fueran gratuitos o infinitos.

---

## 2. Catálogo de habilidades

Se propone conservar las 11 habilidades que ya existen en el archivo de datos de habilidades, pero agruparlas en cuatro familias. La única reclasificación necesaria es mover **Construcción** a **Desarrollo**.

| Familia | Habilidad | Función principal | Alcance MVP |
|---|---|---|---|
| Recolección | Tala | Madera, madera dura y resina | Sí |
| Recolección | Minería | Piedra, pedernal y minerales | Sí |
| Recolección | Recolección | Bayas y arcilla | Sí |
| Recolección | Herboristería | Fibra, semillas y hierbas | Sí |
| Recolección | Caza | Carne y pieles | Sí, básica |
| Producción | Artesanía | Herramientas, cuerdas y carbón | Sí |
| Producción | Carpintería | Tablas y componentes de madera | Sí |
| Producción | Cocina | Comida cocida y platos | Sí |
| Producción | Metalurgia | Lingotes y procesamiento de minerales | Sí, cobre |
| Ciencia | Investigación | Generar conocimiento y habilitar tecnologías | Sí |
| Desarrollo | Construcción | Levantar y mejorar edificios | Sí |

### Responsabilidad de cada habilidad

- **Tala:** abastece madera para refugios, talleres, combustible, tablas y herramientas.
- **Minería:** proporciona piedra y pedernal al comienzo; luego cobre y, más adelante, hierro.
- **Recolección:** mantiene el suministro temprano de bayas y permite obtener arcilla.
- **Herboristería:** proporciona fibra para cuerdas, semillas para agricultura y hierbas para futuras recetas.
- **Caza:** complementa la economía alimentaria con carne y pieles. No debe ser obligatoria para sobrevivir durante los primeros minutos.
- **Artesanía:** convierte materiales simples en herramientas, cuerdas y combustibles procesados.
- **Carpintería:** transforma madera en tablas. Las tablas deben ser un componente de construcción de eras posteriores, no otro recurso sin uso.
- **Cocina:** convierte alimentos en raciones más eficientes y habilita platos de mayor valor.
- **Metalurgia:** procesa minerales en lingotes. No debe desbloquear la extracción del mineral que ella misma necesita para comenzar.
- **Investigación:** transforma tiempo de trabajo en conocimiento y habilita saltos tecnológicos.
- **Construcción:** representa la capacidad de levantar, mejorar y ampliar instalaciones. No necesita una actividad temporizada independiente en el MVP: gana XP cuando se completa una construcción o mejora.

**No agregar todavía** Agricultura, Medicina, Ingeniería, Ganadería ni Gestión como habilidades separadas. La agricultura puede seguir representada por una investigación y el edificio Huerto hasta que exista suficiente contenido para justificar una habilidad propia.

---

## 3. Niveles y experiencia

### Curva propuesta

Conservar la curva ya implementada:

**XP para el siguiente nivel (L) = piso de 50 + 25 × L + 8 × L elevado a 1,8.**

El XP sobrante se conserva al subir de nivel. El límite técnico continúa siendo nivel 99, aunque el contenido del MVP solo necesita llegar al nivel 25.

| Nivel alcanzado | XP acumulado aproximado | XP requerido para el siguiente nivel | Uso de diseño |
|---:|---:|---:|---|
| 1 | 0 | 83 | Acciones básicas |
| 5 | 639 | 319 | Primeras mejoras de herramientas y recursos |
| 10 | 3.128 | 804 | Segundo escalón de recolección |
| 15 | 8.414 | 1.472 | Acceso a cobre mediante investigación |
| 20 | 17.379 | 2.307 | Hito de eficiencia |
| 25 | 30.841 | 3.301 | Especialización permanente |
| 40 | 105.829 | 7.170 | Bonificación de rendimiento |
| 50 | 191.827 | 10.446 | Contenido de expansión |
| 75 | 571.868 | 20.900 | Especialización avanzada futura |
| 99 | 1.216.420 | — | Dominio a largo plazo |

La curva es suficientemente suave al principio y crea una cola larga a partir de nivel 40. No agregar niveles adicionales ni una segunda moneda de XP para el MVP.

### Ritmo esperado

Sin bonificaciones, una acción básica de Tala entrega 8 XP cada 3 segundos:

- Nivel 5: alrededor de 4 minutos de actividad continua.
- Nivel 10: alrededor de 20 minutos.
- Nivel 15: alrededor de 53 minutos.
- Nivel 25: alrededor de 3,2 horas si se mantuviera siempre la acción inicial.

Son estimaciones de referencia, no tiempos exactos: las acciones nuevas entregan más XP y las herramientas reducen duración o mejoran rendimiento.

### Hitos de nivel

| Hito | Efecto recomendado |
|---:|---|
| 1 | Acciones iniciales de la habilidad |
| 3 | Primera receta o acción secundaria, cuando corresponda |
| 5 | Recurso o herramienta de segundo escalón |
| 8 | Acciones intermedias puntuales, como arcilla |
| 10 | Recurso avanzado y primer hito de rendimiento |
| 15 | Acceso a actividades especializadas, como prospección de cobre |
| 20 | 5% menos duración de acciones de esa habilidad |
| 25 | Elegir una especialización permanente |
| 40 | +5% de rendimiento |
| 50, 75 y 99 | Reservados para contenido de expansión |

No todas las habilidades necesitan desbloqueos en todos los hitos. Es preferible que cada nivel importante abra una decisión o una cadena productiva concreta.

### Maestría y especialización

Se conserva la maestría actual, separada del nivel normal:

- Maestría máxima: 20.
- XP para el siguiente nivel de maestría: 500 + 250 × nivel actual.
- Cada nivel de maestría aporta +1,5% de rendimiento.
- En nivel 25 de habilidad se elige una especialización permanente:
  - **Velocidad:** 15% menos duración de las acciones de esa habilidad.
  - **Rendimiento:** +20% de producción de esa habilidad.

Para evitar multiplicadores excesivos, el rendimiento total de habilidad debería tener un tope de **+50%** en el MVP, antes de aplicar resultados aleatorios. Los bonos de herramienta se aplican después, con un tope global de +75% de rendimiento. La probabilidad especial nunca puede superar 100%.

La maestría debe subir solo cuando se completa una acción o receta de esa habilidad; los edificios pasivos no otorgan maestría.

---

## 4. Acciones repetibles por habilidad

Los tiempos son tiempos base antes de aplicar herramientas, nivel y especialización. El XP se entrega por acción completada, incluso si un resultado secundario aleatorio no se obtiene.

### Recolección

| Habilidad | Acción | Nivel | Duración | Resultado | XP | Requisitos |
|---|---|---:|---:|---|---:|---|
| Tala | Madera común | 1 | 3 s | 1 madera | 8 | Ninguno |
| Tala | Madera dura | 10 | 6 s | 1 madera dura; 40% de obtener 1 madera | 18 | Ninguno |
| Tala | Madera resinosa | 20 | 8 s | 2 madera; 60% de obtener 1 resina | 28 | Ninguno |
| Minería | Piedra común | 1 | 4 s | 1 piedra | 9 | Ninguno |
| Minería | Pedernal | 5 | 5,5 s | 1 pedernal | 14 | Ninguno |
| Minería | Mineral de cobre | 15 | 9 s | 1 mineral de cobre | 25 | Herramientas de piedra y prospección de cobre |
| Minería | Mineral de hierro | 25 | 12 s | 1 mineral de hierro | 40 | Era del Hierro; futuro |
| Herboristería | Fibras vegetales | 1 | 3,5 s | 1 fibra | 7 | Ninguno |
| Herboristería | Semillas | 5 | 4,5 s | 1 semilla; 30% de obtener 1 fibra | 12 | Primavera, verano u otoño |
| Herboristería | Hierbas medicinales | 10 | 6 s | 1 hierba | 18 | Futuro uso medicinal |
| Recolección | Bayas silvestres | 1 | 4 s | 2 bayas | 8 | Primavera, verano u otoño |
| Recolección | Arcilla | 8 | 5,5 s | 1 arcilla | 14 | Ninguno |
| Caza | Rastreo | 1 | 7 s | 70%: 1 carne cruda; 25%: 1 piel | 12 | Ninguno |
| Caza | Caza menor | 3 | 9 s | 90%: 2 carnes; 45%: 1 piel | 20 | Tecnología Caza y trampeo; lanza recomendada |
| Caza | Caza mayor | 10 | 16 s | 85%: 4 carnes; 65%: 2 pieles | 38 | Tecnología Caza y trampeo; lanza de piedra recomendada |

La extracción de cobre debe estar disponible después de alcanzar Minería 15 y desbloquear la prospección, **antes** de investigar Metalurgia básica. Así se elimina la dependencia circular descrita más adelante.

### Ciencia

| Habilidad | Acción | Nivel | Duración | Resultado | XP | Requisitos |
|---|---|---:|---:|---|---:|---|
| Investigación | Experimentos básicos | 1 | 8 s | 1 conocimiento | 15 | Ninguno |
| Investigación | Experimentos avanzados | 10 | 15 s | 3 conocimientos | 35 | Taller o instalación de investigación en una futura mejora |

La investigación es una actividad que consume tiempo de un habitante. Completar una tecnología también entrega XP de Investigación equivalente a 2 × coste de conocimiento, como ya hace el prototipo.

### Producción y desarrollo

La transformación de materiales debe hacerse mediante recetas en la cola global, no duplicarse como actividad y receta. Por eso Carpintería, Artesanía, Cocina y Metalurgia suben de nivel al completar sus recetas.

Construcción no necesita una barra de progreso adicional: entrega **20 XP al completar un edificio** y **10 XP al mejorar un edificio**. Si se amplía el coste o la escala de un edificio en el futuro, estos valores pueden revisarse.

---

## 5. Herramientas y bonificaciones

Las herramientas pertenecen a un habitante y afectan a sus actividades. No se desgastan en el MVP.

| Herramienta | Nivel de equipo | Categoría | Velocidad | Rendimiento | Desbloqueo |
|---|---:|---|---:|---:|---|
| Hacha rudimentaria | 0 | Hacha | 10% más rápida | +5% | Artesanía 1 |
| Hacha de piedra | 1 | Hacha | 25% más rápida | +15% | Artesanía 5 + Herramientas de piedra |
| Hacha de cobre | 2 | Hacha | 40% más rápida | +30% | Futuro: Metalurgia de cobre |
| Pico rudimentario | 0 | Pico | 10% más rápido | +5% | Artesanía 1 |
| Pico de piedra | 1 | Pico | 25% más rápido | +15% | Artesanía 5 + Herramientas de piedra |
| Pico de cobre | 2 | Pico | 40% más rápido | +30% | Futuro: Metalurgia de cobre |
| Lanza de madera | 0 | Lanza | 10% más rápida | +10% | Artesanía 1 + Caza y trampeo |
| Lanza de piedra | 1 | Lanza | 25% más rápida | +25% | Artesanía 5 + Caza y trampeo |

Los valores corresponden a los bonos ya definidos en el catálogo actual de herramientas. La velocidad se expresa como multiplicador de duración: 0,75 significa que la acción tarda el 75% del tiempo base.

**Regla técnica importante:** el campo actual llamado requiredTool se usa como categoría para buscar bonificaciones; no comprueba que el habitante posea obligatoriamente una herramienta. Renombrarlo a toolCategory evitaría confusiones. Si más adelante una acción exige una herramienta concreta, agregar un campo separado requiredToolId.

---

## 6. Catálogo de materiales

| Material | Familia | Era | Uso principal | Estado |
|---|---|---:|---|---|
| Madera | Natural | 1 | Edificios, herramientas y combustible | MVP |
| Piedra | Natural | 1 | Edificios y herramientas | MVP |
| Fibra | Natural | 1 | Cuerda, herramientas y tejidos | MVP |
| Bayas | Alimento | 1 | Alimentación directa y cocina | MVP |
| Pedernal | Mineral | 1 | Herramientas y puntas | MVP |
| Arcilla | Natural | 1 | Horno y cerámica futura | MVP |
| Semillas | Natural | 2 | Huertos | MVP |
| Carne cruda | Alimento | 1 | Cocina | MVP |
| Piel animal | Natural | 1 | Abrigos | MVP |
| Cuerda | Componente | 1 | Herramientas y edificios | MVP |
| Carbón vegetal | Fabricado | 1–3 | Combustible y metalurgia | MVP |
| Tabla | Fabricado | 2 | Construcciones y herramientas avanzadas | MVP |
| Comida cocida | Alimento | 1 | Raciones diarias | MVP |
| Carne cocinada | Alimento | 1 | Platos completos | MVP |
| Plato completo | Alimento | 1 | Una ración diaria completa | MVP |
| Conocimiento | Científico | Todas | Investigación tecnológica | MVP |
| Hierbas | Natural | 2 | Medicina futura | Futuro |
| Resina | Natural | 2 | Adhesivos e impermeabilización | Futuro |
| Agua | Alimento/insumo | 2 | Cocina, agricultura y salud | Futuro |
| Madera dura | Natural | 2 | Herramientas y estructuras avanzadas | Futuro |
| Mineral de cobre | Mineral | 3 | Lingotes de cobre | MVP |
| Lingote de cobre | Fabricado | 3 | Herramientas metálicas | MVP ampliado |
| Mineral de hierro | Mineral | 4 | Lingotes de hierro | Futuro |
| Lingote de hierro | Fabricado | 4 | Herramientas e instalaciones avanzadas | Futuro |

No conviene agregar materiales por variedad visual. Cada recurso nuevo debe tener al menos dos usos claros o ser un requisito de una progresión principal.

---

## 7. Catálogo de recetas

Los valores siguientes parten de las recetas actuales. Se señala explícitamente el ajuste recomendado cuando el balance o la consistencia del prototipo lo requieren.

### Artesanía y componentes

| Receta | Nivel | Ingredientes | Resultado | Tiempo | XP | Requisitos |
|---|---:|---|---|---:|---:|---|
| Cuerda | 1 | 5 fibra | 1 cuerda | 4 s | 10 | Procesamiento de fibras |
| Hacha rudimentaria | 1 | 2 madera + 2 piedra + 1 fibra | 1 hacha rudimentaria | 6 s | 15 | Taller |
| Pico rudimentario | 1 | 2 madera + 3 piedra + 1 fibra | 1 pico rudimentario | 6 s | 15 | Taller |
| Hacha de piedra | 5 | 3 madera + 5 piedra + 2 cuerda + 1 pedernal | 1 hacha de piedra | 10 s | 30 | Taller + Herramientas de piedra |
| Pico de piedra | 5 | 3 madera + 6 piedra + 2 cuerda + 1 pedernal | 1 pico de piedra | 10 s | 30 | Taller + Herramientas de piedra |
| Carbón vegetal | 3 | 4 madera | 2 carbón vegetal | 8 s | 18 | Fogata + Control del fuego |

### Carpintería y metalurgia

| Receta | Nivel | Ingredientes | Resultado | Tiempo | XP | Requisitos |
|---|---:|---|---|---:|---:|---|
| Tablas de madera | 1 | 3 madera | 2 tablas | 6 s | 15 | Aserradero |
| Lingote de cobre | 1 | 2 mineral de cobre + 1 carbón | 1 lingote de cobre | 12 s | 30 | Horno + Metalurgia básica |
| Lingote de hierro | 15 | 3 mineral de hierro + 2 carbón | 1 lingote de hierro | 18 s | 45 | Era del Hierro; futuro |

### Cocina y supervivencia

| Receta | Nivel | Ingredientes | Resultado | Tiempo | XP | Requisitos |
|---|---:|---|---|---:|---:|---|
| Bayas cocidas | 1 | 10 bayas + 1 madera como combustible | 3 comida cocida | 8 s | 18 | Fogata + Control del fuego |
| Carne cocinada | 1 | 2 carne cruda + 1 madera como combustible | 2 carne cocinada | 6 s | 16 | Fogata + Caza y trampeo |
| Plato completo | 2 | 1 carne cocinada + 10 bayas | 1 plato completo | 9 s | 24 | Fogata + Caza y trampeo |
| Abrigo de piel | 3 | 4 piel animal + 3 fibra | 1 abrigo de piel | 10 s | 25 | Taller + Caza y trampeo |

### Caza

| Receta | Nivel | Ingredientes | Resultado | Tiempo | XP | Requisitos |
|---|---:|---|---|---:|---:|---|
| Lanza de madera | 1 | 3 madera + 1 pedernal + 2 fibra | 1 lanza de madera | 7 s | 18 | Taller + Caza y trampeo |
| Lanza de piedra | 5 | 3 madera + 3 pedernal + 2 cuerda | 1 lanza de piedra | 11 s | 32 | Taller + Caza y trampeo |

### Ajuste alimentario recomendado

La receta actual de bayas cocidas transforma 3 bayas en 2 comidas cocidas. Como cada comida cocida vale 20/3 puntos de alimento, eso convierte 3 puntos de alimento en 13,33: una multiplicación excesiva que puede eliminar demasiado pronto la presión de supervivencia.

La propuesta de **10 bayas + 1 madera → 3 comidas cocidas** conserva una mejora por cocinar, pero la limita a duplicar el valor nutricional de las bayas. Tres comidas cocidas siguen representando una ración diaria de adulto. El combustible introduce un coste visible y conecta la cocina con la economía de madera.

El plato completo mantiene su valor actual: 1 carne cocinada (10 puntos) + 10 bayas (10 puntos) = 1 plato (20 puntos). No es necesario añadir otra bonificación nutricional.

---

## 8. Edificios y producción pasiva

Los valores de producción son por edificio de nivel 1, con un trabajador asignado y antes de aplicar salud y estación.

| Edificio | Coste base | Requisito | Producción/efecto | Personal |
|---|---|---|---|---:|
| Refugio | 30 madera + 15 piedra + 10 fibra | Construcción primitiva | +100 almacenamiento; protección y reproducción | 0 |
| Fogata | 15 madera + 10 piedra | Control del fuego | Permite cocina y carbón | 0 |
| Taller | 40 madera + 25 piedra + 5 cuerda | Construcción primitiva | Habilita herramientas y componentes | 0 |
| Aserradero | 50 madera + 30 piedra + 8 cuerda | Tecnología Aserradero | +2 madera/min | 1 |
| Cantera | 40 madera + 40 piedra + 6 cuerda | Tecnología Cantera | +1,5 piedra/min | 1 |
| Huerto | 35 madera + 15 piedra + 10 semillas + 5 fibra | Agricultura | +1,2 bayas/min y +0,6 fibra/min, con estacionalidad | 1 |
| Puesto de trampeo | 35 madera + 15 fibra + 4 cuerda | Caza y trampeo | +0,35 carne cruda/min y +0,08 piel/min | 1 |
| Horno | 30 madera + 60 piedra + 20 arcilla | Metalurgia básica | Habilita fundición | 0 |

### Reglas de producción

- Cada trabajador cubre una plaza de producción. Un edificio sin personal produce cero.
- El nivel del edificio multiplica producción por 1 + 0,35 × (nivel - 1), según la fórmula actual.
- La salud media de la población y los modificadores estacionales siguen afectando la producción.
- No otorgar XP por recursos pasivos.
- Los edificios no deben generar más alimento del que la población puede almacenar o consumir indefinidamente sin límite: el almacenamiento global sigue siendo el tope.
- Las mejoras deben competir con la construcción de nuevos edificios; no ofrecer simultáneamente una mejora enorme de velocidad y rendimiento.

---

## 9. Investigaciones y dependencias

El conocimiento se obtiene con Investigación y se consume al desbloquear tecnologías. Los costes de materiales se pagan una sola vez.

| Tecnología | Coste de materiales | Conocimiento | Prerrequisitos | Desbloquea | Era |
|---|---|---:|---|---|---:|
| Control del fuego | 20 madera + 5 piedra | 5 | Ninguno | Fogata, cocina de bayas y carbón | 1 |
| Herramientas de piedra | 25 piedra + 5 pedernal + 3 cuerda | 8 | Ninguno | Hachas y picos de piedra | 1 |
| Procesamiento de fibras | 30 fibra | 6 | Ninguno | Receta de cuerda | 1 |
| Construcción primitiva | 40 madera + 20 piedra | 10 | Control del fuego | Refugio y Taller | 1 |
| Caza y trampeo | 25 madera + 15 piedra + 12 fibra | 10 | Herramientas de piedra | Lanzas, caza menor y Puesto de trampeo | 1 |
| Aserradero | 60 madera + 30 piedra + 10 cuerda | 15 | Construcción primitiva + Herramientas de piedra | Aserradero y tablas | 2 |
| Cantera | 40 madera + 50 piedra + 8 cuerda | 15 | Construcción primitiva + Herramientas de piedra | Cantera | 2 |
| Agricultura | 30 madera + 15 semillas + 10 fibra | 12 | Procesamiento de fibras | Huerto | 2 |
| Metalurgia básica | 10 mineral de cobre + 15 carbón + 10 arcilla | 25 | Control del fuego + Aserradero | Horno y fundición de cobre | 3 |
| Fundición de hierro | Costes nuevos por definir | 40 | Metalurgia básica + Minería 25 | Extracción y fundición de hierro | 4 |

### Corrección obligatoria: dependencia circular del cobre

En el prototipo actual, la actividad de extracción de cobre requiere Metalurgia básica, pero la investigación Metalurgia básica cuesta 10 minerales de cobre. El recurso necesario para investigar queda bloqueado por la propia investigación.

Resolverlo de una de estas dos maneras; se recomienda la primera:

1. **Recomendado:** desbloquear la prospección de cobre con Herramientas de piedra y Minería 15. Metalurgia básica consume el mineral ya extraído y desbloquea horno/fundición.
2. Alternativa: cambiar el coste de Metalurgia básica para que no exija mineral de cobre y dejar que la tecnología desbloquee su extracción.

No mantener las dos condiciones simultáneamente.

### Aplicación consistente de desbloqueos

La lista de desbloqueos de una tecnología debe tener efecto real. Cada receta, actividad o edificio debe comprobar el requisito tecnológico explícito. En el estado actual, por ejemplo, Procesamiento de fibras anuncia que desbloquea Cuerda, pero la receta de Cuerda no declara el requisito tecnológico; también Refugio aparece como desbloqueo de Construcción primitiva sin exigir esa tecnología en su definición.

Para el MVP, usar requisitos explícitos en cada definición y una función central de validación. Evitar que la interfaz oculte algo que el motor permite fabricar.

### Cadena principal de progresión

- Tala, Minería y Herboristería abastecen materiales básicos.
- Investigación transforma tiempo de trabajo en conocimiento.
- Las tecnologías habilitan Fogata, Taller, Refugio, Aserradero, Huerto, Trampas y Horno.
- Artesanía produce herramientas y componentes.
- Carpintería procesa madera; Cocina procesa alimentos; Metalurgia procesa minerales.
- Construcción amplía la capacidad productiva y el almacenamiento.

---

## 10. Progresión por eras

| Era | Fantasía de progreso | Contenido principal | Condición de avance |
|---|---|---|---|
| 1. Supervivencia y piedra | Dejar de depender de lo que se encuentra por casualidad | Recolección, fuego, herramientas primitivas, refugio, caza básica | Refugio, fogata, taller y herramientas de piedra |
| 2. Asentamiento | Convertir el campamento en una comunidad sostenible | Aserradero, cantera, huerto, trampas, tablas y producción pasiva | Sostener la población durante un invierno y producir materiales sin recolección constante |
| 3. Cobre | Especializar la producción y mejorar herramientas | Prospección, horno, carbón, lingotes y herramientas de cobre | Fabricar el primer lingote y una herramienta de cobre |
| 4. Hierro | Alcanzar producción avanzada | Hierro, hornos mejorados y herramientas superiores | Futuro |
| 5. Industrialización | Automatización a gran escala y nuevas fuentes de energía | Máquinas, electricidad y cadenas complejas | Futuro, fuera del alcance actual |

Las eras son hitos de contenido, no reinicios. El jugador conserva niveles, herramientas, edificios, recursos y población al avanzar.

---

## 11. Compatibilidad con idle, automatización y offline

### Actividades manuales

- Una actividad conserva progreso, cantidad de acciones completadas y objetivo.
- Al completar el objetivo, quedarse sin materiales, cambiar de estación o perder al trabajador, debe detenerse de forma segura y liberar al habitante.
- Las tareas paralelas no comparten progreso ni trabajador.
- Si el habitante muere, la actividad se cancela y su progreso parcial se pierde; no se deben entregar recursos de una acción incompleta.

### Recetas y cola

- Mantener una cola global y un solo lote activo a la vez en el MVP.
- La cantidad manual se limita a 50 por orden; la automatización agrega lotes de uno.
- **Mejora recomendada:** consumir los ingredientes de cada unidad cuando esa unidad comienza a fabricarse, no descontar toda la cola al agregarla. Mostrar claramente ingredientes reservados o pendientes.
- Una receta que no tiene materiales no avanza; la cola no debe consumir recursos parcialmente.
- XP y maestría se otorgan al completar cada unidad, tanto manual como automática.

### Automatización

Conservar los modos actuales:

- **Continuo:** fabrica mientras haya materiales y la orden esté activa.
- **Mantener:** intenta sostener una cantidad objetivo del producto final.

Cada orden debe indicar instalación, receta, prioridad, inventario actual, objetivo y motivo de espera. La pausa debe impedir que se creen nuevos lotes; un lote ya pagado puede terminar.

### Offline

- Procesar actividades, fabricación, producción pasiva, estaciones, hambre, calefacción y automatización con el mismo motor de simulación.
- Mantener el límite actual de 8 horas.
- Aplicar las mismas reglas de trabajador, ingredientes, almacenamiento y desbloqueos que online.
- No conceder XP por producción pasiva durante ausencia.
- Limitar la simulación por pasos y con protección ante bucles extensos; nunca saltar el consumo diario o los cambios de estación.

---

## 12. Alcance MVP recomendado

### Incluido

- Las 11 habilidades existentes, agrupadas en cuatro familias.
- Niveles 1–25 con la curva actual; nivel 99 queda soportado técnicamente, pero sin contenido posterior.
- Una a cuatro acciones por habilidad, con tiempos, XP y resultados definidos.
- Herramientas rudimentarias y de piedra; cobre como objetivo final del MVP.
- Recursos naturales, componentes, alimentos, conocimiento y cobre.
- 14 recetas de supervivencia, herramientas, componentes, cocina y cobre.
- Ocho edificios actuales: refugio, fogata, taller, aserradero, cantera, huerto, puesto de trampeo y horno.
- Investigaciones de eras 1–3.
- Producción pasiva, trabajadores, estaciones, cola de fabricación y automatización continua/mantener.
- Guardado, migración y progreso offline de hasta 8 horas.
- Objetivos principales que guíen la cadena: primera herramienta, refugio, fuego, asentamiento y primer lingote.

### Fuera del MVP

- Era del Hierro completa y metalurgia avanzada.
- Electricidad, máquinas, motores y fábricas.
- Agricultura como habilidad independiente, ganadería y domesticación.
- Medicina, enfermedades, heridas, calidad de vida y profesiones especializadas.
- Durabilidad, reparación y desgaste de herramientas.
- Calidad aleatoria de objetos, rarezas, afijos y fabricación crítica.
- Árboles de talentos ramificados, prestigio, reinicios y nuevas monedas.
- Comercio, mercado, caravanas, combate táctico y eventos aleatorios complejos.
- Colas paralelas por edificio y asignación automática avanzada de trabajadores.

---

## 13. Ajustes necesarios en el prototipo actual

Orden recomendado para implementarlo sin reescribir el motor:

| Prioridad | Archivo o sistema | Ajuste |
|---:|---|---|
| P0 | Datos de habilidades | Agregar categoría Desarrollo y mover Construcción a ella |
| P0 | Datos de habilidades y recetas | Eliminar o unificar las acciones duplicadas de bayas cocidas, tablas y fundición de cobre; cocina, carpintería y metalurgia deben usar una sola definición de receta |
| P0 | Datos de habilidades e investigaciones | Corregir el bloqueo circular de extracción de cobre |
| P0 | Datos de recetas e investigaciones | Aplicar realmente el requisito tecnológico de Cuerda y los demás desbloqueos |
| P0 | Datos de edificios | Exigir Construcción primitiva para Refugio, o quitarlo de los desbloqueos de esa tecnología |
| P1 | Datos de recetas | Rebalancear bayas cocidas y hacer explícito el combustible |
| P1 | Motor de juego | Otorgar XP de Construcción al terminar edificios y mejoras |
| P1 | Datos de habilidades | Renombrar requiredTool a toolCategory; separar requisitos duros de herramientas si fueran necesarios |
| P1 | Motor de juego | Unificar el consumo de ingredientes de cola manual y automática por lote |
| P1 | Estado del juego | Centralizar límites de bonificación de habilidad y normalización de estados guardados |
| P2 | Paneles de habilidades y fabricación | Mostrar XP para el siguiente nivel, requisitos faltantes, rendimiento por acción y producción por minuto |
| P2 | Objetivos | Añadir objetivos que enseñen la cadena hasta el primer lingote de cobre |

No se recomienda reescribir React, la persistencia ni el calendario para incorporar esta especificación. Los datos ya están separados en la carpeta de datos; la mayor parte del trabajo debe consistir en hacer consistentes las definiciones y sus validaciones.

---

## 14. Pruebas de aceptación

Antes de considerar terminado el sistema, comprobar:

1. Un adulto no puede iniciar dos actividades simultáneas ni trabajar en un edificio mientras tiene una tarea manual activa.
2. Dos adultos libres pueden realizar dos actividades distintas en paralelo.
3. Una acción entrega recursos y XP exactamente una vez por ciclo, y conserva el progreso parcial al guardar.
4. El nivel sube al alcanzar el XP requerido y conserva el excedente.
5. La herramienta equipada modifica únicamente actividades de su categoría y nunca supera los topes definidos.
6. Una receta no puede fabricarse si falta nivel, tecnología, instalación o ingredientes.
7. Una orden automática y una manual producen el mismo resultado y XP por unidad.
8. Una cola sin ingredientes se detiene sin consumir parcialmente la receta.
9. La extracción de cobre puede desbloquearse antes de necesitar el cobre para Metalurgia básica.
10. Un Refugio o una receta no se puede obtener antes de su tecnología declarada.
11. Los edificios sin trabajador no producen; los cambios de estación se aplican también offline.
12. La producción pasiva no concede XP; las recetas automatizadas sí.
13. La comida cocida no multiplica de forma descontrolada el valor nutricional.
14. Al llegar a invierno, las bayas silvestres se detienen y el sistema de alimento/calefacción sigue funcionando.
15. Una ausencia de 8 horas o menos procesa los mismos sistemas que online, sin duplicar XP, recursos ni nacimientos.

---

## Recomendación final

Implementar primero los cinco ajustes P0 y las pruebas 1–10. Después balancear cocina, combustible y producción pasiva con una simulación de al menos dos años de juego. Solo cuando la población pueda atravesar el invierno y el jugador alcance el cobre sin bloqueos circulares conviene ampliar el catálogo de recetas o empezar la Era del Hierro.

El objetivo del MVP no es tener cien recetas: es que cada recurso tenga un propósito, cada tecnología abra una posibilidad nueva y cada automatización quite una tarea repetitiva sin eliminar las decisiones de supervivencia.
