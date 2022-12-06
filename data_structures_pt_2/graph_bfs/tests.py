import unittest

from graph_bfs import SimpleGraph


class TestSimpleGraphBFS(unittest.TestCase):

    def test_no_path(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)

        graph_bfs = graph.BreadthFirstSearch(0, 1)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([], path)

    def test_no_path_but_has_vertex_with_path_to_itself(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 0)
        graph.AddEdge(1, 1)

        graph_bfs = graph.BreadthFirstSearch(0, 1)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([], path)

    def test_edges_no_path(self):
        graph = SimpleGraph(4)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 3)
        graph.AddEdge(1, 3)

        graph_bfs = graph.BreadthFirstSearch(0, 2)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([], path)

    def test_bfs_graph_size_2(self):
        graph = SimpleGraph(2)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 1)

        graph_bfs = graph.BreadthFirstSearch(0, 1)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual(2, len(graph_bfs))
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
        graph.AddEdge(1, 3)
        graph.AddEdge(0, 2)
        graph.AddEdge(0, 3)
        graph.AddEdge(2, 3)
        graph.AddEdge(2, 4)
        graph.AddEdge(4, 5)
        graph.AddEdge(5, 6)

        graph_bfs = graph.BreadthFirstSearch(0, 6)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([0, 2, 4, 5, 6], path)

    def test_bfs_start_not_from_beginning(self):
        graph = SimpleGraph(3)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddEdge(1, 2)

        graph_bfs = graph.BreadthFirstSearch(1, 2)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([2, 3], path)

    def test_bfs_start_not_from_beginning_long_graph(self):
        graph = SimpleGraph(8)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddVertex(6)
        graph.AddVertex(7)
        graph.AddVertex(8)
        graph.AddVertex(9)
        graph.AddEdge(0, 2)
        graph.AddEdge(1, 2)
        graph.AddEdge(4, 6)
        graph.AddEdge(6, 7)

        graph_bfs = graph.BreadthFirstSearch(6, 7)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([7, 8], path)

    def test_bfs_from_vertex_to_itself(self):
        graph = SimpleGraph(3)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddEdge(0, 0)
        graph.AddEdge(0, 1)

        graph_bfs = graph.BreadthFirstSearch(0, 0)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual(1, len(graph_bfs))
        self.assertEqual([1], path)

    def test_bfs_when_vertex_has_path_to_itself(self):
        graph = SimpleGraph(6)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddVertex(6)
        graph.AddEdge(0, 0)
        graph.AddEdge(1, 1)
        graph.AddEdge(1, 2)
        graph.AddEdge(2, 1)
        graph.AddEdge(2, 0)
        graph.AddEdge(2, 2)
        graph.AddEdge(2, 3)
        graph.AddEdge(2, 4)
        graph.AddEdge(4, 4)
        graph.AddEdge(4, 5)

        graph_bfs = graph.BreadthFirstSearch(0, 5)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual(4, len(graph_bfs))
        self.assertEqual([1, 3, 5, 6], path)

    def test_long_path(self):
        graph = SimpleGraph(14)
        graph.AddVertex(0)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddVertex(6)
        graph.AddVertex(7)
        graph.AddVertex(8)
        graph.AddVertex(9)
        graph.AddVertex(10)
        graph.AddVertex(11)
        graph.AddVertex(12)
        graph.AddVertex(13)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(2, 2)
        graph.AddEdge(1, 4)
        graph.AddEdge(2, 4)
        graph.AddEdge(2, 3)
        graph.AddEdge(3, 5)
        graph.AddEdge(5, 6)
        graph.AddEdge(5, 7)
        graph.AddEdge(6, 9)
        graph.AddEdge(7, 8)
        graph.AddEdge(8, 10)
        graph.AddEdge(9, 10)
        graph.AddEdge(10, 11)
        graph.AddEdge(10, 12)
        graph.AddEdge(11, 12)
        graph.AddEdge(11, 13)

        graph_bfs = graph.BreadthFirstSearch(0, 13)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([0, 2, 3, 5, 6, 9, 10, 11, 13], path)

    def test_bfs_with_path_splitting(self):
        graph = SimpleGraph(6)
        graph.AddVertex(0)
        graph.AddVertex(1)
        graph.AddVertex(2)
        graph.AddVertex(3)
        graph.AddVertex(4)
        graph.AddVertex(5)
        graph.AddEdge(0, 1)
        graph.AddEdge(0, 2)
        graph.AddEdge(1, 3)
        graph.AddEdge(2, 4)
        graph.AddEdge(4, 5)

        graph_bfs = graph.BreadthFirstSearch(0, 5)

        path = [vertex.Value for vertex in graph_bfs]

        self.assertEqual([0, 2, 4, 5], path)
