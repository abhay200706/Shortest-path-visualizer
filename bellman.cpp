#include "graph.h"
#include <vector>
#include <limits>

using namespace std;

/*
 * BELLMAN-FORD ALGORITHM
 * ----------------------
 * Works on graphs WITH negative weights (unlike Dijkstra).
 * Also DETECTS negative cycles.
 *
 * Idea:
 *   - Relax ALL edges, V-1 times.
 *   - After V-1 rounds, shortest paths are guaranteed (if no negative cycle).
 *   - Do one more round: if any distance still decreases → negative cycle exists.
 *
 * Why V-1 rounds?
 *   A shortest path in a graph with V nodes has at most V-1 edges.
 *   Each round guarantees one more edge on the path is "correct".
 *
 * Time:  O(V * E)  — slower than Dijkstra
 * Space: O(V)
 */

struct BellmanResult {
    vector<double> dist;
    vector<int>    prev;
    bool           hasNegativeCycle;
    // For visualization: store (round, node, old_dist, new_dist) for each relaxation
    vector<tuple<int,int,double,double>> relaxations;
};

BellmanResult bellmanFord(const Graph& g, int source) {
    int n = g.size();
    const double INF = numeric_limits<double>::infinity();

    vector<double> dist(n, INF);
    vector<int>    prev(n, -1);
    vector<tuple<int,int,double,double>> relaxations;

    dist[source] = 0.0;

    // V-1 rounds of relaxation
    for (int round = 0; round < n - 1; round++) {
        bool anyRelaxed = false;  // optimization: stop early if nothing changed

        for (int u = 0; u < n; u++) {
            if (dist[u] == INF) continue;  // can't relax from unreachable node

            for (const Edge& e : g.adj[u]) {
                double newDist = dist[u] + e.weight;
                if (newDist < dist[e.to]) {
                    // Record this relaxation for visualization
                    relaxations.push_back({round, e.to, dist[e.to], newDist});
                    dist[e.to] = newDist;
                    prev[e.to] = u;
                    anyRelaxed = true;
                }
            }
        }

        if (!anyRelaxed) break;  // early exit: already optimal
    }

    // Check for negative cycle: do one more round
    // If anything still relaxes, a negative cycle exists
    bool hasNegativeCycle = false;
    for (int u = 0; u < n; u++) {
        if (dist[u] == INF) continue;
        for (const Edge& e : g.adj[u]) {
            if (dist[u] + e.weight < dist[e.to]) {
                hasNegativeCycle = true;
                break;
            }
        }
    }

    return {dist, prev, hasNegativeCycle, relaxations};
}
