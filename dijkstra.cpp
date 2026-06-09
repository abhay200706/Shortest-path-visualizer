#include "graph.h"
#include <vector>
#include <queue>
#include <limits>

using namespace std;

/*
 * DIJKSTRA'S ALGORITHM
 * --------------------
 * Works on graphs with NON-NEGATIVE weights only.
 *
 * Idea:
 *   - Keep a "distance" array. Start with infinity everywhere, 0 at source.
 *   - Use a min-heap (priority queue) to always process the closest unvisited node.
 *   - When we visit a node, check if going through it gives a shorter path to its neighbors.
 *
 * Time:  O((V + E) log V)
 * Space: O(V)
 */

struct DijkstraResult {
    vector<double> dist;   // shortest distance from source to each node
    vector<int>    prev;   // previous node on shortest path (for reconstruction)
    vector<int>    order;  // order in which nodes were finalized (for visualization)
};

DijkstraResult dijkstra(const Graph& g, int source) {
    int n = g.size();
    const double INF = numeric_limits<double>::infinity();

    vector<double> dist(n, INF);
    vector<int>    prev(n, -1);
    vector<int>    order;
    vector<bool>   visited(n, false);

    // Min-heap: (distance, node)
    priority_queue<pair<double,int>,
                   vector<pair<double,int>>,
                   greater<>> pq;

    dist[source] = 0.0;
    pq.push({0.0, source});

    while (!pq.empty()) {
        auto [d, u] = pq.top();
        pq.pop();

        if (visited[u]) continue;  // already processed this node
        visited[u] = true;
        order.push_back(u);        // record visit order for visualization

        // Relax all neighbors
        for (const Edge& e : g.adj[u]) {
            double newDist = dist[u] + e.weight;
            if (newDist < dist[e.to]) {
                dist[e.to] = newDist;
                prev[e.to] = u;
                pq.push({newDist, e.to});
            }
        }
    }

    return {dist, prev, order};
}

// Reconstruct path from source to target using prev[]
vector<int> reconstructPath(const vector<int>& prev, int source, int target) {
    vector<int> path;
    for (int v = target; v != -1; v = prev[v]) {
        path.push_back(v);
        if (v == source) break;
    }
    reverse(path.begin(), path.end());

    // If path doesn't start at source, no path exists
    if (path.empty() || path[0] != source) return {};
    return path;
}
