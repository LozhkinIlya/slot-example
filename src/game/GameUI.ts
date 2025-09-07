import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { GameState } from './GameState';
import { Button } from './ui/Button';
import { ResponsiveManager } from '../utils/ResponsiveManager';
import { PixiTimer } from '../utils/PixiTimer';

export class GameUI {
    public container: PIXI.Container;
    private gameState: GameState;

    private background: PIXI.Graphics;
    private balanceText: PIXI.Text;
    private betText: PIXI.Text;
    private spinButton: Button;
    private increaseBetButton: Button;
    private decreaseBetButton: Button;

    public onSpin: () => void = () => {};
    public onBetChange: (bet: number) => void = () => {};

    constructor(
        private app: PIXI.Application, 
        gameState: GameState,
        private responsiveManager: ResponsiveManager,
        private pixiTimer: PixiTimer
    ) {
        this.container = new PIXI.Container();
        this.gameState = gameState;
    }

    public async init(): Promise<void> {
        this.createBackground();
        this.updateLayout(); 
        this.updateUI();
    }

    private createBackground(): void {
        this.background = new PIXI.Graphics();
        this.drawBackground();
        this.container.addChild(this.background);
    }

    private drawBackground(): void {
        const config = this.responsiveManager.getConfig();
        const uiWidth = this.responsiveManager.getUIWidth();
        const uiHeight = this.responsiveManager.getUIHeight();
        
        this.background.clear();
        this.background.beginFill(0x16213E, 0.9);
        this.background.drawRoundedRect(0, 0, uiWidth, uiHeight, 10);
        this.background.endFill();

        this.background.lineStyle(2, 0xFFD700);
        this.background.drawRoundedRect(5, 5, uiWidth - 10, uiHeight - 10, 8);
    }

    private createBalanceDisplay(): void {
        const config = this.responsiveManager.getConfig();
        const scale = this.responsiveManager.getUIScale();
        const margin = config.isMobile ? 20 : 50;
        
        const balanceLabel = new PIXI.Text('BALANCE', {
            fontSize: this.responsiveManager.getFontSize(18),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        balanceLabel.position.set(margin, config.isMobile ? 15 : 20);
        this.container.addChild(balanceLabel);

        this.balanceText = new PIXI.Text('1000', {
            fontSize: this.responsiveManager.getFontSize(32),
            fill: 0x4ECDC4,
            fontWeight: 'bold'
        });
        this.balanceText.position.set(margin, config.isMobile ? 35 : 45);
        this.container.addChild(this.balanceText);

        const currencyText = new PIXI.Text('FUN', {
            fontSize: this.responsiveManager.getFontSize(14),
            fill: 0xCCCCCC
        });
        currencyText.position.set(margin, config.isMobile ? 65 : 85);
        this.container.addChild(currencyText);
    }

    private createBetControls(): void {
        const config = this.responsiveManager.getConfig();
        const centerX = config.width / 2;
        const buttonSize = this.responsiveManager.getButtonSize(40, 40);
        
        const betLabel = new PIXI.Text('BET', {
            fontSize: this.responsiveManager.getFontSize(18),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        betLabel.anchor.set(0.5, 0);
        betLabel.position.set(centerX, config.isMobile ? 15 : 20);
        this.container.addChild(betLabel);

        this.decreaseBetButton = new Button('-', buttonSize.width, buttonSize.height, 0xFF6B6B, this.responsiveManager);
        this.decreaseBetButton.container.position.set(centerX - buttonSize.width - 30, config.isMobile ? 40 : 50);
        this.decreaseBetButton.onClick = () => {
            if (this.gameState.decreaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.decreaseBetButton.container);

        this.betText = new PIXI.Text('10', {
            fontSize: this.responsiveManager.getFontSize(24),
            fill: 0xFFD93D,
            fontWeight: 'bold'
        });
        this.betText.anchor.set(0.5);
        this.betText.position.set(centerX, config.isMobile ? 60 : 70);
        this.container.addChild(this.betText);

        this.increaseBetButton = new Button('+', buttonSize.width, buttonSize.height, 0x4ECDC4, this.responsiveManager);
        this.increaseBetButton.container.position.set(centerX + 30, config.isMobile ? 40 : 50);
        this.increaseBetButton.onClick = () => {
            if (this.gameState.increaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.increaseBetButton.container);
    }

    private createSpinButton(): void {
        const config = this.responsiveManager.getConfig();
        const buttonSize = this.responsiveManager.getButtonSize(150, 60);
        const margin = config.isMobile ? 20 : 50;
        
        this.spinButton = new Button('SPIN', buttonSize.width, buttonSize.height, 0x2ECC71, this.responsiveManager);
        this.spinButton.container.position.set(
            config.width - buttonSize.width - margin, 
            config.isMobile ? 35 : 45
        );
        this.spinButton.onClick = () => {
            if (this.gameState.canSpin()) {
                this.onSpin();
            }
        };
        this.container.addChild(this.spinButton.container);
    }

    public updateLayout(): void {
        this.drawBackground();
        
        const config = this.responsiveManager.getConfig();
        const uiLayout = this.responsiveManager.getUILayout();
        
        if (uiLayout === 'bottom') {
            const uiHeight = this.responsiveManager.getUIHeight();
            this.container.position.set(0, this.app.screen.height - uiHeight);
        } else {
            const uiWidth = this.responsiveManager.getUIWidth();
            this.container.position.set(this.app.screen.width - uiWidth, 0);
        }

        this.repositionUIElements();
    }
    
    private repositionUIElements(): void {
        const config = this.responsiveManager.getConfig();
        const uiLayout = this.responsiveManager.getUILayout();
        const uiWidth = this.responsiveManager.getUIWidth();
        const uiHeight = this.responsiveManager.getUIHeight();
        
        this.container.removeChildren();
        this.container.addChild(this.background);
        
        if (uiLayout === 'side') {
            this.createSideLayout();
        } else {
            this.createBottomLayout();
        }
    }
    
    private createSideLayout(): void {
        const uiWidth = this.responsiveManager.getUIWidth();
        const balanceMargin = 50;
        const margin = 20;
        const verticalSpacing = 80;
        let currentY = margin;
        const centerX = uiWidth / 2;
        
        const balanceLabel = new PIXI.Text('BALANCE', {
            fontSize: this.responsiveManager.getFontSize(16),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        balanceLabel.anchor.set(0.5, 0.5);
        balanceLabel.position.set(centerX, currentY + balanceLabel.height / 2);
        this.container.addChild(balanceLabel);
        
        this.balanceText = new PIXI.Text('1000', {
            fontSize: this.responsiveManager.getFontSize(28),
            fill: 0x4ECDC4,
            fontWeight: 'bold'
        });
        this.balanceText.anchor.set(0.5, 0.5);
        this.balanceText.position.set(centerX, currentY + 25 + this.balanceText.height / 2);
        this.container.addChild(this.balanceText);
        
        const currencyText = new PIXI.Text('FUN', {
            fontSize: this.responsiveManager.getFontSize(12),
            fill: 0xCCCCCC
        });
        currencyText.anchor.set(0.5, 0.5);
        currencyText.position.set(centerX, currentY + 55 + currencyText.height / 2);
        this.container.addChild(currencyText);
        
        currentY += verticalSpacing;
        
        const betLabel = new PIXI.Text('BET', {
            fontSize: this.responsiveManager.getFontSize(16),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        betLabel.anchor.set(0.5, 0.5); 
        betLabel.position.set(centerX, currentY + betLabel.height / 2); 
        this.container.addChild(betLabel);
        
        const buttonSize = this.responsiveManager.getButtonSize(35, 35);
        const betControlsY = currentY + 30 + buttonSize.height / 2;
        const spacing = 30;
        
        this.decreaseBetButton = new Button('-', buttonSize.width, buttonSize.height, 0xFF6B6B, this.responsiveManager);
        this.decreaseBetButton.container.position.set(centerX - spacing - buttonSize.width / 2, betControlsY);
        this.decreaseBetButton.onClick = () => {
            if (this.gameState.decreaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.decreaseBetButton.container);
        
        this.betText = new PIXI.Text('10', {
            fontSize: this.responsiveManager.getFontSize(20),
            fill: 0xFFD93D,
            fontWeight: 'bold'
        });
        this.betText.anchor.set(0.5, 0.5);
        this.betText.position.set(centerX, betControlsY);
        this.container.addChild(this.betText);
        
        this.increaseBetButton = new Button('+', buttonSize.width, buttonSize.height, 0x4ECDC4, this.responsiveManager);
        this.increaseBetButton.container.position.set(centerX + spacing + buttonSize.width / 2, betControlsY);
        this.increaseBetButton.onClick = () => {
            if (this.gameState.increaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.increaseBetButton.container);
        
        currentY += verticalSpacing + 20;

        const spinButtonSize = this.responsiveManager.getButtonSize(180, 50);
        this.spinButton = new Button('SPIN', spinButtonSize.width, spinButtonSize.height, 0x2ECC71, this.responsiveManager);
        this.spinButton.container.position.set(
            centerX,
            currentY + spinButtonSize.height / 2 
        );
        this.spinButton.onClick = () => {
            if (this.gameState.canSpin()) {
                this.onSpin();
            }
        };
        this.container.addChild(this.spinButton.container);
    }
    
    private createBottomLayout(): void {
        const config = this.responsiveManager.getConfig();
        const margin = config.isMobile ? 20 : 50;

        const balanceLabel = new PIXI.Text('BALANCE', {
            fontSize: this.responsiveManager.getFontSize(18),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        balanceLabel.position.set(margin, config.isMobile ? 15 : 20);
        this.container.addChild(balanceLabel);

        this.balanceText = new PIXI.Text('1000', {
            fontSize: this.responsiveManager.getFontSize(32),
            fill: 0x4ECDC4,
            fontWeight: 'bold'
        });
        this.balanceText.position.set(margin, config.isMobile ? 35 : 45);
        this.container.addChild(this.balanceText);

        const currencyText = new PIXI.Text('FUN', {
            fontSize: this.responsiveManager.getFontSize(14),
            fill: 0xCCCCCC
        });
        currencyText.position.set(margin, config.isMobile ? 65 : 85);
        this.container.addChild(currencyText);
        
        const centerX = config.width / 2;
        const buttonSize = this.responsiveManager.getButtonSize(40, 40);
        
        const betLabel = new PIXI.Text('BET', {
            fontSize: this.responsiveManager.getFontSize(18),
            fill: 0xFFFFFF,
            fontWeight: 'bold'
        });
        betLabel.anchor.set(0.5, 0);
        betLabel.position.set(centerX, config.isMobile ? 15 : 20);
        this.container.addChild(betLabel);

        this.decreaseBetButton = new Button('-', buttonSize.width, buttonSize.height, 0xFF6B6B, this.responsiveManager);
        this.decreaseBetButton.container.position.set(centerX - 30 - buttonSize.width / 2, (config.isMobile ? 40 : 50) + buttonSize.height / 2);
        this.decreaseBetButton.onClick = () => {
            if (this.gameState.decreaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.decreaseBetButton.container);

        this.betText = new PIXI.Text('10', {
            fontSize: this.responsiveManager.getFontSize(24),
            fill: 0xFFD93D,
            fontWeight: 'bold'
        });
        this.betText.anchor.set(0.5);
        this.betText.position.set(centerX, config.isMobile ? 60 : 70);
        this.container.addChild(this.betText);

        this.increaseBetButton = new Button('+', buttonSize.width, buttonSize.height, 0x4ECDC4, this.responsiveManager);
        this.increaseBetButton.container.position.set(centerX + 30 + buttonSize.width / 2, (config.isMobile ? 40 : 50) + buttonSize.height / 2);
        this.increaseBetButton.onClick = () => {
            if (this.gameState.increaseBet()) {
                this.onBetChange(this.gameState.getCurrentBet());
                this.updateUI();
            }
        };
        this.container.addChild(this.increaseBetButton.container);
        
        const spinButtonSize = this.responsiveManager.getButtonSize(150, 60);
        this.spinButton = new Button('SPIN', spinButtonSize.width, spinButtonSize.height, 0x2ECC71, this.responsiveManager);
        this.spinButton.container.position.set(
            config.width - margin - spinButtonSize.width / 2, 
            (config.isMobile ? 35 : 45) + spinButtonSize.height / 2
        );
        this.spinButton.onClick = () => {
            if (this.gameState.canSpin()) {
                this.onSpin();
            }
        };
        this.container.addChild(this.spinButton.container);
    }

    public updateUI(): void {
        this.balanceText.text = this.gameState.getBalance().toString();
        
        this.betText.text = this.gameState.getCurrentBet().toString();
        
        const canSpin = this.gameState.canSpin();
        this.spinButton.setEnabled(canSpin);
        
        if (this.gameState.isCurrentlySpinning()) {
            this.spinButton.setText('SPINNING');
        } else {
            this.spinButton.setText('PLAY');
        }

        this.decreaseBetButton.setEnabled(this.gameState.canDecreaseBet());
        this.increaseBetButton.setEnabled(this.gameState.canIncreaseBet());
    }

    public showWinMessage(amount: number): void {
        const config = this.responsiveManager.getConfig();
        const fontSize = this.responsiveManager.getFontSize(24);
        
        const winText = new PIXI.Text(`YOU WON: ${amount}`, {
            fontSize,
            fill: 0xFFD700,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 2
        });
        
        winText.anchor.set(0.5);
        winText.position.set(config.width / 2, config.isMobile ? 60 : 75);
        winText.alpha = 0;
        winText.scale.set(0.5);
        
        this.container.addChild(winText);
        
        const tl = gsap.timeline({
            onComplete: () => {
                this.container.removeChild(winText);
            }
        });

        tl.to(winText, {
            duration: 0.6,
            alpha: 1,
            ease: "back.out(1.7)"
        })
        .to(winText.scale, {
            duration: 0.6,
            x: 1,
            y: 1,
            ease: "back.out(1.7)"
        }, 0)
        .to(winText, {
            duration: 0.3,
            alpha: 0.7,
            yoyo: true,
            repeat: 2,
            ease: "power2.inOut"
        }, "+=1")
        .to(winText, {
            duration: 0.5,
            alpha: 0,
            y: winText.y - 30,
            ease: "power2.in"
        }, "+=0.5");
    }
}
