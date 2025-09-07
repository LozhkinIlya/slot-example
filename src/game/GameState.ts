export class GameState {
    private balance: number = 1000;
    private betIndex: number = 0;
    private isSpinning: boolean = false;
    private readonly betAmounts: number[] = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    constructor() {}

    public getBalance(): number {
        return this.balance;
    }

    public getCurrentBet(): number {
        return this.betAmounts[this.betIndex];
    }

    public getBetIndex(): number {
        return this.betIndex;
    }

    public setBetIndex(index: number): void {
        if (index >= 0 && index < this.betAmounts.length) {
            this.betIndex = index;
        }
    }

    public increaseBet(): boolean {
        const nextIndex = this.betIndex + 1;
        if (nextIndex < this.betAmounts.length && this.betAmounts[nextIndex] <= this.balance) {
            this.betIndex = nextIndex;
            return true;
        }
        return false;
    }

    public decreaseBet(): boolean {
        const prevIndex = this.betIndex - 1;
        if (prevIndex >= 0) {
            this.betIndex = prevIndex;
            return true;
        }
        return false;
    }

    public canIncreaseBet(): boolean {
        const nextIndex = this.betIndex + 1;
        return nextIndex < this.betAmounts.length && this.betAmounts[nextIndex] <= this.balance;
    }

    public canDecreaseBet(): boolean {
        return this.betIndex > 0;
    }

    public canSpin(): boolean {
        return !this.isSpinning && this.balance >= this.getCurrentBet();
    }

    public startSpin(): void {
        if (this.canSpin()) {
            this.isSpinning = true;
            this.balance -= this.getCurrentBet();
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
        return this.betAmounts[0];
    }

    public getMaxBet(): number {
        return this.betAmounts[this.betAmounts.length - 1];
    }

    public getBetAmounts(): readonly number[] {
        return this.betAmounts;
    }
}
