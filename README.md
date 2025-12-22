<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/16M_CeCnHQE4VcbpFeacKWz0ECvqbLwhi

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set the `GEMINI_API_KEY` to your Gemini API key.
3. Start the backend proxy (keeps your API key on the server side):
   `npm run server`
4. In another terminal, run the frontend:
   `npm run dev`
