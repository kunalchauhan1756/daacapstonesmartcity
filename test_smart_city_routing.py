import unittest
from smart_city_routing import (INF, CityGraph, bellman_ford, build_sample_city,
                                dijkstra, generate_random_city, reconstruct_path)


class Tests(unittest.TestCase):
    def test_sample_city(self):
        g = build_sample_city()
        dist, parent = dijkstra(g, "Railway Station")
        self.assertEqual(dist["Airport"], 12)
        self.assertEqual(reconstruct_path(parent, "Railway Station", "Airport"),
                         ["Railway Station", "Bus Terminal", "City Mall", "Hospital", "Airport"])

    def test_algorithms_agree_on_random_cities(self):
        for n in (10, 60, 200):
            g = generate_random_city(n, seed=n)
            self.assertEqual(dijkstra(g, 0)[0], bellman_ford(g, 0)[0])

    def test_unreachable(self):
        g = CityGraph()
        g.add_road("A", "B", 1)
        g.add_location("C")
        dist, parent = dijkstra(g, "A")
        self.assertEqual(dist["C"], INF)
        self.assertEqual(reconstruct_path(parent, "A", "C"), [])

    def test_negative_edge(self):
        g = CityGraph(directed=True)
        for u, v, w in [("A", "B", 4), ("A", "C", 5), ("B", "D", 7), ("C", "B", -3), ("D", "E", 2)]:
            g.add_road(u, v, w)
        self.assertEqual(dijkstra(g, "A", strict=True)[0]["D"], 11)   # wrong on purpose
        self.assertEqual(bellman_ford(g, "A")[0]["D"], 9)             # correct

    def test_negative_cycle(self):
        g = CityGraph(directed=True)
        for u, v, w in [("A", "B", 1), ("B", "C", -2), ("C", "B", 1)]:
            g.add_road(u, v, w)
        self.assertTrue(bellman_ford(g, "A")[2])


if __name__ == "__main__":
    unittest.main()
