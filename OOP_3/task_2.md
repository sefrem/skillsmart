
1. Что будет включено в систему, а что точно не надо в неё включать:
   Высокоуровнево, система состоит из 3 частей:
   - Прием входящих данных от пользователя (Input)
   - Игровая логика
   - Отображение (Output)

2. Главные подсистемы:
   Вышеуказанные сущности можно также назвать основными подсистемами
   Виды сущностей:

          1. Поле
             Здесь инскапсулирована вся логика действий с полем - генерация нового поля, его изменение, 
             удаление из него элементов, добавление новых элементов
    
          2. Валидатор
             Здесь находится логика проверки поля на наличие "3 в ряд", а также на условия завершения игры
    
          3. Статистика
             Здесь ведется вся информация о текущей игре - количество ходов, количество комбинаций, история ходов
    
          4. Модификации
             Здесь логика возможных модификаций в процессе игры - бонусы, новые выигрышные комбинации и т.д.
    
          5. Input
             Здесь принимаются команды от игрока - новый ход, перезапуск или завершение игры
    
          6. Отображение
             Здесь на экран выводится игровое поле

3. Пользовательские метафоры (что именно пользователь/заказчик понимает под тем, что в рамках проекта он называет,
   например, "Автомобиль" или "Товар" или "Клиент"):
   
    Поле - выводимая в консоль сетка 8x8, заполненная случайными элементами из 5 типов (например, буквы A, B, C, D, E)
   
    Ход - введенная в консоль комбинация  их 2 ячеек, элементы которых игрок хочет поменять местами. После перестановки
    подходящие комбинации элементов удаляются с доски.
   
    Статистика - выводимая пользователю информация о количестве очков, номере хода и т.д.
   
    Бонусы - как усложненные комбинации (например, 4 в ряд), так и дополнительные условия, выполняя которые игрок может заработать
   больше очков.

4. Функциональность
    - Прием хода от пользователя
    - Перерисовка поля
    - Проверка поля на наличие успешных комбинация
    - Удаление успешных комбинаций, заполнение поля новыми случайными элементами
    - Начисление игроку очков
    - При невозможности хода завершать игру
    - По действию игрока завершать/перезапускать игру

5. Библиотеки повторного использования
    - Построение поля по заданным параметрам (размер, количество уникальных элементов)