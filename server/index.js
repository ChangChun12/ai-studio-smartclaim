import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[SmartClaim API] GEMINI_API_KEY is missing. AI routes will return errors until it is configured.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const ensureModel = () => {
  if (!genAI) {
    throw new Error('Gemini API key is not configured.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

app.post('/api/gemini/summary', async (req, res) => {
  const { text } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Missing text to summarize.' });
  }

  const truncatedText = String(text).substring(0, 15000);
  const prompt = `
    請閱讀以下保險保單的文字內容，並進行快速分析。
    請回傳一個 JSON 物件 (不要 Markdown)，包含以下欄位：
    1. "title": 判斷出的保險公司與保單名稱。
    2. "summary": 50 字以內的保單功能摘要。
    3. "highlights": 3 個保障亮點。
    4. "suggestedQuestions": 3 個不超過 12 個中文字的具體問題。

    保單內容片段：
    ${truncatedText}
  `;

  try {
    const model = ensureModel();
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const jsonRes = JSON.parse(response.response?.text() || "{}");

    res.json({
      title: jsonRes.title || "已上傳保單",
      summary: jsonRes.summary || "已完成保單內容解析。",
      highlights: jsonRes.highlights || [],
      suggestedQuestions: jsonRes.suggestedQuestions || [
        "理賠範圍有哪些？",
        "除外責任是什麼？",
        "如何申請理賠？"
      ]
    });
  } catch (error) {
    console.error('Gemini summary error:', error);
    res.status(500).json({
      title: "已上傳保單",
      summary: "系統已讀取內容，但 AI 分析暫時無法使用。",
      highlights: [],
      suggestedQuestions: ["理賠範圍有哪些？", "除外責任是什麼？", "如何申請理賠？"]
    });
  }
});

app.post('/api/gemini/chat', async (req, res) => {
  const { query, contextText = "", mode = 'general' } = req.body || {};

  if (!query) {
    return res.status(400).json({ text: "缺少使用者問題。", guidance: [] });
  }

  let systemInstruction = "";

  if (mode === 'single') {
    systemInstruction = `你是一位專業的保險理賠助手 (SmartClaim AI)。
    使用者已上傳一份特定的保單文件 (PDF)。
    請**完全依據**該上傳文件的內容來回答使用者的問題。
    若文件中沒有相關資訊，請如實告知。`;
  } else if (mode === 'multi') {
    systemInstruction = `你是一位專業的保險理賠總管 (SmartClaim AI)。
    使用者已上傳多份保單文件。提供的 Context 包含所有文件的內容，並標註了來源文件名。
    請綜合分析這些文件來回答問題。
    例如，如果使用者問「哪張保單賠比較多」，請進行比較。
    請在回答中明確指出資訊來源於哪一份保單。`;
  } else {
    systemInstruction = `你是一位擁有豐富保險知識的專業顧問 (SmartClaim AI)。
    目前使用者**尚未上傳任何保單文件**。
    請基於你在台灣保險法規、常見理賠實務、專有名詞解釋方面的專業知識來回答使用者的問題。
    回答時請說明這是一般性的保險知識，實際理賠仍需視個別保單條款而定。
    若遇到需要具體條款才能判斷的問題（如：賠多少錢），請提醒使用者上傳保單以獲得精確分析。`;
  }

  const finalContext = contextText
    ? `[參考文件內容 (Context)]:\n${String(contextText).substring(0, 50000)} (為確保效能，內容可能經截斷)`
    : `[無特定參考文件，請依據一般專業知識回答]`;

  const prompt = `
    ${systemInstruction}

    使用者問題: "${query}"
    
    ${finalContext}

    請使用**繁體中文 (Traditional Chinese)** 進行邏輯判斷並回答：

    **判斷邏輯步驟**：
    1. **檢查資訊充足性**：
       - 若需要計算金額但缺變數 -> Path A (追問)。
       - 若只是問定義或一般知識 -> Path B (分析)。
       - 若在多保單模式下需要釐清哪張保單 -> Path A (追問)。
       
    2. **決策路徑**：
       - **路徑 A (資訊不足 - 需要追問)**：將 status 設為 "clarification"。
       - **路徑 B (資訊充足 - 進行分析)**：將 status 設為 "analysis"。

    **JSON 回覆格式要求**：
    請務必回傳合法的 JSON 物件，不要包含 Markdown 的 \`\`\`json 標記。格式如下：

    若為 **路徑 A (需要追問)**：
    {
      "status": "clarification",
      "response": "一段文字，解釋需要哪些額外資訊。",
      "follow_up": "一句簡短、明確的問句",
      "checklist": [],
      "key_points": []
    }

    若為 **路徑 B (進行分析)**：
    {
      "status": "analysis",
      "response": "一段清晰的分析結論。請務必將**重點**、**金額**、**條件**使用 Markdown 的粗體語法 (**內容**) 標示。",
      "checklist": ["建議步驟1", "建議步驟2"],
      "key_points": ["重點1", "重點2 (如: 骨折險: **5萬元**)"],
      "warning": "除外責任或注意事項",
      "original_terms": "引用來源文字 (若為一般知識模式則免填)"
    }
  `;

  try {
    const model = ensureModel();
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: { responseMimeType: 'application/json' }
    });

    const jsonRes = JSON.parse(response.response?.text() || "{}");
    const structuredData = {
      status: jsonRes.status || 'analysis',
      response: jsonRes.response || "目前無法分析您的問題。",
      checklist: jsonRes.checklist || [],
      key_points: jsonRes.key_points,
      warning: jsonRes.warning,
      original_terms: jsonRes.original_terms,
      follow_up: jsonRes.follow_up
    };

    res.json({
      text: structuredData.response,
      guidance: structuredData.checklist || [],
      structuredData
    });
  } catch (error) {
    console.error('Gemini chat error:', error);
    res.status(500).json({
      text: "分析過程中發生錯誤，請稍後再試。",
      guidance: []
    });
  }
});

app.listen(PORT, () => {
  console.log(`[SmartClaim API] Server is running on http://0.0.0.0:${PORT}`);
});
