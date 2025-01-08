import * as vscode from 'vscode';

export class EyeStrainPrevention {
    private panel: vscode.WebviewPanel | undefined;
    private checkTimer: NodeJS.Timeout | undefined;
    private enabled: boolean;
    private timeUntilBreak: number;
    private readonly BREAK_INTERVAL = 20 * 60; // 20 minutes in seconds
    private readonly CHECK_INTERVAL = 1000; // 1 second

    constructor() {
        this.enabled = false;
        this.timeUntilBreak = this.BREAK_INTERVAL;
    }

    public start() {
        if (this.enabled) return;
        
        this.enabled = true;
        this.timeUntilBreak = this.BREAK_INTERVAL;
        this.startTimer();
        
        if (!this.panel) {
            this.createPanel();
        }
        this.updatePanel();
    }

    public stop() {
        if (!this.enabled) return;
        
        this.enabled = false;
        if (this.checkTimer) {
            clearTimeout(this.checkTimer);
            this.checkTimer = undefined;
        }
        
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
    }

    public toggle() {
        if (this.enabled) {
            this.stop();
            vscode.window.showInformationMessage('Eye strain prevention disabled');
        } else {
            this.start();
            vscode.window.showInformationMessage('Eye strain prevention enabled');
        }
    }

    private startTimer() {
        if (this.checkTimer) {
            clearTimeout(this.checkTimer);
        }
        this.checkTimer = setInterval(() => {
            this.checkEyeStrain();
        }, this.CHECK_INTERVAL);
    }

    private checkEyeStrain() {
        if (this.timeUntilBreak > 0) {
            this.timeUntilBreak--;
            if (this.panel) {
                this.updatePanel();
            }
        } else {
            this.suggestBreak();
        }
    }

    private suggestBreak() {
        vscode.window.showInformationMessage(
            '20-20-20 Rule: Look at something 20 feet away for 20 seconds',
            'Take Break'
        ).then(selection => {
            if (selection === 'Take Break') {
                this.timeUntilBreak = this.BREAK_INTERVAL;
                this.updatePanel();
            }
        });
    }

    private createPanel() {
        this.panel = vscode.window.createWebviewPanel(
            'eyeStrain',
            'Eye Strain Prevention',
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });
    }

    private updatePanel() {
        if (!this.panel) return;

        const minutes = Math.floor(this.timeUntilBreak / 60);
        const seconds = this.timeUntilBreak % 60;

        this.panel.webview.html = `
            <!DOCTYPE html>
            <html>
                <body>
                    <h2>Next Eye Break in:</h2>
                    <h1>${minutes}:${seconds.toString().padStart(2, '0')}</h1>
                    <p>Remember the 20-20-20 rule:</p>
                    <p>Every 20 minutes, look at something 20 feet away for 20 seconds.</p>
                </body>
            </html>
        `;
    }

    public dispose() {
        this.stop();
    }
}
