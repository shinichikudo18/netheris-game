# Netheris World UI — Fase 2.5 Alpha / Cyber Paths

Macro-entrega local de la interfaz viva de Netheris.

## Identidad visual

Netheris se mantiene como:

**mundo digital + magia + RPG/anime**

La Fase 2.5 agrega una segunda regla de diseño:

> Las agentes no se teletransportan por la interfaz: recorren Netheris como habitantes de un mundo-juego.

La inspiración funcional es el concepto de cyberworld/PET de juegos como MegaMan Battle Network: caminos digitales, nodos, intersecciones y destinos visibles, sin copiar assets, mapas ni arte del juego.

## Qué agrega Fase 2.5

### Grafo de navegación

Nuevo archivo:

```text
world-paths.js
```

El Hogar tiene un grafo navegable con nodos:

```text
home_katherine
home_karen
home_karencita

hub_left
hub_center
hub_right

board
core
research

south_left
south_center
south_right

portal
table
homeConsole
```

Los destinos visuales continúan representando:

- `board` → Archivo de Katherine;
- `research` → Forja de Karen;
- `homeConsole` → Santuario de Karencita;
- `core` → Núcleo de Netheris;
- `portal` → Puerta al Mundo Físico;
- `table` → Círculo del Consejo.

### Pathfinding

`world-paths.js` construye el grafo y resuelve rutas entre nodos.

Actualmente utiliza búsqueda en anchura (BFS), suficiente para el mapa pequeño de El Hogar.

Ejemplo conceptual:

```text
Katherine
home_katherine
      ↓
   hub_left
      ↓
    board
      ↓
Archivo de Katherine
```

Otro ejemplo:

```text
Karen
home_karen
    ↓
hub_center
    ↓
 hub_right
    ↓
 research
    ↓
Forja de Karen
```

### Movimiento por segmentos

Se reemplazó el desplazamiento visual directo por movimiento paso a paso.

Flujo:

```text
Evento
  ↓
World State Engine
  ↓
resolver destino
  ↓
calcular path
  ↓
departed
  ↓
pathing
  ↓
nodo → nodo → nodo
  ↓
arrived
  ↓
interacting
  ↓
animación real del PET
  ↓
completed
```

La duración de cada tramo depende de la distancia entre nodos.

### Caminos energéticos

La escena dibuja el grafo como una red de caminos digitales.

Cuando una agente usa una ruta:

- se ilumina el segmento actual;
- se ilumina el nodo de llegada;
- el color sigue la identidad visual del personaje;
- el camino muestra desplazamiento de energía;
- el PET usa frames de caminar;
- al llegar aparece un pulso visual;
- luego comienza su pose/animación de trabajo.

### Estados visuales

Los estados visuales están separados del estado lógico.

Estados visuales actuales:

```text
pathing
arriving
interacting
idle
```

Esto permite que un evento lógico:

```json
{
  "agent": "karen",
  "state": "researching",
  "target": "research"
}
```

pase visualmente por:

```text
pathing
  ↓
arriving
  ↓
interacting
```

sin modificar el significado lógico `researching`.

## Historial enriquecido

El World State Engine ahora expone:

```js
netherisWorld.recordPhase(event, phase, extra)
```

El Oráculo puede mostrar fases como:

```text
started
departed
pathing
arrived
interacting
completed
visual-complete
```

Esto será especialmente útil cuando los eventos provengan de servicios reales.

## World State Engine

Archivo:

```text
world-state.js
```

Mantiene:

- estado por agente;
- cola independiente;
- tareas simultáneas entre agentes;
- finalización;
- historial;
- pausa/reanudación;
- validación básica del contrato.

## Contrato

```text
contracts/world-event.schema.json
contracts/README.md
```

Regla inalterable:

> Netheris puede animar el ambiente libremente, pero no representa trabajo real de Katherine, Karen o Karencita sin un evento real que lo respalde.

Toda esta fase continúa usando:

```text
source=local-demo
```

## Cómo probar esta macrofase

Las mejores pruebas visuales son:

1. **Katherine · archivo**  
   Katherine recorre su ruta hasta el Archivo.

2. **Karen · investigar**  
   Karen cruza los nodos del mapa hasta la Forja.

3. **Karencita · santuario**  
   Karencita recorre la ruta sureste.

4. **Consejo**  
   Las tres recorren el mapa simultáneamente hacia el Círculo del Consejo.

5. **Probar cola Karen**  
   Permite observar cómo varias tareas de una misma agente se procesan una detrás de otra.

6. Seleccionar una agente y hacer clic en:
   - Núcleo de Netheris;
   - Puerta al Mundo Físico.

## Archivos principales

```text
index.html
styles.css
app.js
world-state.js
world-paths.js
contracts/
scripts/import_pet_frames.py
```

## Ejecutar

```bash
python3 -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

## Próxima macrofase

Después de validar visualmente el desplazamiento:

### Fase 3 Alpha — Real Bridge

- adaptador WebSocket para CT116;
- detección de sesión/autenticación;
- reconexión automática;
- modo degradado/offline;
- traducción de eventos reales `typing` e `investigando`;
- badge REAL vs SIMULADO;
- eventos reales moviendo las agentes por este mismo grafo;
- sin tocar todavía Home Assistant directamente;
- posteriormente n8n / Research Bridge / HA;
- Event Bus como arquitectura final.

No reemplazar todavía Netheris-V1.
