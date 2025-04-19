# 講道文翻譯網站 (Sermon)

這是一個基於 Turborepo 和 Next.js 的講道文翻譯網站 monorepo 專案，用於將上傳的 .docx 格式講道文件轉換為網頁格式，方便瀏覽和翻譯。

## 專案架構

本專案使用 Turborepo 作為 monorepo 管理工具，架構如下：

### 應用程式 (`apps/`)

- `7grace`: 恩典園教會講道文翻譯網站 - 用於將上傳的 .docx 格式講道文件轉換為網頁格式

### 共享套件 (`packages/`)

- _(目前暫無共享套件，未來可視需求擴充)_

## 功能特點

- 支援上傳 .docx 格式的講道文件
- 自動將文件轉換為 Markdown 格式
- 支援大型文件的分割處理
- 可擴展的架構，支援未來添加更多文件格式

## 開發工具

本專案使用 Biome 作為程式碼格式化和檢查工具，並使用 Turborepo 管理任務：

```bash
# 開發全部專案
pnpm dev

# 構建全部專案
pnpm build

# 檢查程式碼
pnpm lint

# 格式化程式碼
pnpm format

# 檢查並自動修正問題
pnpm check
```

## 專案模組設計 (七個恩典應用)

### 文件處理模組 (`apps/7grace/lib/document-processor/`)

- **核心功能**：提供擴展性強的文件處理機制
- **工廠模式**：根據文件類型選擇適當的處理器
- **處理器**：
  - `DocxProcessor`: 處理 Word 文檔格式
  - `GenericProcessor`: 作為其他格式的基類
- **工具類**：
  - `split-markdown.ts`: 分割大型 Markdown 文件
  - `storage.ts`: 提供 Vercel KV 儲存功能

### 後端動作 (`apps/7grace/actions/`)

- `convert-document.ts`: 處理檔案上傳和轉換的 Server Action
- 從原有的 `convert.ts` 重構，採用更模組化的方法

### 前端頁面 (`apps/7grace/app/`)

- `page.tsx`: 主頁，提供檔案上傳表單
- `articles/[slug]/page.tsx`: 顯示轉換後的文章頁面

### 共享配置 (`packages/config/`)
- _(此部分已移除，相關說明不再適用)_

## 快速開始

首先，安裝依賴：

```bash
pnpm install
```

安裝過程會自動編譯共享配置。然後，運行開發服務器：

```bash
pnpm dev
```

或只運行特定專案：

```bash
pnpm --filter=7grace dev
```

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 即可看到結果。

## 技術堆棧

- [Turborepo](https://turbo.build/) - Monorepo 管理工具
- [Next.js](https://nextjs.org/) - React 框架
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - 鍵值存儲
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - Word 文檔轉換
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架

## 部署

本專案可以部署到 Vercel 平台，支持多專案部署。

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
