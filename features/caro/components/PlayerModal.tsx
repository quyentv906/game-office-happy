import { useState } from "react";
import { useCaroStore } from "../store/useCaroStore";

export default function PlayerModal({ onSave }: { onSave: () => void }) {
  const { userName, setUserName } = useCaroStore();
  const [inputVal, setInputVal] = useState(userName);

  const handleSave = () => {
    if (inputVal.trim()) {
      setUserName(inputVal.trim());
      onSave();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6 transform transition-all">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800">Nhập Tên Của Bạn</h2>
          <p className="text-slate-500 text-sm mt-2">Biệt danh ảo diệu để đối thủ phải e sợ!</p>
        </div>
        
        <input 
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ví dụ: Faker"
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium text-slate-800"
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        />

        <button 
          onClick={handleSave}
          disabled={!inputVal.trim()}
          className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          Sẵn Sàng
        </button>
      </div>
    </div>
  );
}
