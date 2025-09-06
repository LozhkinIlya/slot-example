export class GameState {
    private balance: number = 1000;
    private currentBet: number = 10;
    private isSpinning: boolean = false;
    private minBet: number = 1;
    private maxBet: number = 100;

    constructor() {}

    public getBalance(): number {
        return this.balance;
    }

    public getCurrentBet(): number {
        return this.currentBet;
    }

    public setBet(amount: number): void {
        if (amount >= this.minBet && amount <= this.maxBet && amount <= this.balance) {
            this.currentBet = amount;
        }
    }

    public canSpin(): boolean {
        return !this.isSpinning && this.balance >= this.currentBet;
    }

    public startSpin(): void {
        if (this.canSpin()) {
            this.isSpinning = true;
            this.balance -= this.currentBet;
        }
    }

    public endSpin(): void {
        this.isSpinning = false;
    }

    public addWin(amount: number): void {
        this.balance += amount;
    }

    public isCurrentlySpinning(): boolean {
        return this.isSpinning;
    }

    public getMinBet(): number {
        return this.minBet;
    }

    public getMaxBet(): number {
        return this.maxBet;
    }
}
