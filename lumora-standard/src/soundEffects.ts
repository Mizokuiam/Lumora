import * as vscode from 'vscode';

export class SoundEffects {
    private enabled: boolean;
    private statusBarItem: vscode.StatusBarItem;
    private lastSoundTime: number;
    private readonly MIN_SOUND_INTERVAL = 50; // Minimum ms between sounds

    constructor() {
        this.enabled = false;
        this.lastSoundTime = 0;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.updateStatusBar();

        // Listen to document changes
        vscode.workspace.onDidChangeTextDocument(e => {
            if (this.enabled && e.contentChanges.length > 0) {
                this.playTypingSound();
            }
        });
    }

    public start() {
        this.enabled = true;
        this.statusBarItem.show();
        this.updateStatusBar();
    }

    public stop() {
        this.enabled = false;
        this.statusBarItem.hide();
    }

    public toggle() {
        if (this.enabled) {
            this.stop();
        } else {
            this.start();
        }
        vscode.window.showInformationMessage(`Sound effects ${this.enabled ? 'enabled' : 'disabled'}`);
    }

    private playSound(frequency: number = 800, duration: number = 50) {
        const now = Date.now();
        if (now - this.lastSoundTime < this.MIN_SOUND_INTERVAL) {
            return;
        }
        this.lastSoundTime = now;

        // In a real implementation, this would play an actual sound
        // For now, we'll just update the status bar
        this.statusBarItem.text = '$(unmute)';
        setTimeout(() => {
            this.updateStatusBar();
        }, duration);
    }

    private playTypingSound() {
        this.playSound(440, 10); // A4 note, very short duration
    }

    private updateStatusBar() {
        this.statusBarItem.text = this.enabled ? '$(unmute)' : '$(mute)';
        this.statusBarItem.tooltip = `Sound effects ${this.enabled ? 'enabled' : 'disabled'}`;
    }

    public dispose() {
        this.statusBarItem.dispose();
    }
}
