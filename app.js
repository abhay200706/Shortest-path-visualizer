/*
 * app.js — Route Planner Algorithm Visualizer
 * ============================================
 * All three algorithms (Dijkstra, A*, Bellman-Ford) are implemented here
 * in plain JavaScript so you can run this in the browser without a server.
 *
 * The C++ files in /backend/ contain the same logic with comments —
 * use those as reference for understanding the algorithms.
 *
 * Structure:
 *   1. Graph data (nodes + edges)
 *   2. Algorithm implementations
 *   3. Canvas drawing functions
 *   4. UI event handlers
 */


// ─────────────────────────────────────────
// 1. GRAPH DATA
// ─────────────────────────────────────────

// Each node: { id, name, x, y }
// x, y are canvas pixel positions
const NODES = [
  { id: 0, name: "Delhi",     x: 400, y: 80  },
  { id: 1, name: "Jaipur",    x: 160, y: 180 },
  { id: 2, name: "Agra",      x: 500, y: 180 },
  { id: 3, name: "Lucknow",   x: 640, y: 130 },
  { id: 4, name: "Mumbai",    x: 120, y: 370 },
  { id: 5, name: "Pune",      x: 150, y: 440 },
  { id: 6, name: "Hyderabad", x: 400, y: 390 },
  { id: 7, name: "Chennai",   x: 530, y: 470 },
  { id: 8, name: "Bangalore", x: 370, y: 470 },
  { id: 9, name: "Kolkata",   x: 680, y: 250 },
];

// Each edge: [from, to, weight]
const EDGES_DATA = [
  [0, 1, 268],
  [0, 2, 200],
  [0, 3, 497],
  [1, 2, 240],
  [1, 4, 1153],
  [2, 3, 363],
  [2, 6, 1093],
  [3, 9, 985],
  [4, 5, 149],
  [4, 6, 711],
  [5, 6, 559],
  [6, 7, 626],
  [6, 8, 574],
  [7, 8, 346],
  [9, 3, 985],
];

// Build adjacency list from EDGES_DATA
// adj[u] = [ { to, weight }, ... ]
const adj = Array.from({ length: NODES.length }, () => []);
for (const [u, v, w] of EDGES_DATA) {
  adj[u].push({ to: v, weight: w });
  adj[v].push({ to: u, weight: w });  // undirected
}


// ─────────────────────────────────────────
// 2. ALGORITHM IMPLEMENTATIONS
// ─────────────────────────────────────────

const INF = Infinity;

/*
 * DIJKSTRA
 * Returns steps[] — each step is a snapshot of the algorithm state.
 * We record every "node finalized" event so we can replay it visually.
 */
function dijkstra(source, target) {
  const n = NODES.length;
  const dist = Array(n).fill(INF);
  const prev = Array(n).fill(-1);
  const visited = Array(n).fill(false);
  const steps = [];

  dist[source] = 0;

  // Simple min-heap using array (good enough for small graphs)
  // Each entry: { dist, node }
  const pq = [{ dist: 0, node: source }];

  while (pq.length > 0) {
    // Pop minimum — sort the array each time (O(n log n) but simpler to read)
    pq.sort((a, b) => a.dist - b.dist);
    const { dist: d, node: u } = pq.shift();

    if (visited[u]) continue;
    visited[u] = true;

    // Record this step for visualization
    steps.push({
      current: u,
      visited: [...visited],
      dist: [...dist],
      prev: [...prev],
    });

    if (u === target) break;

    // Relax neighbors
    for (const { to, weight } of adj[u]) {
      const newDist = dist[u] + weight;
      if (newDist < dist[to]) {
        dist[to] = newDist;
        prev[to] = u;
        pq.push({ dist: newDist, node: to });
      }
    }
  }

  return { steps, dist, prev };
}

/*
 * A* (A-STAR)
 * Same as Dijkstra but uses f = g + h (heuristic) to guide the search.
 * Heuristic: Euclidean distance on canvas between two nodes.
 */
function heuristic(nodeA, nodeB) {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  // Scale from canvas pixels to approximate km (rough, for demo)
  return Math.sqrt(dx * dx + dy * dy) * 1.5;
}

function astar(source, target) {
  const n = NODES.length;
  const gCost = Array(n).fill(INF);  // actual cost from source
  const prev   = Array(n).fill(-1);
  const closed = Array(n).fill(false);
  const steps  = [];

  gCost[source] = 0;
  const fCost = (node) => gCost[node] + heuristic(NODES[node], NODES[target]);

  const open = [{ f: fCost(source), node: source }];

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const { node: u } = open.shift();

    if (closed[u]) continue;
    closed[u] = true;

    steps.push({
      current: u,
      visited: [...closed],
      dist: [...gCost],
      prev: [...prev],
    });

    if (u === target) break;

    for (const { to, weight } of adj[u]) {
      if (closed[to]) continue;
      const tentG = gCost[u] + weight;
      if (tentG < gCost[to]) {
        gCost[to] = tentG;
        prev[to]  = u;
        open.push({ f: fCost(to), node: to });
      }
    }
  }

  return { steps, dist: gCost, prev };
}

/*
 * BELLMAN-FORD
 * Iterates V-1 rounds over all edges.
 * Each round is one "step" for visualization.
 */
function bellmanFord(source, target) {
  const n = NODES.length;
  const dist = Array(n).fill(INF);
  const prev = Array(n).fill(-1);
  const steps = [];

  dist[source] = 0;

  for (let round = 0; round < n - 1; round++) {
    let anyRelaxed = false;

    // Flatten all edges for iteration
    for (const [u, v, w] of EDGES_DATA) {
      // Try u → v
      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        anyRelaxed = true;
      }
      // Try v → u (undirected)
      if (dist[v] !== INF && dist[v] + w < dist[u]) {
        dist[u] = dist[v] + w;
        prev[u] = v;
        anyRelaxed = true;
      }
    }

    // Record state after this round
    steps.push({
      current: -1,         // no single "current" node in Bellman-Ford
      round: round + 1,
      visited: dist.map(d => d !== INF),
      dist: [...dist],
      prev: [...prev],
    });

    if (!anyRelaxed) break;  // early exit: already optimal
  }

  return { steps, dist, prev };
}

/*
 * Reconstruct path from source to target using prev[]
 */
function getPath(prev, source, target) {
  const path = [];
  let v = target;
  while (v !== -1) {
    path.push(v);
    if (v === source) break;
    v = prev[v];
  }
  path.reverse();
  if (path[0] !== source) return [];  // no path
  return path;
}


// ─────────────────────────────────────────
// 3. CANVAS DRAWING
// ─────────────────────────────────────────

const canvas = document.getElementById("graphCanvas");
const ctx    = canvas.getContext("2d");

const COLOR = {
  edge:      "#2a2a4a",
  edgeLabel: "#555",
  unvisited: "#3a3a5a",
  visited:   "#2a5298",
  current:   "#f7c04f",
  path:      "#4fc97a",
  source:    "#4f8ef7",
  target:    "#f74f4f",
  nodeText:  "#ffffff",
  pathEdge:  "#4fc97a",
};

function drawGraph(visitedSet = new Set(), currentNode = -1, pathNodes = new Set(), pathEdges = new Set()) {

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw edges
  for (const [u, v, w] of EDGES_DATA) {
    const a = NODES[u], b = NODES[v];
    const edgeKey1 = `${u}-${v}`, edgeKey2 = `${v}-${u}`;
    const isPath = pathEdges.has(edgeKey1) || pathEdges.has(edgeKey2);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = isPath ? COLOR.pathEdge : COLOR.edge;
    ctx.lineWidth   = isPath ? 3 : 1.5;
    ctx.stroke();

    // Edge weight label
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    ctx.fillStyle  = isPath ? COLOR.pathEdge : COLOR.edgeLabel;
    ctx.font       = "11px Segoe UI, sans-serif";
    ctx.textAlign  = "center";
    ctx.fillText(w + " km", mx, my - 5);
  }

  // Draw nodes
  for (const node of NODES) {
    let color = COLOR.unvisited;
    if (pathNodes.has(node.id))      color = COLOR.path;
    if (node.id === selectedSource)  color = COLOR.source;
    if (node.id === selectedTarget)  color = COLOR.target;
    if (visitedSet.has(node.id) && !pathNodes.has(node.id) && node.id !== selectedSource && node.id !== selectedTarget) {
      color = COLOR.visited;
    }
    if (node.id === currentNode)     color = COLOR.current;

    // Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Node name
    ctx.fillStyle  = COLOR.nodeText;
    ctx.font       = "bold 11px Segoe UI, sans-serif";
    ctx.textAlign  = "center";
    ctx.fillText(node.name, node.x, node.y + 4);
  }
}

// Convert path array [a, b, c, ...] into a Set of edges "a-b", "b-c", ...
function pathToEdgeSet(path) {
  const edges = new Set();
  for (let i = 0; i < path.length - 1; i++) {
    edges.add(`${path[i]}-${path[i+1]}`);
    edges.add(`${path[i+1]}-${path[i]}`);
  }
  return edges;
}


// ─────────────────────────────────────────
// 4. UI STATE & EVENT HANDLERS
// ─────────────────────────────────────────

let selectedSource = 0;
let selectedTarget = 5;
let steps          = [];       // array of algorithm steps
let currentStep    = -1;       // which step we're on (-1 = not started)
let finalPath      = [];
let finalDist      = [];
let finalPrev      = [];

// Populate dropdowns
const sourceSelect = document.getElementById("sourceSelect");
const targetSelect = document.getElementById("targetSelect");

for (const node of NODES) {
  const opt1 = new Option(node.name, node.id);
  const opt2 = new Option(node.name, node.id);
  sourceSelect.add(opt1);
  targetSelect.add(opt2);
}
sourceSelect.value = selectedSource;
targetSelect.value = selectedTarget;

sourceSelect.addEventListener("change", () => {
  selectedSource = parseInt(sourceSelect.value);
  resetView();
});
targetSelect.addEventListener("change", () => {
  selectedTarget = parseInt(targetSelect.value);
  resetView();
});

// Click on canvas to select source/target
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mx = (e.clientX - rect.left) * (canvas.width  / rect.width);
  const my = (e.clientY - rect.top)  * (canvas.height / rect.height);

  for (const node of NODES) {
    const dx = node.x - mx, dy = node.y - my;
    if (Math.sqrt(dx*dx + dy*dy) < 20) {
      // First click sets source, second sets target (cycle)
      if (selectedSource === -1 || selectedTarget !== -1) {
        selectedSource = node.id;
        selectedTarget = -1;
      } else {
        selectedTarget = node.id;
      }
      sourceSelect.value = selectedSource;
      targetSelect.value = selectedTarget;
      resetView();
      break;
    }
  }
});

// Run button
document.getElementById("runBtn").addEventListener("click", () => {
  if (selectedSource === selectedTarget) {
    setInfo("Source and target must be different nodes.");
    return;
  }

  const algo = document.getElementById("algoSelect").value;
  let result;

  if      (algo === "dijkstra") result = dijkstra(selectedSource, selectedTarget);
  else if (algo === "astar")    result = astar(selectedSource, selectedTarget);
  else                          result = bellmanFord(selectedSource, selectedTarget);

  steps     = result.steps;
  finalDist = result.dist;
  finalPrev = result.prev;
  finalPath = getPath(finalPrev, selectedSource, selectedTarget);

  currentStep = 0;
  renderStep(currentStep);
  updateStepButtons();
});

// Reset button
document.getElementById("resetBtn").addEventListener("click", resetView);

// Step buttons
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentStep > 0) { currentStep--; renderStep(currentStep); updateStepButtons(); }
});
document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentStep < steps.length - 1) { currentStep++; renderStep(currentStep); updateStepButtons(); }
});

function renderStep(stepIndex) {
  const step = steps[stepIndex];
  if (!step) return;

  const visitedSet = new Set(
    step.visited.map((v, i) => v ? i : -1).filter(i => i !== -1)
  );

  // On the last step, show the final path
  const isLastStep = stepIndex === steps.length - 1;
  const pathNodes  = isLastStep ? new Set(finalPath) : new Set();
  const pathEdges  = isLastStep ? pathToEdgeSet(finalPath) : new Set();

  drawGraph(visitedSet, step.current, pathNodes, pathEdges);

  // Update step label
  const algoName = document.getElementById("algoSelect").value;
  if (algoName === "bellman") {
    document.getElementById("stepLabel").textContent = `Round ${step.round} / ${steps.length}`;
  } else {
    document.getElementById("stepLabel").textContent =
      `Step ${stepIndex + 1} / ${steps.length}` +
      (step.current !== -1 ? ` — ${NODES[step.current].name}` : "");
  }

  // Update info panel
  const distToTarget = step.dist[selectedTarget];
  setInfo(
    `Visiting: <strong>${step.current !== -1 ? NODES[step.current].name : "—"}</strong><br>` +
    `Best known dist to ${NODES[selectedTarget].name}: <strong>` +
    (distToTarget === INF ? "∞" : Math.round(distToTarget) + " km") +
    `</strong>`
  );

  // Show stats on last step
  if (isLastStep) {
    const statsEl = document.getElementById("stats");
    statsEl.style.display = "block";
    document.getElementById("statVisited").textContent = visitedSet.size;
    document.getElementById("statLength").textContent  = finalPath.length + " nodes";
    document.getElementById("statCost").textContent    =
      finalDist[selectedTarget] === INF ? "No path" : Math.round(finalDist[selectedTarget]) + " km";
  }
}

function resetView() {
  steps = []; currentStep = -1; finalPath = []; finalDist = []; finalPrev = [];
  drawGraph();
  document.getElementById("stepLabel").textContent = "Step: —";
  document.getElementById("prevBtn").disabled = true;
  document.getElementById("nextBtn").disabled = true;
  document.getElementById("stats").style.display = "none";
  setInfo(`Select source and target, then click <strong>Run</strong>.`);
}

function updateStepButtons() {
  document.getElementById("prevBtn").disabled = currentStep <= 0;
  document.getElementById("nextBtn").disabled = currentStep >= steps.length - 1;
}

function setInfo(html) {
  document.getElementById("infoPanel").innerHTML = `<p>${html}</p>`;
}

// Initial draw
drawGraph();
