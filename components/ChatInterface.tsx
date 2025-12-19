
import React, { useState, useRef, useEffect } from 'react';
import { Message, UploadedDocument, UserProfile, ClientSummary } from '../types';
import { generateClaimAdvice, generatePolicySummary } from '../services/geminiService';
import { extractPdfData } from '../services/pdfService';
import { SAMPLE_QUERIES } from '../constants';
import { Send, FileText, CheckCircle2, Bot, User, Loader2, FilePlus, Layers, Calculator, Minimize2, EyeOff, Eye, Trash2, LayoutList, HelpCircle, AlertCircle, Sparkles, FileWarning, Briefcase, LogIn } from 'lucide-react';

interface ChatInterfaceProps {
  user?: UserProfile | null;
  agentModeClient?: ClientSummary; // If provided, the chat is in "Agent Mode" for this client
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, agentModeClient }) => {
  // Determine identity for UI and Logic
  const isAgentMode = !!agentModeClient;
  const isGuestMode = !user && !isAgentMode;
  
  // Persistence Key Logic
  // 1. Agent Mode: Save to client's specific key (simulating database link)
  // 2. User Mode: Save to user's email key
  // 3. Guest Mode: Save to generic guest key
  const storageKey = isAgentMode 
    ? `smartclaim_data_${agentModeClient?.email}` 
    : (user ? `smartclaim_data_${user.email}` : 'smartclaim_data_guest');

  const displayName = isAgentMode 
    ? `專員 (協助: ${agentModeClient?.name})` 
    : (user ? user.name : '訪客');

  const DEFAULT_WELCOME_MESSAGE: Message = {
    id: 'welcome',
    role: 'model',
    text: isAgentMode 
      ? `👋 **專員您好，已連結客戶「${agentModeClient?.name}」的資料庫。**\n\n您可以使用此介面協助客戶分析保單，或上傳新文件。所有對話將自動歸檔至此客戶紀錄中。`
      : `👋 **您好，${displayName}！我是您的 SmartClaim AI 理賠顧問。**\n\n我可以協助您解決保險相關的疑難雜症：\n\n🔹 **一般諮詢 (專業顧問)**：\n即使沒有保單，您也可以詢問保險法規、專有名詞解釋（如：既往症、除外責任）或理賠實務。\n\n🔹 **跨保單總管**：\n若您上傳了多份 PDF，我能在此模式下為您進行「綜合分析」，比較不同保單的理賠範圍。\n\n**現在，請直接提問，或點擊左下方按鈕上傳您的保單吧！** 🚀`
  };

  // Global messages for the "General Expert / Global Manager" mode
  const [globalMessages, setGlobalMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Multi-document state
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  
  // Viewer state
  const [expandedTermsId, setExpandedTermsId] = useState<string | null>(null);
  const [showPdfContent, setShowPdfContent] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Persistence Logic ---

  // Load data on mount or user/client change
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setDocuments(Array.isArray(parsedData.documents) ? parsedData.documents : []);
        setGlobalMessages(Array.isArray(parsedData.globalMessages) && parsedData.globalMessages.length > 0 
          ? parsedData.globalMessages 
          : [DEFAULT_WELCOME_MESSAGE]
        );
      } catch (e) {
        console.error("Failed to load saved data", e);
        setDocuments([]);
        setGlobalMessages([DEFAULT_WELCOME_MESSAGE]);
      }
    } else {
      // Reset if no data found for this key
      setDocuments([]);
      setGlobalMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, [storageKey]); // Re-run when storage key changes (e.g. switching clients or logging in)

  // Save data on change
  useEffect(() => {
    const docsToSave = documents.map(doc => ({
      ...doc,
      fileUrl: '' // Clear blob URL for persistence
    }));

    const dataToSave = {
      documents: docsToSave,
      globalMessages
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    } catch (e) {
      console.error("Storage quota exceeded or error", e);
    }
  }, [documents, globalMessages, storageKey]);

  // --- End Persistence Logic ---

  // Derived state: Current Active Document
  const activeDocument = documents.find(d => d.id === activeDocId) || null;

  // Derived state: Messages to display based on context
  const displayMessages = activeDocument ? activeDocument.chatHistory : globalMessages;

  // Derived state: Suggested queries
  const currentSuggestedQueries = activeDocument?.suggestedQuestions && activeDocument.suggestedQuestions.length > 0
    ? activeDocument.suggestedQuestions
    : SAMPLE_QUERIES;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages, expandedTermsId]);

  useEffect(() => {
    setShowPdfContent(false); 
  }, [activeDocId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const pdfFiles = Array.from(files).filter((file: any) => file.type === 'application/pdf') as File[];

    if (pdfFiles.length === 0) {
      alert('請上傳 PDF 格式的檔案');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsProcessingPdf(true);
    
    const newDocs: UploadedDocument[] = [];
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        setProcessingStatus(`正在解析保單 ${i + 1}/${pdfFiles.length}...`);
        
        try {
          const docData = await extractPdfData(file);
          
          if (docData) {
            setProcessingStatus(`AI 正在分析「${file.name}」內容...`);
            const summary = await generatePolicySummary(docData.fullText);
            
            const welcomeMsg: Message = {
                id: `welcome-${docData.id}`,
                role: 'model',
                text: `✅ **保單載入完成！**\n\n` +
                      `📋 **${summary.title}**\n` +
                      `${summary.summary}\n\n` +
                      `✨ **保障亮點**：\n` +
                      summary.highlights.map(h => `• ${h}`).join('\n')
            };

            docData.chatHistory = [welcomeMsg];
            docData.suggestedQuestions = summary.suggestedQuestions;
            
            newDocs.push(docData);
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to parse ${file.name}`, error);
          failCount++;
        }
      }

      if (newDocs.length > 0) {
        setDocuments(prev => [...prev, ...newDocs]);
        setActiveDocId(newDocs[newDocs.length - 1].id);
      }

      if (failCount > 0) {
        alert(`${failCount} 份檔案解析失敗，請確認檔案是否損壞。`);
      }

    } catch (error) {
      alert('處理檔案時發生錯誤');
      console.error(error);
    } finally {
      setIsProcessingPdf(false);
      setProcessingStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const docToRemove = documents.find(d => d.id === id);
    if (docToRemove?.fileUrl) {
      URL.revokeObjectURL(docToRemove.fileUrl);
    }
    setDocuments(prev => {
      const newDocs = prev.filter(d => d.id !== id);
      if (id === activeDocId) {
        setActiveDocId(newDocs.length > 0 ? newDocs[newDocs.length - 1].id : null);
      }
      return newDocs;
    });
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setInputValue('');
    setIsLoading(true);
    setExpandedTermsId(null);

    if (activeDocument) {
      setDocuments(prev => prev.map(d => 
        d.id === activeDocId 
          ? { ...d, chatHistory: [...d.chatHistory, userMsg] } 
          : d
      ));
    } else {
      setGlobalMessages(prev => [...prev, userMsg]);
    }

    // Determine Context & Mode
    let mode: 'single' | 'multi' | 'general' = 'general';
    let contextText = "";

    if (activeDocument) {
        mode = 'single';
        contextText = activeDocument.fullText;
    } else {
        if (documents.length > 0) {
            mode = 'multi';
            contextText = documents.map(d => `\n--- 文件: ${d.name} ---\n${d.fullText}`).join("\n\n");
        } else {
            mode = 'general';
            contextText = "";
        }
    }

    const aiResponse = await generateClaimAdvice(text, contextText, mode);

    const modelMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: aiResponse.text,
      guidance: aiResponse.guidance,
      structuredData: aiResponse.structuredData
    };

    if (activeDocument) {
      setDocuments(prev => prev.map(d => 
        d.id === activeDocId 
          ? { ...d, chatHistory: [...d.chatHistory, modelMsg] } 
          : d
      ));
    } else {
      setGlobalMessages(prev => [...prev, modelMsg]);
    }
    
    setIsLoading(false);
  };

  const toggleTerms = (msgId: string) => {
    setExpandedTermsId(prev => prev === msgId ? null : msgId);
  };

  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900 bg-emerald-50 px-1 rounded">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white font-sans text-base relative">
      
      {/* Mode Indicators (Banners) */}
      {isGuestMode && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-amber-500 text-white text-xs px-4 py-1 text-center font-medium shadow-md flex items-center justify-center gap-2">
           <AlertCircle className="w-3 h-3" />
           目前為訪客模式，若關閉視窗對話紀錄將不會永久保存。建議您登入以保存資料。
        </div>
      )}
      {isAgentMode && (
        <div className="absolute top-0 left-0 right-0 z-20 bg-indigo-600 text-white text-xs px-4 py-1 text-center font-medium shadow-md flex items-center justify-center gap-2">
           <Briefcase className="w-3 h-3" />
           專員模式：正在檢視並編輯 {agentModeClient.name} 的資料庫
        </div>
      )}

      {/* Left Sidebar: Document List & Switcher */}
      <div className={`hidden lg:flex flex-col w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0 ${(isGuestMode || isAgentMode) ? 'pt-6' : ''}`}>
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-gray-200 shadow-sm z-10">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm uppercase tracking-wide">
            <LayoutList className="w-4 h-4 text-emerald-600" />
            已上傳保單 ({documents.length})
          </h3>
        </div>
        
        {/* Document List Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* Policy Manager / Expert Advisor Card */}
          <div 
            onClick={() => setActiveDocId(null)}
            className={`
              cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center text-center transition-all duration-200
              ${activeDocId === null 
                ? 'bg-white border-emerald-500 shadow-md' 
                : 'bg-white border-transparent hover:border-gray-300 opacity-70 hover:opacity-100'}
            `}
          >
             {activeDocId === null && <div className="text-xs font-bold text-emerald-600 mb-2 w-full text-left flex items-center"><CheckCircle2 className="w-3 h-3 mr-1"/>目前位置</div>}
             <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2 text-indigo-600">
                <Layers className={`w-5 h-5`} />
             </div>
             <h4 className="text-sm font-bold text-gray-700 mb-1">
                {documents.length > 0 ? "保單總管 (跨文件分析)" : "專業保險顧問"}
             </h4>
             <p className="text-[10px] text-gray-500 leading-tight">
               {documents.length > 0 
                 ? "一次分析所有已上傳的保單，進行比較或總覽。" 
                 : "無需保單，回答一般保險知識、名詞解釋與法規。"}
             </p>
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          {documents.map((doc) => {
             const isActive = activeDocId === doc.id;
             return (
              <div 
                key={doc.id}
                onClick={() => setActiveDocId(doc.id)}
                className={`
                  group relative rounded-xl border-2 transition-all duration-200 cursor-pointer overflow-hidden
                  ${isActive 
                    ? 'bg-white border-emerald-500 shadow-lg scale-[1.02]' 
                    : 'bg-white border-transparent hover:border-gray-300 shadow-sm hover:shadow-md'}
                `}
              >
                {isActive && <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>}

                <div className="p-3 pl-4">
                   <div className="flex justify-between items-start mb-2">
                      <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 shrink-0">
                         <FileText className="w-4 h-4" />
                      </div>
                      <button 
                        onClick={(e) => removeDocument(doc.id, e)}
                        className="p-1.5 text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                        title="移除此保單"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <h4 className={`text-sm font-bold mb-1 line-clamp-2 ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                     {doc.name}
                   </h4>
                   <p className="text-[10px] text-gray-400 mb-2">
                     PDF • {doc.pages.length} 頁
                   </p>

                   {isActive ? (
                     <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-[10px] text-emerald-600 font-bold">對話進行中</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setShowPdfContent(!showPdfContent); }}
                          className="flex items-center text-[10px] text-gray-500 hover:text-emerald-600 font-medium px-2 py-1 bg-gray-50 hover:bg-emerald-50 rounded transition-colors"
                        >
                           {showPdfContent ? (
                             <><EyeOff className="w-3 h-3 mr-1" />隱藏內容</>
                           ) : (
                             <><Eye className="w-3 h-3 mr-1" />檢視內容</>
                           )}
                        </button>
                     </div>
                   ) : (
                      <div className="mt-2 text-[10px] text-gray-400 group-hover:text-emerald-600 transition-colors text-right">
                         點擊切換至此對話
                      </div>
                   )}
                </div>

                {isActive && showPdfContent && (
                  <div className="bg-gray-100 border-t border-gray-200 h-64 relative group-hover:block" onClick={(e) => e.stopPropagation()}>
                    {doc.fileUrl ? (
                        <iframe 
                            src={`${doc.fileUrl}#toolbar=0&navpanes=0`}
                            className="w-full h-full"
                            title="PDF Viewer"
                        />
                    ) : (
                        <div className="w-full h-full p-4 overflow-y-auto bg-white text-xs text-gray-600 font-mono whitespace-pre-wrap">
                            <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold border-b pb-2">
                                <FileWarning className="w-4 h-4" />
                                <span>原始檔案未暫存，顯示解析文字</span>
                            </div>
                            {doc.fullText}
                        </div>
                    )}
                     <div className="absolute top-0 right-0 p-1">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowPdfContent(false); }}
                            className="bg-black/50 hover:bg-black/70 text-white p-1 rounded"
                        >
                            <Minimize2 className="w-3 h-3" />
                        </button>
                    </div>
                  </div>
                )}
              </div>
             );
          })}
        </div>

        {/* Persistent Footer with Upload Button */}
        <div className="p-4 bg-white border-t border-gray-200">
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingPdf}
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessingPdf ? <Loader2 className="w-5 h-5 animate-spin"/> : <FilePlus className="w-5 h-5" />}
                {isProcessingPdf ? "分析中..." : '上傳保單 (可多選)'}
            </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col h-full relative min-w-0 ${(isGuestMode || isAgentMode) ? 'pt-6' : ''}`}>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
            {displayMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                
                {msg.role === 'model' && (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${msg.structuredData?.status === 'clarification' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                    {msg.structuredData?.status === 'clarification' ? <HelpCircle className="w-7 h-7 text-white" /> : <Bot className="w-7 h-7 text-white" />}
                  </div>
                )}

                <div className={`flex flex-col max-w-[90%] lg:max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <span className="text-base font-semibold text-gray-500 mb-2 ml-1">
                    {msg.role === 'user' ? (isAgentMode ? '專員' : (user ? '您' : '訪客')) : 'SmartClaim AI'}
                  </span>

                  {/* Message Bubble */}
                  <div className={`text-2xl leading-relaxed rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-gray-100 text-gray-800 p-6 rounded-tr-none' 
                      : 'w-full text-gray-800'
                  }`}>
                    
                    {msg.role === 'user' && msg.text}

                    {msg.role === 'model' && (
                      <div className="space-y-6">
                        
                        {msg.structuredData?.status === 'clarification' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-lg text-amber-800 font-medium flex items-center mb-4">
                            <AlertCircle className="w-6 h-6 mr-3" />
                            <span>為了精確分析，需要您補充以下資訊</span>
                          </div>
                        )}

                        <div className="text-gray-900 leading-9 whitespace-pre-line text-2xl">
                             {renderFormattedText(msg.structuredData?.response || msg.text)}
                        </div>
                        
                        {msg.structuredData?.follow_up && (
                           <div className="mt-4 text-2xl font-bold text-emerald-700">
                              {msg.structuredData.follow_up}
                           </div>
                        )}

                        {msg.structuredData?.key_points && msg.structuredData.key_points.length > 0 && (
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                            <h4 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
                              <Calculator className="w-6 h-6 mr-3"/>
                              理賠試算與重點：
                            </h4>
                            <ul className="space-y-3">
                              {msg.structuredData.key_points.map((pt, idx) => (
                                <li key={idx} className="flex items-start text-xl font-medium text-blue-900">
                                  <span className="mr-3 mt-1">•</span><span>{renderFormattedText(pt)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.guidance && msg.guidance.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                            <h4 className="font-bold text-gray-800 mb-4 flex items-center text-xl">
                              <CheckCircle2 className="w-6 h-6 mr-3 text-emerald-600" />
                              建議準備文件與步驟：
                            </h4>
                            <ul className="space-y-3">
                              {msg.guidance.map((step, idx) => (
                                <li key={idx} className="text-gray-700 text-xl flex items-start">
                                  <span className="mr-3 text-emerald-500 mt-1">•</span>
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.structuredData?.warning && (
                          <div className="bg-red-50 text-red-700 p-5 rounded-lg border border-red-100 text-xl flex items-start">
                             <AlertCircle className="w-7 h-7 mr-3 flex-shrink-0 mt-0.5" />
                             <span className="font-medium">{renderFormattedText(msg.structuredData.warning)}</span>
                          </div>
                        )}

                        {msg.structuredData?.original_terms && (
                          <div className="pt-4">
                            <button 
                              onClick={() => toggleTerms(msg.id)}
                              className="text-gray-500 hover:text-emerald-600 font-medium flex items-center text-sm transition-colors group"
                            >
                              <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                              {expandedTermsId === msg.id ? '收起參考條款' : '查看原始條款依據'}
                            </button>
                            
                            {expandedTermsId === msg.id && (
                              <div className="mt-4 p-5 bg-gray-50 border border-gray-200 text-sm text-gray-600 font-mono whitespace-pre-wrap rounded-lg leading-relaxed shadow-inner">
                                {msg.structuredData.original_terms}
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    )}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${isAgentMode ? 'bg-indigo-600' : 'bg-gray-500'}`}>
                    {isAgentMode ? <Briefcase className="w-7 h-7 text-white" /> : <User className="w-7 h-7 text-white" />}
                  </div>
                )}
              </div>
            ))}
            
            {(isLoading || isProcessingPdf) && (
              <div className="flex gap-4">
                 <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0 mt-1">
                    {isProcessingPdf ? <Sparkles className="w-7 h-7 text-white animate-pulse" /> : <Bot className="w-7 h-7 text-white" />}
                  </div>
                <div className="flex items-center gap-3 text-gray-500 text-xl mt-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="animate-pulse">
                    {isProcessingPdf ? processingStatus || "正在讀取 PDF 文件內容..." : "SmartClaim AI 正在思考中..."}
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-white via-white to-transparent">
          <div className="max-w-4xl mx-auto">
             {displayMessages.length <= 1 && (
                <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide justify-center px-4">
                  {currentSuggestedQueries.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      title={q}
                      className="flex-shrink-0 whitespace-nowrap px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-base rounded-full transition-colors shadow-sm max-w-[200px] truncate"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

            <div className={`relative shadow-xl rounded-3xl border flex flex-col ${isAgentMode ? 'border-indigo-100 bg-indigo-50/10' : 'border-gray-200 bg-white'}`}>
              
              {/* Active Document Indicator above Input */}
              <div className="flex items-center px-6 pt-4 pb-2 gap-3 border-b border-gray-50">
                <span className="text-sm text-gray-400">目前模式：</span>
                {activeDocument ? (
                  <div className="bg-emerald-50 text-emerald-700 text-sm px-3 py-1.5 rounded-lg flex items-center font-medium">
                    <FileText className="w-4 h-4 mr-2" />
                    <span className="truncate max-w-[250px]">{activeDocument.name}</span>
                  </div>
                ) : (
                  <div className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1.5 rounded-lg flex items-center font-medium">
                    <Layers className="w-4 h-4 mr-2" />
                    <span>{documents.length > 0 ? "保單總管 (跨文件分析)" : "專業保險顧問 (一般知識)"}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center w-full p-2">
                <input 
                  type="file" 
                  multiple
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden" 
                  accept=".pdf"
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="ml-2 p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors group relative"
                  title="上傳新保單"
                >
                  <FilePlus className="w-7 h-7" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    上傳保單 (可多選)
                  </span>
                </button>

                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                  placeholder={
                    activeDocument 
                      ? `針對「${activeDocument.name}」提問...` 
                      : (documents.length > 0 ? "詢問所有已上傳的保單..." : "詢問一般保險知識、法規或名詞解釋...")
                  }
                  className="flex-1 px-4 py-5 bg-transparent rounded-2xl focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400 text-xl"
                />
                
                <button
                  onClick={() => handleSend(inputValue)}
                  disabled={isLoading || isProcessingPdf || !inputValue.trim()}
                  className={`mr-2 p-3 rounded-xl transition-all ${
                    inputValue.trim() 
                      ? (isAgentMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-emerald-600 text-white hover:bg-emerald-700')
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
