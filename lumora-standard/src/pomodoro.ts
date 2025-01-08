import * as vscode from 'vscode';

export class PomodoroTimer {
    private statusBarItem: vscode.StatusBarItem;
    private timer: NodeJS.Timeout | undefined;
    private remainingTime: number;
    private isWorkTime: boolean;
    private workDuration: number;
    private breakDuration: number;
    private running: boolean;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.workDuration = 25 * 60; // 25 minutes
        this.breakDuration = 5 * 60; // 5 minutes
        this.remainingTime = this.workDuration;
        this.isWorkTime = true;
        this.running = false;
        this.statusBarItem.command = 'lumora.togglePomodoro';
        this.updateStatusBar();
    }

    public initialize(context: vscode.ExtensionContext) {
        this.statusBarItem.show();
        context.subscriptions.push(this.statusBarItem);
    }

    public start() {
        if (this.running) return;

        this.running = true;
        this.startTimer();
        this.updateStatusBar();
    }

    public stop() {
        if (!this.running) return;

        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
        this.running = false;
        this.updateStatusBar();
    }

    public reset() {
        this.stop();
        this.isWorkTime = true;
        this.remainingTime = this.workDuration;
        this.updateStatusBar();
    }

    public isRunning(): boolean {
        return this.running;
    }

    public toggle() {
        if (this.running) {
            this.stop();
        } else {
            this.start();
        }
    }

    public dispose() {
        this.stop();
        this.statusBarItem.dispose();
    }

    private tick() {
        if (this.remainingTime > 0) {
            this.remainingTime--;
            this.updateStatusBar();
        } else {
            this.phaseComplete();
        }
    }

    private phaseComplete() {
        this.stop();
        this.isWorkTime = !this.isWorkTime;
        this.remainingTime = this.isWorkTime ? this.workDuration : this.breakDuration;
        
        vscode.window.showInformationMessage(
            this.isWorkTime ? 'Break complete! Ready to work?' : 'Work session complete! Time for a break!',
            'Start'
        ).then(selection => {
            if (selection === 'Start') {
                this.start();
            }
        });
    }

    private startTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setInterval(() => {
            this.tick();
        }, 1000);
    }

    private updateStatusBar() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (this.running) {
            this.statusBarItem.text = `$(clock) ${this.isWorkTime ? 'Work' : 'Break'}: ${timeString}`;
            this.statusBarItem.tooltip = `${this.isWorkTime ? 'Work' : 'Break'} session in progress`;
        } else {
            this.statusBarItem.text = `$(clock) Pomodoro`;
            this.statusBarItem.tooltip = 'Click to start Pomodoro timer';
        }
    }
}
