import * as vscode from 'vscode';
import { ThemeManager } from './themeManager';
import { ProductivityTracker } from './productivityTracker';
import { PomodoroTimer } from './pomodoro';
import { EyeStrainPrevention } from './eyeStrain';
import { BreakReminder } from './features/breakReminder';
import { TimeTracking } from './features/timeTracking';
import { FocusMode } from './features/focusMode';
import { SoundEffects } from './soundEffects';

export function activate(context: vscode.ExtensionContext) {
    // Initialize components
    const themeManager = new ThemeManager();
    const productivityTracker = new ProductivityTracker();
    const pomodoroTimer = new PomodoroTimer();
    const eyeStrainPrevention = new EyeStrainPrevention();
    const breakReminder = new BreakReminder();
    const timeTracking = new TimeTracking(context);
    const focusMode = new FocusMode();
    const soundEffects = new SoundEffects();

    // Register commands
    let disposables = [
        vscode.commands.registerCommand('lumora.toggleFocusMode', () => {
            focusMode.toggle();
        }),

        vscode.commands.registerCommand('lumora.startPomodoro', () => {
            pomodoroTimer.start();
        }),

        vscode.commands.registerCommand('lumora.stopPomodoro', () => {
            pomodoroTimer.stop();
        }),

        vscode.commands.registerCommand('lumora.showStats', () => {
            productivityTracker.showStats();
        }),

        vscode.commands.registerCommand('lumora.toggleBreakReminder', () => {
            breakReminder.toggle();
        }),

        vscode.commands.registerCommand('lumora.toggleEyeStrain', () => {
            eyeStrainPrevention.toggle();
        }),

        vscode.commands.registerCommand('lumora.toggleSoundEffects', () => {
            soundEffects.toggle();
        })
    ];

    context.subscriptions.push(...disposables);

    // Start enabled features
    breakReminder.start();
    eyeStrainPrevention.start();
    soundEffects.start();

    // Cleanup on deactivation
    context.subscriptions.push({
        dispose: () => {
            themeManager.dispose();
            productivityTracker.dispose();
            pomodoroTimer.dispose();
            eyeStrainPrevention.dispose();
            breakReminder.dispose();
            timeTracking.dispose();
            focusMode.dispose();
            soundEffects.dispose();
        }
    });
}

export function deactivate() {}
