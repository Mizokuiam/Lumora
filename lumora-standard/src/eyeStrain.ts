import * as vscode from 'vscode';

export class EyeStrainPrevention {
    private panel: vscode.WebviewPanel | undefined;
    private timer: NodeJS.Timer | undefined;
    private enabled: boolean;
    private timeUntilBreak: number;
    private readonly BREAK_INTERVAL = 20 * 60; // 20 minutes in seconds
    private readonly BREAK_DURATION = 20; // 20 seconds

    constructor() {
        this.enabled = false;
        this.timeUntilBreak = this.BREAK_INTERVAL;
    }

    public initialize(context: vscode.ExtensionContext) {
        // Load saved state
        const config = vscode.workspace.getConfiguration('lumora');
        this.enabled = config.get('eyeStrainPrevention.enabled', false);
        
        if (this.enabled) {
            this.enable();
        }
    }

    public enable() {
        if (this.enabled) return;
        
        this.enabled = true;
        this.timeUntilBreak = this.BREAK_INTERVAL;
        this.startTimer();
        
        vscode.workspace.getConfiguration('lumora').update(
            'eyeStrainPrevention.enabled',
            true,
            true
        );
    }

    public disable() {
        if (!this.enabled) return;
        
        this.enabled = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = undefined;
        }
        
        if (this.panel) {
            this.panel.dispose();
            this.panel = undefined;
        }
        
        vscode.workspace.getConfiguration('lumora').update(
            'eyeStrainPrevention.enabled',
            false,
            true
        );
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    private startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            if (this.timeUntilBreak > 0) {
                this.timeUntilBreak--;
                if (this.panel) {
                    this.updatePanel();
                }
            } else {
                this.suggestBreak();
            }
        }, 1000);
    }

    private suggestBreak() {
        vscode.window.showInformationMessage(
            'Time for a 20-20-20 break! Look at something 20 feet away for 20 seconds.',
            'Take Break',
            'Dismiss'
        ).then(selection => {
            if (selection === 'Take Break') {
                this.startBreak();
            } else {
                this.timeUntilBreak = this.BREAK_INTERVAL;
            }
        });
    }

    private startBreak() {
        if (this.panel) {
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel(
                'eyeStrainBreak',
                'Eye Strain Break',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.timeUntilBreak = this.BREAK_INTERVAL;
            });
        }

        this.timeUntilBreak = this.BREAK_DURATION;
        this.updatePanel();
    }

    private updatePanel() {
        if (!this.panel) return;

        const minutes = Math.floor(this.timeUntilBreak / 60);
        const seconds = this.timeUntilBreak % 60;

        this.panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        margin: 0;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-editor-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    .timer {
                        font-size: 48px;
                        margin: 20px;
                    }
                    .instruction {
                        font-size: 24px;
                        text-align: center;
                        margin: 20px;
                        max-width: 600px;
                    }
                    .progress {
                        width: 300px;
                        height: 20px;
                        background: var(--vscode-progressBar-background);
                        border-radius: 10px;
                        overflow: hidden;
                    }
                    .progress-bar {
                        height: 100%;
                        background: var(--vscode-progressBar-foreground);
                        width: ${(this.timeUntilBreak / this.BREAK_DURATION) * 100}%;
                        transition: width 1s linear;
                    }
                </style>
            </head>
            <body>
                <div class="timer">${minutes}:${seconds.toString().padStart(2, '0')}</div>
                <div class="progress">
                    <div class="progress-bar"></div>
                </div>
                <div class="instruction">
                    Look at something 20 feet away to reduce eye strain.
                    Blink slowly and deliberately to help keep your eyes moisturized.
                </div>
            </body>
            </html>
        `;
    }
}
