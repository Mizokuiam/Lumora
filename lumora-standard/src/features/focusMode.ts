import * as vscode from 'vscode';

export class FocusMode {
    private enabled: boolean;
    private statusBarItem: vscode.StatusBarItem;
    private originalLayout: any;

    constructor() {
        this.enabled = false;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
        this.updateStatusBar();
    }

    public toggle() {
        if (this.enabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    private enable() {
        this.enabled = true;
        this.saveCurrentLayout();
        this.applyFocusLayout();
        this.updateStatusBar();
        vscode.window.showInformationMessage('Focus mode enabled');
    }

    private disable() {
        this.enabled = false;
        this.restoreLayout();
        this.updateStatusBar();
        vscode.window.showInformationMessage('Focus mode disabled');
    }

    private saveCurrentLayout() {
        this.originalLayout = {
            panel: vscode.workspace.getConfiguration('workbench').get('panel.defaultPosition'),
            activityBar: vscode.workspace.getConfiguration('workbench').get('activityBar.visible'),
            minimap: vscode.workspace.getConfiguration('editor').get('minimap.enabled'),
            breadcrumbs: vscode.workspace.getConfiguration('breadcrumbs').get('enabled')
        };
    }

    private applyFocusLayout() {
        // Hide distracting UI elements
        vscode.workspace.getConfiguration('workbench').update('panel.defaultPosition', 'hidden', true);
        vscode.workspace.getConfiguration('workbench').update('activityBar.visible', false, true);
        vscode.workspace.getConfiguration('editor').update('minimap.enabled', false, true);
        vscode.workspace.getConfiguration('breadcrumbs').update('enabled', false, true);
    }

    private restoreLayout() {
        if (!this.originalLayout) return;

        vscode.workspace.getConfiguration('workbench').update('panel.defaultPosition', this.originalLayout.panel, true);
        vscode.workspace.getConfiguration('workbench').update('activityBar.visible', this.originalLayout.activityBar, true);
        vscode.workspace.getConfiguration('editor').update('minimap.enabled', this.originalLayout.minimap, true);
        vscode.workspace.getConfiguration('breadcrumbs').update('enabled', this.originalLayout.breadcrumbs, true);
    }

    private updateStatusBar() {
        this.statusBarItem.text = `$(eye${this.enabled ? '' : '-closed'}) Focus Mode`;
        this.statusBarItem.tooltip = `Focus mode is ${this.enabled ? 'enabled' : 'disabled'}`;
        this.statusBarItem.show();
    }

    public dispose() {
        this.disable();
        this.statusBarItem.dispose();
    }
}
