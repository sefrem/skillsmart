import {Queue} from "./task_5_queue";


describe('Queue', () => {

  it('should enqueue element in queue', () => {
    const queue = new Queue<number>();

    queue.enqueue(1);
    expect(queue.size()).toEqual(1);
  });

  it('should dequeue the first added element', () => {
    const queue = new Queue<number>();
    queue.enqueue(1);
    queue.enqueue(2);
    expect(queue.size()).toEqual(2);
    const item = queue.dequeue();

    expect(item).toEqual(1)
    expect(queue.size()).toEqual(1);
  });
})
