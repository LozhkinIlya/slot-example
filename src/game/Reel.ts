import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { Symbol } from './Symbol';
import { ResponsiveManager } from '../utils/ResponsiveManager';
import { PixiTimer } from '../utils/PixiTimer';

export class Reel {
    public container: PIXI.Container;
    private symbols: Symbol[] = [];
    private mask: PIXI.Graphics;
    private isSpinning: boolean = false;
    
    private readonly SYMBOL_TYPES = 5; 
    private readonly EXTRA_SYMBOLS = 10;

    constructor(
        private app: PIXI.Application,
        private symbolHeight: number,
        private visibleSymbols: number,
        private responsiveManager: ResponsiveManager,
        private pixiTimer: PixiTimer
    ) {
        this.container = new PIXI.Container();
        this.init();
    }

    private init(): void {
        this.createMask();
        this.createSymbols();
    }

    private createMask(): void {
        this.mask = new PIXI.Graphics();
        this.updateMask();
        this.container.addChild(this.mask);
        this.container.mask = this.mask;
    }

    private updateMask(): void {
        const symbolWidth = this.symbolHeight;
        this.mask.clear();
        this.mask.beginFill(0xFFFFFF);
        this.mask.drawRect(0, 0, symbolWidth, this.visibleSymbols * this.symbolHeight);
        this.mask.endFill();
    }

    public updateSize(newSymbolHeight: number): void {
        this.symbolHeight = newSymbolHeight;
        this.updateMask();
        
        this.symbols.forEach((symbol, index) => {
            symbol.updateSize(this.symbolHeight);
            symbol.container.position.set(0, index * this.symbolHeight);
        });
    }

    private createSymbols(): void {
        const totalSymbols = this.visibleSymbols + this.EXTRA_SYMBOLS;
        
        for (let i = 0; i < totalSymbols; i++) {
            const symbolType = Math.floor(Math.random() * this.SYMBOL_TYPES);
            const symbol = new Symbol(symbolType, this.symbolHeight, this.responsiveManager);
            
            symbol.container.position.set(0, i * this.symbolHeight);
            this.symbols.push(symbol);
            this.container.addChild(symbol.container);
        }
    }

    public async spin(): Promise<number[]> {
        if (this.isSpinning) return this.getVisibleSymbolTypes();

        this.isSpinning = true;
        
        return new Promise((resolve) => {
            const spinDuration = 1.5 + Math.random() * 1;
            const finalSymbols: number[] = [];

            for (let i = 0; i < this.visibleSymbols; i++) {
                finalSymbols.push(Math.floor(Math.random() * this.SYMBOL_TYPES));
            }

            const tl = gsap.timeline({
                onComplete: () => {
                    this.isSpinning = false;
                    this.alignSymbols(finalSymbols);
                    resolve(finalSymbols);
                }
            });

            const blurFilter = new PIXI.BlurFilter();
            this.container.filters = [blurFilter];

            tl.to(blurFilter, {
                duration: 0.2,
                blur: 8,
                ease: "power2.out"
            })
            .to(blurFilter, {
                duration: 0.3,
                blur: 0,
                ease: "power2.in"
            }, spinDuration - 0.3);

            let currentOffset = 0;
            const totalDistance = (this.visibleSymbols + this.EXTRA_SYMBOLS) * this.symbolHeight * 3;

            tl.to({}, {
                duration: spinDuration,
                ease: "power3.out",
                onUpdate: () => {
                    const progress = tl.progress();
                    const newOffset = totalDistance * progress;
                    const deltaY = newOffset - currentOffset;
                    currentOffset = newOffset;

                    this.symbols.forEach(symbol => {
                        symbol.container.y += deltaY;
                        
                        const maxY = (this.visibleSymbols + this.EXTRA_SYMBOLS) * this.symbolHeight;
                        if (symbol.container.y >= maxY) {
                            symbol.container.y -= maxY;
                            
                            if (progress > 0.8) {
                                const visibleIndex = Math.floor(symbol.container.y / this.symbolHeight);
                                if (visibleIndex < this.visibleSymbols) {
                                    symbol.setType(finalSymbols[visibleIndex]);
                                }
                            } else {
                                symbol.setType(Math.floor(Math.random() * this.SYMBOL_TYPES));
                            }
                        }
                    });
                }
            }, 0);

            tl.call(() => {
                this.container.filters = null;
            });
        });
    }

    private alignSymbols(finalSymbols: number[]): void {
        for (let i = 0; i < this.visibleSymbols; i++) {
            if (this.symbols[i]) {
                this.symbols[i].container.y = i * this.symbolHeight;
                this.symbols[i].setType(finalSymbols[i]);
            }
        }
    }

    private getVisibleSymbolTypes(): number[] {
        const result: number[] = [];
        for (let i = 0; i < this.visibleSymbols; i++) {
            if (this.symbols[i]) {
                result.push(this.symbols[i].getType());
            }
        }
        return result;
    }

    public getVisibleSymbols(): Symbol[] {
        return this.symbols.slice(0, this.visibleSymbols);
    }
}
