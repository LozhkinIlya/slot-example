import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { ResponsiveManager } from '../utils/ResponsiveManager';

export class Symbol {
    public container: PIXI.Container;
    private graphic: PIXI.Graphics;
    private text: PIXI.Text;
    private symbolType: number;
    private symbolSize: number;

    private static readonly SYMBOLS = [
        { emoji: '🍒', color: 0xFF6B6B, name: 'Cherry' },
        { emoji: '🍋', color: 0xFFD93D, name: 'Lemon' },
        { emoji: '🍊', color: 0xFF8C42, name: 'Orange' },
        { emoji: '🍇', color: 0x9B59B6, name: 'Grape' },
        { emoji: '⭐', color: 0xFFD700, name: 'Star' }
    ];

    constructor(
        type: number = 0, 
        symbolSize: number = 100,
        private responsiveManager?: ResponsiveManager
    ) {
        this.container = new PIXI.Container();
        this.symbolType = type;
        this.symbolSize = symbolSize;
        this.init();
    }

    private init(): void {
        this.graphic = new PIXI.Graphics();
        this.container.addChild(this.graphic);

        const fontSize = this.responsiveManager 
            ? this.responsiveManager.getFontSize(Math.floor(this.symbolSize * 0.6))
            : Math.floor(this.symbolSize * 0.6);
            
        this.text = new PIXI.Text('', {
            fontSize,
            align: 'center'
        });
        this.text.anchor.set(0.5);
        this.text.position.set(this.symbolSize / 2, this.symbolSize / 2);
        this.container.addChild(this.text);

        this.updateVisual();
    }

    private updateVisual(): void {
        const symbol = Symbol.SYMBOLS[this.symbolType] || Symbol.SYMBOLS[0];
        const padding = 10;
        const actualSize = this.symbolSize - padding; 
        
        this.graphic.clear();
        
        this.graphic.beginFill(0xF8F9FA);
        this.graphic.lineStyle(2, symbol.color);
        this.graphic.drawRoundedRect(padding / 2, padding / 2, actualSize, actualSize, 8);
        this.graphic.endFill();

        this.graphic.beginFill(symbol.color, 0.1);
        this.graphic.drawRoundedRect(padding / 2 + 2, padding / 2 + 2, actualSize - 4, actualSize - 4, 6);
        this.graphic.endFill();

        this.text.text = symbol.emoji;
        this.text.style.fill = symbol.color;
        this.text.position.set(this.symbolSize / 2, this.symbolSize / 2);
    }

    public setType(type: number): void {
        if (type >= 0 && type < Symbol.SYMBOLS.length) {
            this.symbolType = type;
            this.updateVisual();
        }
    }

    public updateSize(newSize: number): void {
        this.symbolSize = newSize;
        
        const fontSize = this.responsiveManager 
            ? this.responsiveManager.getFontSize(Math.floor(this.symbolSize * 0.6))
            : Math.floor(this.symbolSize * 0.6);
        this.text.style.fontSize = fontSize;
        this.text.position.set(this.symbolSize / 2, this.symbolSize / 2);
        
        this.updateVisual();
    }

    public getType(): number {
        return this.symbolType;
    }

    public getSymbolInfo() {
        return Symbol.SYMBOLS[this.symbolType] || Symbol.SYMBOLS[0];
    }

    public playWinAnimation(): void {
        const tl = gsap.timeline({ repeat: 2, yoyo: true });
        
        tl.to(this.container.scale, {
            duration: 0.3,
            x: 1.2,
            y: 1.2,
            ease: "back.out(1.7)"
        })
        .to(this.container, {
            duration: 0.2,
            rotation: Math.PI * 0.1,
            ease: "power2.inOut"
        }, 0)
        .to(this.container, {
            duration: 0.2,
            rotation: -Math.PI * 0.1,
            ease: "power2.inOut"
        }, 0.2)
        .to(this.container, {
            duration: 0.1,
            rotation: 0,
            ease: "power2.out"
        }, 0.4);
    }
}
