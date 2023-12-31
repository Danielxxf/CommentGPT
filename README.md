# CommentGPT
这是一个基于 ChatGPT 可为多种语言代码添加注释的 VSCode 插件。
## Config
编辑 `config/config_example.json`

```
{
    "apiKey": "Your_OpenAI_ApiKey", //Replace it with your own ApiKey.
    "model": "gpt-3.5-turbo",
    "language": "" //Fill in your language or leave it blank (using vscode's language setting).
}
```
保存为 `config.json`

## Usage
选中需要注释的代码段，右键菜单选择`生成注释`  
  
![image](https://github.com/Danielxxf/CommentGPT/assets/48150158/bd428bf3-a736-4c22-99eb-bd72c077a226)

## 声明
该插件是基于 ChatGPT 模型的一个演示扩展程序，用于自动生成代码注释。请注意以下事项：
1. 生成结果的准确性和质量有限：尽管 ChatGPT 是一种强大的自然语言处理模型，但生成的注释仅仅是基于给定代码片段的猜测。它可能无法提供真实、完整或准确的注释。用户应该审查和验证生成的注释，并根据其判断决定是否采纳。
2. 保护您的 API 密钥和敏感信息：请务必妥善保管您的 OpenAI API 密钥和其他敏感信息。本插件并不处理或存储这些信息，但如配置文件中所使用，请确保不要将敏感信息泄露给他人。
3. 依赖第三方服务和库：该插件依赖 OpenAI 的 ChatGPT 模型和相关 API。请遵守 OpenAI 的服务条款和使用准则。此外，该插件还依赖于 Visual Studio Code 和其他第三方库。请确保在使用插件时遵守相应的许可协议和法律规定。
4. 风险和责任：使用该插件存在风险，并且插件作者对使用该插件造成的任何损失或问题概不负责。请在使用插件之前备份您的代码，并自行承担使用该插件带来的风险和责任。
5. 免责声明的变更：插件作者保留根据需要随时更改免责声明内容的权利。请定期查看并了解最新的免责声明。
通过安装和使用该插件，您即表示您已阅读、理解并同意接受以上免责声明。如果您不同意这些条款，请不要使用该插件。

