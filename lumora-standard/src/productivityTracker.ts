import * as vscode from 'vscode';

export class ProductivityTracker {
    private score: number;
    private lastUpdate: number;
    private typingSpeed: number[];
    private deletionRate: number[];

    constructor() {
        this.score = 0.5; // Start with neutral score
        this.lastUpdate = Date.now();
        this.typingSpeed = [];
        this.deletionRate = [];
    }

    public updateProductivity(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        const now = Date.now();
        const timeDiff = now - this.lastUpdate;
        this.lastUpdate = now;

        // Calculate metrics
        const speed = this.calculateTypingSpeed(changes);
        const deletions = this.calculateDeletionRate(changes);

        // Update history
        this.typingSpeed.push(speed);
        this.deletionRate.push(deletions);

        // Keep last hour of data
        const oneHour = 60 * 60 * 1000;
        this.typingSpeed = this.typingSpeed.slice(-oneHour);
        this.deletionRate = this.deletionRate.slice(-oneHour);

        // Calculate new score
        this.score = this.calculateScore();

        return this.score;
    }

    public getStats() {
        return {
            score: this.score,
            typingSpeed: this.getAverageTypingSpeed(),
            deletionRate: this.getAverageDeletionRate()
        };
    }

    private calculateTypingSpeed(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        const totalCharacters = changes.reduce((sum, change) => sum + change.text.length, 0);
        return totalCharacters / 5; // Simplified WPM calculation
    }

    private calculateDeletionRate(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        const deletions = changes.filter(change => 
            change.text === '' || change.text === '\b'
        ).length;
        return changes.length > 0 ? deletions / changes.length : 0;
    }

    private getAverageTypingSpeed(): number {
        if (this.typingSpeed.length === 0) return 0;
        return this.typingSpeed.reduce((a, b) => a + b) / this.typingSpeed.length;
    }

    private getAverageDeletionRate(): number {
        if (this.deletionRate.length === 0) return 0;
        return this.deletionRate.reduce((a, b) => a + b) / this.deletionRate.length;
    }

    private calculateScore(): number {
        const avgSpeed = this.getAverageTypingSpeed();
        const avgDeletion = this.getAverageDeletionRate();

        // Higher typing speed and lower deletion rate indicate higher productivity
        const speedFactor = Math.min(avgSpeed / 60, 1); // Cap at 60 WPM
        const deletionFactor = 1 - avgDeletion;

        return (speedFactor * 0.7 + deletionFactor * 0.3);
    }
}
