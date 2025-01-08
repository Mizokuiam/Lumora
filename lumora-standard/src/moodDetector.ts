import * as vscode from 'vscode';

export class MoodDetector {
    private typingHistory: Array<{
        timestamp: number;
        pattern: any;
    }>;

    constructor() {
        this.typingHistory = [];
    }

    public analyzeMood(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        // Extract typing patterns
        const pattern = this.extractTypingPattern(changes);
        
        // Update history
        this.updateHistory(pattern);

        // Analyze patterns to determine mood
        return this.calculateMoodScore();
    }

    private extractTypingPattern(changes: readonly vscode.TextDocumentContentChangeEvent[]) {
        return {
            speed: this.calculateTypingSpeed(changes),
            pressure: this.estimateTypingPressure(changes),
            rhythm: this.analyzeTypingRhythm(changes)
        };
    }

    private calculateTypingSpeed(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        const totalCharacters = changes.reduce((sum, change) => sum + change.text.length, 0);
        return totalCharacters / 5; // Simplified WPM calculation
    }

    private estimateTypingPressure(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        // Estimate pressure based on deletion rate and rapid corrections
        const deletions = changes.filter(change => 
            change.text === '' || change.text === '\b'
        ).length;
        return deletions / Math.max(changes.length, 1);
    }

    private analyzeTypingRhythm(changes: readonly vscode.TextDocumentContentChangeEvent[]): number {
        // Analyze consistency in typing patterns
        // Implementation details...
        return 0.5; // Placeholder
    }

    private updateHistory(pattern: any) {
        this.typingHistory.push({
            timestamp: Date.now(),
            pattern: pattern
        });

        // Keep only recent history (last 5 minutes)
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        this.typingHistory = this.typingHistory.filter(item => 
            item.timestamp > fiveMinutesAgo
        );
    }

    private calculateMoodScore(): number {
        if (this.typingHistory.length === 0) {
            return 0.5; // Neutral mood if no data
        }

        // Analyze patterns to determine mood
        const recentPatterns = this.typingHistory.slice(-10);
        
        // Calculate average metrics
        const avgSpeed = recentPatterns.reduce((sum, item) => 
            sum + item.pattern.speed, 0) / recentPatterns.length;
        
        const avgPressure = recentPatterns.reduce((sum, item) => 
            sum + item.pattern.pressure, 0) / recentPatterns.length;
        
        const avgRhythm = recentPatterns.reduce((sum, item) => 
            sum + item.pattern.rhythm, 0) / recentPatterns.length;

        // Higher speed and rhythm, lower pressure indicate better mood
        const speedFactor = Math.min(avgSpeed / 60, 1); // Cap at 60 WPM
        const pressureFactor = 1 - avgPressure;
        const rhythmFactor = avgRhythm;

        // Weighted average of factors
        return (speedFactor * 0.3 + pressureFactor * 0.4 + rhythmFactor * 0.3);
    }
}
