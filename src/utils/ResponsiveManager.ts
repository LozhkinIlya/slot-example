import * as PIXI from 'pixi.js';

export interface DeviceConfig {
    width: number;
    height: number;
    scale: number;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

export class ResponsiveManager {
    private app: PIXI.Application;
    private config: DeviceConfig;
    private onResizeCallbacks: Array<(config: DeviceConfig) => void> = [];

    constructor(app: PIXI.Application) {
        this.app = app;
        this.config = this.calculateConfig();
        this.setupResizeListener();
        this.updateAppSize();
    }

    private calculateConfig(): DeviceConfig {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = width / height;
        
        const isMobile = width <= 768;
        const isTablet = width > 768 && width <= 1024;
        const isDesktop = width > 1024;

        const baseWidth = 800;
        const baseHeight = 600;

        let gameWidth: number;
        let gameHeight: number;
        let scale: number;

        if (isMobile) {
            if (aspectRatio > baseWidth / baseHeight) {
                gameHeight = Math.min(height * 0.9, baseHeight);
                gameWidth = gameHeight * (baseWidth / baseHeight);
                scale = gameHeight / baseHeight;
            } else {
                gameWidth = Math.min(width * 0.95, baseWidth);
                gameHeight = gameWidth * (baseHeight / baseWidth);
                scale = gameWidth / baseWidth;
            }
        } else if (isTablet) {
            const maxScale = Math.min(width / baseWidth, height / baseHeight) * 0.8;
            scale = Math.min(maxScale, 1.2);
            gameWidth = baseWidth * scale;
            gameHeight = baseHeight * scale;
        } else {
            const maxScale = Math.min(width / baseWidth, height / baseHeight) * 0.7;
            scale = Math.min(maxScale, 1.5);
            gameWidth = baseWidth * scale;
            gameHeight = baseHeight * scale;
        }

        return {
            width: Math.floor(gameWidth),
            height: Math.floor(gameHeight),
            scale,
            isMobile,
            isTablet,
            isDesktop
        };
    }

    private setupResizeListener(): void {
        window.addEventListener('resize', () => {
            this.config = this.calculateConfig();
            this.updateAppSize();
            this.notifyResizeCallbacks();
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.config = this.calculateConfig();
                this.updateAppSize();
                this.notifyResizeCallbacks();
            }, 100);
        });
    }

    private updateAppSize(): void {
        this.app.renderer.resize(this.config.width, this.config.height);
        
        const canvas = this.app.view as HTMLCanvasElement;
        canvas.style.position = 'absolute';
        canvas.style.left = '50%';
        canvas.style.top = '50%';
        canvas.style.transform = 'translate(-50%, -50%)';
        canvas.style.maxWidth = '100vw';
        canvas.style.maxHeight = '100vh';
    }

    private notifyResizeCallbacks(): void {
        this.onResizeCallbacks.forEach(callback => {
            callback(this.config);
        });
    }

    public onResize(callback: (config: DeviceConfig) => void): void {
        this.onResizeCallbacks.push(callback);
        callback(this.config);
    }

    public getConfig(): DeviceConfig {
        return { ...this.config };
    }

    public getScale(): number {
        return this.config.scale;
    }

    public isMobile(): boolean {
        return this.config.isMobile;
    }

    public isTablet(): boolean {
        return this.config.isTablet;
    }

    public isDesktop(): boolean {
        return this.config.isDesktop;
    }

    public getUIScale(): number {
        if (this.config.isMobile) {
            return Math.max(0.7, this.config.scale * 0.8);
        }
        return this.config.scale;
    }

    public getFontSize(baseSize: number): number {
        return Math.floor(baseSize * this.getUIScale());
    }

    public getButtonSize(baseWidth: number, baseHeight: number): { width: number; height: number } {
        const scale = this.getUIScale();
        return {
            width: Math.floor(baseWidth * scale),
            height: Math.floor(baseHeight * scale)
        };
    }

    public destroy(): void {
        this.onResizeCallbacks = [];
        window.removeEventListener('resize', this.setupResizeListener);
        window.removeEventListener('orientationchange', this.setupResizeListener);
    }
}
