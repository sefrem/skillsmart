import unittest

from data_structures_pt_2.graph.graph import SimpleGraph


class TestSimpleGraph(unittest.TestCase):

    def test_add_vertex_to_empty_graph(self):
        graph = SimpleGraph(3)

        graph.AddVertex(1)

        self.assertEqual(1, graph.vertex[0].Value)
        self.assertEqual(0, graph.m_adjacency[0][0])
        self.assertEqual(0, graph.m_adjacency[1][0])
        self.assertEqual(0, graph.m_adjacency[2][0])

    def test_add_vertex_to_not_empty_graph(self):
        graph = SimpleGraph(3)

        graph.AddVertex(1)
        graph.AddVertex(2)

        self.assertEqual(2, graph.vertex[1].Value)
        self.assertEqual(0, graph.m_adjacency[0][0])
        self.assertEqual(0, graph.m_adjacency[1][0])
        self.assertEqual(0, graph.m_adjacency[2][0])
        self.assertEqual(0, graph.m_adjacency[0][1])
        self.assertEqual(0, graph.m_adjacency[1][1])
        self.assertEqual(0, graph.m_adjacency[2][1])

    def test_add_vertex_to_full_graph(self):
        graph = SimpleGraph(2)

        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)

        self.assertEqual(1, graph.vertex[0].Value)
        self.assertEqual(2, graph.vertex[1].Value)
        self.assertEqual(0, graph.m_adjacency[0][0])
        self.assertEqual(0, graph.m_adjacency[1][0])
        self.assertEqual(0, graph.m_adjacency[0][1])
        self.assertEqual(0, graph.m_adjacency[1][1])

    def test_add_edge_in_graph_with_two_vertexes(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)

        graph.AddEdge(0, 1)

        self.assertEqual(0, graph.m_adjacency[0][0])
        self.assertEqual(1, graph.m_adjacency[0][1])
        self.assertEqual(1, graph.m_adjacency[1][0])
        self.assertEqual(0, graph.m_adjacency[1][1])

    def test_add_edge_in_graph_with_four_vertexes(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)

        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[0])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[1])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[2])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[3])

        graph.AddEdge(0, 0)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(0, 3)

        self.assertEqual([1, 1, 1, 1], graph.m_adjacency[0])
        self.assertEqual([1, 0, 0, 0], graph.m_adjacency[1])
        self.assertEqual([1, 0, 0, 0], graph.m_adjacency[2])
        self.assertEqual([1, 0, 0, 0], graph.m_adjacency[3])

    def test_remove_edge_in_graph_with_two_vertexes(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 0)
        graph.AddEdge(1, 1)

        self.assertEqual([1, 1], graph.m_adjacency[0])
        self.assertEqual([1, 1], graph.m_adjacency[1])

        graph.RemoveEdge(0, 0)
        graph.RemoveEdge(0, 1)
        graph.RemoveEdge(1, 1)

        self.assertEqual([0, 0], graph.m_adjacency[0])
        self.assertEqual([0, 0], graph.m_adjacency[1])

    def test_is_edge_exists(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)

        is_edge_true = graph.IsEdge(0, 1)
        is_edge_false = graph.IsEdge(0, 0)

        self.assertTrue(is_edge_true)
        self.assertFalse(is_edge_false)

    def test_remove_vertex_and_its_edges_from_graph_size_2(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)

        graph.RemoveVertex(0)

        self.assertIsNone(graph.vertex[0])
        self.assertEqual(2, graph.vertex[1].Value)
        self.assertEqual([0, 0], graph.m_adjacency[0])
        self.assertEqual([0, 0], graph.m_adjacency[1])

    def test_remove_vertex_and_its_edges_from_graph_size_4(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddEdge(0, 0)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(0, 3)

        graph.RemoveVertex(0)

        self.assertIsNone(graph.vertex[0])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[0])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[1])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[2])
        self.assertEqual([0, 0, 0, 0], graph.m_adjacency[3])
