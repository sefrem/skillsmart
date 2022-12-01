import unittest

from graph_bfs import SimpleGraph


class TestSimpleGraphBFS(unittest.TestCase):

    def test_bfs_graph_size_2(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)

        graph_bfs = graph.BreadthFirstSearch(0, 1)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([1, 2], path)

    def test_bfs_graph_size_3(self):
        graph = SimpleGraph(3)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddEdge(0, 1)
        graph.AddEdge(1, 2)

        graph_bfs = graph.BreadthFirstSearch(0, 2)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([1, 2, 3], path)

    def test_bfs_graph_size_4(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddEdge(0, 1)
        graph.AddEdge(1, 2)
        graph.AddEdge(2, 3)

        graph_bfs = graph.BreadthFirstSearch(0, 3)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([1, 2, 3, 4], path)

    def test_bfs_with_one_extra_vertex(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddEdge(0, 1)
        graph.AddEdge(2, 3)
        graph.AddEdge(0, 2)

        graph_bfs = graph.BreadthFirstSearch(0, 3)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([1, 3, 4], path)


    def test_bfs_with_multiple_extra_vertex(self):
        graph = SimpleGraph(7)
        graph.AddVertex(0)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddVertex(6)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(2, 3)
        graph.AddEdge(2, 4)
        graph.AddEdge(4, 5)
        graph.AddEdge(5, 6)

        graph_bfs = graph.BreadthFirstSearch(0, 6)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([0, 2, 4, 5, 6], path)