#include "graph.h"
#include <vector>
#include <queue>
#include <cmath>
#include <limits>

using namespace std;

/*
 * A* ALGORITHM
 * ------------
 * An INFORMED version of Dijkstra. Uses a heuristic to guide the search
 * toward the target, so it visits fewer nodes than Dijkstra.
 *
 * Key idea:
 *   - f(n) = g(n) + h(n)
 *   - g(n) = actual cost from source to n  (same as Dijkstra's dist[])
 *   - h(n) = estimated cost from n to target (heuristic)
 *
 * Heuristic used here: Euclidean distance (straight-line distance).
 * This is ADMISSIBLE (never overestimates), so A* is guaranteed optimal.
 *
 * A* degenerates to Dijkstra when h(n) = 0 for all n.
 *
 * Time:  O((V + E) log V) worst case, usually much faster
 * Space: O(V)
 */

struct AStarResult {
    vector<double> dist;
    vector<int>    prev;
    vector<int>    order;
};

// Euclidean distance between two nodes (using their x,y canvas positions)
double heuristic(const Node& a, const Node& b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return sqrt(dx*dx + dy*dy);
}

AStarResult astar(const Graph& g, int source, int target) {
    int n = g.size();
    const double INF = numeric_limits<double>::infinity();

    vector<double> g_cost(n, INF);  // actual cost from source
    vector<double> f_cost(n, INF);  // g + h
    vector<int>    prev(n, -1);
    vector<int>    order;
    vector<bool>   closed(n, false);

    // Min-heap: (f_cost, node)
    priority_queue<pair<double,int>,
                   vector<pair<double,int>>,
                   greater<>> open;

    g_cost[source] = 0.0;
    f_cost[source] = heuristic(g.nodes[source], g.nodes[target]);
    open.push({f_cost[source], source});

    while (!open.empty()) {
        auto [f, u] = open.top();
        open.pop();

        if (closed[u]) continue;
        closed[u] = true;
        order.push_back(u);

        if (u == target) break;  // found target — stop early (key advantage over Dijkstra)

        for (const Edge& e : g.adj[u]) {
            if (closed[e.to]) continue;

            double tentative_g = g_cost[u] + e.weight;
            if (tentative_g < g_cost[e.to]) {
                g_cost[e.to] = tentative_g;
                prev[e.to]   = u;
                f_cost[e.to] = tentative_g + heuristic(g.nodes[e.to], g.nodes[target]);
                open.push({f_cost[e.to], e.to});
            }
        }
    }

    return {g_cost, prev, order};
}
