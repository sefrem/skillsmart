import unittest

from data_structures_pt_2.graph_dfs.graph_dfs import SimpleGraph, Vertex


class TestSimpleGraphDFS(unittest.TestCase):

    def test_dfs(self):
        graph = SimpleGraph(6)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddVertex(6)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(1, 3)
        graph.AddEdge(1, 4)
        graph.AddEdge(2, 5)

        path = graph.DepthFirstSearch(0, 5)

        path = [vertex.Value for vertex in path]

        self.assertEqual([1, 3, 6], path)

    def test_dfs_with_one_step_back(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(2, 3)

        path = graph.DepthFirstSearch(0, 3)

        path = [vertex.Value for vertex in path]

        self.assertEqual([1, 3, 4], path)

    def test_find_path_in_graph_with_two_vertexes(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)

        path = graph.DepthFirstSearch(0, 1)

        path = [vertex.Value for vertex in path]

        self.assertEqual([1, 2], path)

    def test_find_path_in_graph_with_three_vertexes(self):
        graph = SimpleGraph(3)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddEdge(0, 1)
        graph.AddEdge(1, 2)

        path = graph.DepthFirstSearch(0, 2)

        path = [vertex.Value for vertex in path]

        self.assertEqual([1, 2, 3], path)

    def test_failed_search(self):
        graph = SimpleGraph(3)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)

        graph.AddEdge(0, 1)

        path = graph.DepthFirstSearch(0, 2)

        self.assertEqual([], path)
