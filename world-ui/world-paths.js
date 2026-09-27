(() => {
  const NODES = {
    home_katherine: { x: 34, y: 61, label: "Plaza Katherine" },
    home_karen: { x: 50, y: 64, label: "Plaza Karen" },
    home_karencita: { x: 66, y: 61, label: "Plaza Karencita" },

    hub_left: { x: 35, y: 54, label: "Nodo Oeste" },
    hub_center: { x: 50, y: 56, label: "Nodo Central" },
    hub_right: { x: 65, y: 54, label: "Nodo Este" },

    board: { x: 18, y: 44, label: "Archivo de Katherine" },
    core: { x: 50, y: 42, label: "Núcleo de Netheris" },
    research: { x: 82, y: 44, label: "Forja de Karen" },

    south_left: { x: 31, y: 69, label: "Cruce Suroeste" },
    south_center: { x: 50, y: 69, label: "Cruce Sur" },
    south_right: { x: 69, y: 69, label: "Cruce Sureste" },

    portal: { x: 17, y: 74, label: "Puerta al Mundo Físico" },
    table: { x: 50, y: 75, label: "Círculo del Consejo" },
    homeConsole: { x: 82, y: 75, label: "Santuario de Karencita" },
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
    if (target === "Hogar") return HOME_NODE[agent];
    return TARGET_TO_NODE[target] || HOME_NODE[agent];
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

    const edgesGroup = document.createElementNS(NS, "g");
    edgesGroup.setAttribute("class", "network-edges");

    EDGES.forEach(([a, b]) => {
      const start = NODES[a];
      const end = NODES[b];
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
      group.classList.add("network-node");

      const outer = document.createElementNS(NS, "circle");
      outer.setAttribute("cx", node.x);
      outer.setAttribute("cy", node.y);
      outer.setAttribute("r", "0.95");
      outer.classList.add("network-node-outer");

      const inner = document.createElementNS(NS, "circle");
      inner.setAttribute("cx", node.x);
      inner.setAttribute("cy", node.y);
      inner.setAttribute("r", "0.26");
      inner.classList.add("network-node-inner");

      group.append(outer, inner);
      nodesGroup.appendChild(group);
    });

    svg.append(edgesGroup, nodesGroup);
  }

  function clearHighlights(svg) {
    svg?.querySelectorAll(".network-edge.active, .network-node.active, .network-node.current")
      .forEach(node => node.classList.remove("active", "current", "katherine", "karen", "karencita"));
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
    pathfind,
    edgeId,
    render,
    clearHighlights,
    highlightEdge,
    highlightNode,
  };
})();