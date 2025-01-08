import * as vscode from 'vscode';
import * as child_process from 'child_process';

export class SoundEffects {
    private enabled: boolean;
    private volume: number;
    private context: vscode.ExtensionContext;
    private lastSoundTime: number = 0;
    private readonly MIN_SOUND_INTERVAL = 50; // Minimum ms between sounds to prevent too many beeps

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.enabled = this.context.globalState.get('lumora.enableSoundEffects', true);
        this.volume = this.context.globalState.get('lumora.soundEffectsVolume', 0.5);
    }

    private playSound(frequency: number = 800, duration: number = 50) {
        if (!this.enabled) return;
        
        // Prevent sounds from playing too frequently
        const now = Date.now();
        if (now - this.lastSoundTime < this.MIN_SOUND_INTERVAL) {
            return;
        }
        this.lastSoundTime = now;

        if (process.platform === 'win32') {
            const command = `powershell -Command "[Console]::Beep(${frequency}, ${duration})"`;
            try {
                child_process.execSync(command, { stdio: 'ignore' });
            } catch (e) {
                console.error('Failed to play sound:', e);
            }
        }
    }

    public playTypingSound() {
        this.playSound(440, 10); // A4 note, very short duration
    }

    public playDeleteSound() {
        this.playSound(392, 10); // G4 note, very short duration
    }

    public playSuccessSound() {
        this.playSound(523, 20); // C5 note, slightly longer
    }

    public playAlertSound() {
        this.playSound(466, 20); // Bb4 note, slightly longer
    }

    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
        this.context.globalState.update('lumora.enableSoundEffects', enabled);
        
        // Play a test sound when enabled
        if (enabled) {
            this.playSuccessSound();
        }
    }

    public setVolume(volume: number) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.context.globalState.update('lumora.soundEffectsVolume', this.volume);
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public dispose() {
        // Nothing to dispose
    }
}
