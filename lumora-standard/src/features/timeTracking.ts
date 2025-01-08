import * as vscode from 'vscode';

interface TimeStats {
    totalTime: number;
    fileStats: { [key: string]: number };
    lastUpdate: number;
}

export class TimeTracking {
    private context: vscode.ExtensionContext;
    private stats: TimeStats;
    private updateTimer: NodeJS.Timeout | undefined;
    private readonly UPDATE_INTERVAL = 60000; // Update every minute

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.stats = this.loadStats();
        this.startUpdateTimer();
    }

    private loadStats(): TimeStats {
        const defaultStats: TimeStats = {
            totalTime: 0,
            fileStats: {},
            lastUpdate: Date.now()
        };
        
        return this.context.globalState.get('lumora.timeStats', defaultStats);
    }

    private startUpdateTimer() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        this.updateTimer = setInterval(() => {
            this.updateStats();
        }, this.UPDATE_INTERVAL);

        // Track active editor changes
        vscode.window.onDidChangeActiveTextEditor(() => {
            this.updateStats();
        });
    }

    private updateStats() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;

        const now = Date.now();
        const timeDiff = now - this.stats.lastUpdate;
        
        // Update total time
        this.stats.totalTime += timeDiff;

        // Update per-file statistics
        const fileName = activeEditor.document.fileName;
        this.stats.fileStats[fileName] = (this.stats.fileStats[fileName] || 0) + timeDiff;

        // Update last update time
        this.stats.lastUpdate = now;

        // Save stats
        this.context.globalState.update('lumora.timeStats', this.stats);
    }

    public getStats(): TimeStats {
        return { ...this.stats };
    }

    public getDailyStats(): { time: number, files: number } {
        const totalMinutes = Math.floor(this.stats.totalTime / 60000);
        const uniqueFiles = Object.keys(this.stats.fileStats).length;

        return {
            time: totalMinutes,
            files: uniqueFiles
        };
    }

    public getTopFiles(limit: number = 5): Array<{ file: string, minutes: number }> {
        return Object.entries(this.stats.fileStats)
            .map(([file, time]) => ({
                file: vscode.workspace.asRelativePath(file),
                minutes: Math.floor(time / 60000)
            }))
            .sort((a, b) => b.minutes - a.minutes)
            .slice(0, limit);
    }

    public resetStats() {
        this.stats = {
            totalTime: 0,
            fileStats: {},
            lastUpdate: Date.now()
        };
        this.context.globalState.update('lumora.timeStats', this.stats);
    }

    public dispose() {
        if (this.updateTimer) {
            clearTimeout(this.updateTimer);
        }
        this.updateStats(); // Final update before disposing
    }
}
