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
        self.parents = {}

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
        return self.CalculatePath(path)

    def SearchGraph(self, startIndex, endIndex):
        next_adj_index = startIndex \
            if self.m_adjacency[startIndex][startIndex] == 1 and startIndex == endIndex \
            else self.GetNextAdjacentVertex(startIndex)

        while next_adj_index is not None:
            self.parents.update({next_adj_index: startIndex})

            if next_adj_index == endIndex:
                self.path.append(next_adj_index)
                return self.path

            adj_vertex = self.vertex[next_adj_index]
            adj_vertex.hit = True
            self.queue.append(next_adj_index)

            next_adj_index = self.GetNextAdjacentVertex(startIndex)

        if next_adj_index is None:
            if len(self.queue) == 0:
                return []
            vertex_from_queue = self.queue.pop(0)
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

    def CalculatePath(self, path):
        if len(path) == 0:
            return path

        if path[-1] == self.parents[path[-1]]:
            return [self.vertex[index] for index in path]

        for _ in self.parents.items():
            parent = self.parents.get(path[0])
            if parent is None:
                break
            path.insert(0, parent)

        return [self.vertex[index] for index in path]
