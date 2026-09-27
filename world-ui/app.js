const positions = {
  idleKatherine: { left: 34, top: 61 },
  idleKaren: { left: 50, top: 64 },
  idleKarencita: { left: 66, top: 61 },
  board: { left: 18, top: 44 },
  research: { left: 82, top: 44 },
  homeConsole: { left: 82, top: 75 },
  portal: { left: 17, top: 74 },
  core: { left: 50, top: 42 },
  tableKatherine: { left: 43, top: 75 },
  tableKaren: { left: 50, top: 71 },
  tableKarencita: { left: 57, top: 75 },
};

const roles = {
  katherine: "Coordinación · memoria · conocimiento",
  karen: "Investigación · código · análisis",
  karencita: "Hogar · rutinas · dispositivos",
};

const targetLabels = {
  Hogar: "Plaza del Hogar",
  board: "Archivo de Katherine",
  research: "Forja de Karen",
  homeConsole: "Santuario de Karencita",
  portal: "Puerta al Mundo Físico",
  core: "Núcleo de Netheris",
  table: "Círculo del Consejo",
  "Mesa común": "Círculo del Consejo",
};

const stationSelectors = {
  board: "[data-station='board']",
  research: "[data-station='research']",
  homeConsole: "[data-station='homeConsole']",
  portal: "[data-station='portal']",
  core: "[data-station='core']",
  table: "[data-station='table']",
};

const stationActions = {
  board: "katherine",
  research: "karen",
  homeConsole: "karencita",
  table: "meeting",
};

const animationSets = {
  idle: { frames: [1, 1, 2, 1, 3, 1, 4], ms: 560, loop: true },
  walkDown: { frames: [34, 35, 36, 37], ms: 120, loop: true },
  walkUp: { frames: [38, 39, 40, 41], ms: 120, loop: true },
  work: { frames: [19, 20, 19, 20], ms: 680, loop: true },
  social: { frames: [5, 6, 7, 8], ms: 460, loop: true },
  sit: { frames: [42], ms: 1000, loop: true },
  action: { frames: [43, 44, 43], ms: 280, loop: true },
  sleep: { frames: [50], ms: 1000, loop: true },
  waiting: { frames: [9, 10, 9], ms: 520, loop: true },
  error: { frames: [11, 12, 11], ms: 420, loop: true },
};

const initialState = {
  katherine: {
    name: "Katherine",
    role: roles.katherine,
    busy: false,
    state: "idle",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    current_event_id: null,
  },
  karen: {
    name: "Karen",
    role: roles.karen,
    busy: false,
    state: "idle",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    current_event_id: null,
  },
  karencita: {
    name: "Karencita",
    role: roles.karencita,
    busy: false,
    state: "idle",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    current_event_id: null,
  },
};

const engine = new NetherisWorldState(initialState);
globalThis.netherisWorld = engine;

const animationTimers = {};
const assetsAvailable = { katherine: true, karen: true, karencita: true };
const visualPositions = {
  katherine: { ...positions.idleKatherine },
  karen: { ...positions.idleKaren },
  karencita: { ...positions.idleKarencita },
};

const visualNodes = {
  katherine: NetherisPaths.homeNode.katherine,
  karen: NetherisPaths.homeNode.karen,
  karencita: NetherisPaths.homeNode.karencita,
};

const movementGeneration = {
  katherine: 0,
  karen: 0,
  karencita: 0,
};

const activeEventByAgent = {};
const networkSvg = document.querySelector("#path-network");

let selectedAgent = null;

function framePath(agent, frame) {
  return `./assets/pets/${agent}/frame_${String(frame).padStart(3, "0")}.png`;
}

function preloadFrames() {
  const frames = [...new Set(Object.values(animationSets).flatMap(item => item.frames))];
  Object.keys(initialState).forEach(agent => {
    frames.forEach(frame => {
      const img = new Image();
      img.src = framePath(agent, frame);
    });
  });
}

function setAgentFrame(agent, frame) {
  if (!assetsAvailable[agent]) return;

  const root = document.querySelector(`#agent-${agent}`);
  const img = root.querySelector(".pet-sprite");
  const fallback = root.querySelector(".avatar-fallback");

  img.onload = () => {
    img.hidden = false;
    fallback.hidden = true;
    root.classList.add("has-pet-assets");
  };

  img.onerror = () => {
    assetsAvailable[agent] = false;
    img.hidden = true;
    fallback.hidden = false;
    root.classList.remove("has-pet-assets");
  };

  img.src = framePath(agent, frame);
}

function playAnimation(agent, name) {
  clearInterval(animationTimers[agent]);
  const animation = animationSets[name] || animationSets.idle;
  let index = 0;

  setAgentFrame(agent, animation.frames[0]);
  if (animation.frames.length === 1) return;

  animationTimers[agent] = setInterval(() => {
    index = (index + 1) % animation.frames.length;
    setAgentFrame(agent, animation.frames[index]);
  }, animation.ms);
}

function resolveTarget(agent, target) {
  if (target === "Hogar") {
    if (agent === "katherine") return positions.idleKatherine;
    if (agent === "karen") return positions.idleKaren;
    return positions.idleKarencita;
  }

  if (target === "table" || target === "Mesa común") {
    if (agent === "katherine") return positions.tableKatherine;
    if (agent === "karen") return positions.tableKaren;
    return positions.tableKarencita;
  }

  return positions[target] || resolveTarget(agent, "Hogar");
}

function chooseWalkAnimation(from, to) {
  return to.y < from.y ? "walkUp" : "walkDown";
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function segmentDuration(from, to) {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  return Math.max(190, Math.min(480, Math.round(distance * 23)));
}

function clearAgentPath(agent) {
  if (!networkSvg) return;

  networkSvg.querySelectorAll(`.network-edge.${agent}, .network-node.${agent}`).forEach(node => {
    node.classList.remove(agent);

    const stillOwned =
      node.classList.contains("katherine") ||
      node.classList.contains("karen") ||
      node.classList.contains("karencita");

    if (!stillOwned) node.classList.remove("active", "current");
  });
}

function setVisualState(agent, state) {
  const el = document.querySelector(`#agent-${agent}`);
  if (!el) return;

  el.dataset.visualState = state;
  el.classList.remove("pathing", "arriving", "interacting", "returning");
  if (state) el.classList.add(state);
}

async function moveVisual(agent, event) {
  const el = document.querySelector(`#agent-${agent}`);
  if (!el) return;

  const generation = ++movementGeneration[agent];
  activeEventByAgent[agent] = event;

  const fromNodeId = visualNodes[agent] || NetherisPaths.homeNode[agent];
  const toNodeId = NetherisPaths.nodeForTarget(agent, event.target);
  const path = NetherisPaths.pathfind(fromNodeId, toNodeId);
  const route = path.length ? path : [fromNodeId, toNodeId];

  engine.recordPhase(event, "departed", {
    metadata: {
      ...event.metadata,
      visual_state: "pathing",
      path: route,
    },
  });

  el.classList.add("moving", "active");
  setVisualState(agent, "pathing");
  el.dataset.state = event.state;
  el.querySelector(".agent-bubble span").textContent = `En ruta · ${event.activity}`;

  clearAgentPath(agent);
  NetherisPaths.highlightNode(networkSvg, fromNodeId, agent, true);

  engine.recordPhase(event, "pathing", {
    metadata: {
      ...event.metadata,
      visual_state: "pathing",
      path: route,
    },
  });

  for (let index = 1; index < route.length; index += 1) {
    if (generation !== movementGeneration[agent]) return;

    const previousId = route[index - 1];
    const nextId = route[index];
    const previous = NetherisPaths.nodes[previousId];
    const next = NetherisPaths.nodes[nextId];
    if (!previous || !next) continue;

    clearAgentPath(agent);
    NetherisPaths.highlightEdge(networkSvg, previousId, nextId, agent);
    NetherisPaths.highlightNode(networkSvg, previousId, agent);
    NetherisPaths.highlightNode(networkSvg, nextId, agent, true);

    el.classList.toggle("face-left", next.x < previous.x);
    const walkAnimation = chooseWalkAnimation(previous, next);
    playAnimation(agent, walkAnimation);

    const duration = segmentDuration(previous, next);
    el.style.setProperty("--move-ms", `${duration}ms`);
    el.style.left = `${next.x}%`;
    el.style.top = `${next.y}%`;
    el.style.zIndex = String(20 + Math.round(next.y));

    visualPositions[agent] = { left: next.x, top: next.y };
    await wait(duration + 34);
  }

  if (generation !== movementGeneration[agent]) return;

  const finalPosition = resolveTarget(agent, event.target);
  const nodePosition = NetherisPaths.nodes[toNodeId];

  if (
    nodePosition &&
    (Math.abs(finalPosition.left - nodePosition.x) > 0.2 ||
      Math.abs(finalPosition.top - nodePosition.y) > 0.2)
  ) {
    const duration = 190;
    el.style.setProperty("--move-ms", `${duration}ms`);
    el.style.left = `${finalPosition.left}%`;
    el.style.top = `${finalPosition.top}%`;
    el.style.zIndex = String(20 + Math.round(finalPosition.top));
    visualPositions[agent] = { ...finalPosition };
    await wait(duration + 24);
  }

  if (generation !== movementGeneration[agent]) return;

  visualNodes[agent] = toNodeId;
  el.classList.remove("moving");
  setVisualState(agent, "arriving");
  el.querySelector(".agent-bubble span").textContent = `Llegando · ${event.activity}`;
  clearAgentPath(agent);
  NetherisPaths.highlightNode(networkSvg, toNodeId, agent, true);

  engine.recordPhase(event, "arrived", {
    metadata: {
      ...event.metadata,
      visual_state: "arriving",
      node: toNodeId,
    },
  });

  await wait(430);
  if (generation !== movementGeneration[agent]) return;

  setVisualState(agent, "interacting");
  el.querySelector(".agent-bubble span").textContent = event.activity;
  playAnimation(agent, event.animation || "idle");

  engine.recordPhase(event, "interacting", {
    metadata: {
      ...event.metadata,
      visual_state: "interacting",
      node: toNodeId,
    },
  });

  clearTimeout(el.activeTimer);
  el.activeTimer = setTimeout(() => {
    if (!el.classList.contains("selected")) el.classList.remove("active");
  }, Math.max(4200, event.duration_ms || 0));
}

function settleVisual(agent) {
  const el = document.querySelector(`#agent-${agent}`);
  if (!el) return;

  movementGeneration[agent] += 1;
  clearAgentPath(agent);

  const nodeId = visualNodes[agent];
  if (nodeId) NetherisPaths.highlightNode(networkSvg, nodeId, agent, true);

  el.dataset.state = "idle";
  setVisualState(agent, "");
  el.classList.remove("moving");
  el.querySelector(".agent-bubble span").textContent = "Disponible";
  playAnimation(agent, "idle");

  const event = activeEventByAgent[agent];
  if (event) {
    engine.recordPhase(event, "visual-complete", {
      metadata: {
        ...event.metadata,
        visual_state: "idle",
        node: nodeId,
      },
    });
  }

  setTimeout(() => {
    clearAgentPath(agent);
    if (!el.classList.contains("selected")) el.classList.remove("active");
  }, 900);
}

function refreshOccupancy(snapshot) {
  document.querySelectorAll(".world-object.occupied").forEach(node => node.classList.remove("occupied"));

  Object.values(snapshot.agents).forEach(item => {
    if (!item.busy) return;
    const target = item.target === "Mesa común" ? "table" : item.target;
    const selector = stationSelectors[target];
    if (selector) document.querySelector(selector)?.classList.add("occupied");
  });
}

function renderPayload(payload) {
  const output = document.querySelector("#event-output");
  if (output) output.textContent = JSON.stringify(payload, null, 2);
}

function renderInspector(agent) {
  const item = engine.snapshot().agents[agent];
  const inspector = document.querySelector("#agent-inspector");
  if (!item || !inspector) return;

  document.querySelectorAll(".agent.selected").forEach(node => node.classList.remove("selected"));

  selectedAgent = agent;
  document.querySelector(`#agent-${agent}`)?.classList.add("selected");
  document.querySelector("#inspector-name").textContent = item.name;
  document.querySelector("#inspector-role").textContent = roles[agent];
  document.querySelector("#inspector-activity").textContent = item.activity;
  document.querySelector("#inspector-target").textContent = targetLabels[item.target] || item.target;
  document.querySelector("#inspector-source").textContent = item.source;
  inspector.hidden = false;
}

function closeInspector() {
  selectedAgent = null;
  document.querySelector("#agent-inspector").hidden = true;
  document.querySelectorAll(".agent.selected").forEach(node => node.classList.remove("selected"));
}

function renderQueue(queues) {
  const count = Object.values(queues).reduce((sum, queue) => sum + queue.length, 0);
  document.querySelector("#engine-queue").textContent = `Cola: ${count}`;
}

function renderHistory(history) {
  const container = document.querySelector("#event-history");
  if (!container) return;

  if (!history.length) {
    container.innerHTML = '<p class="empty-history">Todavía no hay eventos.</p>';
    return;
  }

  container.innerHTML = history.slice(0, 12).map(item => {
    const time = new Date(item.timestamp).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const subject = item.agent ? item.agent : "world";
    return `
      <article class="history-item">
        <header>
          <strong>${escapeHtml(subject)}</strong>
          <span class="history-phase">${escapeHtml(item.phase || "event")}</span>
          <time>${escapeHtml(time)}</time>
        </header>
        <p>${escapeHtml(item.activity || item.type)} · ${escapeHtml(targetLabels[item.target] || item.target || "-")}</p>
      </article>
    `;
  }).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function submitEvent(event) {
  const result = engine.submit(event);

  if (!result.accepted) {
    renderPayload({ status: "invalid", errors: result.errors, event: result.event });
    setValidation(result.errors.join(" · "), false);
  } else if (result.queued) {
    renderPayload({ status: "queued", event: result.event });
  } else {
    renderPayload({ status: "started", event: result.event });
  }

  return result;
}

function demo(type) {
  if (type === "katherine") {
    submitEvent({
      type: "agent.coordination.started",
      agent: "katherine",
      state: "working",
      activity: "Organizando y coordinando",
      target: "board",
      animation: "work",
      capability: "coordination",
      source: "local-demo",
      duration_ms: 5200,
    });
  }

  if (type === "karen") {
    submitEvent({
      type: "agent.research.started",
      agent: "karen",
      state: "researching",
      activity: "Investigando",
      target: "research",
      animation: "work",
      capability: "research",
      tool: "future:research-bridge",
      source: "local-demo",
      duration_ms: 6200,
    });
  }

  if (type === "karencita") {
    submitEvent({
      type: "agent.home.started",
      agent: "karencita",
      state: "acting",
      activity: "Revisando la casa",
      target: "homeConsole",
      animation: "action",
      capability: "home",
      source: "local-demo",
      duration_ms: 5200,
    });
  }

  if (type === "meeting") {
    const correlation = `meeting-${Date.now()}`;
    [
      ["katherine", "Conversando con Karen y Karencita"],
      ["karen", "Conversando con Katherine y Karencita"],
      ["karencita", "Conversando con Katherine y Karen"],
    ].forEach(([agent, activity]) => {
      submitEvent({
        type: "agents.meeting",
        agent,
        state: "talking",
        activity,
        target: "table",
        animation: "social",
        source: "local-demo",
        correlation_id: correlation,
        duration_ms: 5600,
      });
    });
  }

  if (type === "sleep") {
    ["katherine", "karen", "karencita"].forEach(agent => {
      submitEvent({
        type: "agent.rest",
        agent,
        state: "resting",
        activity: "Descansando",
        target: "Hogar",
        animation: "sleep",
        source: "local-demo",
        duration_ms: 6200,
      });
    });
  }

  if (type === "queue") {
    [
      ["Investigando alerta", "research", "researching", "work", 3200],
      ["Revisando código", "research", "working", "work", 3200],
      ["Esperando resultado", "research", "waiting", "waiting", 2600],
    ].forEach(([activity, target, state, animation, duration_ms]) => {
      submitEvent({
        type: "agent.queue.demo",
        agent: "karen",
        state,
        activity,
        target,
        animation,
        source: "local-demo",
        duration_ms,
      });
    });
  }

  if (type === "sequence") {
    demo("katherine");
    demo("karen");
    demo("karencita");
    setTimeout(() => demo("meeting"), 700);
  }
}

function resetVisuals() {
  Object.entries(visualPositions).forEach(([agent]) => {
    const target = resolveTarget(agent, "Hogar");
    const el = document.querySelector(`#agent-${agent}`);
    visualPositions[agent] = { ...target };
    visualNodes[agent] = NetherisPaths.homeNode[agent];
    movementGeneration[agent] += 1;
    clearAgentPath(agent);
    el.style.left = `${target.left}%`;
    el.style.top = `${target.top}%`;
    el.style.zIndex = String(10 + Math.round(target.top));
    el.dataset.state = "idle";
    el.dataset.visualState = "idle";
    el.classList.remove("moving", "active", "face-left", "pathing", "arriving", "interacting", "returning");
    el.querySelector(".agent-bubble span").textContent = "Libre";
    playAnimation(agent, "idle");
  });

  closeInspector();
  refreshOccupancy(engine.snapshot());
}

function toggleLab() {
  const panel = document.querySelector("#lab-panel");
  const button = document.querySelector("#toggle-lab");
  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setValidation(message, ok = true) {
  const node = document.querySelector("#event-validation");
  node.textContent = message;
  node.classList.remove("ok", "error");
  node.classList.add(ok ? "ok" : "error");
}

function dispatchEditorEvent() {
  const textarea = document.querySelector("#event-input");

  try {
    const raw = JSON.parse(textarea.value);
    const result = submitEvent(raw);

    if (result.accepted) {
      setValidation(result.queued ? "Evento válido · en cola" : "Evento válido · enviado", true);
    }
  } catch (error) {
    setValidation(`JSON inválido: ${error.message}`, false);
  }
}

function loadExample() {
  document.querySelector("#event-input").value = JSON.stringify({
    type: "agent.research.started",
    agent: "karen",
    state: "researching",
    activity: "Investigando desde contrato JSON",
    target: "research",
    animation: "work",
    source: "local-demo",
    tool: "research-bridge",
    duration_ms: 5000,
  }, null, 2);
  setValidation("Ejemplo cargado", true);
}

function updateLocalClock() {
  const now = new Date();
  const clock = document.querySelector("#local-clock");
  const world = document.querySelector("#world");

  if (clock) {
    clock.textContent = new Intl.DateTimeFormat("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
  }

  if (world) {
    const hour = now.getHours();
    world.dataset.daypart = hour >= 7 && hour < 20 ? "day" : "night";
  }
}

engine.addEventListener("world:event", event => {
  const payload = event.detail;
  if (payload.agent) moveVisual(payload.agent, payload);
  renderPayload({ status: "started", event: payload });
});

engine.addEventListener("world:complete", event => {
  if (event.detail.agent) settleVisual(event.detail.agent);
});

engine.addEventListener("world:state", event => {
  refreshOccupancy(event.detail);
  if (selectedAgent) renderInspector(selectedAgent);
});

engine.addEventListener("world:queue", event => renderQueue(event.detail));

engine.addEventListener("world:history", event => {
  renderHistory(event.detail);
});

engine.addEventListener("world:invalid", event => {
  setValidation(event.detail.errors.join(" · "), false);
});

engine.addEventListener("world:pause", event => {
  const button = document.querySelector("#toggle-engine-pause");
  button.textContent = event.detail.paused ? "Reanudar cola" : "Pausar cola";
});

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", () => demo(button.dataset.demo));
});

document.querySelector("#toggle-lab").addEventListener("click", toggleLab);
document.querySelector("#reset-world").addEventListener("click", () => {
  engine.reset();
  resetVisuals();
  renderPayload({ source: "local-demo", status: "reset" });
});

document.querySelector("#close-inspector").addEventListener("click", closeInspector);
document.querySelector("#dispatch-event").addEventListener("click", dispatchEditorEvent);
document.querySelector("#load-event-example").addEventListener("click", loadExample);

document.querySelector("#toggle-engine-pause").addEventListener("click", () => {
  engine.setPaused(!engine.paused);
});

document.querySelector("#clear-history").addEventListener("click", () => {
  engine.clearHistory();
  renderPayload({ source: "local-demo", status: "history-cleared" });
});

document.querySelectorAll(".agent").forEach(el => {
  const agent = el.dataset.agent;
  el.addEventListener("click", () => renderInspector(agent));
  el.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      renderInspector(agent);
    }
  });
});

document.querySelectorAll(".world-object").forEach(node => {
  node.addEventListener("click", () => {
    const station = node.dataset.station;
    const action = stationActions[station];

    if (action) {
      demo(action);
      return;
    }

    if ((station === "core" || station === "portal") && selectedAgent) {
      submitEvent({
        type: "world.object.interaction",
        agent: selectedAgent,
        state: station === "core" ? "working" : "acting",
        activity: station === "core" ? "Consultando el Core" : "Observando el enlace físico",
        target: station,
        animation: station === "core" ? "work" : "action",
        source: "local-demo",
        duration_ms: 4200,
        metadata: { object: station },
      });
      return;
    }

    renderPayload({
      type: "world.object.selected",
      station,
      status: "informational",
      hint: "Selecciona una de las chicas para interactuar con este objeto",
    });
  });
});

preloadFrames();
NetherisPaths.render(networkSvg);

Object.keys(initialState).forEach(agent => {
  const target = resolveTarget(agent, "Hogar");
  const el = document.querySelector(`#agent-${agent}`);
  el.style.left = `${target.left}%`;
  el.style.top = `${target.top}%`;
  el.style.zIndex = String(10 + Math.round(target.top));
  el.dataset.state = "idle";
  el.dataset.visualState = "idle";
  playAnimation(agent, "idle");
  NetherisPaths.highlightNode(networkSvg, visualNodes[agent], agent, true);
  setTimeout(() => clearAgentPath(agent), 900);
});

renderQueue(engine.snapshot().queues);
renderHistory(engine.snapshot().history);
updateLocalClock();
setInterval(updateLocalClock, 30000);
