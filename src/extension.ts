import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-comment" is now active!');

  const configPath = './config.json'; // 配置文件路径
  let apiKey:string = '';
  let model:string = '';

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(data);
    apiKey = config.apiKey;
    model = config.model;
  } catch (err) {
    console.log(`Failed to read config file: ${err}`);
    return;
  }
  
  // 创建一个新的Configuration对象，将API密钥传递给它进行配置
  const configuration = new Configuration({
    apiKey: apiKey,
  });
  
  // 用上面创建的Configuration对象来实例化一个新的OpenAIApi对象，并传递密钥进行身份验证
  const openai = new OpenAIApi(configuration);

  let disposable = vscode.commands.registerCommand('commentgpt.generateComment', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const document = editor.document;
      const selection = editor.selection;
      const codeSnippet = document.getText(selection);

      // 使用 ChatGPT API 生成注释文本
      generateComment(codeSnippet, openai)
        .then((comment) => {
          console.log(comment);
          if (comment && comment.length > 0) {
            editor.edit((editBuilder) => {
              editBuilder.insert(selection.start, `/*`);
              editBuilder.insert(selection.end, `*/\n`);
              editBuilder.insert(selection.end, `\n${comment}\n`);
            });
          }
        })
        .catch((error) => {
          vscode.window.showErrorMessage('Failed to generate comment: ' + error.message);
        });
    }
  });

  context.subscriptions.push(disposable);
}

async function generateComment(codeSnippet: string, openai: OpenAIApi): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: '请为以下代码添加详尽的注释，如果没给出代码，你就报错\n' + codeSnippet }],
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