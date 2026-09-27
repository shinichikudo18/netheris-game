(() => {
  const NODES = {
    home_katherine: { x: 34, y: 61, label: "Plaza Katherine", kind: "home" },
    home_karen: { x: 50, y: 64, label: "Plaza Karen", kind: "home" },
    home_karencita: { x: 66, y: 61, label: "Plaza Karencita", kind: "home" },

    hub_left: { x: 35, y: 54, label: "Nodo Oeste", kind: "junction" },
    hub_center: { x: 50, y: 56, label: "Nodo Central", kind: "junction" },
    hub_right: { x: 65, y: 54, label: "Nodo Este", kind: "junction" },

    board: { x: 18, y: 44, label: "Archivo de Katherine", kind: "destination" },
    core: { x: 50, y: 42, label: "Núcleo de Netheris", kind: "destination" },
    research: { x: 82, y: 44, label: "Forja de Karen", kind: "destination" },

    south_left: { x: 31, y: 69, label: "Cruce Suroeste", kind: "junction" },
    south_center: { x: 50, y: 69, label: "Cruce Sur", kind: "junction" },
    south_right: { x: 69, y: 69, label: "Cruce Sureste", kind: "junction" },

    portal: { x: 17, y: 74, label: "Puerta al Mundo Físico", kind: "destination" },
    table: { x: 50, y: 75, label: "Círculo del Consejo", kind: "destination" },
    homeConsole: { x: 82, y: 75, label: "Santuario de Karencita", kind: "destination" },
  };

  const EDGES = [
    ["home_katherine", "hub_left"],
    ["home_karen", "hub_center"],
    ["home_karencita", "hub_right"],

    ["hub_left", "hub_center"],
    ["hub_center", "hub_right"],

    ["hub_left", "board"],
    ["hub_center", "core"],
    ["hub_right", "research"],

    ["hub_left", "south_left"],
    ["hub_center", "south_center"],
    ["hub_right", "south_right"],

    ["south_left", "south_center"],
    ["south_center", "south_right"],

    ["south_left", "portal"],
    ["south_center", "table"],
    ["south_right", "homeConsole"],
  ];

  const AGENT_LANES = {
    katherine: { x: -0.72, y: -0.18 },
    karen: { x: 0, y: 0 },
    karencita: { x: 0.72, y: 0.18 },
  };

  const adjacency = new Map();
  Object.keys(NODES).forEach(id => adjacency.set(id, new Set()));

  EDGES.forEach(([a, b]) => {
    adjacency.get(a)?.add(b);
    adjacency.get(b)?.add(a);
  });

  const TARGET_TO_NODE = {
    board: "board",
    core: "core",
    research: "research",
    portal: "portal",
    table: "table",
    "Mesa común": "table",
    homeConsole: "homeConsole",
  };

  const HOME_NODE = {
    katherine: "home_katherine",
    karen: "home_karen",
    karencita: "home_karencita",
  };

  function nodeForTarget(agent, target) {
    if (typeof target === "string" && target.startsWith("node:")) {
      const requested = target.slice(5);
      return NODES[requested] ? requested : HOME_NODE[agent];
    }
    if (target === "Hogar") return HOME_NODE[agent];
    return TARGET_TO_NODE[target] || HOME_NODE[agent];
  }

  function pointForAgent(nodeId, agent) {
    const node = NODES[nodeId];
    if (!node) return null;
    const lane = AGENT_LANES[agent] || { x: 0, y: 0 };
    return {
      ...node,
      x: node.x + lane.x,
      y: node.y + lane.y,
    };
  }

  function pathfind(from, to) {
    if (!NODES[from] || !NODES[to]) return [];
    if (from === to) return [from];

    const queue = [from];
    const previous = new Map([[from, null]]);

    while (queue.length) {
      const current = queue.shift();
      for (const next of adjacency.get(current) || []) {
        if (previous.has(next)) continue;
        previous.set(next, current);

        if (next === to) {
          const path = [to];
          let cursor = current;

          while (cursor) {
            path.unshift(cursor);
            cursor = previous.get(cursor);
          }

          return path;
        }

        queue.push(next);
      }
    }

    return [from, to];
  }

  function edgeId(a, b) {
    return [a, b].sort().join("__");
  }

  function render(svg) {
    if (!svg) return;
    svg.replaceChildren();

    const NS = "http://www.w3.org/2000/svg";

    const bedsGroup = document.createElementNS(NS, "g");
    bedsGroup.setAttribute("class", "network-beds");

    const edgesGroup = document.createElementNS(NS, "g");
    edgesGroup.setAttribute("class", "network-edges");

    EDGES.forEach(([a, b]) => {
      const start = NODES[a];
      const end = NODES[b];

      const bed = document.createElementNS(NS, "line");
      bed.setAttribute("x1", start.x);
      bed.setAttribute("y1", start.y);
      bed.setAttribute("x2", end.x);
      bed.setAttribute("y2", end.y);
      bed.classList.add("network-edge-bed");
      bedsGroup.appendChild(bed);

      const line = document.createElementNS(NS, "line");
      line.setAttribute("x1", start.x);
      line.setAttribute("y1", start.y);
      line.setAttribute("x2", end.x);
      line.setAttribute("y2", end.y);
      line.dataset.edge = edgeId(a, b);
      line.classList.add("network-edge");
      edgesGroup.appendChild(line);
    });

    const nodesGroup = document.createElementNS(NS, "g");
    nodesGroup.setAttribute("class", "network-nodes");

    Object.entries(NODES).forEach(([id, node]) => {
      const group = document.createElementNS(NS, "g");
      group.dataset.node = id;
      group.dataset.kind = node.kind;
      group.classList.add("network-node");

      const title = document.createElementNS(NS, "title");
      title.textContent = node.label;

      const hit = document.createElementNS(NS, "circle");
      hit.setAttribute("cx", node.x);
      hit.setAttribute("cy", node.y);
      hit.setAttribute("r", "1.8");
      hit.classList.add("network-node-hit");

      const outer = document.createElementNS(NS, "circle");
      outer.setAttribute("cx", node.x);
      outer.setAttribute("cy", node.y);
      outer.setAttribute("r", node.kind === "destination" ? "1.08" : "0.92");
      outer.classList.add("network-node-outer");

      const inner = document.createElementNS(NS, "circle");
      inner.setAttribute("cx", node.x);
      inner.setAttribute("cy", node.y);
      inner.setAttribute("r", node.kind === "destination" ? "0.31" : "0.25");
      inner.classList.add("network-node-inner");

      group.append(title, hit, outer, inner);
      nodesGroup.appendChild(group);
    });

    svg.append(bedsGroup, edgesGroup, nodesGroup);
  }

  function clearHighlights(svg) {
    svg?.querySelectorAll(
      ".network-edge.active, .network-edge.planned, .network-node.active, .network-node.current, .network-node.planned"
    ).forEach(node => {
      node.classList.remove(
        "active", "planned", "current",
        "katherine", "karen", "karencita"
      );
    });
  }

  function clearAgentHighlights(svg, agent) {
    svg?.querySelectorAll(`.network-edge.${agent}, .network-node.${agent}`).forEach(node => {
      node.classList.remove(agent);

      const stillOwned =
        node.classList.contains("katherine") ||
        node.classList.contains("karen") ||
        node.classList.contains("karencita");

      if (!stillOwned) node.classList.remove("active", "planned", "current");
    });
  }

  function previewRoute(svg, route, agent) {
    if (!svg || !Array.isArray(route)) return;

    route.forEach((nodeId, index) => {
      const node = svg.querySelector(`[data-node="${nodeId}"]`);
      node?.classList.add("planned", agent);

      if (index === 0) return;

      const previous = route[index - 1];
      const edge = svg.querySelector(`[data-edge="${edgeId(previous, nodeId)}"]`);
      edge?.classList.add("planned", agent);
    });
  }

  function highlightEdge(svg, a, b, agent) {
    const edge = svg?.querySelector(`[data-edge="${edgeId(a, b)}"]`);
    if (!edge) return;
    edge.classList.add("active", agent);
  }

  function highlightNode(svg, nodeId, agent, current = false) {
    const node = svg?.querySelector(`[data-node="${nodeId}"]`);
    if (!node) return;
    node.classList.add(current ? "current" : "active", agent);
  }

  globalThis.NetherisPaths = {
    nodes: NODES,
    edges: EDGES,
    homeNode: HOME_NODE,
    nodeForTarget,
    pointForAgent,
    pathfind,
    edgeId,
    render,
    clearHighlights,
    clearAgentHighlights,
    previewRoute,
    highlightEdge,
    highlightNode,
  };
})();