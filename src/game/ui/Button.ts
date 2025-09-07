import * as PIXI from 'pixi.js';
import { ResponsiveManager } from '../../utils/ResponsiveManager';

export class Button {
    public container: PIXI.Container;
    private background: PIXI.Graphics;
    private text: PIXI.Text;
    private isEnabled: boolean = true;
    private baseColor: number;
    private hoverColor: number;
    private disabledColor: number = 0x666666;
    private originalWidth: number;
    private originalHeight: number;
    
    public onClick: () => void = () => {};

    constructor(
        labelText: string,
        width: number = 100,
        height: number = 40,
        color: number = 0x3498DB,
        private responsiveManager?: ResponsiveManager
    ) {
        this.container = new PIXI.Container();
        this.baseColor = color;
        this.hoverColor = this.lightenColor(color, 0.2);
        this.originalWidth = width;
        this.originalHeight = height;
        
        this.createBackground(width, height);
        this.createText(labelText);
        this.setupInteraction();
        
        this.container.pivot.set(width / 2, height / 2);
    }

    private createBackground(width: number, height: number): void {
        this.background = new PIXI.Graphics();
        this.drawBackground(width, height, this.baseColor);
        this.container.addChild(this.background);
    }

    private drawBackground(width: number, height: number, color: number): void {
        this.background.clear();
        
        this.background.beginFill(color);
        this.background.drawRoundedRect(0, 0, width, height, 8);
        this.background.endFill();
        
        this.background.lineStyle(2, this.lightenColor(color, 0.3));
        this.background.drawRoundedRect(1, 1, width - 2, height - 2, 6);
        
        this.background.beginFill(0xFFFFFF, 0.2);
        this.background.drawRoundedRect(2, 2, width - 4, height / 3, 4);
        this.background.endFill();
    }

    private createText(labelText: string): void {
        const fontSize = this.responsiveManager 
            ? this.responsiveManager.getFontSize(16)
            : 16;
            
        this.text = new PIXI.Text(labelText, {
            fontSize,
            fill: 0xFFFFFF,
            fontWeight: 'bold',
            align: 'center'
        });
        
        this.text.anchor.set(0.5);
        this.centerText();
        this.container.addChild(this.text);
    }

    private centerText(): void {
        this.text.position.set(this.originalWidth / 2, this.originalHeight / 2);
    }

    private setupInteraction(): void {
        this.container.eventMode = 'static';
        this.container.cursor = 'pointer';
        
        this.container.on('pointerdown', this.onPointerDown.bind(this));
        this.container.on('pointerup', this.onPointerUp.bind(this));
        this.container.on('pointerover', this.onPointerOver.bind(this));
        this.container.on('pointerout', this.onPointerOut.bind(this));
        this.container.on('pointerupoutside', this.onPointerUp.bind(this));
    }

    private onPointerDown(): void {
        if (!this.isEnabled) return;
        
        this.container.scale.set(0.95);
        this.drawBackground(this.originalWidth, this.originalHeight, this.darkenColor(this.baseColor, 0.2));
    }

    private onPointerUp(): void {
        if (!this.isEnabled) return;
        
        this.container.scale.set(1);
        this.drawBackground(this.originalWidth, this.originalHeight, this.hoverColor);
        this.onClick();
    }

    private onPointerOver(): void {
        if (!this.isEnabled) return;
        
        this.drawBackground(this.originalWidth, this.originalHeight, this.hoverColor);
    }

    private onPointerOut(): void {
        if (!this.isEnabled) return;
        
        this.container.scale.set(1);
        this.drawBackground(this.originalWidth, this.originalHeight, this.baseColor);
    }

    public setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        
        if (enabled) {
            this.container.eventMode = 'static';
            this.container.cursor = 'pointer';
            this.container.alpha = 1;
            this.drawBackground(this.originalWidth, this.originalHeight, this.baseColor);
        } else {
            this.container.eventMode = 'none';
            this.container.cursor = 'default';
            this.container.alpha = 0.6;
            this.drawBackground(this.originalWidth, this.originalHeight, this.disabledColor);
        }
    }

    public setText(newText: string): void {
        this.text.text = newText;
        this.centerText();
    }

    public getText(): string {
        return this.text.text;
    }

    private lightenColor(color: number, amount: number): number {
        const r = Math.min(255, Math.floor((color >> 16) + (255 - (color >> 16)) * amount));
        const g = Math.min(255, Math.floor(((color >> 8) & 0xFF) + (255 - ((color >> 8) & 0xFF)) * amount));
        const b = Math.min(255, Math.floor((color & 0xFF) + (255 - (color & 0xFF)) * amount));
        return (r << 16) | (g << 8) | b;
    }

    private darkenColor(color: number, amount: number): number {
        const r = Math.floor((color >> 16) * (1 - amount));
        const g = Math.floor(((color >> 8) & 0xFF) * (1 - amount));
        const b = Math.floor((color & 0xFF) * (1 - amount));
        return (r << 16) | (g << 8) | b;
    }
}
