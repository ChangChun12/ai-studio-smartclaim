
import React from 'react';
import { ViewState } from '../types';
import { RESEARCH_METRICS } from '../constants';
import { ArrowRight, ShieldCheck, FileText, MessageCircleQuestion, CheckCircle2, Zap, Search } from 'lucide-react';

interface HomeProps {
  setView: (view: ViewState) => void;
}

const Home: React.FC<HomeProps> = ({ setView }) => {
  return (
    <div className="bg-white">
      {/* Hero Section with decorative background */}
      <div className="relative overflow-hidden">
        {/* Abstract Background Blobs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium mb-8 border border-emerald-100 shadow-sm">
              <Zap className="w-4 h-4 mr-2 fill-current" />
              AI 驅動，理賠不再複雜
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
              您的專屬 <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">AI 保險理賠顧問</span>
              <br />
              <span className="text-4xl md:text-5xl text-gray-700 mt-2 block">秒懂繁雜條款，守護您的權益</span>
            </h1>

            <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              不再需要翻閱厚重的保單文件，也不必擔心看不懂專業術語。
              <br className="hidden md:block" />
              上傳您的保單，透過對話，即刻獲得精準的理賠建議與申請清單。
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setView(ViewState.DEMO)}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-emerald-200/50 transition-all transform hover:-translate-y-1 active:scale-95"
              >
                立即免費諮詢
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('how-it-works');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold rounded-2xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all"
              >
                了解運作方式
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Value Proposition / Pain Points */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">為什麼需要 SmartClaim AI？</h2>
            <p className="text-gray-500">面對保險理賠，您是否也遇過這些困擾？</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-6">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">條款文字像天書</h3>
                <p className="text-gray-500 leading-relaxed">
                  保單動輒數十頁，充滿法律與醫療專有名詞，想確認是否理賠卻找不到關鍵字？
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                  <MessageCircleQuestion className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">不確定能賠多少</h3>
                <p className="text-gray-500 leading-relaxed">
                  發生意外或生病住院，想知道具體能申請多少補助，卻只能靠猜測或漫長等待？
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-16 -mt-16 transition-all group-hover:scale-110"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">文件總是漏東漏西</h3>
                <p className="text-gray-500 leading-relaxed">
                  申請流程繁瑣，常常因為少一張診斷書或收據而被退件，來回奔波心力交瘁？
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works - User Journey */}
      <div id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">只需三步驟，理賠更輕鬆</h2>
            <p className="text-gray-500">將複雜的流程交給 AI，您只需要專注於康復</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 border-t-2 border-dashed border-emerald-300 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:border-emerald-500 transition-colors duration-300">
                <FileText className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. 上傳保單</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                支援 PDF 格式。系統會自動辨識並解析條款內容，建立您的專屬知識庫。
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:border-emerald-500 transition-colors duration-300">
                <MessageCircleQuestion className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. 描述情況</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                像是「我車禍骨折了」、「住院三天能賠嗎？」<br />就像問朋友一樣簡單。
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center group cursor-default">
              <div className="w-24 h-24 bg-white border-4 border-emerald-100 rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:border-emerald-500 transition-colors duration-300">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. 獲取建議</h3>
              <p className="text-gray-500 text-sm max-w-xs">
                獲得 AI 分析的理賠試算、條款依據，以及完整的申請文件檢查清單。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Capability Stats (Styled less like academic metrics) */}
      <div className="bg-emerald-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-emerald-800">
            {RESEARCH_METRICS.map((metric, index) => (
              <div key={index} className="pt-8 md:pt-0 px-4">
                <div className="text-5xl font-extrabold text-emerald-400 mb-2">{metric.value}</div>
                <div className="text-lg font-medium text-emerald-100 mb-2">{metric.label}</div>
                <p className="text-emerald-300/70 text-sm">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">準備好體驗更聰明的保險諮詢了嗎？</h2>
          <p className="text-xl text-gray-500 mb-10">
            不需要等待客服轉接，現在就讓 AI 幫您檢視保單權益。
          </p>
          <button
            onClick={() => setView(ViewState.DEMO)}
            className="inline-flex items-center justify-center px-10 py-5 text-xl font-bold rounded-2xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
          >
            <Search className="mr-2 w-6 h-6" />
            立即開始使用
          </button>
        </div>
      </div>

      {/* Team & Special Thanks */}
      <div className="bg-gray-50 py-20 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">製作團隊與特別感謝</h2>

          <div className="flex flex-col md:flex-row justify-center gap-16">
            {/* Member 1: 莊浚 */}
            <div className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 bg-gray-200 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="https://raw.githubusercontent.com/ChangChun12/name-assets/d8a2a3994f6370339e4c52e98096407be91085a4/IMG_1997.PNG"
                  alt="莊浚"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">莊浚</h3>
              <p className="text-emerald-600 font-bold text-base mb-3 bg-emerald-50 px-3 py-1 rounded-full">研究與系統開發</p>
              <p className="text-gray-500 text-base max-w-xs leading-relaxed">
                開發者 (我本人)。致力於結合大型語言模型與保險實務，解決資訊不對稱的痛點。
              </p>
            </div>

            {/* Member 2: 施倫閔老師 */}
            <div className="flex flex-col items-center group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6 bg-gray-200 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiYXq9XJKVwgVQjNfwMXGxCToZzSsBxDJJqw&s"
                  alt="施倫閔老師"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">施倫閔 老師</h3>
              <p className="text-emerald-600 font-bold text-base mb-3 bg-emerald-50 px-3 py-1 rounded-full">特別感謝 / 指導</p>
              <p className="text-gray-500 text-base max-w-xs leading-relaxed">
                感謝老師在專案開發過程中的悉心指導、專業建議與支持。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
