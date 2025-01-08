import * as vscode from 'vscode';

export class FocusMode {
    private enabled: boolean;
    private context: vscode.ExtensionContext;
    private decorationType: vscode.TextEditorDecorationType;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.enabled = this.context.globalState.get('lumora.focusModeEnabled', false);
        
        // Create decoration type for dimming inactive code
        this.decorationType = vscode.window.createTextEditorDecorationType({
            opacity: '0.5',
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });
    }

    public enable() {
        this.enabled = true;
        this.context.globalState.update('lumora.focusModeEnabled', true);
        this.updateFocusState();
        
        // Hide activity bar and minimap
        vscode.workspace.getConfiguration('workbench').update('activityBar.visible', false, true);
        vscode.workspace.getConfiguration('editor').update('minimap.enabled', false, true);
    }

    public disable() {
        this.enabled = false;
        this.context.globalState.update('lumora.focusModeEnabled', false);
        this.clearDecorations();
        
        // Restore UI elements
        vscode.workspace.getConfiguration('workbench').update('activityBar.visible', true, true);
        vscode.workspace.getConfiguration('editor').update('minimap.enabled', true, true);
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    private updateFocusState() {
        if (!this.enabled) return;

        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) return;

        const visibleRange = activeEditor.visibleRanges[0];
        const documentRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(activeEditor.document.lineCount - 1, 0)
        );

        // Dim everything except the visible range
        const decorations: vscode.DecorationOptions[] = [{
            range: new vscode.Range(
                documentRange.start,
                visibleRange.start
            )
        },
        {
            range: new vscode.Range(
                visibleRange.end,
                documentRange.end
            )
        }];

        activeEditor.setDecorations(this.decorationType, decorations);
    }

    private clearDecorations() {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor) {
            activeEditor.setDecorations(this.decorationType, []);
        }
    }

    public dispose() {
        this.decorationType.dispose();
    }
}
