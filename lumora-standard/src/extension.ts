import * as vscode from 'vscode';
import { ThemeManager } from './themeManager';
import { ProductivityTracker } from './productivityTracker';
import { MoodDetector } from './moodDetector';
import { PomodoroTimer } from './pomodoro';
import { EyeStrainPrevention } from './eyeStrain';
import { SoundEffects } from './soundEffects';
import { FocusMode } from './features/focusMode';
import { TimeTracking } from './features/timeTracking';
import { BreakReminder } from './features/breakReminder';

export function activate(context: vscode.ExtensionContext) {
    // Initialize services
    const themeManager = new ThemeManager();
    const productivityTracker = new ProductivityTracker();
    const moodDetector = new MoodDetector();
    const pomodoroTimer = new PomodoroTimer();
    const eyeStrain = new EyeStrainPrevention();
    const soundEffects = new SoundEffects(context);
    const focusMode = new FocusMode(context);
    const timeTracking = new TimeTracking(context);
    const breakReminder = new BreakReminder(context);

    // Register commands
    let disposable = vscode.commands.registerCommand('lumora.toggleThemeAdjustment', () => {
        const config = vscode.workspace.getConfiguration('lumora');
        const currentState = config.get('enableAutoAdjust');
        config.update('enableAutoAdjust', !currentState, true);
        vscode.window.setStatusBarMessage(`Theme adjustment ${!currentState ? 'enabled' : 'disabled'}`, 2000);
    });
    context.subscriptions.push(disposable);

    // Productivity stats command
    disposable = vscode.commands.registerCommand('lumora.showProductivity', () => {
        const stats = productivityTracker.getStats();
        vscode.window.setStatusBarMessage(`Productivity Score: ${stats.score}`, 2000);
    });
    context.subscriptions.push(disposable);

    // Focus mode command
    context.subscriptions.push(
        vscode.commands.registerCommand('lumora.toggleFocusMode', () => {
            if (focusMode.isEnabled()) {
                focusMode.disable();
                vscode.window.setStatusBarMessage('Focus mode disabled', 2000);
            } else {
                focusMode.enable();
                vscode.window.setStatusBarMessage('Focus mode enabled', 2000);
            }
        })
    );

    // Time tracking command
    context.subscriptions.push(
        vscode.commands.registerCommand('lumora.showTimeStats', () => {
            const dailyStats = timeTracking.getDailyStats();
            const topFiles = timeTracking.getTopFiles(3);
            
            const statsMessage = `Today's coding time: ${dailyStats.time} minutes\n` +
                `Files worked on: ${dailyStats.files}\n\n` +
                'Top files:\n' +
                topFiles.map(f => `${f.file}: ${f.minutes} minutes`).join('\n');
            
            vscode.window.showInformationMessage(statsMessage);
        })
    );

    // Break reminder command
    context.subscriptions.push(
        vscode.commands.registerCommand('lumora.toggleBreakReminder', () => {
            if (breakReminder.isEnabled()) {
                breakReminder.stop();
                vscode.window.setStatusBarMessage('Break reminders disabled', 2000);
            } else {
                breakReminder.start();
                vscode.window.setStatusBarMessage('Break reminders enabled', 2000);
            }
        })
    );

    // Pomodoro timer commands
    disposable = vscode.commands.registerCommand('lumora.togglePomodoro', () => {
        if (pomodoroTimer.isRunning()) {
            pomodoroTimer.stop();
            vscode.window.setStatusBarMessage('Pomodoro timer paused', 2000);
        } else {
            pomodoroTimer.start();
            vscode.window.setStatusBarMessage('Pomodoro timer started', 2000);
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('lumora.resetPomodoro', () => {
        pomodoroTimer.reset();
        vscode.window.setStatusBarMessage('Pomodoro timer reset', 2000);
    });
    context.subscriptions.push(disposable);

    // Eye strain prevention command
    disposable = vscode.commands.registerCommand('lumora.toggleEyeStrain', () => {
        if (eyeStrain.isEnabled()) {
            eyeStrain.disable();
            vscode.window.setStatusBarMessage('Eye strain prevention disabled', 2000);
        } else {
            eyeStrain.enable();
            vscode.window.setStatusBarMessage('Eye strain prevention enabled', 2000);
        }
    });
    context.subscriptions.push(disposable);

    // Register sound effects commands
    context.subscriptions.push(
        vscode.commands.registerCommand('lumora.toggleSoundEffects', () => {
            const enabled = !soundEffects.isEnabled();
            soundEffects.setEnabled(enabled);
            vscode.window.setStatusBarMessage(`Sound effects ${enabled ? 'enabled' : 'disabled'}`, 2000);
        })
    );

    // Add typing sound effect listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(event => {
            if (event.contentChanges.length > 0) {
                const change = event.contentChanges[0];
                if (change.text.length > 0) {
                    soundEffects.playTypingSound();
                } else {
                    soundEffects.playDeleteSound();
                }
            }
        })
    );

    // Add sound effects to disposables
    context.subscriptions.push(soundEffects);

    // Monitor typing patterns
    const typingSubscription = vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.contentChanges.length > 0) {
            const mood = moodDetector.analyzeMood(event.contentChanges);
            const productivity = productivityTracker.updateProductivity(event.contentChanges);
            themeManager.adjustTheme(mood, productivity);
        }
    });
    context.subscriptions.push(typingSubscription);

    // Initialize features
    pomodoroTimer.initialize(context);
    eyeStrain.initialize(context);

    // Add all features to disposables
    context.subscriptions.push(
        focusMode,
        timeTracking,
        breakReminder,
        soundEffects
    );
}

export function deactivate() {
    // Clean up resources
}
