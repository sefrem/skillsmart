class Vertex:
    hit = False

    def __init__(self, val):
        self.Value = val


class SimpleGraph:

    def __init__(self, size):
        self.max_vertex = size
        self.m_adjacency = [[0] * size for _ in range(size)]
        self.vertex = [None] * size
        self.queue = []
        self.path = []

    def AddVertex(self, v):
        vertex = Vertex(v)
        for index, v in enumerate(self.vertex):
            if v is None:
                self.vertex[index] = vertex
                break

    def RemoveVertex(self, v):
        self.vertex[v] = None
        for index, i in enumerate(self.m_adjacency[v]):
            self.m_adjacency[v][index] = 0
        for row in self.m_adjacency:
            row[v] = 0

    def IsEdge(self, v1, v2):
        return self.m_adjacency[v1][v2] == self.m_adjacency[v2][v1] == 1

    def AddEdge(self, v1, v2):
        self.m_adjacency[v1][v2] = 1
        self.m_adjacency[v2][v1] = 1

    def RemoveEdge(self, v1, v2):
        self.m_adjacency[v1][v2] = 0
        self.m_adjacency[v2][v1] = 0

    def BreadthFirstSearch(self, VFrom, VTo):
        self.queue = []
        self.path = []
        for vertex in self.vertex:
            if vertex:
                vertex.hit = False
        vertex = self.vertex[VFrom]
        vertex.hit = True
        path = self.SearchGraph(VFrom, VTo)
        if len(path) > 0:
            path.insert(0, vertex)

        return path

    def SearchGraph(self, startIndex, endIndex):
        next_adj_index = startIndex \
            if self.m_adjacency[startIndex][startIndex] == 1 and startIndex == endIndex \
            else self.GetNextAdjacentVertex(startIndex)

        while next_adj_index is not None:

            if next_adj_index == endIndex:
                self.path.append(self.vertex[next_adj_index])
                return self.path

            adj_vertex = self.vertex[next_adj_index]
            adj_vertex.hit = True
            self.queue.append(next_adj_index)

            next_adj_index = self.GetNextAdjacentVertex(startIndex)

        if next_adj_index is None:
            if len(self.queue) == 0:
                return []
            vertex_from_queue = self.queue.pop(0)

            if len(self.path):
                index = self.GetLastVertexInPathIndex()
                if self.m_adjacency[vertex_from_queue][index] != 1:
                    self.path.pop()

            self.path.append(self.vertex[vertex_from_queue])
            return self.SearchGraph(vertex_from_queue, endIndex)

        return self.SearchGraph(next_adj_index, endIndex)

    def GetNextAdjacentVertex(self, index):
        for i, is_adj in enumerate(self.m_adjacency[index]):
            if is_adj == 1 and self.vertex[i].hit is False:
                return i
        return None

    def GetLastVertexInPathIndex(self):
        for i, vertex in enumerate(self.vertex):
            if vertex.Value == self.path[-1].Value:
                return i
