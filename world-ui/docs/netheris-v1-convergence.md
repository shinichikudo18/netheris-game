# Convergencia con Netheris-V1

## Objetivo

World UI será el frontend principal de Netheris-V1.

No se mantendrán dos interfaces operativas de forma permanente.

## Arquitectura final

```text
Netheris
  ↓
Platform Bridge existente
  ↓
World UI
  ├─ El Hogar
  ├─ Chats
  ├─ Cyber Navigation
  └─ Oráculo
```

La UI nueva reutilizará:

- autenticación y sesión existentes;
- historial existente;
- WebSocket existente;
- chats privados y grupo;
- integración con runtimes;
- funciones especiales ya disponibles.

## Principio técnico

La UI se servirá desde el mismo origen que el Platform Bridge.

Las llamadas del frontend deben usar rutas relativas.

Ejemplo conceptual:

```js
const scheme = location.protocol === "https:" ? "wss:" : "ws:";
const ws = new WebSocket(`${scheme}//${location.host}/ws`);
```

Esto evita mantener otro login, otro historial o un backend paralelo.

## Migración

### Paso 1

Publicar World UI como ruta temporal de prueba dentro del mismo servicio.

### Paso 2

Integrar:

- historial;
- envío de mensajes;
- WebSocket;
- chat privado de Katherine;
- chat privado de Karen;
- chat privado de Karencita;
- chat grupal;
- funciones especiales actuales.

### Paso 3

Validar web y móvil.

### Paso 4

Convertir World UI en la ruta principal.

Mantener temporalmente la interfaz antigua como rollback.

### Paso 5

Retirar la interfaz legacy cuando exista equivalencia funcional.

## Integración visual

Las funciones de V1 deben entrar al mundo:

- Katherine → chat contextual desde su avatar;
- Karen → chat e investigación desde su Forja;
- Karencita → chat desde su Santuario;
- grupo → Círculo del Consejo;
- actividad real → World Event → navegación → animación.

## Próxima macrofase

**Fase 3 — Convergencia V1**

- adaptador Platform Bridge;
- WebSocket same-origin;
- historial real;
- chats integrados;
- traducción de eventos;
- indicador REAL vs SIMULADO;
- despliegue temporal de prueba;
- cambio posterior a interfaz única.

## Resultado final

```text
UN CT
UN BACKEND
UN HISTORIAL
UN FRONTEND
UN NETHERIS
```
