import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-comment" is now active!');

  const configPath = path.resolve(__dirname, '../config/config.json');
  let apiKey: string;
  let model: string;
  let language: string;

  let languageNames = new Intl.DisplayNames(['en'], {type: 'language'});

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(data);
    apiKey = config.apiKey;
    model = config.model;
    language = config.language || languageNames.of(vscode.env.language.toLowerCase());
  } catch (err) {
    console.log(`Failed to read config file: ${err}`);
    return;
  }
  console.log(apiKey);
  
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  
  // 用上面创建的Configuration对象来实例化一个新的OpenAIApi对象，并传递密钥进行身份验证
  const openai = new OpenAIApi(configuration);

  let disposable = vscode.commands.registerCommand('commentgpt.generateComment', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const startLine = selection.start.line;
      const endLine = selection.end.line;
      const codeSnippet = document.getText(selection);
      const insertPosition = new vscode.Position(editor.document.lineAt(selection.end.line).lineNumber + 1, 0);
      let minIndentation = 50;
      
      for (let line = startLine; line <= endLine; line++) {
        const currentLine = editor.document.lineAt(line);
        if (currentLine.isEmptyOrWhitespace){
          continue;
        }
        const indentation = currentLine.firstNonWhitespaceCharacterIndex;

        if (indentation < minIndentation) {
          minIndentation = indentation;
        }
      }
      console.log(minIndentation);
      
      await vscode.commands.executeCommand('editor.action.commentLine');

      try {
        // 使用 ChatGPT API 生成注释文本
        const comment = indentText(await generateComment(codeSnippet, openai, model, language), minIndentation);
        console.log(comment);
        if (comment && comment.length > 0) {
          editor.edit((editBuilder) => {
            editBuilder.insert(insertPosition, `\n${comment}\n`);
          });
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to generate comment: ' + error);
      }
    }
  });

  context.subscriptions.push(disposable);
}

async function generateComment(codeSnippet: string, openai: OpenAIApi, model: string, language: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    console.log(codeSnippet);
    openai.createChatCompletion({
      model: model,
      messages: [{ role: 'user', content: 'Please add detailed comments for the following code. Use the corresponding programming language\'s comment symbols to embed the comments in the code. Your response should only contain comments and code, without any additional textual descriptions. Please use '+ language +' as the natural language for the comments. Do not modify the source code. If no code is provided, please report an error.\n' + codeSnippet }],
    })
      .then((response) => {
        const message = response.data.choices[0]?.message?.content;
        console.log(message);
        if (message && typeof message === 'string') {
          resolve(message);
        } else {
          reject(new Error('Failed to generate comment: Invalid response message'));
        }
      })
      .catch((error) => {
        reject(new Error('Failed to generate comment: ' + error.message));
      });
  });
}

function indentText(text: string, indentLevel: number): string {
  const indent = ' '.repeat(indentLevel); // 设置缩进字符串，例如：4个空格
  return text.split('\n').map(line => indent + line).join('\n');
}

export function deactivate() {}