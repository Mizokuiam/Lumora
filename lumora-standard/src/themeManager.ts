import * as vscode from 'vscode';
import Color from 'color';

export class ThemeManager {
    private currentTheme: vscode.ColorTheme | undefined;

    constructor() {
        this.currentTheme = vscode.window.activeColorTheme;
        vscode.window.onDidChangeActiveColorTheme(theme => {
            this.currentTheme = theme;
        });
    }

    public adjustTheme(mood: number, productivity: number) {
        if (!this.currentTheme) return;

        const workbenchColors = this.calculateColors(mood, productivity);
        const config = vscode.workspace.getConfiguration('workbench');
        
        for (const [key, value] of Object.entries(workbenchColors)) {
            config.update(key, value, true);
        }
    }

    private calculateColors(mood: number, productivity: number): Record<string, string> {
        const baseColor = this.currentTheme!.kind === vscode.ColorThemeKind.Dark
            ? Color('#1e1e1e')
            : Color('#ffffff');

        // Adjust saturation based on mood (0-1)
        const saturation = 0.3 + (mood * 0.4); // 30-70% saturation
        
        // Adjust brightness based on productivity (0-1)
        const brightness = 0.4 + (productivity * 0.3); // 40-70% brightness

        const accentColor = baseColor
            .rotate(mood * 360) // Hue based on mood
            .saturate(saturation)
            .darken(1 - brightness);

        return {
            'colorCustomizations.editor.background': accentColor.toString(),
            'colorCustomizations.editor.foreground': accentColor.isLight() ? '#000000' : '#ffffff'
        };
    }

    public dispose() {
        // Clean up any theme customizations
        const config = vscode.workspace.getConfiguration('workbench');
        config.update('colorCustomizations', undefined, true);
    }
}
