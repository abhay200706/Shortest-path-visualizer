#pragma once
#include <vector>
#include <string>
#include <unordered_map>

using namespace std;

// One edge: goes to 'to', costs 'weight'
struct Edge {
    int to;
    double weight;
};

// One node: has a name and (x,y) position for drawing
struct Node {
    int id;
    string name;
    double x, y;  // canvas coordinates
};

class Graph {
public:
    vector<Node> nodes;
    vector<vector<Edge>> adj;  // adjacency list

    // Add a node, returns its id
    int addNode(const string& name, double x, double y);

    // Add undirected edge between u and v
    void addEdge(int u, int v, double weight);

    int size() const { return nodes.size(); }
};
