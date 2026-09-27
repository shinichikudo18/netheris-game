# Netheris World UI — Fase 2 Alpha / Arcane Realm

Macro-entrega local de la futura interfaz viva de Netheris.

## Dirección artística cerrada

Netheris se define visualmente como **mundo digital + magia + RPG/anime**.

No debe verse como:

- dashboard corporativo;
- NOC/SOC;
- oficina futurista convencional;
- simple habitación con pantallas.

Debe sentirse como un **reino digital habitable**, donde la infraestructura lógica de Netheris se expresa como magia tecnológica:

- datos → runas y corrientes de energía;
- servicios → santuarios, forjas, archivos y cristales;
- enlaces externos → portales;
- Core → cristal/núcleo central;
- reuniones → círculos rituales;
- eventos → pulsos, caminos luminosos y actividad visible;
- máquinas reales → lugares/artefactos del mundo.

Las imágenes de referencia aportadas por Franco fijan el lenguaje visual: paisajes digitales oscuros azul/violeta, árboles luminosos, cristales, plataformas flotantes, runas, portales, arquitectura fantástica y partículas de energía.

## Mundo actual

La Fase 2 Alpha conserva toda la lógica previa pero rehace la capa visual:

- cielo de éter con nebulosas y estrellas;
- islas y torres flotantes al fondo;
- plano principal con caminos rúnicos;
- círculo arcano central;
- árboles digitales;
- campos de cristal;
- Archivo de Katherine;
- Forja de Karen;
- Santuario de Karencita;
- Puerta al Mundo Físico;
- Núcleo de Netheris;
- Círculo del Consejo;
- auras propias de cada agente;
- PET reales y animados;
- día/noche según hora local.

## World State Engine

Archivo: `world-state.js`.

Incluye:

- estado independiente por Katherine, Karen y Karencita;
- estados `idle / moving / working / researching / acting / talking / resting / waiting / error`;
- cola independiente por agente;
- actividades simultáneas;
- duración y finalización;
- pausa/reanudación;
- historial efímero;
- API local `window.netherisWorld`.

La dirección artística es independiente de este motor: cambiar el escenario no rompe el contrato lógico.

## Contrato JSON

Archivos:

```text
contracts/world-event.schema.json
contracts/README.md
```

Toda integración futura debe producir eventos normalizados.

Regla inalterable:

> Netheris puede tener animación ambiental, pero nunca debe fingir que una agente está trabajando si no existe un evento real que lo respalde.

`source=local-demo` identifica la simulación actual.

## Oráculo de pruebas

El botón **Oráculo** abre el laboratorio local:

- acciones rápidas;
- cola de Karen;
- secuencia multiagente;
- editor JSON;
- historial;
- pausa/reanudación;
- payload normalizado.

## PET frames

Cada personaje usa 50 PNG transparentes de 256×256.

Mapeo provisional:

- idle: 001–004;
- caminar hacia cámara: 034–037;
- caminar alejándose: 038–041;
- trabajo: 019–020;
- interacción/energía: 043–044;
- sentada: 042;
- descanso: 050;
- espera/error: expresiones provisionales.

## Ejecutar

```bash
python3 -m http.server 8080
```

Abrir:

```text
http://localhost:8080
```

## Próxima macro-entrega

La conexión real con CT116/Platform Bridge queda deliberadamente después de consolidar esta identidad visual.

Luego:

1. adaptador WebSocket;
2. detección de sesión/autenticación;
3. traducción de `typing/investigando`;
4. reconexión y modo degradado;
5. distinción visual REAL vs SIMULADO;
6. adaptadores n8n/Research Bridge/Home Assistant;
7. Event Bus como fuente principal.

No reemplazar todavía Netheris-V1.
