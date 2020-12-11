import * as fs from 'fs';
import * as path from 'path';
import * as Q from 'q';
import { TextEditor, window, workspace } from 'vscode';
// import { IFiles } from './file';
// import { FileContents } from './file-contents';
// import { Utils } from './utils';

export class ThemeAdder {
  // Show input prompt for folder name
  // The imput is also used to create the files with the respective name as defined in the Angular style guide [https://angular.io/docs/ts/latest/guide/style-guide.html]
  public showFileNameDialog(args: any): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();

    var clickedFolderPath: string;
    if (args) {
      clickedFolderPath = args.fsPath;
    } else {
      if (!window.activeTextEditor) {
        deferred.reject('Please open a file first.. or just right-click on a file/folder and use the context menu!');
        return deferred.promise;
      } else {
        clickedFolderPath = path.dirname(window.activeTextEditor.document.fileName);
      }
    }
    var newFolderPath: string = fs.lstatSync(clickedFolderPath).isDirectory() ? clickedFolderPath : path.dirname(clickedFolderPath);

    if (workspace.rootPath === undefined) {
      deferred.reject('Please open a project first. Thanks! :-)');
    } else {
      window
        .showInputBox({
          prompt: "What's the name of the component for which you want to add a theme?",
          value: 'component',
        })
        .then(
          (fileName) => {
            if (!fileName || /[~`!#$%\^&*+=\[\]\\';,/{}|\\":<>\?\s]/g.test(fileName)) {
              deferred.reject("That's not a valid name! (no whitespaces or special characters)");
            } else {
              deferred.resolve(path.join(newFolderPath, `${fileName}.component.theme.scss`));
            }
          },
          (error) => console.error(error)
        );
    }
    return deferred.promise;
  }

  public createFile(fileName: string): Q.Promise<string> {
    const deferred: Q.Deferred<string> = Q.defer<string>();
    var inputName: string = path.parse(fileName).name;

    var ta: ThemeAdder = new ThemeAdder();
    var content: string = ta.getFileContentWithName(inputName);

    fs.writeFile(fileName, content, (err) => {
      if (err) {
        deferred.reject(err.message);
      }
    });

    deferred.resolve(fileName);

    return deferred.promise;
  }

  public openFileInEditor(fileUrl: string): Q.Promise<TextEditor> {
    const deferred: Q.Deferred<TextEditor> = Q.defer<TextEditor>();

    workspace.openTextDocument(fileUrl).then((textDocument) => {
      if (!textDocument) {
        return;
      }
      window.showTextDocument(textDocument).then((editor) => {
        if (!editor) {
          return;
        }
        deferred.resolve(editor);
      });
    });

    return deferred.promise;
  }

  private getFileContentWithName(name: string): string {
    name = name.replace('.component.theme', '');

    var content: string = '';
    content = `@use '~@angular/material/theming';\n\n@mixin _${name}-color($colors) {\n\t$trp: map-get($colors, trp);\n\tcolor: theming.mat-color($trp, example-color);\n}\n\n@mixin ${name}-theme($theme) {\n\t$color: theming.mat-get-color-config($theme);\n\n\t@if $color != null {\n\t\ttrp-${name} {\n\t\t\t@include _${name}-color($color);\n\t\t}\n\t}\n}`;
    return content;
  }
}
