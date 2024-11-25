
export abstract class Output {

    // постусловие: в консоль выведено игровое поле
    public abstract showField(): void

    // постусловие: в консоль выведено количество очков игрока
    public abstract showPoints(): void

    // постусловие: в консоль выведено сообщение о невалидном ходе
    public abstract invalidMove(): void
}
