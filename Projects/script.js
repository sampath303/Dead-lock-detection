// Event Listener for Simulate Button
document
  .getElementById("simulate-btn")
  .addEventListener("click", simulateDeadlock);

// Deadlock Detection Logic with Graph Rendering
function simulateDeadlock() {
  const processesInput = document.getElementById("processes").value.trim();
  const resourcesInput = document.getElementById("resources").value.trim();
  const allocationsInput = document.getElementById("allocations").value.trim();
  const requestsInput = document.getElementById("requests").value.trim();

  // Check if all input fields are filled
  if (
    !processesInput ||
    !resourcesInput ||
    !allocationsInput ||
    !requestsInput
  ) {
    document.getElementById("output").innerHTML =
      "<b style='color: orange;'>Please fill in all fields.</b>";
    return;
  }

  // Parse inputs
  const processes = processesInput.split(",").map((p) => p.trim());
  const resources = resourcesInput.split(",").map((r) => r.trim());
  const allocations = allocationsInput.split(",").map((a) => a.trim());
  const requests = requestsInput.split(",").map((r) => r.trim());

  // Initialize Resource Allocation Graph (Directed Graph)
  const graph = {};

  // Add all processes and resources as nodes
  processes.forEach((p) => (graph[p] = []));
  resources.forEach((r) => (graph[r] = []));

  // Add allocation edges (Resource -> Process)
  allocations.forEach((pair) => {
    const [process, resource] = pair.split("->").map((x) => x.trim());
    if (process && resource && graph[resource]) {
      graph[resource].push(process); // Resource -> Process
    }
  });

  // Add request edges (Process -> Resource)
  requests.forEach((pair) => {
    const [process, resource] = pair.split("->").map((x) => x.trim());
    if (process && resource && graph[process]) {
      graph[process].push(resource); // Process -> Resource
    }
  });

  // Cycle Detection using DFS
  const visited = new Set();
  const stack = new Set();

  function hasCycle(node) {
    if (stack.has(node)) return true; // Cycle detected
    if (visited.has(node)) return false; // Already processed

    visited.add(node);
    stack.add(node);

    for (const neighbor of graph[node] || []) {
      if (hasCycle(neighbor)) return true;
    }

    stack.delete(node); // Remove from current path
    return false;
  }

  // Check for cycles in the graph starting from every node
  let isDeadlock = false;
  for (const node of [...processes, ...resources]) {
    if (!visited.has(node)) {
      if (hasCycle(node)) {
        isDeadlock = true;
        break;
      }
    }
  }

  // Display the result
  document.getElementById("output").innerHTML = isDeadlock
    ? "<b style='color: red;'>Deadlock detected!</b>"
    : "<b style='color: green;'>No deadlock detected.</b>";

  // Render the graph
  renderGraph(processes, resources, allocations, requests);
}

// Function to render the graph using Vis.js
function renderGraph(processes, resources, allocations, requests) {
  // Prepare nodes and edges for Vis.js
  const nodes = [];
  const edges = [];

  // Add process nodes
  processes.forEach((p) => nodes.push({ id: p, label: p, color: "#FFD700" })); // Yellow for processes

  // Add resource nodes
  resources.forEach((r) => nodes.push({ id: r, label: r, color: "#87CEEB" })); // Blue for resources

  // Add edges for allocations (Resource -> Process)
  allocations.forEach((pair) => {
    const [process, resource] = pair.split("->").map((x) => x.trim());
    edges.push({ from: resource, to: process, arrows: "to", color: "#00FF00" }); // Green for allocations
  });

  // Add edges for requests (Process -> Resource)
  requests.forEach((pair) => {
    const [process, resource] = pair.split("->").map((x) => x.trim());
    edges.push({ from: process, to: resource, arrows: "to", color: "#FF4500" }); // Orange for requests
  });

  // Create a network graph
  const container = document.getElementById("graph-container");
  container.style.display = "block";
  const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
  const options = {
    physics: false, // Disable physics to stop movement
    interaction: {
      zoomView: false, // Disable zoom
      dragView: false, // Disable panning
    },
    edges: { smooth: true },
  };
  new vis.Network(container, data, options);
}
