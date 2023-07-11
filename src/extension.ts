import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from "openai";
import * as fs from 'fs';
import * as path from 'path';


// 激活函数
export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "auto-comment" is now active!'); // 输出激活成功的消息

  const configPath = path.resolve(__dirname, '../config/config.json'); // 定义配置文件路径
  let apiKey: string; // 定义apiKey变量并赋值
  let model: string; // 定义model变量并赋值

  try {
    const data = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(data);
    apiKey = config.apiKey;
    model = config.model;
  } catch (err) {
    console.log(`Failed to read config file: ${err}`);
    return;
  }
  console.log(apiKey);
  
  // 创建一个新的Configuration对象，将API密钥传递给它进行配置
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

      try {
        // 使用 ChatGPT API 生成注释文本
        const comment = await generateComment(codeSnippet, openai, model);
        console.log(comment);
        if (comment && comment.length > 0) {
          const languageId = document.languageId;
          const commentSymbol = getCommentSymbol(languageId);

          editor.edit((editBuilder) => {
            editBuilder.insert(selection.start, `${commentSymbol.start}\n`);
            editBuilder.insert(selection.end, `\n${commentSymbol.end}\n`);
            editBuilder.insert(selection.end, `\n${comment}\n`);
          });
        }
      } catch (error) {
        vscode.window.showErrorMessage('Failed to generate comment: ' + error);
      }
    }
  });

  context.subscriptions.push(disposable);
}

async function generateComment(codeSnippet: string, openai: OpenAIApi, model: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    console.log(codeSnippet);
    openai.createChatCompletion({
      model: model,
      messages: [{ role: 'user', content: 'Please add detailed comments to the following code. The comments should be written in '+ vscode.env.language.toLowerCase() +'(ISO 639-1) and should not modify the source code. If no code is provided, please throw an error.\n' + codeSnippet }],
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

function getCommentSymbol(languageId: string): { start: string, end: string } {
  switch (languageId) {
    case 'javascript':
    case 'typescript':
      return { start: '/*', end: '*/' };
    case 'python':
      return { start: '"""', end: '"""' };
    case 'java':
      return { start: '/**', end: '*/' };
    case 'cpp':
    case 'c':
    case 'csharp':
      return { start: '/*', end: '*/' };
    case 'html':
    case 'xml':
      return { start: '<!--', end: '-->' };
    case 'css':
      return { start: '/*', end: '*/' };
    case 'ruby':
      return { start: '=begin', end: '=end' };
    case 'swift':
      return { start: '/*', end: '*/' };
    case 'php':
      return { start: '/*', end: '*/' };
    // Add more cases for other programming languages if needed
    default:
      return { start: '', end: '' };
  }
}

export function deactivate() {}