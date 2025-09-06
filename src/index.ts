import { SlotGame } from './game/SlotGame';

window.addEventListener('load', () => {
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        const game = new SlotGame(gameContainer);
        game.init();
    }
});
