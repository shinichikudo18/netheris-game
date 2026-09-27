# Netheris World UI — Fase 1

Primer prototipo visual de la futura interfaz viva de Netheris.

## Objetivo de esta fase

Definir cómo se ve **El Hogar** y cómo se traducen actividades de Katherine, Karen y Karencita a movimiento visible, sin conectar todavía con servicios reales.

Regla central:

> La interfaz no debe inventar trabajo real. En esta fase todos los movimientos son simulados y están marcados como `local-demo`. Más adelante solo las animaciones de actividad serán disparadas por eventos reales de Netheris.

## Ejecutar en Linux

```bash
git clone https://github.com/shinichikudo18/netheris-game.git
cd netheris-game
git checkout world-ui-v2-phase1
cd world-ui
python3 -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

No necesita npm ni dependencias en esta fase.

## Avatares

Coloca tus imágenes existentes aquí:

```text
world-ui/assets/katherine.png
world-ui/assets/karen.png
world-ui/assets/karencita.png
```

Si todavía no están, la interfaz usa iniciales como fallback.

## Qué se puede probar

- Katherine moviéndose hacia su tablero.
- Karen moviéndose a su estación de investigación.
- Karencita moviéndose a la consola de casa.
- Las tres reuniéndose en la mesa común.
- Estado textual de ubicación/actividad.
- Payload de evento simulado que será la base del contrato real posterior.

## Siguiente fase

Fase 2 convertirá este prototipo en un **World State Model** explícito:

- esquema de eventos;
- estados `idle / moving / working / talking / waiting / error`;
- catálogo de ubicaciones;
- cola de actividades;
- transición por eventos;
- simulador JSON;
- separación entre animación ambiental y actividad real.

Después de estabilizar Fase 2 se conectará primero al Platform Bridge de Netheris-V1 mediante WebSocket, sin tocar todavía n8n ni el futuro Event Bus.
