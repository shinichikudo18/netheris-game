const positions = {
  idleKatherine: { left: 34, top: 61 },
  idleKaren: { left: 50, top: 64 },
  idleKarencita: { left: 66, top: 61 },
  board: { left: 18, top: 43 },
  research: { left: 82, top: 44 },
  homeConsole: { left: 82, top: 76 },
  portal: { left: 17, top: 75 },
  core: { left: 50, top: 43 },
  tableKatherine: { left: 43, top: 76 },
  tableKaren: { left: 50, top: 72 },
  tableKarencita: { left: 57, top: 76 },
};

const roles = {
  katherine: "Coordinación",
  karen: "Research & código",
  karencita: "Casa & rutinas",
};

const stationSelectors = {
  board: "[data-station='board']",
  research: "[data-station='research']",
  homeConsole: "[data-station='homeConsole']",
  portal: "[data-station='portal']",
  core: "[data-station='core']",
  table: "[data-station='table']",
  "Mesa común": "[data-station='table']",
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
};

const initialState = {
  katherine: {
    name: "Katherine",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    position: positions.idleKatherine,
  },
  karen: {
    name: "Karen",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    position: positions.idleKaren,
  },
  karencita: {
    name: "Karencita",
    activity: "Libre en El Hogar",
    target: "Hogar",
    source: "local-demo",
    position: positions.idleKarencita,
  },
};

const state = structuredClone(initialState);
const animationTimers = {};
const assetsAvailable = { katherine: true, karen: true, karencita: true };
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
    if (!animation.loop && index === animation.frames.length - 1) {
      clearInterval(animationTimers[agent]);
    }
  }, animation.ms);
}

function setStationOccupied(target, active = true) {
  document.querySelectorAll(".world-object.occupied").forEach(node => node.classList.remove("occupied"));
  const selector = stationSelectors[target];
  if (active && selector) {
    document.querySelector(selector)?.classList.add("occupied");
  }
}

function updateRouteTrail(from, to) {
  const trail = document.querySelector("#route-trail");
  if (!trail || !from || !to) return;

  const world = document.querySelector("#world");
  const width = world.clientWidth;
  const height = world.clientHeight;

  const x1 = from.left / 100 * width;
  const y1 = from.top / 100 * height;
  const x2 = to.left / 100 * width;
  const y2 = to.top / 100 * height;

  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  trail.style.left = `${x1}px`;
  trail.style.top = `${y1}px`;
  trail.style.width = `${distance}px`;
  trail.style.transform = `rotate(${angle}deg)`;
  trail.classList.add("active");

  clearTimeout(updateRouteTrail.timer);
  updateRouteTrail.timer = setTimeout(() => trail.classList.remove("active"), 1000);
}

function chooseWalkAnimation(from, to) {
  return to.top < from.top ? "walkUp" : "walkDown";
}

function moveAgent(agent, position, activity, target, event = {}, arrivalAnimation = "idle") {
  const el = document.querySelector(`#agent-${agent}`);
  const previous = state[agent].position;
  const walkAnimation = chooseWalkAnimation(previous, position);

  state[agent] = {
    ...state[agent],
    position,
    activity,
    target,
    source: event.source || "local-demo",
  };

  el.classList.toggle("face-left", position.left < previous.left);
  el.classList.add("moving", "active");
  el.style.left = `${position.left}%`;
  el.style.top = `${position.top}%`;
  el.style.zIndex = String(10 + Math.round(position.top));
  el.querySelector(".agent-bubble span").textContent = activity;

  playAnimation(agent, walkAnimation);
  updateRouteTrail(previous, position);
  setStationOccupied(target);

  clearTimeout(el.arrivalTimer);
  clearTimeout(el.activeTimer);

  el.arrivalTimer = setTimeout(() => {
    el.classList.remove("moving");
    playAnimation(agent, arrivalAnimation);
  }, 900);

  el.activeTimer = setTimeout(() => {
    if (!el.classList.contains("selected")) el.classList.remove("active");
  }, 4200);

  renderEvent({ agent, activity, target, animation: arrivalAnimation, ...event });

  if (selectedAgent === agent) renderInspector(agent);
}

function renderEvent(payload) {
  document.querySelector("#event-output").textContent = JSON.stringify({
    source: "local-demo",
    timestamp: new Date().toISOString(),
    ...payload,
  }, null, 2);
}

function renderInspector(agent) {
  const item = state[agent];
  const inspector = document.querySelector("#agent-inspector");

  document.querySelectorAll(".agent.selected").forEach(node => node.classList.remove("selected"));

  selectedAgent = agent;
  document.querySelector(`#agent-${agent}`)?.classList.add("selected");

  document.querySelector("#inspector-name").textContent = item.name;
  document.querySelector("#inspector-role").textContent = roles[agent];
  document.querySelector("#inspector-activity").textContent = item.activity;
  document.querySelector("#inspector-target").textContent = item.target;
  document.querySelector("#inspector-source").textContent = item.source;
  inspector.hidden = false;
}

function closeInspector() {
  selectedAgent = null;
  document.querySelector("#agent-inspector").hidden = true;
  document.querySelectorAll(".agent.selected").forEach(node => node.classList.remove("selected"));
}

function resetWorld() {
  Object.assign(state, structuredClone(initialState));
  setStationOccupied(null, false);

  moveAgent("katherine", positions.idleKatherine, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle");
  setTimeout(() => moveAgent("karen", positions.idleKaren, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle"), 100);
  setTimeout(() => moveAgent("karencita", positions.idleKarencita, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle"), 200);
}

function demo(type) {
  if (type === "katherine") {
    moveAgent("katherine", positions.board, "Organizando y coordinando", "board", {
      type: "agent.activity.started",
      capability: "coordination",
    }, "work");
  }

  if (type === "karen") {
    moveAgent("karen", positions.research, "Investigando", "research", {
      type: "agent.activity.started",
      capability: "research",
      tool: "future:research-bridge",
    }, "work");
  }

  if (type === "karencita") {
    moveAgent("karencita", positions.homeConsole, "Revisando la casa", "homeConsole", {
      type: "agent.activity.started",
      capability: "home",
    }, "action");
  }

  if (type === "meeting") {
    setStationOccupied("Mesa común");
    moveAgent("katherine", positions.tableKatherine, "Conversando con Karen y Karencita", "Mesa común", { type: "agents.meeting" }, "social");
    setTimeout(() => moveAgent("karen", positions.tableKaren, "Conversando con Katherine y Karencita", "Mesa común", { type: "agents.meeting" }, "social"), 120);
    setTimeout(() => moveAgent("karencita", positions.tableKarencita, "Conversando con Katherine y Karen", "Mesa común", { type: "agents.meeting" }, "social"), 240);
  }

  if (type === "sleep") {
    setStationOccupied(null, false);
    moveAgent("katherine", positions.idleKatherine, "Descansando", "Hogar", { type: "agent.rest" }, "sleep");
    setTimeout(() => moveAgent("karen", positions.idleKaren, "Descansando", "Hogar", { type: "agent.rest" }, "sleep"), 120);
    setTimeout(() => moveAgent("karencita", positions.idleKarencita, "Descansando", "Hogar", { type: "agent.rest" }, "sleep"), 240);
  }

  if (type === "sequence") runSequence();
}

async function runSequence() {
  demo("katherine");
  await wait(1350);
  demo("karen");
  await wait(1350);
  demo("karencita");
  await wait(1650);
  demo("meeting");
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toggleLab() {
  const panel = document.querySelector("#lab-panel");
  const button = document.querySelector("#toggle-lab");
  const willOpen = panel.hidden;
  panel.hidden = !willOpen;
  button.setAttribute("aria-expanded", String(willOpen));
  if (willOpen) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", () => demo(button.dataset.demo));
});

document.querySelector("#toggle-lab").addEventListener("click", toggleLab);
document.querySelector("#reset-world").addEventListener("click", resetWorld);
document.querySelector("#close-inspector").addEventListener("click", closeInspector);

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
      const target = station === "core" ? positions.core : positions.portal;
      const label = station === "core" ? "Core Netheris" : "Enlace al mundo físico";
      moveAgent(
        selectedAgent,
        target,
        station === "core" ? "Consultando el Core" : "Observando el enlace físico",
        station,
        { type: "world.object.interaction", station },
        station === "core" ? "work" : "action"
      );
      return;
    }

    renderEvent({
      type: "world.object.selected",
      station,
      status: "informational",
      hint: "Selecciona una de las chicas para interactuar con este objeto",
    });
  });
});

function updateLocalClock() {
  const clock = document.querySelector("#local-clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

updateLocalClock();
setInterval(updateLocalClock, 30000);

preloadFrames();

Object.entries(initialState).forEach(([agent, data]) => {
  const el = document.querySelector(`#agent-${agent}`);
  el.style.left = `${data.position.left}%`;
  el.style.top = `${data.position.top}%`;
  el.style.zIndex = String(10 + Math.round(data.position.top));
  playAnimation(agent, "idle");
});
