
def GenerateBBSTArray(a):
    if len(a) <= 1:
        return a
    a.sort()
    center = len(a) // 2
    result = [None] * len(a)
    result[0] = a[center]

    generate(a[:center], True, 0, result)
    if len(a) == 2:
        return result
    generate(a[center + 1:], False, 0, result)
    return result


def generate(arr, isLeft, parentIndex, result):
    childIndex = 2 * parentIndex + 1 if isLeft else 2 * parentIndex + 2
    if len(arr) == 1:
        result[childIndex] = arr[0]
        return

    result[childIndex] = arr[len(arr) // 2]
    generate(arr[:len(arr) // 2], True, childIndex, result)
    generate(arr[(len(arr) // 2) + 1:], False, childIndex, result)
