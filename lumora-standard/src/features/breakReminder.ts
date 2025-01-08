import * as vscode from 'vscode';

export class BreakReminder {
    private statusBarItem: vscode.StatusBarItem;
    private timer: NodeJS.Timeout | undefined;
    private timeUntilBreak: number;
    private enabled: boolean;
    private readonly BREAK_INTERVAL = 30 * 60; // 30 minutes in seconds
    private readonly CHECK_INTERVAL = 1000; // Check every second

    constructor() {
        this.enabled = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.timeUntilBreak = this.BREAK_INTERVAL;
        this.updateStatusBar();
    }

    public toggle() {
        if (this.enabled) {
            this.stop();
            vscode.window.showInformationMessage('Break reminders disabled');
        } else {
            this.start();
            vscode.window.showInformationMessage('Break reminders enabled');
        }
    }

    public start() {
        this.enabled = true;
        this.statusBarItem.show();
        this.startTimer();
        this.updateStatusBar();
    }

    public stop() {
        this.enabled = false;
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        this.statusBarItem.hide();
    }

    private startTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setInterval(() => {
            this.tick();
        }, this.CHECK_INTERVAL);
    }

    private tick() {
        if (this.timeUntilBreak > 0) {
            this.timeUntilBreak--;
            this.updateStatusBar();
        } else {
            this.suggestBreak();
        }
    }

    private updateStatusBar() {
        const minutes = Math.floor(this.timeUntilBreak / 60);
        const seconds = this.timeUntilBreak % 60;
        this.statusBarItem.text = `$(clock) ${minutes}:${seconds.toString().padStart(2, '0')}`;
        this.statusBarItem.tooltip = 'Time until next break';
    }

    private async suggestBreak() {
        const take = 'Take Break';
        const skip = 'Skip';
        const result = await vscode.window.showInformationMessage(
            "Time for a break! Take a few minutes to rest your eyes and stretch.",
            take,
            skip
        );

        if (result === take) {
            // Stop the timer during break
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = undefined;
            }
            
            // Show break timer
            const breakLength = 5 * 60; // 5 minutes
            let breakTimeLeft = breakLength;
            
            const breakTimer = setInterval(() => {
                if (breakTimeLeft > 0) {
                    const mins = Math.floor(breakTimeLeft / 60);
                    const secs = breakTimeLeft % 60;
                    this.statusBarItem.text = `$(clock) Break: ${mins}:${secs.toString().padStart(2, '0')}`;
                    breakTimeLeft--;
                } else {
                    clearInterval(breakTimer);
                    vscode.window.showInformationMessage('Break finished! Back to work.');
                    this.timeUntilBreak = this.BREAK_INTERVAL;
                    this.startTimer();
                }
            }, 1000);
        } else {
            // Skip break
            this.timeUntilBreak = this.BREAK_INTERVAL;
        }
    }

    public dispose() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.statusBarItem.dispose();
    }
}
