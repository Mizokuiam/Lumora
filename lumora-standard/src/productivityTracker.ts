import * as vscode from 'vscode';

interface ProductivityStats {
    score: number;
    typingSpeed: number;
    focusTime: number;
    breaksTaken: number;
}

export class ProductivityTracker {
    private stats: ProductivityStats;
    private lastUpdate: number;
    private typedCharacters: number;

    constructor() {
        this.stats = {
            score: 0,
            typingSpeed: 0,
            focusTime: 0,
            breaksTaken: 0
        };
        this.lastUpdate = Date.now();
        this.typedCharacters = 0;

        // Listen to document changes
        vscode.workspace.onDidChangeTextDocument(e => {
            this.updateStats(e.contentChanges);
        });
    }

    private updateStats(changes: readonly vscode.TextDocumentContentChangeEvent[]) {
        const now = Date.now();
        const timeDiff = (now - this.lastUpdate) / 1000; // Convert to seconds

        // Update typing speed
        changes.forEach(change => {
            this.typedCharacters += change.text.length;
        });

        if (timeDiff >= 60) { // Update every minute
            this.stats.typingSpeed = this.typedCharacters / timeDiff;
            this.typedCharacters = 0;
            this.lastUpdate = now;

            // Update productivity score
            this.calculateScore();
        }
    }

    private calculateScore() {
        // Simple scoring based on typing speed and focus time
        const speedScore = Math.min(this.stats.typingSpeed / 5, 1); // Normalize to 0-1
        const focusScore = Math.min(this.stats.focusTime / 3600, 1); // Normalize to 0-1 (max 1 hour)
        
        this.stats.score = (speedScore * 0.4 + focusScore * 0.6) * 100;
    }

    public showStats() {
        const message = `Productivity Stats:
- Score: ${Math.round(this.stats.score)}%
- Typing Speed: ${Math.round(this.stats.typingSpeed)} chars/sec
- Focus Time: ${Math.round(this.stats.focusTime / 60)} minutes
- Breaks Taken: ${this.stats.breaksTaken}`;

        vscode.window.showInformationMessage(message);
    }

    public getStats(): ProductivityStats {
        return { ...this.stats };
    }

    public recordBreak() {
        this.stats.breaksTaken++;
        this.calculateScore();
    }

    public updateFocusTime(seconds: number) {
        this.stats.focusTime = seconds;
        this.calculateScore();
    }

    public dispose() {
        // Clean up any resources
    }
}
