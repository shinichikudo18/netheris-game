# Netheris World UI — Fase 2.8 Alpha / Cyber Navigation

Macro-entrega local de la interfaz viva de Netheris.

## Objetivo

Netheris mantiene su identidad:

**mundo digital + magia + RPG/anime**

La Fase 2.8 profundiza la navegación tipo cyberworld/PET:

> Katherine, Karen y Karencita no solo siguen rutas automáticas: ahora el mapa se comporta como una red explorable.

La inspiración funcional sigue siendo un cyberworld estilo juego, sin copiar mapas, arte ni assets de franquicias externas.

## Mejoras principales

### 1. Rutas completas visibles

Antes solo se destacaba el segmento actual.

Ahora, cuando una agente recibe un destino:

- toda la ruta prevista aparece marcada;
- el tramo actual se ilumina con mayor intensidad;
- el nodo actual pulsa;
- los tramos ya recorridos dejan de ser la prioridad;
- la ruta mantiene el color visual de la agente.

### 2. Caminos más parecidos a carriles

El grafo ahora tiene dos capas:

- **base/carril** ancho y oscuro;
- **flujo energético** encima.

Eso hace que deje de parecer un diagrama de líneas y se acerque más a caminos recorribles del mundo digital.

### 3. Carriles por agente

Se añadieron offsets de movimiento independientes:

- Katherine: carril ligeramente izquierdo;
- Karen: carril central;
- Karencita: carril ligeramente derecho.

Esto reduce superposición cuando varias recorren los mismos cruces al mismo tiempo.

Los destinos finales siguen usando sus posiciones propias.

### 4. Nodos interactivos

Los nodos del mapa son interactivos.

Flujo:

1. seleccionar Katherine, Karen o Karencita;
2. hacer clic en cualquier nodo;
3. la agente genera un evento local de exploración;
4. calcula ruta desde su nodo actual;
5. recorre Netheris hasta ese nodo.

Los nodos intermedios dejan de ser decoración: pasan a ser lugares transitables.

### 5. Navegación desde posición actual

Cada agente mantiene su nodo visual actual.

Ejemplo:

```text
Karen está en Forja
      ↓
Franco selecciona Karen
      ↓
clic en Nodo Suroeste
      ↓
pathfinding desde research
      ↓
hub_right → hub_center → hub_left → south_left
```

No vuelve artificialmente a su spawn para iniciar una ruta nueva.

### 6. Actividad empieza al llegar

Se corrigió una limitación importante.

Antes:

```text
evento inicia
↓
timer de trabajo inicia
↓
agente camina
↓
puede consumir parte del tiempo mientras viaja
```

Ahora:

```text
evento inicia
↓
departed
↓
pathing
↓
arrived
↓
interacting
↓
recién aquí inicia duration_ms
```

El contrato incorpora:

```json
{
  "defer_completion": true
}
```

La UI local lo activa automáticamente para eventos de agentes.

El World State Engine incorpora:

```js
netherisWorld.armCompletion(agent, eventId, durationMs)
```

### 7. Estados visuales

Se mantienen separados del estado lógico:

```text
pathing
arriving
interacting
idle
```

Ejemplo:

```text
estado lógico = researching

visual:
pathing
↓
arriving
↓
interacting
```

### 8. Exploración manual

Un nodo explorado genera un evento similar a:

```json
{
  "type": "agent.explore.started",
  "agent": "karen",
  "state": "moving",
  "activity": "Explorando Nodo Oeste",
  "target": "node:hub_left",
  "source": "local-demo",
  "defer_completion": true
}
```

El prefijo:

```text
node:
```

permite usar nodos del grafo como destinos sin convertir todos en servicios lógicos.

## Grafo actual

```text
                 board
                   │
home_katherine─hub_left────hub_center────hub_right─research
                   │            │            │
               south_left──south_center──south_right
                   │            │            │
                portal        table      homeConsole

home_karen ───────────────→ hub_center
home_karencita ───────────→ hub_right
core conectado a hub_center
```

## Archivos

```text
index.html
styles.css
app.js
world-state.js
world-paths.js
contracts/world-event.schema.json
contracts/README.md
scripts/import_pet_frames.py
```

## Pruebas recomendadas

### Ruta automática

- Oráculo → Katherine · archivo
- Oráculo → Karen · investigar
- Oráculo → Karencita · santuario

### Movimiento simultáneo

- Oráculo → Consejo

Las tres deben viajar hacia el Círculo del Consejo usando sus propios carriles visuales.

### Exploración manual

1. hacer clic en Karen;
2. hacer clic en un nodo del suelo;
3. probar varios nodos consecutivos;
4. repetir con Katherine y Karencita.

### Destinos especiales

Seleccionar una agente y hacer clic en:

- Núcleo de Netheris;
- Puerta al Mundo Físico.

## Regla de verdad

Sigue vigente:

> Netheris puede tener animación ambiental y exploración simulada, pero jamás debe representar trabajo real sin un evento real.

Todo sigue usando:

```text
source=local-demo
```

## Próxima macrofase

### Fase 3 Alpha — Real Bridge

Cuando esta navegación quede validada:

- conexión WebSocket con Netheris-V1 / CT116;
- autenticación y diagnóstico de sesión;
- reconexión automática;
- modo degradado;
- normalización de mensajes del Platform Bridge;
- eventos `typing` e `investigando`;
- indicador REAL vs SIMULADO;
- actividad real usando exactamente este mismo grafo;
- luego n8n / Research Bridge / Home Assistant;
- Event Bus como arquitectura final.

No reemplazar todavía Netheris-V1.
