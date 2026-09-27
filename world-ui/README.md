# Netheris World UI — Fase 2 Alpha

Macro-entrega local de la futura interfaz viva de Netheris.

## Qué reúne esta fase

Esta entrega junta el trabajo visual de Fase 1.x con la base lógica que antes estaba prevista para Fase 2.

### Mundo

- El Hogar como escena principal, no como dashboard.
- Katherine, Karen y Karencita representadas con sus PET reales.
- Tablero de Katherine.
- Estación de investigación de Karen.
- Consola de casa de Karencita.
- Core Netheris.
- Portal al mundo físico.
- Mesa común y lounge.
- Iluminación ambiental por zonas.
- Personajes más grandes y con movimiento direccional.
- Día/noche visual según la hora local del navegador.
- Interacción directa con los objetos del escenario.

### World State Engine

Archivo: `world-state.js`.

Incluye:

- estado independiente por agente;
- estados `idle / moving / working / researching / acting / talking / resting / waiting / error`;
- cola independiente por agente;
- eventos simultáneos entre agentes distintos;
- duración de actividades;
- transición automática a idle al completar;
- pausa/reanudación de cola;
- historial efímero local;
- eventos de inicio, finalización, cola e invalidez;
- API global local `window.netherisWorld`.

Ejemplo desde la consola del navegador:

```js
netherisWorld.submit({
  type: "agent.research.started",
  agent: "karen",
  state: "researching",
  activity: "Investigando prueba",
  target: "research",
  animation: "work",
  source: "local-demo",
  duration_ms: 5000
})
```

## Contrato JSON

Se agregó:

```text
contracts/world-event.schema.json
contracts/README.md
```

La UI futura no debe depender directamente de n8n, Home Assistant, Research Bridge o Platform Bridge. Esos sistemas deberán traducir su actividad al contrato de eventos de Netheris.

Regla:

> La interfaz nunca inventa trabajo real.

`source=local-demo` significa simulación. Una integración real deberá usar su origen real.

Nunca incluir secretos, credenciales, tokens o payloads sensibles en los eventos.

## Laboratorio local

El botón **Simulación** abre el laboratorio. Incluye:

- acciones rápidas;
- prueba de cola de Karen;
- secuencia multiagente;
- editor JSON para inyectar eventos manuales;
- validación básica;
- payload normalizado;
- historial local;
- contador de eventos en cola;
- pausa y reanudación de colas.

## PET frames

Cada personaje usa 50 PNG transparentes de 256×256.

Mapeo provisional:

- idle: 001–004;
- caminar hacia cámara: 034–037;
- caminar alejándose: 038–041;
- trabajo/tecnología: 019–020;
- interacción/energía: 043–044;
- sentada: 042;
- descanso: 050;
- espera/error: primeros frames de expresión, provisional.

## Importar ZIP

```bash
python3 scripts/import_pet_frames.py \
  /home/katherine/Descargas/Katherine_PET_Netheris_50_frames.zip \
  /home/katherine/Descargas/Karen_PET_Netheris_50_frames.zip \
  /home/katherine/Descargas/Karencita_PET_Netheris_50_frames.zip
```

## Ejecutar

```bash
python3 -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

## Qué falta antes de conectar producción

La siguiente macro-entrega deberá centrarse en la conexión real:

1. adaptador WebSocket para Platform Bridge;
2. traducción de eventos existentes `typing/investigando`;
3. ACK/finalización de tareas reales;
4. reconexión y modo degradado;
5. separación clara entre `local-demo` y fuentes reales;
6. luego adaptadores n8n/Research Bridge/Home Assistant;
7. finalmente Event Bus como fuente normalizada principal.

No desplegar esta UI como reemplazo del CT Netheris-V1 todavía.
