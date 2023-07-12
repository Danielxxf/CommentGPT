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
      const codeSnippet = document.getText(selection);
      const insertPosition = new vscode.Position(editor.document.lineAt(selection.end.line).lineNumber + 1, 0);
      await vscode.commands.executeCommand('editor.action.commentLine');

      try {
        // 使用 ChatGPT API 生成注释文本
        const comment = await generateComment(codeSnippet, openai, model, language);
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
      messages: [{ role: 'user', content: 'Please add detailed comments to the following code. The comments should be written in '+ language +' and should not modify the source code. If no code is provided, please throw an error.\n' + codeSnippet }],
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

export function deactivate() {}