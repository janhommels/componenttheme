import * as vscode from 'vscode';
import { ThemeAdder } from './theme-adder';

export function activate(context: vscode.ExtensionContext) {
  var addComponentTheme = vscode.commands.registerCommand('componenttheme.addComponentTheme', (args) => {
    const themeAdder: ThemeAdder = new ThemeAdder();
    themeAdder
      .showFileNameDialog(args)
      .then(themeAdder.createFile)
      .then(themeAdder.openFileInEditor)
      .catch((err) => {
        if (err) {
          vscode.window.showErrorMessage(err);
        }
      });
  });

  context.subscriptions.push(addComponentTheme);
}

// this method is called when your extension is deactivated
export function deactivate() {}
