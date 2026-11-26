# Smart City Route Optimization System

Shortest routes between city locations using **Dijkstra** and **Bellman-Ford**, compared on graphs of different sizes.
Locations are vertices and roads are weighted edges (km).

## Website (JavaScript, no install)
Double-click `login.html` in Chrome or Edge. Demo login: **admin / smartcity123** (change it in `js/auth.js`).
Pick start and destination, close roads, and run the benchmark.

## Python version
```
python python/smart_city_routing.py              # demo + negative-weight case + benchmark
python python/smart_city_routing.py --demo
python python/smart_city_routing.py --benchmark
python python/smart_city_routing.py --plot       # needs: pip install matplotlib
cd python && python -m unittest -v               # tests
```

## Structure
```
login.html, index.html     website pages
css/style.css              theme (light and dark)
js/                        auth, data, algorithms, ui, benchmark, main
python/smart_city_routing.py        graph, Dijkstra, Bellman-Ford, benchmark
python/test_smart_city_routing.py   unit tests
```

| Algorithm | Time | Negative weights |
|---|---|---|
| Dijkstra (min-heap) | O((V + E) log V) | No |
| Bellman-Ford | O(V * E) | Yes, detects negative cycles |
