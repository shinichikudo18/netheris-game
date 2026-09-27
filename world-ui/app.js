const positions = {
  idleKatherine: { left: 31, top: 56 },
  idleKaren: { left: 50, top: 58 },
  idleKarencita: { left: 69, top: 56 },
  board: { left: 19, top: 31 },
  research: { left: 81, top: 33 },
  homeConsole: { left: 80, top: 73 },
  tableKatherine: { left: 43, top: 72 },
  tableKaren: { left: 50, top: 68 },
  tableKarencita: { left: 57, top: 72 },
};

const animationSets = {
  idle:   { frames: [1, 1, 2, 1, 3, 1, 4], ms: 520, loop: true },
  walk:   { frames: [34, 35, 36, 37], ms: 120, loop: true },
  work:   { frames: [20, 20, 19, 20], ms: 620, loop: true },
  social: { frames: [5, 6, 7, 4], ms: 420, loop: true },
  sit:    { frames: [42], ms: 1000, loop: true },
  sleep:  { frames: [50], ms: 1000, loop: true },
};

const initialState = {
  katherine: { name: "Katherine", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKatherine },
  karen: { name: "Karen", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKaren },
  karencita: { name: "Karencita", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKarencita },
};

const state = structuredClone(initialState);
const animationTimers = {};
const assetsAvailable = { katherine: true, karen: true, karencita: true };

function framePath(agent, frame) {
  return `./assets/pets/${agent}/frame_${String(frame).padStart(3, "0")}.png`;
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

function moveAgent(agent, position, activity, target, event = {}, arrivalAnimation = "idle") {
  const el = document.querySelector(`#agent-${agent}`);
  state[agent] = { ...state[agent], position, activity, target };

  playAnimation(agent, "walk");
  el.classList.add("moving");
  el.style.left = `${position.left}%`;
  el.style.top = `${position.top}%`;
  el.querySelector(".agent-label span").textContent = activity;

  setTimeout(() => {
    el.classList.remove("moving");
    playAnimation(agent, arrivalAnimation);
  }, 900);

  renderAgentList();
  renderEvent({ agent, activity, target, animation: arrivalAnimation, ...event });
}

function renderAgentList() {
  const list = document.querySelector("#agent-list");
  list.innerHTML = Object.entries(state).map(([, item]) => `
    <div class="agent-row">
      <span class="dot"></span>
      <div>
        <strong>${item.name}</strong>
        <span>${item.activity}</span>
        <span>Ubicación: ${item.target}</span>
      </div>
    </div>
  `).join("");
}

function renderEvent(payload) {
  document.querySelector("#event-output").textContent = JSON.stringify({
    source: "local-demo",
    timestamp: new Date().toISOString(),
    ...payload
  }, null, 2);
}

function resetWorld() {
  Object.assign(state, structuredClone(initialState));
  moveAgent("katherine", positions.idleKatherine, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle");
  setTimeout(() => moveAgent("karen", positions.idleKaren, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle"), 90);
  setTimeout(() => moveAgent("karencita", positions.idleKarencita, "Libre en El Hogar", "Hogar", { type: "agent.idle" }, "idle"), 180);
}

function demo(type) {
  if (type === "katherine") {
    moveAgent("katherine", positions.board, "Organizando y coordinando", "Tablero", {
      type: "agent.activity.started",
      capability: "coordination"
    }, "work");
  }

  if (type === "karen") {
    moveAgent("karen", positions.research, "Investigando", "Estación de investigación", {
      type: "agent.activity.started",
      capability: "research",
      tool: "future:research-bridge"
    }, "work");
  }

  if (type === "karencita") {
    moveAgent("karencita", positions.homeConsole, "Revisando la casa", "Consola de casa", {
      type: "agent.activity.started",
      capability: "home"
    }, "work");
  }

  if (type === "meeting") {
    moveAgent("katherine", positions.tableKatherine, "Conversando con Karen y Karencita", "Mesa común", { type: "agents.meeting" }, "social");
    setTimeout(() => moveAgent("karen", positions.tableKaren, "Conversando con Katherine y Karencita", "Mesa común", { type: "agents.meeting" }, "social"), 120);
    setTimeout(() => moveAgent("karencita", positions.tableKarencita, "Conversando con Katherine y Karen", "Mesa común", { type: "agents.meeting" }, "social"), 240);
  }

  if (type === "sleep") {
    moveAgent("katherine", positions.idleKatherine, "Descansando", "Hogar", { type: "agent.rest" }, "sleep");
    setTimeout(() => moveAgent("karen", positions.idleKaren, "Descansando", "Hogar", { type: "agent.rest" }, "sleep"), 120);
    setTimeout(() => moveAgent("karencita", positions.idleKarencita, "Descansando", "Hogar", { type: "agent.rest" }, "sleep"), 240);
  }

  if (type === "sequence") runSequence();
}

async function runSequence() {
  demo("katherine");
  await wait(1200);
  demo("karen");
  await wait(1200);
  demo("karencita");
  await wait(1800);
  demo("meeting");
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

document.querySelectorAll("[data-demo]").forEach(button => {
  button.addEventListener("click", () => demo(button.dataset.demo));
});
document.querySelector("#reset-world").addEventListener("click", resetWorld);

Object.entries(initialState).forEach(([agent, data]) => {
  const el = document.querySelector(`#agent-${agent}`);
  el.style.left = `${data.position.left}%`;
  el.style.top = `${data.position.top}%`;
  playAnimation(agent, "idle");
});

renderAgentList();
