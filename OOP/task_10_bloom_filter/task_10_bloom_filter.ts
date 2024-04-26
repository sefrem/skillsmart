abstract class BloomFilterSpec<T> {

  // конструктор
  // постусловие: создано новый пустой фильтр соответствующей длины
  constructor(filterLength?: number) {
  }

  // команды
  // постусловие: для всех результатов хэш-функций ставит соответствующие биты в позицию 1
  public abstract add(value: T): void

  // запросы
  // постусловие: возвращает true, если для всех результатов хэш-функций в битовом массиве стоит 1
  public abstract is_present(value: T): boolean
}

export class BloomFilter<T> implements BloomFilterSpec<T> {
  private array = []

  constructor(private filterLength = 32) {
    this.array = new Array(this.filterLength).fill(0);
  }

  hash_func_1(value: T): number {
    return value.toString().split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * 17, 0) % this.filterLength
  }

  hash_func_2(value: T): number {
    return value.toString().split('').reduce((acc, char, index) => acc + char.charCodeAt(0) * 223, 0) % this.filterLength
  }

  add(value: T): void {
    const hash_1 = this.hash_func_1(value);
    const hash_2 = this.hash_func_2(value);
    this.array[hash_1] = 1;
    this.array[hash_2] = 1;
  }

  is_present(value: T): boolean {
    const hash_1 = this.hash_func_1(value);
    const hash_2 = this.hash_func_2(value);

    return !!this.array[hash_1] && !!this.array[hash_2];
  }
}
