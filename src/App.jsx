import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, History, Settings, Upload, X, Share2, ChevronDown, 
  Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, Sun, HelpCircle, Palmtree, CheckCircle2, 
  RefreshCw, Stethoscope, AlertOctagon, XCircle, BookOpen, 
  Lock, Menu, Calendar, ChevronRight, ArrowLeft
} from 'lucide-react';

// --- ERROR BOUNDARY (Layer 1: The Safety Net) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("App Crash:", error, errorInfo); }
  render() {
    // We use a safe fallback text here since context might not be available during a crash
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-orange-50/50 font-sans">
          <div className="bg-white p-6 rounded-3xl shadow-xl shadow-orange-100/50">
            <div className="bg-red-50 p-4 rounded-full inline-block mb-4"><AlertOctagon size={48} className="text-red-500" /></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-6">We encountered a hiccup. Let's try that again.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all">Restart App</button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- CONFIGURATION ---
const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  try { if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY; } catch (e) {}
  return ""; 
};

// *** VERCEL BACKEND URL (Mobile Connection) ***
const VERCEL_BACKEND_URL = "https://cocomed.vercel.app"; 

// --- UTILITIES ---
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const sanitizeScanData = (data) => {
  if (!data || typeof data !== 'object') return null;
  const safeString = (val) => (val && typeof val === 'string') ? val : (typeof val === 'number' ? String(val) : "N/A");
  const safeArray = (arr) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) return [safeString(arr)];
    return arr.map(item => (typeof item === 'string' ? item : (item?.text || JSON.stringify(item)))).filter(Boolean);
  };
  return {
    ...data,
    brandName: safeString(data.brandName),
    genericName: safeString(data.genericName),
    manufacturer: safeString(data.manufacturer),
    dosageForm: safeString(data.dosageForm),
    strength: safeString(data.strength),
    purpose: safeString(data.purpose),
    howToTake: safeString(data.howToTake),
    sideEffects: safeArray(data.sideEffects),
    warnings: safeArray(data.warnings),
  };
};

// --- LOCALIZATION DATABASE ---
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

const languageNames = {
  en: 'English', es: 'Spanish', zh: 'Simplified Chinese', hi: 'Hindi', ar: 'Arabic', pt: 'Portuguese', 
  ru: 'Russian', ja: 'Japanese', de: 'German', fr: 'French', ur: 'Urdu', id: 'Indonesian', 
  tr: 'Turkish', ko: 'Korean', bn: 'Bengali', ta: 'Tamil', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam'
};

// Master Dictionary for Static UI
const UI_STRINGS = {
  en: {
    nav: { home: "Home", history: "Collection", guide: "Guide", settings: "Settings", privacy: "Privacy" },
    home: { greeting: "Good Day", title: "Scan Medicine", subtitle: "Take a clear photo of the packaging.", tap: "Tap to Capture", analyzing: "Analyzing...", collection: "Recent Scans", empty: "Your journal is empty.", btn_guide: "View Guide" },
    result: { back: "Back to Journal", share: "Share", copied: "Copied!", disclaimer: "AI-Generated content. Always consult a doctor.", translating: "Translating..." },
    settings: { title: "Settings", language: "Language", data: "Data Management", clear: "Clear Scan History", privacy_title: "Privacy" },
    privacy: { title: "Privacy Policy", updated: "Last Updated", sec1: "Data Collection", sec1_d: "Images are processed in real-time by AI and are not permanently stored.", sec2: "Usage", sec2_d: "Camera is used solely for medication identification.", sec3: "Disclaimer", sec3_d: "Not a substitute for professional medical advice." },
    guide: { title: "How to use CocoMed", subtitle: "Three simple steps to health.", step1: "Snap", step1_d: "Take a clear photo.", step2: "Analyze", step2_d: "AI identifies the drug.", step3: "Learn", step3_d: "Read usage info." },
    error: { title: "Scan Failed", dismiss: "Dismiss" }
  },
  es: {
    nav: { home: "Inicio", history: "Colección", guide: "Guía", settings: "Ajustes", privacy: "Privacidad" },
    home: { greeting: "Hola", title: "Escanear Medicina", subtitle: "Toma una foto clara del empaque.", tap: "Tocar para Capturar", analyzing: "Analizando...", collection: "Recientes", empty: "Tu diario está vacío.", btn_guide: "Ver Guía" },
    result: { back: "Volver", share: "Compartir", copied: "¡Copiado!", disclaimer: "Generado por IA. Consulta a un médico.", translating: "Traduciendo..." },
    settings: { title: "Ajustes", language: "Idioma", data: "Datos", clear: "Borrar Historial", privacy_title: "Privacidad" },
    privacy: { title: "Política de Privacidad", updated: "Actualizado", sec1: "Recopilación", sec1_d: "Las imágenes no se guardan permanentemente.", sec2: "Uso", sec2_d: "Solo para identificar medicamentos.", sec3: "Aviso", sec3_d: "No sustituye el consejo médico." },
    guide: { title: "Cómo usar", subtitle: "Tres pasos simples.", step1: "Foto", step1_d: "Toma una foto clara.", step2: "Analizar", step2_d: "IA identifica la droga.", step3: "Aprender", step3_d: "Lee las instrucciones." },
    error: { title: "Error", dismiss: "Omitir" }
  },
  zh: {
    nav: { home: "首页", history: "收藏", guide: "指南", settings: "设置", privacy: "隐私" },
    home: { greeting: "你好", title: "扫描药物", subtitle: "拍摄清晰的包装照片。", tap: "点击拍照", analyzing: "分析中...", collection: "最近扫描", empty: "日志为空。", btn_guide: "查看指南" },
    result: { back: "返回", share: "分享", copied: "已复制", disclaimer: "AI生成。请咨询医生。", translating: "翻译中..." },
    settings: { title: "设置", language: "语言", data: "数据管理", clear: "清空历史", privacy_title: "隐私" },
    privacy: { title: "隐私政策", updated: "更新于", sec1: "数据收集", sec1_d: "图像不被永久存储。", sec2: "用途", sec2_d: "仅用于药物识别。", sec3: "免责声明", sec3_d: "不可替代医生建议。" },
    guide: { title: "使用说明", subtitle: "简单三步。", step1: "拍照", step1_d: "拍摄清晰照片。", step2: "分析", step2_d: "AI识别药物。", step3: "学习", step3_d: "阅读说明。" },
    error: { title: "扫描失败", dismiss: "关闭" }
  },
  // ... (Other languages fall back to English structure but utilize the Translation Engine for the actual medical content)
};

// Robust Translation Helper
const getUiText = (lang, key) => {
  const base = UI_STRINGS[lang] || UI_STRINGS['en']; // Default to English if lang not fully defined in UI_STRINGS
  const val = key.split('.').reduce((o, i) => (o ? o[i] : null), base);
  // Second fallback to English key if specific key is missing in target lang
  if (!val) {
     return key.split('.').reduce((o, i) => (o ? o[i] : null), UI_STRINGS['en']) || "";
  }
  return val;
};

// --- COMPONENTS ---

const NavTab = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all font-medium text-sm
      ${active ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    <Icon size={18} />
    <span className="hidden md:inline">{label}</span>
  </button>
);

const InfoBlock = ({ title, content, type = 'neutral' }) => {
  const isWarning = type === 'warning';
  return (
    <div className={`p-5 rounded-2xl mb-4 transition-all ${isWarning ? 'bg-orange-50 border border-orange-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
      <h4 className={`text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isWarning ? 'text-orange-800' : 'text-slate-400'}`}>
        {isWarning ? <AlertTriangle size={16} /> : <Info size={16} />}
        {title}
      </h4>
      <div className={`text-base leading-relaxed ${isWarning ? 'text-orange-900' : 'text-slate-700'}`}>
        {Array.isArray(content) ? (
          <ul className="space-y-2">
            {content.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${isWarning ? 'bg-orange-400' : 'bg-slate-300'}`} />
                {typeof item === 'object' ? JSON.stringify(item) : item}
              </li>
            ))}
          </ul>
        ) : (
          <p>{typeof content === 'object' ? JSON.stringify(content) : content}</p>
        )}
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function MedScanApp() {
  const [screen, setScreen] = useState('home'); 
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  // Persistence
  useEffect(() => {
    const savedLang = localStorage.getItem('cocomed_lang');
    const savedHist = localStorage.getItem('cocomed_hist');
    if (savedLang) setLang(savedLang);
    if (savedHist) setHistory(JSON.parse(savedHist));
  }, []);

  useEffect(() => { localStorage.setItem('cocomed_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cocomed_hist', JSON.stringify(history)); }, [history]);

  const isRTL = LANGUAGES.find(l => l.code === lang)?.dir === 'rtl';

  // --- SMART AI LOGIC ---
  useEffect(() => {
    const checkAndTranslate = async () => {
      if (screen === 'result' && scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) {
        await reAnalyzeForLanguage(scanResult);
      }
    };
    checkAndTranslate();
  }, [screen, lang, scanResult]);

  const performGeminiCall = async (payload) => {
    const envKey = getApiKey();
    if (envKey && process.env.NODE_ENV === 'development') {
         const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${envKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: payload }] })
         });
         return await res.json();
    } else {
         const res = await fetch(`${VERCEL_BACKEND_URL}/api/analyze`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: payload[0].text,
                image: payload[1]?.inlineData?.data 
            })
         });
         if (!res.ok) throw new Error("Server Error");
         return await res.json();
    }
  };

  const handleScan = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = compressed.split(',')[1];
      
      const prompt = `You are a helpful pharmacist assistant. 
      STEP 1: Check if image is medication. If NO, return JSON { "error": "NOT_MEDICINE" }.
      STEP 2: If YES, extract info in ${languageNames[lang]}.
      Format: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;

      const data = await performGeminiCall([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      
      if (!json) throw new Error("Could not understand image");
      const parsed = JSON.parse(json);
      if (parsed.error) throw new Error(parsed.error === "NOT_MEDICINE" ? "That doesn't look like medication. Please scan a label or package." : parsed.error);
      
      const clean = sanitizeScanData(parsed);
      const newScan = { ...clean, id: Date.now(), date: new Date().toISOString(), img: compressed, languageCode: lang };
      
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      setScreen('result');

    } catch (err) {
      console.error(err);
      setError(err.message || "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reAnalyzeForLanguage = async (currentScan) => {
      setIsTranslating(true);
      try {
          const base64 = currentScan.img.split(',')[1];
          const prompt = `Translate/Re-analyze this medication information into ${languageNames[lang]}.
          Format: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;
          
          const data = await performGeminiCall([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          const json = text?.match(/\{[\s\S]*\}/)?.[0];
          
          if (json) {
              const parsed = JSON.parse(json);
              const clean = sanitizeScanData(parsed);
              const updatedScan = { ...currentScan, ...clean, languageCode: lang };
              setScanResult(updatedScan);
              setHistory(prev => prev.map(item => item.id === currentScan.id ? updatedScan : item));
          }
      } catch (e) {
          console.error("Translation failed", e);
      } finally {
          setIsTranslating(false);
      }
  };

  // --- SCREEN RENDERS ---

  const HomeScreen = () => (
    <div className="max-w-5xl mx-auto w-full p-6 flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-5/12">
        <div className="mb-6">
           <span className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1 block">{getUiText(lang, 'home.greeting')}</span>
           <h1 className="text-3xl font-bold text-slate-900">{getUiText(lang, 'home.title')}</h1>
           <p className="text-slate-500 mt-2">{getUiText(lang, 'home.subtitle')}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start mb-6 animate-fade-in">
            <XCircle className="text-red-500 shrink-0" size={20} />
            <div className="flex-1">
               <h3 className="font-bold text-red-900 text-sm">{getUiText(lang, 'error.title')}</h3>
               <p className="text-red-700 text-xs mt-1">{error}</p>
            </div>
            <button onClick={() => setError(null)}><X size={16} className="text-red-400" /></button>
          </div>
        )}

        <div 
          onClick={() => !loading && fileRef.current?.click()}
          className={`group bg-white rounded-[2.5rem] border-2 border-dashed ${loading ? 'border-orange-300 bg-orange-50' : 'border-slate-200 hover:border-orange-400 hover:bg-orange-50/30'} transition-all cursor-pointer p-10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden`}
        >
           <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => { if(e.target.files[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
           
           {loading ? (
             <div className="text-center z-10">
               <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
               <p className="text-orange-800 font-bold animate-pulse">{getUiText(lang, 'home.analyzing')}</p>
             </div>
           ) : (
             <>
               <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Camera size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">{getUiText(lang, 'home.tap')}</h3>
               <p className="text-slate-400 text-sm text-center max-w-xs">{getUiText(lang, 'home.subtitle')}</p>
             </>
           )}
        </div>
      </div>

      <div className="w-full md:w-7/12">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-slate-900 flex items-center gap-2"><Calendar size={18} className="text-slate-400" /> {getUiText(lang, 'home.collection')}</h3>
        </div>
        {history.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300"><Sparkles /></div>
             <p className="text-slate-400">{getUiText(lang, 'home.empty')}</p>
             <button onClick={() => setScreen('guide')} className="mt-4 text-emerald-600 font-bold text-sm hover:underline">{getUiText(lang, 'home.btn_guide')}</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {history.slice(0,4).map((item, i) => (
               <div key={i} onClick={() => { setScanResult(item); setScreen('result'); }} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0"><img src={item.img} className="w-full h-full object-cover" /></div>
                  <div className="min-w-0">
                     <p className="text-[10px] font-bold text-orange-600 uppercase">{new Date(item.date).toLocaleDateString()}</p>
                     <h4 className="font-bold text-slate-800 truncate">{item.brandName}</h4>
                     <p className="text-xs text-slate-500 truncate">{item.genericName}</p>
                  </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );

  const ResultScreen = () => (
    <div className="max-w-4xl mx-auto p-6">
      <button onClick={() => setScreen('home')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm"><ArrowLeft size={16} /> {getUiText(lang, 'result.back')}</button>
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-slate-100 relative group h-64 md:h-auto">
           <img src={scanResult.img} className="w-full h-full object-cover" />
           {isTranslating && (
               <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                   <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                   <span className="text-emerald-700 font-bold text-sm animate-pulse">{getUiText(lang, 'result.translating')}</span>
               </div>
           )}
        </div>
        <div className="flex-1 p-8 md:p-10">
           <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-3">{scanResult.dosageForm}</span>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">{scanResult.brandName}</h1>
                <p className="text-lg text-slate-500 font-medium mt-1">{scanResult.genericName}</p>
              </div>
              <button onClick={() => {
                 navigator.share ? navigator.share({title: scanResult.brandName, text: `Medicine info for ${scanResult.brandName}`}) : alert(getUiText(lang, 'result.copied'));
              }} className="p-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600"><Share2 size={20} /></button>
           </div>

           <div className="grid gap-2">
              <InfoBlock title={getUiText(lang, 'result.whatIsItFor') || "Purpose"} content={scanResult.purpose} />
              <InfoBlock title={getUiText(lang, 'result.howToTake') || "Instructions"} content={scanResult.howToTake} />
              <div className="grid md:grid-cols-2 gap-4">
                 <InfoBlock title={getUiText(lang, 'result.sideEffects') || "Side Effects"} content={scanResult.sideEffects} type="warning" />
                 <InfoBlock title={getUiText(lang, 'result.warnings') || "Warnings"} content={scanResult.warnings} type="warning" />
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={14} />
              <span>{getUiText(lang, 'result.disclaimer')}</span>
           </div>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{getUiText(lang, 'settings.title')}</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="text-slate-400" />
            <span className="font-bold text-slate-700">{getUiText(lang, 'settings.language')}</span>
          </div>
          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded">{LANGUAGES.find(l => l.code === lang)?.nativeName}</span>
        </div>
        <div className="h-64 overflow-y-auto p-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} className={`w-full text-left px-4 py-3 rounded-xl flex justify-between items-center hover:bg-slate-50 ${lang === l.code ? 'bg-orange-50 text-orange-700' : 'text-slate-600'}`}>
              <span className="font-medium">{l.nativeName}</span>
              {lang === l.code && <CheckCircle2 size={16} />}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Trash2 size={18} className="text-slate-400" /> {getUiText(lang, 'settings.data')}</h3>
         <button onClick={() => { if(confirm("Delete all history?")) setHistory([]); }} className="text-red-600 font-bold text-sm hover:underline">{getUiText(lang, 'settings.clear')}</button>
      </div>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="max-w-2xl mx-auto p-6">
       <h1 className="text-2xl font-bold text-slate-900 mb-6">{getUiText(lang, 'privacy.title')}</h1>
       <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm prose prose-slate">
          <div className="flex items-center gap-3 mb-6 text-slate-400 font-medium"><Lock size={20} /> <span>{getUiText(lang, 'privacy.updated')}: Nov 2025</span></div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">1. {getUiText(lang, 'privacy.sec1')}</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">{getUiText(lang, 'privacy.sec1_d')}</p>
          <h3 className="font-bold text-lg text-slate-800 mb-2">2. {getUiText(lang, 'privacy.sec2')}</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">{getUiText(lang, 'privacy.sec2_d')}</p>
          <h3 className="font-bold text-lg text-slate-800 mb-2">3. {getUiText(lang, 'privacy.sec3')}</h3>
          <p className="text-slate-600 leading-relaxed">{getUiText(lang, 'privacy.sec3_d')}</p>
       </div>
    </div>
  );

  const GuideScreen = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12 mt-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">{getUiText(lang, 'guide.title')}</h1>
        <p className="text-slate-500">{getUiText(lang, 'guide.subtitle')}</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
         {[
           { icon: Camera, title: getUiText(lang, 'guide.step1'), desc: getUiText(lang, 'guide.step1_d') },
           { icon: Sparkles, title: getUiText(lang, 'guide.step2'), desc: getUiText(lang, 'guide.step2_d') },
           { icon: BookOpen, title: getUiText(lang, 'guide.step3'), desc: getUiText(lang, 'guide.step3_d') }
         ].map((step, i) => (
           <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><step.icon size={32} /></div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.desc}</p>
           </div>
         ))}
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-orange-200 selection:text-orange-900" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* --- TOP NAVIGATION (DESKTOP) --- */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
           <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
                 <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm"><Palmtree size={18} /></div>
                 <span className="font-bold text-lg text-slate-900 tracking-tight">CocoMed</span>
              </div>
              <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                 {['home', 'history', 'guide', 'settings', 'privacy'].map(tab => (
                   <button key={tab} onClick={() => setScreen(tab)} className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-all ${screen === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                     {getUiText(lang, `nav.${tab}`) || tab}
                   </button>
                 ))}
              </div>
              <div className="md:hidden w-8" /> 
           </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 w-full relative pb-24 md:pb-0">
          {screen === 'home' && <HomeScreen />}
          {screen === 'result' && <ResultScreen />}
          {screen === 'history' && <div className="max-w-5xl mx-auto p-6"><h2 className="text-2xl font-bold mb-6">{getUiText(lang, 'home.collection')}</h2>{history.length ? <div className="grid sm:grid-cols-2 gap-4">{history.map((item,i) => <div key={i} onClick={() => {setScanResult(item); setScreen('result')}} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 cursor-pointer hover:border-orange-300"><img src={item.img} className="w-16 h-16 rounded-lg object-cover bg-slate-100" /><div><h4 className="font-bold">{item.brandName}</h4><p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p></div></div>)}</div> : <p className="text-slate-400 text-center mt-20">{getUiText(lang, 'home.empty')}</p>}</div>}
          {screen === 'guide' && <GuideScreen />}
          {screen === 'settings' && <SettingsScreen />}
          {screen === 'privacy' && <PrivacyScreen />}
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-1 px-4 flex justify-between items-center z-50 h-20">
           <NavTab icon={Home} label={getUiText(lang, 'nav.home')} active={screen === 'home'} onClick={() => setScreen('home')} />
           <NavTab icon={History} label={getUiText(lang, 'nav.history')} active={screen === 'history'} onClick={() => setScreen('history')} />
           <NavTab icon={BookOpen} label={getUiText(lang, 'nav.guide')} active={screen === 'guide'} onClick={() => setScreen('guide')} />
           <NavTab icon={Settings} label={getUiText(lang, 'nav.settings')} active={screen === 'settings'} onClick={() => setScreen('settings')} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
