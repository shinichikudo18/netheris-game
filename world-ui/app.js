const positions = {
  idleKatherine: { left: 31, top: 56 },
  idleKaren: { left: 50, top: 58 },
  idleKarencita: { left: 69, top: 56 },
  board: { left: 19, top: 31 },
  research: { left: 81, top: 33 },
  homeConsole: { left: 80, top: 73 },
  core: { left: 49, top: 31 },
  portal: { left: 19, top: 73 },
  tableKatherine: { left: 43, top: 72 },
  tableKaren: { left: 50, top: 68 },
  tableKarencita: { left: 57, top: 72 },
};

const initialState = {
  katherine: { name: "Katherine", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKatherine },
  karen: { name: "Karen", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKaren },
  karencita: { name: "Karencita", activity: "Libre en El Hogar", target: "Hogar", position: positions.idleKarencita },
};

const state = structuredClone(initialState);
const labels = {
  katherine: document.querySelector("#agent-katherine .agent-label span"),
  karen: document.querySelector("#agent-karen .agent-label span"),
  karencita: document.querySelector("#agent-karencita .agent-label span"),
};

function moveAgent(agent, position, activity, target, event = {}) {
  const el = document.querySelector(`#agent-${agent}`);
  state[agent] = { ...state[agent], position, activity, target };
  el.classList.add("moving");
  el.style.left = `${position.left}%`;
  el.style.top = `${position.top}%`;
  labels[agent].textContent = activity;
  setTimeout(() => el.classList.remove("moving"), 900);
  renderAgentList();
  renderEvent({ agent, activity, target, ...event });
}

function renderAgentList() {
  const list = document.querySelector("#agent-list");
  list.innerHTML = Object.entries(state).map(([id, item]) => `
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
  moveAgent("katherine", positions.idleKatherine, "Libre en El Hogar", "Hogar", { type: "agent.idle" });
  setTimeout(() => moveAgent("karen", positions.idleKaren, "Libre en El Hogar", "Hogar", { type: "agent.idle" }), 90);
  setTimeout(() => moveAgent("karencita", positions.idleKarencita, "Libre en El Hogar", "Hogar", { type: "agent.idle" }), 180);
}

function demo(type) {
  if (type === "katherine") {
    moveAgent("katherine", positions.board, "Organizando y coordinando", "Tablero", {
      type: "agent.activity.started",
      capability: "coordination"
    });
  }

  if (type === "karen") {
    moveAgent("karen", positions.research, "Investigando", "Estación de investigación", {
      type: "agent.activity.started",
      capability: "research",
      tool: "future:research-bridge"
    });
  }

  if (type === "karencita") {
    moveAgent("karencita", positions.homeConsole, "Revisando la casa", "Consola de casa", {
      type: "agent.activity.started",
      capability: "home"
    });
  }

  if (type === "meeting") {
    moveAgent("katherine", positions.tableKatherine, "Conversando con Karen y Karencita", "Mesa común", { type: "agents.meeting" });
    setTimeout(() => moveAgent("karen", positions.tableKaren, "Conversando con Katherine y Karencita", "Mesa común", { type: "agents.meeting" }), 120);
    setTimeout(() => moveAgent("karencita", positions.tableKarencita, "Conversando con Katherine y Karen", "Mesa común", { type: "agents.meeting" }), 240);
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
});

renderAgentList();
