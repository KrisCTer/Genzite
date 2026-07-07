import React from 'react';

export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 relative flex flex-col items-center justify-center bg-[#020409] overflow-y-auto h-full w-full">
      <style dangerouslySetInnerHTML={{__html: `
        .input-gradient-border {
          position: relative;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(24px);
          border-radius: 24px;
          padding: 1px;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.5);
        }
        .input-gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 1.5rem;
          padding: 1px;
          background: linear-gradient(to right, #4285f4, #9b72cb, #d96570, #f4af5f);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0.4;
        }
      `}} />

      {/* Top Action Icon */}
      <div className="absolute top-6 left-6">
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-[#9aa0a6]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </div>

      {/* Top Right Action Icons */}
      <div className="absolute top-6 right-6">
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer text-[#9aa0a6]">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </div>

      {/* Center Hero Section */}
      <div className="max-w-4xl w-full px-6 flex flex-col items-center pt-[15vh] pb-20">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-10">
          <h1 className="text-3xl font-light text-[#e3e3e3] tracking-tight">Build your ideas with Gemini</h1>
          <div className="text-[#a8c7fa]">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L14.062 8.938L20 11L14.062 13.062L12 19L9.938 13.062L4 11L9.938 8.938L12 3Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
            </svg>
          </div>
        </div>

        {/* Main Input Search Bar */}
        <div className="w-full mb-10">
          <div className="input-gradient-border group">
            <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
              <textarea 
                className="bg-transparent border-none focus:ring-0 w-full text-[16px] placeholder-[#64748b] text-[#e3e3e3] resize-none h-24 outline-none leading-relaxed" 
                placeholder="Describe an app and let Gemini do the rest"
              ></textarea>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#9aa0a6]">
                  <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </button>
                  <button className="p-2 hover:bg-white/10 hover:text-white rounded-full transition-colors cursor-pointer">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
                  </button>
                </div>
                <button className="flex items-center gap-2 bg-[#1A2235] hover:bg-[#202A40] border border-white/5 transition-all duration-200 px-5 py-2.5 rounded-full text-sm font-medium text-white shadow-sm cursor-pointer group-focus-within:bg-[#0066da] group-focus-within:border-transparent group-focus-within:hover:bg-[#0052b3]">
                  <span className="text-[#a8c7fa] group-focus-within:text-white">✨</span>
                  I'm feeling lucky
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pill Buttons Row */}
        <div className="flex flex-wrap justify-center gap-3 mb-20 overflow-x-auto max-w-full no-scrollbar pb-2">
          <button className="flex items-center gap-2.5 px-4 h-[40px] bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[13px] font-medium text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9981-.447-.9981-.9981s.447-.9981.9981-.9981.9981.447.9981.9981-.447.9981-.9981.9981zm-11.046 0c-.5511 0-.9981-.447-.9981-.9981s.447-.9981.9981-.9981.9981.447.9981.9981-.447.9981-.9981.9981zm11.414-5.4665l1.9218-3.3283c.123-.213.0494-.486-.1634-.609-.2127-.123-.4858-.0495-.6088.1633l-1.954 3.3842c-1.4284-.6522-3.0305-1.0205-4.7366-1.0205s-3.3082.3683-4.7366 1.0205l-1.954-3.3842c-.123-.2128-.396-.2863-.6088-.1633-.2127.123-.2864.396-.1634.609l1.9218 3.3283C3.606 11.2334 1.944 13.5654 1.666 16.326h20.318c-.278-2.7606-1.94-5.0926-5.1848-6.4511z"></path></svg>
            Build an Android app
          </button>
          <button className="flex items-center gap-2.5 px-4 h-[40px] bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[13px] font-medium text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M7.71 3.5l2.29 4h-5.42l-2.29-4h5.42z" fill="#0066da"></path><path d="M12.59 12h5.41l2.29 4h-5.41l-2.29-4z" fill="#00ac47"></path></svg>
            Google Drive
          </button>
          <button className="flex items-center gap-2.5 px-4 h-[40px] bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[13px] font-medium text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6z" fill="#0F9D58"></path></svg>
            Google Sheets
          </button>
          <button className="flex items-center gap-2.5 px-4 h-[40px] bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[13px] font-medium text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#EA4335"></path></svg>
            Gmail
          </button>
          <button className="flex items-center gap-2.5 px-4 h-[40px] bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[13px] font-medium text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z" fill="#4285F4"></path></svg>
            Google Calendar
          </button>
          <button className="w-10 h-[40px] flex items-center justify-center bg-[#0A1124]/80 border border-white/5 rounded-xl hover:bg-[#131B31] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-200 text-[#cbd5e1] shadow-sm cursor-pointer">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
          </button>
        </div>
      </div>

      {/* Bottom Discovery Section */}
      <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between px-8 py-5 bg-[#0A1124] border border-[#1A2235] rounded-[24px] shadow-lg">
        <h2 className="text-[16px] font-medium text-[#e3e3e3]">Discover and remix app ideas</h2>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-[#131B31] border border-white/5 hover:border-white/10 hover:bg-[#1C2640] rounded-xl text-sm font-medium transition-all duration-200 text-[#e3e3e3] cursor-pointer shadow-sm hover:-translate-y-0.5">
          Browse the app gallery
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
