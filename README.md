# 講道文翻譯網站

這是一個基於 Next.js 的講道文翻譯網站，用於將上傳的 .docx 格式講道文件轉換為網頁格式，方便瀏覽和翻譯。

## 功能特點

- 支援上傳 .docx 格式的講道文件
- 自動將文件轉換為 Markdown 格式
- 支援大型文件的分割處理
- 可擴展的架構，支援未來添加更多文件格式

## 開發工具

本專案使用 Biome 作為程式碼格式化和檢查工具：

```bash
# 檢查程式碼
pnpm lint

# 格式化程式碼
pnpm format

# 檢查並自動修正問題
pnpm check
```

## 架構設計

本專案使用模組化設計，主要架構如下：

### 文件處理模組 (`lib/document-processor/`)

- **核心功能**：提供擴展性強的文件處理機制
- **工廠模式**：根據文件類型選擇適當的處理器
- **處理器**：
  - `DocxProcessor`: 處理 Word 文檔格式
  - `GenericProcessor`: 作為其他格式的基類
- **工具類**：
  - `split-markdown.ts`: 分割大型 Markdown 文件
  - `storage.ts`: 提供 Vercel KV 儲存功能

### 後端動作 (`actions/`)

- `convert-document.ts`: 處理檔案上傳和轉換的 Server Action
- 從原有的 `convert.ts` 重構，採用更模組化的方法

### 前端頁面 (`app/`)

- `page.tsx`: 主頁，提供檔案上傳表單
- `articles/[slug]/page.tsx`: 顯示轉換後的文章頁面

### UI 元件 (`components/`)

- `Article.tsx`: 文章容器元件
- `MarkdownContent.tsx`: Markdown 渲染元件

## 快速開始

首先，運行開發服務器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

在瀏覽器中打開 [http://localhost:3000](http://localhost:3000) 即可看到結果。

## 技術堆棧

- [Next.js](https://nextjs.org/) - React 框架
- [Vercel KV](https://vercel.com/docs/storage/vercel-kv) - 鍵值存儲
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - Word 文檔轉換
- [React Markdown](https://github.com/remarkjs/react-markdown) - Markdown 渲染

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
