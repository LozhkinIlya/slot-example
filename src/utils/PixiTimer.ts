import * as PIXI from 'pixi.js';

export class PixiTimer {
    private app: PIXI.Application;
    private timers: Map<string, { elapsed: number; duration: number; callback: () => void; repeat: boolean }> = new Map();
    private isRunning: boolean = false;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.startTimer();
    }

    private startTimer(): void {
        if (this.isRunning) return;
        this.isRunning = true;

        const update = () => {
            const deltaMS = this.app.ticker.deltaMS;
            
            for (const [id, timer] of this.timers.entries()) {
                timer.elapsed += deltaMS;
                
                if (timer.elapsed >= timer.duration) {
                    timer.callback();
                    
                    if (timer.repeat) {
                        timer.elapsed = 0;
                    } else {
                        this.timers.delete(id);
                    }
                }
            }

            if (this.timers.size === 0) {
                this.isRunning = false;
                this.app.ticker.remove(update);
            }
        };

        this.app.ticker.add(update);
    }

    public setTimeout(callback: () => void, delay: number, id?: string): string {
        const timerId = id || `timer_${Date.now()}_${Math.random()}`;
        
        this.timers.set(timerId, {
            elapsed: 0,
            duration: delay,
            callback,
            repeat: false
        });

        if (!this.isRunning) {
            this.startTimer();
        }

        return timerId;
    }

    public setInterval(callback: () => void, delay: number, id?: string): string {
        const timerId = id || `interval_${Date.now()}_${Math.random()}`;
        
        this.timers.set(timerId, {
            elapsed: 0,
            duration: delay,
            callback,
            repeat: true
        });

        if (!this.isRunning) {
            this.startTimer();
        }

        return timerId;
    }

    public clearTimer(id: string): void {
        this.timers.delete(id);
    }

    public clearAllTimers(): void {
        this.timers.clear();
    }

    public destroy(): void {
        this.clearAllTimers();
        this.isRunning = false;
    }
}
