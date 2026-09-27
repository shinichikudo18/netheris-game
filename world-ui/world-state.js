(() => {
  const AGENTS = ["katherine", "karen", "karencita"];
  const STATES = ["idle", "moving", "working", "researching", "acting", "talking", "resting", "waiting", "error"];

  function uid() {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
    return `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  class NetherisWorldState extends EventTarget {
    constructor(initialAgents = {}) {
      super();
      this.initialAgents = structuredClone(initialAgents);
      this.agents = structuredClone(initialAgents);
      this.queues = Object.fromEntries(AGENTS.map(agent => [agent, []]));
      this.history = [];
      this.paused = false;
      this.maxHistory = 80;
      this._timers = new Map();
    }

    normalize(raw = {}) {
      const event = {
        id: raw.id || uid(),
        type: raw.type || "agent.activity.started",
        agent: raw.agent || null,
        state: raw.state || "working",
        activity: raw.activity || "Actividad",
        target: raw.target || "Hogar",
        animation: raw.animation || "work",
        source: raw.source || "local-demo",
        capability: raw.capability || null,
        tool: raw.tool || null,
        correlation_id: raw.correlation_id || null,
        duration_ms: Number.isFinite(raw.duration_ms) ? raw.duration_ms : 4200,
        queue: raw.queue !== false,
        timestamp: raw.timestamp || new Date().toISOString(),
        metadata: raw.metadata && typeof raw.metadata === "object" ? raw.metadata : {},
      };
      return event;
    }

    validate(event) {
      const errors = [];
      if (!event.type || typeof event.type !== "string") errors.push("type es obligatorio");
      if (event.agent && !AGENTS.includes(event.agent)) errors.push(`agent inválido: ${event.agent}`);
      if (!STATES.includes(event.state)) errors.push(`state inválido: ${event.state}`);
      if (!event.target || typeof event.target !== "string") errors.push("target es obligatorio");
      if (!event.source || typeof event.source !== "string") errors.push("source es obligatorio");
      if (event.duration_ms < 0) errors.push("duration_ms no puede ser negativo");
      return errors;
    }

    submit(raw) {
      const event = this.normalize(raw);
      const errors = this.validate(event);

      if (errors.length) {
        const detail = { event, errors };
        this.dispatchEvent(new CustomEvent("world:invalid", { detail }));
        return { accepted: false, errors, event };
      }

      if (event.agent) {
        const agentState = this.agents[event.agent];
        if (agentState?.busy && event.queue) {
          this.queues[event.agent].push(event);
          this._record(event, "queued");
          this._emitQueue();
          return { accepted: true, queued: true, event };
        }
      }

      this._activate(event);
      return { accepted: true, queued: false, event };
    }

    _activate(event) {
      if (event.agent) {
        const current = this.agents[event.agent] || {};
        this.agents[event.agent] = {
          ...current,
          busy: event.state !== "idle",
          state: event.state,
          activity: event.activity,
          target: event.target,
          source: event.source,
          current_event_id: event.id,
          updated_at: event.timestamp,
        };
      }

      this._record(event, "started");
      this.dispatchEvent(new CustomEvent("world:event", { detail: structuredClone(event) }));
      this._emitState();

      if (event.agent && event.duration_ms > 0 && event.state !== "idle") {
        const oldTimer = this._timers.get(event.agent);
        if (oldTimer) clearTimeout(oldTimer);

        const timer = setTimeout(() => this.complete(event.agent, event.id), event.duration_ms);
        this._timers.set(event.agent, timer);
      }
    }

    complete(agent, eventId = null) {
      if (!AGENTS.includes(agent)) return;
      const current = this.agents[agent];
      if (!current) return;
      if (eventId && current.current_event_id !== eventId) return;

      const timer = this._timers.get(agent);
      if (timer) clearTimeout(timer);
      this._timers.delete(agent);

      const completedEvent = {
        id: current.current_event_id || uid(),
        type: "agent.activity.completed",
        agent,
        state: "idle",
        activity: current.activity,
        target: current.target,
        source: current.source || "local-demo",
        timestamp: new Date().toISOString(),
      };

      this.agents[agent] = {
        ...current,
        busy: false,
        state: "idle",
        activity: current.target === "Hogar" ? "Libre en El Hogar" : `Disponible en ${current.target}`,
        current_event_id: null,
        updated_at: completedEvent.timestamp,
      };

      this._record(completedEvent, "completed");
      this.dispatchEvent(new CustomEvent("world:complete", { detail: structuredClone(completedEvent) }));
      this._emitState();

      if (!this.paused) this._drain(agent);
    }

    _drain(agent) {
      if (!AGENTS.includes(agent)) return;
      if (this.agents[agent]?.busy) return;
      const next = this.queues[agent].shift();
      this._emitQueue();
      if (next) setTimeout(() => this._activate(next), 180);
    }

    setPaused(value) {
      this.paused = Boolean(value);
      this.dispatchEvent(new CustomEvent("world:pause", { detail: { paused: this.paused } }));
      if (!this.paused) AGENTS.forEach(agent => this._drain(agent));
    }

    recordPhase(raw, phase, extra = {}) {
      const event = this.normalize({ ...raw, ...extra, id: raw.id || extra.id });
      this._record(event, phase);
      this.dispatchEvent(new CustomEvent("world:phase", {
        detail: { ...structuredClone(event), phase }
      }));
    }

    clearHistory() {
      this.history = [];
      this.dispatchEvent(new CustomEvent("world:history", { detail: [] }));
    }

    reset() {
      for (const timer of this._timers.values()) clearTimeout(timer);
      this._timers.clear();
      this.agents = structuredClone(this.initialAgents);
      this.queues = Object.fromEntries(AGENTS.map(agent => [agent, []]));
      this.history = [];
      this.paused = false;
      this.dispatchEvent(new CustomEvent("world:reset"));
      this._emitQueue();
      this._emitState();
    }

    snapshot() {
      return {
        agents: structuredClone(this.agents),
        queues: structuredClone(this.queues),
        history: structuredClone(this.history),
        paused: this.paused,
      };
    }

    _record(event, phase) {
      this.history.unshift({ ...structuredClone(event), phase });
      if (this.history.length > this.maxHistory) this.history.length = this.maxHistory;
      this.dispatchEvent(new CustomEvent("world:history", { detail: this.snapshot().history }));
    }

    _emitQueue() {
      this.dispatchEvent(new CustomEvent("world:queue", { detail: structuredClone(this.queues) }));
    }

    _emitState() {
      this.dispatchEvent(new CustomEvent("world:state", { detail: this.snapshot() }));
    }
  }

  globalThis.NetherisWorldState = NetherisWorldState;
})();