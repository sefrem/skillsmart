import unittest

from data_structures_pt_2.weak_graph.weak_graph import SimpleGraph


class TestWeakVertices(unittest.TestCase):

    def test_weak_vertices(self):
        g = SimpleGraph(9)
        g.AddVertex(0)
        g.AddVertex(1)
        g.AddVertex(2)
        g.AddVertex(3)
        g.AddVertex(4)
        g.AddVertex(5)
        g.AddVertex(6)
        g.AddVertex(7)
        g.AddVertex(8)
        g.AddEdge(0, 1)
        g.AddEdge(0, 2)
        g.AddEdge(0, 3)
        g.AddEdge(1, 3)
        g.AddEdge(2, 3)
        g.AddEdge(1, 4)
        g.AddEdge(3, 5)
        g.AddEdge(4, 5)
        g.AddEdge(5, 6)
        g.AddEdge(5, 7)
        g.AddEdge(6, 7)
        g.AddEdge(7, 8)

        weak = g.WeakVertices()

        self.assertEqual(2, len(weak))
        values = [vertex.Value for vertex in weak]

        self.assertEqual([8, 4], values)

    def test_no_weak_vertices(self):
        g = SimpleGraph(4)
        g.AddVertex(0)
        g.AddVertex(1)
        g.AddVertex(2)
        g.AddVertex(3)
        g.AddEdge(0, 1)
        g.AddEdge(0, 2)
        g.AddEdge(0, 3)
        g.AddEdge(1, 2)
        g.AddEdge(2, 3)

        weak = g.WeakVertices()
        self.assertEqual(0, len(weak))
        self.assertEqual([], weak)