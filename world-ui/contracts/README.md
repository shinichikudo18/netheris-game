# Contrato de eventos Netheris World

Este contrato es la frontera entre la UI y los productores futuros de eventos
(Platform Bridge, n8n, runtimes, Research Bridge, Home Assistant y Event Bus).

La UI no necesita saber cómo se ejecutó una tarea. Solo recibe un evento normalizado.

Ejemplo:

```json
{
  "type": "agent.research.started",
  "agent": "karen",
  "state": "researching",
  "activity": "Investigando CVE de FortiGate",
  "target": "research",
  "animation": "work",
  "source": "research-bridge",
  "tool": "codex",
  "duration_ms": 8000
}
```

Reglas:

- `source=local-demo` identifica simulación.
- Una actividad real futura debe informar su origen real.
- Nunca incluir credenciales, tokens, prompts secretos ni payloads sensibles.
- El motor mantiene una cola independiente por agente.
- Eventos simultáneos de distintas agentes pueden ejecutarse a la vez.
- Si una misma agente está ocupada, el evento siguiente entra en cola salvo `queue=false`.
- `duration_ms=0` deja el evento activo hasta que un productor real envíe finalización o la integración implemente ACK.
