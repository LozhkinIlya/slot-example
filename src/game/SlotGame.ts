import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { SlotMachine } from './SlotMachine';
import { GameUI } from './GameUI';
import { GameState } from './GameState';
import { ResponsiveManager } from '../utils/ResponsiveManager';
import { PixiTimer } from '../utils/PixiTimer';

export class SlotGame {
    private app: PIXI.Application;
    private slotMachine: SlotMachine;
    private gameUI: GameUI;
    private gameState: GameState;
    private responsiveManager: ResponsiveManager;
    private pixiTimer: PixiTimer;

    constructor(private container: HTMLElement) {
        this.app = new PIXI.Application({
            width: 800,
            height: 600,
            backgroundColor: 0x1a1a2e,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });

        this.gameState = new GameState();
        this.responsiveManager = new ResponsiveManager(this.app);
        this.pixiTimer = new PixiTimer(this.app);
    }

    public async init(): Promise<void> {
        try {
            this.container.appendChild(this.app.view as HTMLCanvasElement);

            this.slotMachine = new SlotMachine(this.app, this.responsiveManager, this.pixiTimer);
            this.gameUI = new GameUI(this.app, this.gameState, this.responsiveManager, this.pixiTimer);

            await this.slotMachine.init();
            await this.gameUI.init();

            this.app.stage.addChild(this.slotMachine.container);
            this.app.stage.addChild(this.gameUI.container);

            this.setupEventHandlers();
            

            this.setupResponsive();

            console.log('Slot game initialized successfully!');
        } catch (error) {
            console.error('Failed to initialize slot game:', error);
        }
    }

    private setupEventHandlers(): void {
        this.gameUI.onSpin = () => {
            if (this.gameState.canSpin()) {
                this.spin();
            }
        };

        this.gameUI.onBetChange = (newBet: number) => {
            this.gameState.setBet(newBet);
        };
    }

    private setupResponsive(): void {
        this.responsiveManager.onResize((config) => {
            this.slotMachine.updateLayout();
            this.gameUI.updateLayout();
        });
    }

    private async spin(): Promise<void> {
        this.gameState.startSpin();
        this.gameUI.updateUI();

        try {
            const result = await this.slotMachine.spin();
            
            const winAmount = this.calculateWin(result);
            
            if (winAmount > 0) {
                this.gameState.addWin(winAmount);
                this.showWinAnimation(winAmount);
            }

            this.gameState.endSpin();
            this.gameUI.updateUI();
        } catch (error) {
            console.error('Spin error:', error);
            this.gameState.endSpin();
            this.gameUI.updateUI();
        }
    }

    private calculateWin(result: number[][]): number {
        let totalWin = 0;
        const bet = this.gameState.getCurrentBet();

        for (let row = 0; row < 3; row++) {
            const line = [result[0][row], result[1][row], result[2][row]];
            
            if (line[0] === line[1] && line[1] === line[2]) {
                const multiplier = this.getSymbolMultiplier(line[0]);
                totalWin += bet * multiplier;
            }
        }

        return totalWin;
    }

    private getSymbolMultiplier(symbol: number): number {
        const multipliers = [10, 5, 3, 2, 1]; 
        return multipliers[symbol] || 1;
    }

    private showWinAnimation(amount: number): void {
        const fontSize = this.responsiveManager.getFontSize(48);
        const winText = new PIXI.Text(`WIN: ${amount}`, {
            fontSize,
            fill: 0xFFD700,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 3
        });

        winText.anchor.set(0.5);
        winText.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
        winText.alpha = 0;
        winText.scale.set(0.3);

        this.app.stage.addChild(winText);

        const tl = gsap.timeline({
            onComplete: () => {
                this.app.stage.removeChild(winText);
            }
        });

        tl.to(winText, {
            duration: 0.5,
            alpha: 1,
            ease: "back.out(1.7)"
        })
        .to(winText.scale, {
            duration: 0.5,
            x: 1.2,
            y: 1.2,
            ease: "back.out(1.7)"
        }, 0)
        .to(winText.scale, {
            duration: 0.3,
            x: 1,
            y: 1,
            ease: "power2.out"
        })
        .to(winText, {
            duration: 0.2,
            alpha: 0.8,
            yoyo: true,
            repeat: 3,
            ease: "power2.inOut"
        }, "+=0.5")
        .to(winText, {
            duration: 0.4,
            alpha: 0,
            y: winText.y - 50,
            ease: "power2.in"
        }, "+=0.5");
    }

    public destroy(): void {
        this.responsiveManager.destroy();
        this.pixiTimer.destroy();
        gsap.killTweensOf("*");
        this.app.destroy(true);
    }
}
