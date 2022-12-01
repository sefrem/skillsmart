class Vertex:
    hit = False

    def __init__(self, val):
        self.Value = val


class SimpleGraph:

    def __init__(self, size):
        self.max_vertex = size
        self.m_adjacency = [[0] * size for _ in range(size)]
        self.vertex = [None] * size
        self.stack = []

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

    def DepthFirstSearch(self, VFrom, VTo):
        self.stack = []
        for vertex in self.vertex:
            vertex.hit = False
        self.SearchGraph(VFrom, VTo, False)

        return self.stack

    def SearchGraph(self, VFrom, VTo, IsOnStack):
        vertex = self.vertex[VFrom]
        if not IsOnStack:
            vertex.hit = True
            self.stack.append(vertex)
        for index, edge in enumerate(self.m_adjacency[VFrom]):
            if edge == 1:
                if index == VTo:
                    self.stack.append(self.vertex[VTo])
                    return

        next_vertex_index, is_on_stack = self.GetNextAdjacentVertex(VFrom)
        if next_vertex_index is None:
            return []

        self.SearchGraph(next_vertex_index, VTo, is_on_stack)

    def GetNextAdjacentVertex(self, VIndex):
        for (index, edge) in enumerate(self.m_adjacency[VIndex]):
            if edge == 1 and self.vertex[index].hit is False:
                return index, False

        return self.GetPrevVertexFromStack()

    def GetPrevVertexFromStack(self):
        self.stack.pop()
        if len(self.stack) == 0:
            return None, False

        for index, value in enumerate(self.vertex):
            if value.Value == self.stack[-1].Value:
                return index, True
