
import { StructuredResponse } from "../types";

// Toggle this to TRUE to use the secure backend proxy
// For local testing with .env, set VITE_USE_LOCAL_API=true in .env
const USE_PROXY = !import.meta.env.VITE_USE_LOCAL_API;

// Only used for local testing if USE_PROXY is false
// TEMPORARY: For debugging, you can hardcode your API key here
const TEMP_API_KEY = ''; // Paste your API key here temporarily for testing
const localApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Debug: Log environment variables (remove in production)
console.log('🔍 Environment Check:', {
  USE_PROXY,
  VITE_USE_LOCAL_API: import.meta.env.VITE_USE_LOCAL_API,
  hasApiKey: !!localApiKey,
  apiKeyPrefix: localApiKey ? localApiKey.substring(0, 10) + '...' : 'MISSING',
  usingTempKey: !!TEMP_API_KEY
});

type AnalysisMode = 'single' | 'multi' | 'general';

/**
 * Helper to call the backend proxy
 */
async function callProxyAPI(prompt: string, systemInstruction?: string): Promise<any> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Server Error');
  }

  const data = await response.json();
  return JSON.parse(data.text);
}

/**
 * Generates a summary for an uploaded policy document.
 */
export const generatePolicySummary = async (text: string): Promise<{
  title: string;
  summary: string;
  highlights: string[];
  suggestedQuestions: string[];
}> => {
  const truncatedText = text.substring(0, 15000);

  const prompt = `
    請閱讀以下保險保單的文字內容，並進行快速分析。
    請回傳一個 JSON 物件 (不要 Markdown)，包含以下欄位：
    1. "title": 判斷出的保險公司與保單名稱 (例如：國泰人壽真安心住院醫療終身保險)。
    2. "summary": 用 50 字以內簡介這張保單的主要功能 (例如：這是一張針對住院與手術的實支實付醫療險...)。
    3. "highlights": 列出 3 個此保單的保障亮點 (例如：包含門診手術、理賠無上限、針對特定意外加倍)。
    4. "suggestedQuestions": 根據此保單內容，提出 3 個使用者可能會問的"具體"問題。**重要：為了確保版面整齊，每個問題請嚴格限制在 12 個中文字以內** (例如："骨折未住院有賠嗎？"、"門診手術賠多少？")。

    保單內容片段：
    ${truncatedText}
  `;

  try {
    let jsonRes;

    if (USE_PROXY) {
      jsonRes = await callProxyAPI(prompt);
    } else {
      // Local Client-Side Fallback (Optional)
      const { GoogleGenAI } = await import("@google/genai");
      if (!localApiKey) throw new Error("Local API Key missing");
      const ai = new GoogleGenAI({ apiKey: localApiKey });
      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      jsonRes = JSON.parse(resp.text || "{}");
    }

    return {
      title: jsonRes.title || "已上傳保單",
      summary: jsonRes.summary || "已完成保單內容解析。",
      highlights: jsonRes.highlights || [],
      suggestedQuestions: jsonRes.suggestedQuestions || ["理賠範圍有哪些？", "除外責任是什麼？", "如何申請理賠？"]
    };
  } catch (error: any) {
    console.error("Summary Generation Error:", error);
    return {
      title: "分析失敗",
      summary: "無法連接 AI 服務，請稍後再試。",
      highlights: [],
      suggestedQuestions: []
    };
  }
};

/**
 * Generates advice based on the user query and provided context.
 */
export const generateClaimAdvice = async (
  query: string,
  contextText: string = "",
  mode: AnalysisMode = 'general'
): Promise<{ text: string; guidance: string[]; structuredData?: StructuredResponse; suggestedQuestions?: string[] }> => {

  let systemInstruction = "";

  if (mode === 'single') {
    systemInstruction = `你是一位專業的保險理賠助手 (SmartClaim AI)。
    使用者已上傳一份特定的保單文件 (PDF)。
    請**完全依據**該上傳文件的內容來回答使用者的問題。
    若文件中沒有相關資訊，請如實告知。`;
  } else if (mode === 'multi') {
    systemInstruction = `你是一位專業的保險理賠總管 (SmartClaim AI)。
    使用者已上傳多份保單文件。提供的 Context 包含所有文件的內容，並標註了來源文件名。
    請綜合分析這些文件來回答問題。`;
  } else {
    systemInstruction = `你是一位擁有豐富保險知識的專業顧問 (SmartClaim AI)。
    目前使用者**尚未上傳任何保單文件**。
    請基於你在台灣保險法規、常見理賠實務、專有名詞解釋方面的專業知識來回答使用者的問題。`;
  }

  const finalContext = contextText ? `
    [參考文件內容 (Context)]:
    ${contextText.substring(0, 50000)} (為確保效能，內容可能經截斷)
  ` : `[無特定參考文件，請依據一般專業知識回答]`;

  const prompt = `
    使用者問題: "${query}"
    
    ${finalContext}

    請使用**繁體中文 (Traditional Chinese)** 進行邏輯判斷並回答：

    **判斷邏輯步驟**：
    1. **檢查資訊充足性**：若需要計算金額但缺變數或需要釐清哪張保單 -> Path A (追問)。否則 -> Path B (分析)。
       
    2. **決策路徑**：
       - **路徑 A (資訊不足 - 需要追問)**：將 status 設為 "clarification"。
       - **路徑 B (資訊充足 - 進行分析)**：將 status 設為 "analysis"。

    **JSON 回覆格式要求**：
    請務必回傳合法的 JSON 物件。**每個回覆都必須包含 suggested_questions 欄位**。格式如下：

    若為 **路徑 A (需要追問)**：
    {
      "status": "clarification",
      "response": "一段文字,解釋需要哪些額外資訊。",
      "follow_up": "一句簡短、明確的問句",
      "checklist": [],
      "key_points": [],
      "suggested_questions": ["相關問題1", "相關問題2", "相關問題3"]
    }

    若為 **路徑 B (進行分析)**：
    {
      "status": "analysis",
      "response": "一段清晰的分析結論。請務必將**重點金額和條件**使用 Markdown 粗體 (**內容**) 標示。",
      "checklist": ["建議步驟1", "建議步驟2"],
      "key_points": ["重點1", "重點2"],
      "warning": "除外責任或注意事項",
      "original_terms": "引用來源文字",
      "suggested_questions": ["後續問題1", "後續問題2", "後續問題3"]
    }

    **【必填】suggested_questions 欄位要求**：
    1. **必須生成 3 個問題**,不可省略此欄位
    2. 問題應基於當前對話內容,引導使用者深入探討
    3. 每個問題限制在 12 個中文字以內
    4. 問題要具體實用,例如："骨折未住院有賠嗎？"、"理賠金額如何計算？"、"等待期有多久？"
  `;

  try {
    let jsonRes;

    if (USE_PROXY) {
      jsonRes = await callProxyAPI(prompt, systemInstruction);
    } else {
      const { GoogleGenAI } = await import("@google/genai");
      if (!localApiKey) throw new Error("Local API Key missing");
      const ai = new GoogleGenAI({ apiKey: localApiKey });

      const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\n${prompt}`,
        config: { responseMimeType: "application/json" }
      });
      jsonRes = JSON.parse(resp.text || "{}");
    }

    const structuredData: StructuredResponse = {
      status: jsonRes.status || 'analysis',
      response: jsonRes.response || "目前無法分析您的問題。",
      checklist: jsonRes.checklist || [],
      key_points: jsonRes.key_points,
      warning: jsonRes.warning,
      original_terms: jsonRes.original_terms,
      follow_up: jsonRes.follow_up
    };

    // 注意: AI 回傳的是 suggested_questions (底線),需要轉換為 suggestedQuestions (駝峰式)
    const suggestedQuestions = jsonRes.suggested_questions || jsonRes.suggestedQuestions || [];

    console.log('📝 建議問題轉換:', {
      raw_suggested_questions: jsonRes.suggested_questions,
      raw_suggestedQuestions: jsonRes.suggestedQuestions,
      final: suggestedQuestions
    });

    return {
      text: structuredData.response,
      guidance: structuredData.checklist || [],
      structuredData: structuredData,
      suggestedQuestions: suggestedQuestions
    };

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return {
      text: "分析過程中發生錯誤 (" + (error.message || "Unknown") + ")。請稍後再試。",
      guidance: [],
      suggestedQuestions: []
    };
  }
};

