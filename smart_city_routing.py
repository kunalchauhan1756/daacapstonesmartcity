"""
Smart City Route Optimization System
------------------------------------
Locations  -> vertices
Roads      -> weighted edges (distance in km, or travel time in minutes)

Algorithms:
  1. Dijkstra      (min-heap)          O((V + E) log V)   non-negative weights only
  2. Bellman-Ford  (with early exit)   O(V * E)           handles negative weights,
                                                          detects negative cycles

Run:
    python smart_city_routing.py              # city demo + benchmark
    python smart_city_routing.py --demo       # city demo only
    python smart_city_routing.py --benchmark  # benchmark only
    python smart_city_routing.py --plot       # benchmark + save graph (needs matplotlib)
"""

import heapq
import random
import sys
import time
from collections import defaultdict

INF = float("inf")


# --------------------------------------------------------------------------- #
# Graph
# --------------------------------------------------------------------------- #
class CityGraph:
    """Weighted graph stored as an adjacency list."""

    def __init__(self, directed=False):
        self.directed = directed
        self.adj = defaultdict(list)      # u -> [(v, weight), ...]
        self.vertices = set()
        self.edge_count = 0

    def add_location(self, name):
        self.vertices.add(name)

    def add_road(self, u, v, weight):
        self.vertices.update((u, v))
        self.adj[u].append((v, weight))
        self.edge_count += 1
        if not self.directed:
            self.adj[v].append((u, weight))
            self.edge_count += 1

    def edges(self):
        """Yield every directed edge (u, v, w)."""
        for u in self.adj:
            for v, w in self.adj[u]:
                yield u, v, w

    @property
    def V(self):
        return len(self.vertices)

    @property
    def E(self):
        return self.edge_count


# --------------------------------------------------------------------------- #
# Algorithms
# --------------------------------------------------------------------------- #
def dijkstra(graph, source, strict=False):
    """
    Returns (dist, parent).
    Only valid when all edge weights are non-negative.
    strict=True uses the textbook 'visited set' version (a node is finalised
    once popped), which is what actually breaks on negative edges.
    """
    dist = {v: INF for v in graph.vertices}
    parent = {v: None for v in graph.vertices}
    dist[source] = 0
    heap = [(0, source)]
    visited = set()

    while heap:
        d, u = heapq.heappop(heap)
        if d > dist[u]:                     # stale entry, skip
            continue
        if strict:
            if u in visited:
                continue
            visited.add(u)
        for v, w in graph.adj[u]:
            nd = d + w
            if nd < dist[v] and not (strict and v in visited):
                dist[v] = nd
                parent[v] = u
                heapq.heappush(heap, (nd, v))
    return dist, parent


def bellman_ford(graph, source):
    """
    Returns (dist, parent, has_negative_cycle).
    Works with negative weights. Stops early if a pass changes nothing.
    """
    dist = {v: INF for v in graph.vertices}
    parent = {v: None for v in graph.vertices}
    dist[source] = 0
    edge_list = list(graph.edges())

    for _ in range(graph.V - 1):
        changed = False
        for u, v, w in edge_list:
            if dist[u] != INF and dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                parent[v] = u
                changed = True
        if not changed:                     # early termination
            break

    # V-th pass: any further relaxation => negative cycle
    for u, v, w in edge_list:
        if dist[u] != INF and dist[u] + w < dist[v]:
            return dist, parent, True
    return dist, parent, False


def reconstruct_path(parent, source, target):
    """Walk parent pointers back from target to source."""
    path, node = [], target
    while node is not None:
        path.append(node)
        if node == source:
            return path[::-1]
        node = parent[node]
    return []                               # unreachable


# --------------------------------------------------------------------------- #
# Sample city
# --------------------------------------------------------------------------- #
def build_sample_city():
    """A small named city map. Weights are distances in km."""
    g = CityGraph(directed=False)
    roads = [
        ("Railway Station", "City Mall", 4),
        ("Railway Station", "Bus Terminal", 2),
        ("Railway Station", "Old Market", 7),
        ("Bus Terminal", "City Mall", 1),
        ("Bus Terminal", "University", 5),
        ("City Mall", "Hospital", 3),
        ("City Mall", "Stadium", 6),
        ("Old Market", "Hospital", 4),
        ("Old Market", "Airport", 9),
        ("University", "Stadium", 3),
        ("University", "Tech Park", 4),
        ("Hospital", "Airport", 6),
        ("Hospital", "Stadium", 2),
        ("Stadium", "Tech Park", 2),
        ("Tech Park", "Airport", 8),
    ]
    for u, v, w in roads:
        g.add_road(u, v, w)
    return g


def show_route(graph, source, target):
    print(f"\nRoute: {source}  ->  {target}")
    print("-" * 60)

    d_dist, d_par = dijkstra(graph, source)
    b_dist, b_par, neg = bellman_ford(graph, source)

    d_path = reconstruct_path(d_par, source, target)
    b_path = reconstruct_path(b_par, source, target)

    print(f"Dijkstra      : {' -> '.join(d_path)}  ({d_dist[target]} km)")
    print(f"Bellman-Ford  : {' -> '.join(b_path)}  ({b_dist[target]} km)")
    print(f"Negative cycle: {neg}")
    print(f"Results match : {d_dist[target] == b_dist[target]}")


def demo_city():
    print("=" * 60)
    print(" SMART CITY ROUTE OPTIMIZATION - DEMO")
    print("=" * 60)
    city = build_sample_city()
    print(f"Locations: {city.V}   Directed road segments: {city.E}")

    show_route(city, "Railway Station", "Airport")
    show_route(city, "University", "Old Market")
    show_route(city, "Tech Park", "Railway Station")

    # All shortest distances from one source
    src = "Railway Station"
    dist, _ = dijkstra(city, src)
    print(f"\nShortest distances from {src}:")
    for place, d in sorted(dist.items(), key=lambda x: x[1]):
        print(f"  {place:<18} {d:>4} km")


def demo_negative_weights():
    """
    Shows WHY Bellman-Ford exists: a negative edge (e.g. a toll rebate / time
    saved by a new expressway) breaks Dijkstra but not Bellman-Ford.
    """
    print("\n" + "=" * 60)
    print(" NEGATIVE WEIGHT CASE (directed roads)")
    print("=" * 60)
    g = CityGraph(directed=True)
    g.add_road("A", "B", 4)
    g.add_road("A", "C", 5)
    g.add_road("B", "D", 7)
    g.add_road("C", "B", -3)      # rebate road: C -> B saves 3
    g.add_road("D", "E", 2)

    d_dist, _ = dijkstra(g, "A", strict=True)
    b_dist, _, neg = bellman_ford(g, "A")
    print(f"Dijkstra     A->D: {d_dist['D']}   (WRONG: B was finalised at 4 before A->C->B = 2 was seen)")
    print(f"Bellman-Ford A->D: {b_dist['D']}   (correct: A->C->B->D)")
    print(f"Negative cycle detected: {neg}")

    g.add_road("D", "C", -10)     # creates cycle C->B->D->C with negative total
    _, _, neg = bellman_ford(g, "A")
    print(f"After adding D->C (-10): negative cycle detected = {neg}")


# --------------------------------------------------------------------------- #
# Benchmark
# --------------------------------------------------------------------------- #
def generate_random_city(n, avg_degree=4, seed=None):
    """Connected random city: spanning chain + random extra roads."""
    rng = random.Random(seed)
    g = CityGraph(directed=False)
    nodes = list(range(n))
    rng.shuffle(nodes)
    for i in range(n - 1):                              # guarantees connectivity
        g.add_road(nodes[i], nodes[i + 1], rng.randint(1, 20))
    extra = max(0, (n * avg_degree) // 2 - (n - 1))
    for _ in range(extra):
        u, v = rng.sample(range(n), 2)
        g.add_road(u, v, rng.randint(1, 20))
    return g


def time_it(fn, *args, repeats=3):
    best = INF
    for _ in range(repeats):
        t0 = time.perf_counter()
        fn(*args)
        best = min(best, time.perf_counter() - t0)
    return best * 1000                                  # ms


def benchmark(sizes=(50, 100, 250, 500, 1000, 2000), avg_degree=4):
    print("\n" + "=" * 72)
    print(" PERFORMANCE COMPARISON  (best of 3 runs, time in ms)")
    print("=" * 72)
    print(f"{'V':>6} {'E(dir)':>8} {'Dijkstra':>12} {'Bellman-Ford':>14} "
          f"{'BF/Dijk':>9} {'Match':>7}")
    print("-" * 72)

    results = []
    for n in sizes:
        g = generate_random_city(n, avg_degree, seed=n)
        src = 0

        t_d = time_it(dijkstra, g, src)
        t_b = time_it(bellman_ford, g, src)

        d, _ = dijkstra(g, src)
        b, _, _ = bellman_ford(g, src)
        match = all(d[v] == b[v] for v in g.vertices)

        ratio = t_b / t_d if t_d > 0 else float("inf")
        print(f"{g.V:>6} {g.E:>8} {t_d:>12.3f} {t_b:>14.3f} "
              f"{ratio:>8.1f}x {str(match):>7}")
        results.append((g.V, g.E, t_d, t_b))

    print("-" * 72)
    print("Dijkstra  : O((V+E) log V)  -> scales near-linearly")
    print("Bellman-Ford: O(V*E) worst case; early exit helps on random maps,")
    print("              but it is still consistently slower and the gap widens with size")
    return results


def plot_results(results, filename="performance_comparison.png"):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("\nmatplotlib not installed -> skipping plot (pip install matplotlib)")
        return

    sizes = [r[0] for r in results]
    plt.figure(figsize=(8, 5))
    plt.plot(sizes, [r[2] for r in results], "o-", label="Dijkstra")
    plt.plot(sizes, [r[3] for r in results], "s-", label="Bellman-Ford")
    plt.xlabel("Number of locations (V)")
    plt.ylabel("Time (ms)")
    plt.title("Dijkstra vs Bellman-Ford: Runtime vs Graph Size")
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(filename, dpi=150)
    print(f"\nPlot saved to {filename}")


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
if __name__ == "__main__":
    args = set(sys.argv[1:])
    only_demo = "--demo" in args
    only_bench = "--benchmark" in args

    if not only_bench:
        demo_city()
        demo_negative_weights()
    if not only_demo:
        res = benchmark()
        if "--plot" in args:
            plot_results(res)
