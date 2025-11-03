# GitHub 用户备注（Tampermonkey 脚本）

该仓库提供一个小型的 Tampermonkey 用户脚本（TypeScript + esbuild），用于帮助 GitHub 组织和团队维护者为 GitHub 用户添加本地“备注名”。它会在常见 GitHub 页面（组织成员、团队、PR、评论、settings/access 等）旁显示可读的别名或备注。

主要功能

- 在用户名旁显示备注（badge）。
- 页面内内联编辑与管理面板，一处集中查看和编辑所有备注。
- 支持 CSV 导入/导出，方便批量管理。
- 简易多语言界面（中文/English）并带语言选择。
- 将备注保存在浏览器的 `localStorage`（无需服务器）。

使用场景

当组织使用数字 ID 或显示名较难识别时，管理者可以为人员添加友好名称（备注），在本地浏览器中查看这些备注以提升可读性和协作效率。

安装（用户）

1. 在浏览器中安装 Tampermonkey。
2. 下载本仓库构建产物 `dist/tampermonkey-userscript.user.js`（或使用托管的 raw URL / Release 资源）。
3. 在 Tampermonkey 中导入脚本并启用。脚本会在 metadata 中定义的 GitHub 页面上运行。

快速使用

- 点击右下角的“备注管理”按钮打开管理面板。
- 在任意支持页面上点击用户旁的 badge 进行内联编辑。
- 在管理面板中可以导入/导出 CSV、手动添加、删除条目并切换语言。

开发者说明

- 源文件：

  - `src/metadata.user.js` — Tampermonkey 元数据（发布前更新 @match/@name/@version）。
  - `src/main.ts` — TypeScript 源（脚本逻辑、选择器、UI、多语言）。
  - `scripts/build.mjs` — esbuild 打包脚本，会注入元数据并生成 `dist/`。

- 本地构建：

  ```pwsh
  pnpm install
  pnpm run build
  ```

- 构建后将 `dist/tampermonkey-userscript.user.js` 导入 Tampermonkey，或将其作为 Release 资源发布。

存储与隐私

- 备注保存在浏览器的 `localStorage`（键名为 `github_user_notes`），语言选择保存在 `github_user_notes_lang`。
- 脚本不会向任何服务器传输数据。

扩展

- 若 GitHub DOM 发生变化，可在 `src/main.ts` 中添加或调整选择器。
- 如需更多语言，在 `I18N` 中添加对应条目并扩展语言选择器。

需要我帮助添加 CI 自动构建并将 `dist/` 作为 Release 工件上传吗？
