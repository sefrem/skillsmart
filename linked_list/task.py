from linked_list import LinkedList, Node


def make_list(linked_list_a, linked_list_b):
    if linked_list_a.len() == linked_list_b.len():
        new_list = LinkedList()
        node_a = linked_list_a.head
        node_b = linked_list_b.head
        while node_a is not None:
            new_list.add_in_tail(Node(node_a.value + node_b.value))
            node_a = node_a.next
            node_b = node_b.next
        return new_list
    return None