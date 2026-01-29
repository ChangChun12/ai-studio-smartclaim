# SmartClaim AI

<div align="center">
<img width="1200" height="475" alt="Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

這是一個基於 AI Studio 的 React 應用程式。

## 在地端執行

**前置需求：** 需要安裝 Node.js。

1.  **安裝依賴套件 (Install dependencies)：**
    ```bash
    npm install
    ```

2.  **設定環境變數：**
    請在 `.env.local` 檔案中設定您的 `GEMINI_API_KEY`：
    ```
    VITE_GEMINI_API_KEY=your_key_here
    ```

3.  **執行應用程式 (Run the app)：**
    ```bash
    npm run dev
    ```

4.  **建置生產版本 (Build for production)：**
    ```bash
    npm run build
    ```

## 部署

本專案包含 GitHub Action 設定，可自動部署至 GitHub Pages。
推送至 `main` 分支後，Action 將會自動執行。

## 技術棧

- React 19
- Vite
- TypeScript
- Google GenAI SDK
