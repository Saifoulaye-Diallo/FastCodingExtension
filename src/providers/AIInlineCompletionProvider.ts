import * as vscode from 'vscode';
import { codeCompletion } from '../commands/gpt-4-turbo/codeCompletion';

export const AIInlineCompletionProvider: vscode.InlineCompletionItemProvider = {
    async provideInlineCompletionItems(document, position) {
      const before = document.getText(new vscode.Range(new vscode.Position(0, 0), position));
  
      const after = document.getText(
        new vscode.Range(
          position,
          new vscode.Position(
            Math.min(document.lineCount - 1, position.line + 10),
            1000
          )
        )
      );
  
      const suggestion = await codeCompletion(before, after);
  
      if (!suggestion?.trim()) return [];
  
      const ghostText = suggestion.trim();
  
      return [
        new vscode.InlineCompletionItem(ghostText, new vscode.Range(position, position))
      ];
    }
  };
  
