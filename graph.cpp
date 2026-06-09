#include "graph.h"

int Graph::addNode(const string& name, double x, double y) {
    int id = nodes.size();
    nodes.push_back({id, name, x, y});
    adj.push_back({});  // empty edge list for this node
    return id;
}

void Graph::addEdge(int u, int v, double weight) {
    adj[u].push_back({v, weight});
    adj[v].push_back({u, weight});  // undirected: add both directions
}
