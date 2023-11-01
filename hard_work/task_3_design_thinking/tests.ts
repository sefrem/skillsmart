
// Тест до

it('assures that checking for pairs happens only one time, just after the cards are dealt', () => {
    const spy = jest.spyOn(gameState, 'checkHandForPairs');

    gameState.initGame('first');
    gameState.addPlayer('second');
    gameState.setBet('first', '10');
    gameState.setBet('second', '10');
    gameState["deal"]();

    expect(spy).toBeCalledTimes(2);
});

// Тест после

it('asserts the state of players with split value calculated is sent from the BE', () => {
    jest.spyOn(GameState.prototype, 'getCardFromTop').mockImplementation(function (this: GameState) {
        return mockDeck.splice(0, 1)[0];
    });
    const broadcastSpy = jest.spyOn(socket, 'emit');

    gameState.initGame('first');
    gameState.addPlayer('second');
    gameState["deal"]();

    expect(broadcastSpy).toHaveBeenCalledWith(
        'gameStatePlayers',
        [
            expect.objectContaining({
            id: 'first',
            canSplit: true
        }),
            expect.objectContaining({
                id: 'second',
                canSplit: false
            })
        ],
    )
})