class Vertex:

    def __init__(self, val):
        self.Value = val


class SimpleGraph:

    def __init__(self, size):
        self.max_vertex = size
        self.m_adjacency = [[0] * size for _ in range(size)]
        self.vertex = [None] * size

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

    def CreateMapOfAdjacentVerticesIndexes(self):
        neighbors = []

        for index, all_adjacent in enumerate(self.m_adjacency):
            neighbors.insert(index, set())
            for i, n in enumerate(all_adjacent):
                if n == 1:
                    neighbors[index].add(i)

        return neighbors

    def WeakVertices(self):
        strong_vertices_indexes = set()
        neighbors = self.CreateMapOfAdjacentVerticesIndexes()

        for index, neighbor in enumerate(neighbors):
            for i, n in enumerate(neighbor):
                intersect = neighbors[index].intersection(neighbors[n])
                if len(intersect) > 0:
                    strong_vertices_indexes.add(index)
                    break

        all_indices = set(range(len(self.vertex)))
        weak_vertices_indexes = all_indices.difference(strong_vertices_indexes)

        result = []

        for i in weak_vertices_indexes:
            result.append(self.vertex[i])

        return result
