import * as PIXI from 'pixi.js';
import { Reel } from './Reel';
import { ResponsiveManager } from '../utils/ResponsiveManager';
import { PixiTimer } from '../utils/PixiTimer';

export class SlotMachine {
    public container: PIXI.Container;
    private reels: Reel[] = [];
    private readonly REEL_COUNT = 3;
    private readonly SYMBOL_COUNT = 3;
    private reelWidth: number = 100;
    private symbolHeight: number = 100;
    private background: PIXI.Graphics;

    constructor(
        private app: PIXI.Application,
        private responsiveManager: ResponsiveManager,
        private pixiTimer: PixiTimer
    ) {
        this.container = new PIXI.Container();
        this.updateSizes();
    }

    private updateSizes(): void {
        const scale = this.responsiveManager.getScale();
        this.reelWidth = Math.floor(120 * scale);
        this.symbolHeight = Math.floor(100 * scale);
    }

    public async init(): Promise<void> {
        this.createBackground();
        
        this.createReels();
        
        this.updateLayout();
    }

    private createBackground(): void {
        this.background = new PIXI.Graphics();
        this.drawBackground();
        this.container.addChild(this.background);
    }

    private drawBackground(): void {
        this.background.clear();
        
        const totalWidth = this.REEL_COUNT * this.reelWidth + 25;
        const totalHeight = this.SYMBOL_COUNT * this.symbolHeight + 40;
        
        this.background.beginFill(0x2c2c54);
        this.background.drawRoundedRect(0, 0, totalWidth, totalHeight, 15);
        this.background.endFill();

        this.background.lineStyle(4, 0xFFD700);
        this.background.drawRoundedRect(10, 10, totalWidth - 20, totalHeight - 20, 10);
    }

    private createReels(): void {
        for (let i = 0; i < this.REEL_COUNT; i++) {
            const reel = new Reel(this.app, this.symbolHeight, this.SYMBOL_COUNT, this.responsiveManager, this.pixiTimer);
            reel.container.position.set(20 + i * this.reelWidth, 20);
            
            this.reels.push(reel);
            this.container.addChild(reel.container);
        }
    }

    public updateLayout(): void {
        this.updateSizes();
        this.drawBackground();
        
        this.reels.forEach((reel, i) => {
            reel.container.position.set(20 + i * this.reelWidth, 20);
            reel.updateSize(this.symbolHeight);
        });
        
        const uiLayout = this.responsiveManager.getUILayout();
        const slotMachineWidth = this.container.width;
        const slotMachineHeight = this.container.height;
        
        let centerX: number;
        let centerY: number;
        
        if (uiLayout === 'side') {
            const uiWidth = this.responsiveManager.getUIWidth();
            const availableWidth = this.app.screen.width - uiWidth;
            
            centerX = availableWidth / 2 - slotMachineWidth / 2;
            centerY = (this.app.screen.height - slotMachineHeight) / 2;
        } else {
            const uiHeight = this.responsiveManager.getUIHeight();
            const availableHeight = this.app.screen.height - uiHeight;
            
            centerX = (this.app.screen.width - slotMachineWidth) / 2;
            centerY = availableHeight / 2 - slotMachineHeight / 2;
        }
        
        this.container.position.set(centerX, centerY);
    }

    public async spin(): Promise<number[][]> {
        const spinPromises = this.reels.map((reel, index) => {
            return new Promise<number[]>((resolve) => {
                this.pixiTimer.setTimeout(() => {
                    reel.spin().then(resolve);
                }, index * 200); 
            });
        });

        const results = await Promise.all(spinPromises);
        
        const formattedResult: number[][] = [];
        for (let reelIndex = 0; reelIndex < results.length; reelIndex++) {
            formattedResult[reelIndex] = results[reelIndex];
        }

        return formattedResult;
    }

    public getReels(): Reel[] {
        return this.reels;
    }
}
