
import React, { useState } from 'react';
import { ClientSummary } from '../types';
import ChatInterface from './ChatInterface';
import { Search, User, Phone, Mail, Clock, FileText, AlertTriangle, ChevronRight, PieChart, Shield, PlusCircle, Filter, MessagesSquare, ArrowLeft } from 'lucide-react';

// Mock Data representing a database
const MOCK_CLIENTS: ClientSummary[] = [
  {
    id: 'c1',
    name: '王大明',
    email: 'wang.dm@example.com',
    phone: '0912-345-678',
    lastInteraction: '2025-02-14',
    policyCount: 3,
    riskStatus: 'Medium',
    tags: ['醫療險缺口', '近期車禍'],
    notes: '客戶詢問骨折未住院的理賠問題，已建議補強意外實支實付。',
    mockPolicies: [
       { name: '國泰人壽真安心住院醫療', type: '醫療險', coverage: '住院/手術' },
       { name: '富邦產險機車強制險', type: '車險', coverage: '強制責任' },
       { name: '新光意外傷害保險', type: '意外險', coverage: '身故/失能' }
    ]
  },
  {
    id: 'c2',
    name: '陳小美',
    email: 'may.chen@example.com',
    phone: '0988-777-666',
    lastInteraction: '2025-02-10',
    policyCount: 5,
    riskStatus: 'Low',
    tags: ['高資產', '退休規劃'],
    notes: '關注儲蓄型保單與長照議題，預計下個月會面討論。',
    mockPolicies: [
       { name: '南山人壽美年發外幣終身', type: '儲蓄險', coverage: '身故/滿期金' },
       { name: '台灣人壽長照險', type: '長照險', coverage: '長期照顧狀態' }
    ]
  },
  {
    id: 'c3',
    name: '林志豪',
    email: 'lin.jason@example.com',
    phone: '0922-333-444',
    lastInteraction: '2025-01-28',
    policyCount: 1,
    riskStatus: 'High',
    tags: ['保障不足', '家庭支柱'],
    notes: '目前僅有基本壽險，且身為家庭經濟來源，急需規劃重大傷病與高額壽險。',
    mockPolicies: [
       { name: '中國人壽定期壽險', type: '壽險', coverage: '身故' }
    ]
  }
];

type DashboardTab = 'details' | 'chat';

const AgentDashboard: React.FC = () => {
  const [selectedClient, setSelectedClient] = useState<ClientSummary | null>(MOCK_CLIENTS[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('details');

  const filteredClients = MOCK_CLIENTS.filter(c => 
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  const handleClientSelect = (client: ClientSummary) => {
      setSelectedClient(client);
      setActiveTab('details'); // Reset to details on switch
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 font-sans">
      
      {/* Sidebar: Client List */}
      <div className="w-80 md:w-96 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
           <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">客戶列表</h2>
              <button className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors" title="新增客戶">
                 <PlusCircle className="w-5 h-5" />
              </button>
           </div>
           
           <div className="relative">
             <input 
               type="text" 
               placeholder="搜尋姓名或電話..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
             />
             <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredClients.map(client => (
            <div 
              key={client.id}
              onClick={() => handleClientSelect(client)}
              className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${selectedClient?.id === client.id ? 'bg-indigo-50 hover:bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
            >
               <div className="flex justify-between items-start mb-1">
                 <h3 className={`font-bold ${selectedClient?.id === client.id ? 'text-indigo-900' : 'text-gray-800'}`}>{client.name}</h3>
                 <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    client.riskStatus === 'High' ? 'bg-red-100 text-red-600' :
                    client.riskStatus === 'Medium' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                 }`}>
                   {client.riskStatus === 'High' ? '高風險' : client.riskStatus === 'Medium' ? '需關注' : '完善'}
                 </span>
               </div>
               <p className="text-xs text-gray-500 mb-2 truncate">{client.email}</p>
               <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" /> {client.lastInteraction}
                  </span>
                  <div className="flex gap-1">
                    {client.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} className="text-[10px] bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
               </div>
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <p>找不到符合的客戶</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedClient ? (
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
           
           {/* Client Header & Tabs */}
           <div className="bg-white border-b border-gray-200 px-8 pt-6 shadow-sm z-10">
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                       {selectedClient.name[0]}
                    </div>
                    <div>
                       <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                         {selectedClient.name}
                         <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">ID: {selectedClient.id.toUpperCase()}</span>
                       </h1>
                       <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center hover:text-indigo-600 cursor-pointer"><Phone className="w-3 h-3 mr-1"/> {selectedClient.phone}</span>
                          <span className="flex items-center hover:text-indigo-600 cursor-pointer"><Mail className="w-3 h-3 mr-1"/> {selectedClient.email}</span>
                       </div>
                    </div>
                 </div>
                 <div className="flex gap-3">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm shadow-sm">
                       編輯資料
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm shadow-md shadow-indigo-200 flex items-center">
                       <PlusCircle className="w-4 h-4 mr-1.5" />
                       新增保單
                    </button>
                 </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 -mb-px">
                  <button 
                    onClick={() => setActiveTab('details')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        客戶概覽
                    </div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    <div className="flex items-center gap-2">
                        <MessagesSquare className="w-4 h-4" />
                        AI 協作諮詢
                    </div>
                  </button>
              </div>
           </div>

           {/* Content Body */}
           <div className="flex-1 overflow-hidden relative">
              
              {/* DETAIL VIEW */}
              {activeTab === 'details' && (
                <div className="h-full overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                  {/* Left Column: Stats & Notes */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* AI Insights Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                          <PieChart className="w-5 h-5 mr-2 text-indigo-600" />
                          AI 帳戶分析摘要
                        </h3>
                        <div className="bg-indigo-50/50 rounded-xl p-4 text-indigo-900 text-sm leading-relaxed border border-indigo-100">
                          {selectedClient.notes}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedClient.tags.map((tag, idx) => (
                              <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
                                #{tag}
                              </span>
                          ))}
                        </div>
                    </div>

                    {/* Policy List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-bold text-gray-800 flex items-center">
                              <Shield className="w-5 h-5 mr-2 text-emerald-600" />
                              已持有保單 ({selectedClient.mockPolicies.length})
                          </h3>
                          <button className="text-sm text-indigo-600 font-medium hover:underline">查看全部</button>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {selectedClient.mockPolicies.map((policy, idx) => (
                              <div key={idx} className="px-6 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{policy.name}</h4>
                                    <p className="text-xs text-gray-500 mt-1">類型: {policy.type} • 保障: {policy.coverage}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                              </div>
                          ))}
                        </div>
                    </div>
                  </div>

                  {/* Right Column: Actions & History */}
                  <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-800 mb-4">快捷操作</h3>
                        <div className="space-y-3">
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors flex items-center font-medium text-sm">
                              <FileText className="w-4 h-4 mr-3" />
                              產生保單健檢報告
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-indigo-50 text-gray-700 hover:text-indigo-700 transition-colors flex items-center font-medium text-sm">
                              <AlertTriangle className="w-4 h-4 mr-3" />
                              標記為高風險客戶
                            </button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-6 rounded-2xl shadow-lg">
                          <h3 className="font-bold mb-2">專員備忘錄</h3>
                          <p className="text-xs text-gray-400 mb-4">僅供內部查看，客戶端不可見</p>
                          <textarea 
                            className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            rows={4}
                            placeholder="輸入備忘..."
                            defaultValue="需確認是否已加保實支實付醫療險附約。"
                          ></textarea>
                      </div>
                  </div>
                </div>
              )}

              {/* CHAT VIEW */}
              {activeTab === 'chat' && (
                  <div className="h-full w-full animate-in slide-in-from-right-4 duration-300">
                     <ChatInterface 
                        // We pass the client information as the "Agent Mode Client" context
                        agentModeClient={selectedClient}
                     />
                  </div>
              )}

           </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400 bg-gray-50">
           <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>請從左側選擇一位客戶以檢視詳細資料</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgentDashboard;
