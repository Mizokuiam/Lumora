import * as vscode from 'vscode';

interface BreakStats {
    lastBreakTime: number;
    breaksCompleted: number;
    breaksDismissed: number;
}

export class BreakReminder {
    private context: vscode.ExtensionContext;
    private enabled: boolean;
    private stats: BreakStats;
    private checkInterval: NodeJS.Timer | undefined;
    private readonly DEFAULT_INTERVAL = 30 * 60 * 1000; // 30 minutes
    private readonly STRETCHES = [
        "Roll your shoulders backwards and forwards",
        "Stretch your arms above your head",
        "Look at something 20 feet away for 20 seconds",
        "Stand up and walk around for a minute",
        "Gently rotate your wrists",
        "Do some neck stretches",
        "Take deep breaths"
    ];

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.enabled = this.context.globalState.get('lumora.breakReminderEnabled', true);
        this.stats = this.loadStats();
        
        if (this.enabled) {
            this.start();
        }
    }

    private loadStats(): BreakStats {
        return this.context.globalState.get('lumora.breakStats', {
            lastBreakTime: Date.now(),
            breaksCompleted: 0,
            breaksDismissed: 0
        });
    }

    private async suggestBreak() {
        const stretch = this.STRETCHES[Math.floor(Math.random() * this.STRETCHES.length)];
        const take = 'Take a Break';
        const dismiss = 'Dismiss';
        
        const choice = await vscode.window.showInformationMessage(
            `Time for a break! Suggestion: ${stretch}`,
            take,
            dismiss
        );

        if (choice === take) {
            this.stats.breaksCompleted++;
            this.stats.lastBreakTime = Date.now();
            vscode.window.showInformationMessage('Great job taking care of yourself!');
        } else if (choice === dismiss) {
            this.stats.breaksDismissed++;
        }

        this.context.globalState.update('lumora.breakStats', this.stats);
    }

    public start() {
        this.enabled = true;
        this.context.globalState.update('lumora.breakReminderEnabled', true);

        if (!this.checkInterval) {
            this.checkInterval = setInterval(() => {
                const now = Date.now();
                if (now - this.stats.lastBreakTime >= this.DEFAULT_INTERVAL) {
                    this.suggestBreak();
                }
            }, 60000); // Check every minute
        }
    }

    public stop() {
        this.enabled = false;
        this.context.globalState.update('lumora.breakReminderEnabled', false);

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = undefined;
        }
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public getStats(): BreakStats {
        return { ...this.stats };
    }

    public dispose() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
    }
}
