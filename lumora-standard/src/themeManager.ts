import * as vscode from 'vscode';
import * as Color from 'color';

export class ThemeManager {
    private currentTheme: any;
    private baseTheme: any;

    constructor() {
        this.initializeTheme();
    }

    private initializeTheme() {
        this.baseTheme = vscode.workspace.getConfiguration('workbench').get('colorTheme');
    }

    public adjustTheme(mood: number, productivity: number) {
        const config = vscode.workspace.getConfiguration('lumora');
        if (!config.get('enableAutoAdjust')) {
            return;
        }

        // Calculate color adjustments based on mood and productivity
        const saturation = this.calculateSaturation(mood);
        const brightness = this.calculateBrightness(productivity);

        this.applyColorAdjustments(saturation, brightness);
    }

    private calculateSaturation(mood: number): number {
        // Mood ranges from 0 (stressed) to 1 (relaxed)
        return 0.5 + (mood * 0.5);
    }

    private calculateBrightness(productivity: number): number {
        // Productivity ranges from 0 (low) to 1 (high)
        return 0.4 + (productivity * 0.6);
    }

    private applyColorAdjustments(saturation: number, brightness: number) {
        const workbenchConfig = vscode.workspace.getConfiguration('workbench');
        const editorConfig = vscode.workspace.getConfiguration('editor');

        // Adjust editor colors
        const baseBackground = Color('#1e1e1e');
        const adjustedBackground = baseBackground
            .saturate(saturation)
            .lightness(brightness * 100);

        workbenchConfig.update('colorCustomizations', {
            'editor.background': adjustedBackground.hex(),
            'editor.foreground': brightness > 0.5 ? '#000000' : '#ffffff'
        }, true);
    }
}
