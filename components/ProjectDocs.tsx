
import React, { useState } from 'react';
import { ViewState } from '../types';
import { 
  Server, 
  Cpu, 
  Database, 
  Shield, 
  Layout, 
  Code2, 
  FileText, 
  Workflow,
  Lightbulb,
  Layers,
  Bot,
  Terminal,
  ChevronRight
} from 'lucide-react';

interface ProjectDocsProps {
  setView: (view: ViewState) => void;
}

const ProjectDocs: React.FC<ProjectDocsProps> = ({ setView }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: '專案概述', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'architecture', label: '系統架構', icon: <Server className="w-4 h-4" /> },
    { id: 'tech-stack', label: '技術堆疊', icon: <Code2 className="w-4 h-4" /> },
    { id: 'features', label: '核心功能', icon: <Layout className="w-4 h-4" /> },
    { id: 'api-integration', label: 'AI 模型整合', icon: <Bot className="w-4 h-4" /> },
    { id: 'security', label: '資安與部署', icon: <Shield className="w-4 h-4" /> },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">SmartClaim AI 專案概述</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                SmartClaim AI 是一個基於 RAG (Retrieval-Augmented Generation) 架構的智慧保險理賠輔助系統。
                旨在解決保險人與被保險人之間的「資訊不對稱」問題，透過 AI 技術自動化解析複雜的保單條款，
                提供使用者即時、準確且白話的理賠建議。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                <h3 className="text-xl font-bold text-emerald-800 mb-3 flex items-center">
                  <Workflow className="w-5 h-5 mr-2" />
                  解決痛點
                </h3>
                <ul className="space-y-2 text-emerald-700">
                  <li>• 保單條款艱澀難懂，一般民眾難以閱讀</li>
                  <li>• 理賠金額計算複雜，缺乏試算工具</li>
                  <li>• 跨保單比較耗時，容易遺漏權益</li>
                  <li>• 申請文件繁瑣，常因缺件導致退件</li>
                </ul>
              </div>
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                 <h3 className="text-xl font-bold text-indigo-800 mb-3 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  核心價值
                </h3>
                 <ul className="space-y-2 text-indigo-700">
                  <li>• <span className="font-bold">即時性</span>：上傳 PDF 數秒內完成解析</li>
                  <li>• <span className="font-bold">準確性</span>：基於上傳文件的 Evidence-Based 回答</li>
                  <li>• <span className="font-bold">隱私優先</span>：純前端解析，文件不需儲存於後端</li>
                  <li>• <span className="font-bold">結構化輸出</span>：自動整理檢查清單與試算結果</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'architecture':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">系統架構設計 (System Architecture)</h2>
              <p className="text-gray-600 mb-8">
                本系統採用 Client-Side RAG 架構，將 PDF 解析負載移至客戶端，僅將提取的純文字 Context 發送至 LLM，
                大幅降低伺服器成本並提升隱私性。
              </p>
            </div>

            {/* Architecture Diagram Visualization */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
               <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
                  {/* Client */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-48">
                     <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Layout className="w-6 h-6" />
                     </div>
                     <h4 className="font-bold text-gray-800">React Frontend</h4>
                     <p className="text-xs text-gray-500 mt-1">UI / State Management</p>
                  </div>

                  <div className="hidden md:flex flex-1 h-px bg-gray-300 relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400 font-mono">
                       User Upload
                     </div>
                  </div>
                  
                  {/* Processing */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-48">
                     <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-6 h-6" />
                     </div>
                     <h4 className="font-bold text-gray-800">PDF.js Processing</h4>
                     <p className="text-xs text-gray-500 mt-1">Client-side Extraction</p>
                  </div>

                  <div className="hidden md:flex flex-1 h-px bg-gray-300 relative">
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400 font-mono">
                       Text Context
                     </div>
                  </div>

                  {/* LLM */}
                  <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-200 w-48">
                     <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bot className="w-6 h-6" />
                     </div>
                     <h4 className="font-bold text-gray-800">Gemini 2.5 Flash</h4>
                     <p className="text-xs text-gray-500 mt-1">Inference & Logic</p>
                  </div>
               </div>

               {/* Arrows for mobile flow */}
               <div className="md:hidden flex flex-col items-center gap-2 my-2 text-gray-300">
                  <ChevronRight className="rotate-90" />
                  <ChevronRight className="rotate-90" />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
               <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-bold text-gray-900 mb-2">1. 文件攝取層 (Ingestion)</h4>
                  <p className="text-sm text-gray-600">使用 <code className="bg-gray-100 px-1 rounded">pdfjs-dist</code> 在瀏覽器端直接解析 PDF 二進位資料，提取文字座標與內容，重建段落結構。</p>
               </div>
               <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-bold text-gray-900 mb-2">2. 上下文構建 (Context)</h4>
                  <p className="text-sm text-gray-600">系統根據使用者的模式（單一保單/多保單），動態組裝 Prompt，將提取的文字作為 Context 注入給 LLM。</p>
               </div>
               <div className="border-l-4 border-emerald-500 pl-4">
                  <h4 className="font-bold text-gray-900 mb-2">3. 結構化生成 (Generation)</h4>
                  <p className="text-sm text-gray-600">強制 Gemini 輸出 JSON 格式，包含 <code className="bg-gray-100 px-1 rounded">status</code>, <code className="bg-gray-100 px-1 rounded">key_points</code>, <code className="bg-gray-100 px-1 rounded">checklist</code> 等欄位，以利前端渲染 UI。</p>
               </div>
            </div>
          </div>
        );

      case 'tech-stack':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">技術堆疊 (Technology Stack)</h2>
              <p className="text-gray-600 mb-8">
                本專案採用現代化 React 生態系，專注於高效能、型別安全與優良的使用者體驗。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                 <div className="flex items-center mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600 mr-3">
                        <Code2 className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">Frontend Framework</h3>
                 </div>
                 <ul className="text-sm text-gray-600 space-y-2 ml-12">
                    <li><span className="font-bold text-gray-800">React 19</span>: 利用最新的 Hooks 與 Server Components 概念。</li>
                    <li><span className="font-bold text-gray-800">TypeScript</span>: 嚴格的型別定義，確保開發穩健性。</li>
                    <li><span className="font-bold text-gray-800">Tailwind CSS</span>: Utility-first CSS 框架，快速構建響應式 UI。</li>
                 </ul>
              </div>

              <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                 <div className="flex items-center mb-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 mr-3">
                        <Bot className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">AI & Data Processing</h3>
                 </div>
                 <ul className="text-sm text-gray-600 space-y-2 ml-12">
                    <li><span className="font-bold text-gray-800">Google GenAI SDK</span>: 串接 Gemini 2.5 Flash 模型。</li>
                    <li><span className="font-bold text-gray-800">PDF.js</span>: Mozilla 開源的 PDF 解析引擎 (WebAssembly)。</li>
                    <li><span className="font-bold text-gray-800">LocalStorage</span>: 前端持久化儲存，模擬資料庫功能。</li>
                 </ul>
              </div>

              <div className="p-5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                 <div className="flex items-center mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600 mr-3">
                        <Layout className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-gray-800">UI Components</h3>
                 </div>
                 <ul className="text-sm text-gray-600 space-y-2 ml-12">
                    <li><span className="font-bold text-gray-800">Lucide React</span>: 輕量且風格統一的 SVG 圖標庫。</li>
                    <li><span className="font-bold text-gray-800">Google Fonts</span>: Noto Sans TC (繁體中文最佳化)。</li>
                 </ul>
              </div>
            </div>
          </div>
        );

      case 'features':
         return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">核心功能模組 (Features)</h2>
            </div>
            
            <div className="space-y-6">
               <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">1</div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">智慧保單解析 (Document Analysis)</h3>
                     <p className="text-gray-600 text-sm mt-1">使用者上傳 PDF 後，系統自動提取文字，並呼叫 AI 產生「保單摘要 (Summary)」、「亮點 (Highlights)」與「建議提問 (Suggested Questions)」，建立即時知識庫。</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">2</div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">多模式理賠諮詢 (Multi-Mode Chat)</h3>
                     <p className="text-gray-600 text-sm mt-1">
                        • <span className="font-bold">單一保單模式</span>：鎖定特定文件，深入問答條款細節。<br/>
                        • <span className="font-bold">總管模式 (General Manager)</span>：跨文件檢索，比較不同保單的理賠範圍。<br/>
                        • <span className="font-bold">專家模式 (Expert)</span>：無文件時，回答一般保險法規與知識。
                     </p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">3</div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">專員後台系統 (Agent Dashboard)</h3>
                     <p className="text-gray-600 text-sm mt-1">模擬保險業務員 CRM 介面。專員可登入 (Code: 8866) 查看客戶列表、風險標籤，並直接調用 AI 協助客戶分析保單，實現 B2B2C 應用場景。</p>
                  </div>
               </div>

               <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold">4</div>
                  <div>
                     <h3 className="text-lg font-bold text-gray-900">結構化理賠指引 (Structured Guidance)</h3>
                     <p className="text-gray-600 text-sm mt-1">AI 輸出不僅是純文字，更包含 JSON 格式的「申請清單」、「金額試算重點」與「警示語」，前端 UI 將其渲染為易讀的卡片與清單。</p>
                  </div>
               </div>
            </div>
          </div>
         );

       case 'api-integration':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">AI 模型整合細節</h2>
              <p className="text-gray-600 mb-6">
                 我們使用 <code>@google/genai</code> SDK 與 Gemini 2.5 Flash 模型進行互動。
                 Flash 模型在長文本 (Long Context Window) 的處理能力與回應速度上取得了最佳平衡。
              </p>
            </div>

            <div className="bg-gray-900 rounded-xl p-6 overflow-x-auto">
               <div className="flex items-center justify-between text-gray-400 text-xs mb-4 border-b border-gray-700 pb-2">
                  <span className="flex items-center"><Terminal className="w-4 h-4 mr-2"/> services/geminiService.ts</span>
                  <span>TypeScript</span>
               </div>
               <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
{`// 範例：結構化輸出的 Prompt 設計
const prompt = \`
  你是一位專業的保險理賠助手。
  請依據以下文件內容回答問題...
  
  請務必回傳 JSON 物件，格式如下：
  {
    "status": "analysis",
    "response": "分析結果...",
    "checklist": ["診斷證明書", "收據正本"],
    "key_points": ["每日病房費: **3000元**"],
    "warning": "注意：此保單不理賠門診手術"
  }
\`;

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: { responseMimeType: "application/json" }
});`}
               </pre>
            </div>

            <div className="mt-6">
               <h3 className="text-xl font-bold text-gray-900 mb-3">Prompt Engineering 策略</h3>
               <ul className="list-disc list-inside text-gray-600 space-y-2 ml-2">
                  <li><span className="font-bold text-gray-800">角色設定 (Persona)</span>：明確定義 AI 為「保險理賠顧問」，語氣專業且同理。</li>
                  <li><span className="font-bold text-gray-800">思維鏈 (Chain of Thought)</span>：在 Prompt 中引導 AI 先判斷資訊是否充足 (Status Check)，再決定是追問還是分析。</li>
                  <li><span className="font-bold text-gray-800">格式限制 (Format Constraint)</span>：強制 JSON Mode，解決幻覺與格式跑版問題，便於前端渲染。</li>
               </ul>
            </div>
          </div>
        );

       case 'security':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">資安考量與部署建議</h2>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
               <h3 className="font-bold text-amber-800 text-lg mb-2 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  API Key 安全警告
               </h3>
               <p className="text-amber-700 text-sm leading-relaxed">
                  目前的演示版本為 Client-side Only 應用，API Key 可能暴露於瀏覽器環境。
                  在正式生產環境 (Production) 中，強烈建議採用 Proxy 模式。
               </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
               <div className="p-6 bg-white border border-gray-200 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">1. 網域限制 (HTTP Referrer)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                     若必須在前端使用 Key，請至 Google Cloud Console 設定 <code className="bg-gray-100 px-1 rounded">HTTP referrers</code> 限制，僅允許您部署的網域 (例如 *.vercel.app) 呼叫 API。
                  </p>
                  <div className="text-xs text-gray-400">適用：快速原型、Hackathon</div>
               </div>

               <div className="p-6 bg-white border border-gray-200 rounded-xl">
                  <h4 className="font-bold text-gray-900 mb-3">2. 後端代理 (Backend Proxy)</h4>
                  <p className="text-sm text-gray-600 mb-4">
                     建立一個輕量後端 (Node.js/Python)，API Key 儲存於伺服器環境變數。前端請求發送至後端，後端再轉發至 Google。
                  </p>
                  <div className="text-xs text-gray-400">適用：正式商用產品</div>
               </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-white">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
         <div className="p-6 border-b border-gray-200">
            <h1 className="font-bold text-gray-800 text-lg flex items-center">
               <span className="bg-emerald-600 text-white p-1 rounded mr-2">
                  <Code2 className="w-4 h-4" />
               </span>
               系統文件
            </h1>
            <p className="text-xs text-gray-500 mt-2">SmartClaim AI Documentation</p>
         </div>
         <nav className="p-4 space-y-1">
            {sections.map((section) => (
               <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                     activeSection === section.id 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
               >
                  <span className={`mr-3 ${activeSection === section.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                     {section.icon}
                  </span>
                  {section.label}
                  {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto text-emerald-500" />}
               </button>
            ))}
         </nav>
         
         <div className="p-6 mt-auto">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4 text-white text-xs">
               <p className="font-bold mb-1">版本資訊</p>
               <p className="opacity-70">v1.0.0 (Research Preview)</p>
               <p className="opacity-70 mt-2">Last Updated: 2025-02-15</p>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
         <div className="max-w-4xl mx-auto px-8 py-12">
            {renderContent()}
         </div>
      </div>
    </div>
  );
};

export default ProjectDocs;
