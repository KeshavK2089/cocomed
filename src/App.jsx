import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, 
  ChevronRight, ArrowLeft, Search, Heart, ChevronDown, MapPin, Clock, Star, Layers, Grid3X3
} from 'lucide-react';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="backdrop-blur-2xl bg-white/10 p-8 rounded-[2.5rem] border border-white/20 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">Something went wrong</h2>
            <p className="text-white/60 mb-8 text-sm">The app encountered an error.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl font-medium backdrop-blur transition-all">
              Restart CocoMed
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- CONFIG ---
const VERCEL_BACKEND_URL = "https://cocomed.vercel.app";
const getApiKey = () => {
  try { 
    if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    if (import.meta?.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY; 
  } catch (e) {}
  return "";
};

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 1024, scale = MAX / img.width;
      canvas.width = MAX; canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.onerror = reject;
  };
  reader.onerror = reject;
});

const sanitize = (data) => {
  if (!data || typeof data !== 'object') return null;
  const str = (v) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : "N/A");
  const arr = (a) => Array.isArray(a) ? a.filter(i => typeof i === 'string') : [];
  return { ...data, brandName: str(data.brandName), genericName: str(data.genericName), manufacturer: str(data.manufacturer), dosageForm: str(data.dosageForm), strength: str(data.strength), purpose: str(data.purpose), howToTake: str(data.howToTake), sideEffects: arr(data.sideEffects), warnings: arr(data.warnings) };
};

// --- LOCALIZATION ---
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

const langNames = { en: 'English', es: 'Spanish', zh: 'Simplified Chinese', hi: 'Hindi', ta: 'Tamil' };

const TIPS = [
  { text: "Stay hydrated! Water helps medication absorption.", icon: "💧" },
  { text: "Always check expiration dates before use.", icon: "📅" },
  { text: "Store medicines in a cool, dry place.", icon: "☀️" },
  { text: "Keep allergies list on your phone.", icon: "⚠️" },
  { text: "Consult a pharmacist if you miss a dose.", icon: "💊" }
];

const UI = {
  en: { nav: { home: "Home", history: "History", guide: "Guide", settings: "Settings" }, home: { greeting: "Good Day", title: "CocoMed", subtitle: "Your Personal Medicine Assistant", tap: "Tap to Scan", analyzing: "Analyzing", recent: "Recent", empty: "No scans yet", tip: "Daily Tip" }, result: { back: "Back", purpose: "Purpose", howTo: "How to Take", effects: "Side Effects", warnings: "Warnings", disclaimer: "For educational purposes only. Consult your doctor." }, history: { title: "History", search: "Search medicines...", empty: "No medicines found", export: "Export" }, settings: { title: "Settings", language: "Language", clear: "Clear Data", privacy: "Privacy", about: "About" }, guide: { title: "How to Use", s1: "Scan", s1d: "Point camera at medicine", s2: "Analyze", s2d: "AI identifies the drug", s3: "Learn", s3d: "Read usage & warnings" }, privacy: { title: "Privacy", t1: "Data", d1: "Images processed in real-time, not stored.", t2: "Usage", d2: "Camera used only for identification.", t3: "Disclaimer", d3: "Educational tool, not medical advice." } },
  es: { nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" }, home: { greeting: "Hola", title: "CocoMed", subtitle: "Tu Asistente de Medicinas", tap: "Escanear", analyzing: "Analizando", recent: "Recientes", empty: "Sin escaneos", tip: "Consejo" }, result: { back: "Volver", purpose: "Propósito", howTo: "Cómo Tomar", effects: "Efectos", warnings: "Advertencias", disclaimer: "Solo educativo. Consulte a su médico." }, history: { title: "Historial", search: "Buscar...", empty: "Sin medicinas", export: "Exportar" }, settings: { title: "Ajustes", language: "Idioma", clear: "Borrar", privacy: "Privacidad", about: "Acerca de" }, guide: { title: "Cómo Usar", s1: "Escanear", s1d: "Apunta la cámara", s2: "Analizar", s2d: "IA identifica", s3: "Aprender", s3d: "Lee instrucciones" }, privacy: { title: "Privacidad", t1: "Datos", d1: "Imágenes no almacenadas.", t2: "Uso", d2: "Solo identificación.", t3: "Aviso", d3: "Herramienta educativa." } },
  zh: { nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" }, home: { greeting: "你好", title: "CocoMed", subtitle: "您的药物助手", tap: "扫描", analyzing: "分析中", recent: "最近", empty: "无记录", tip: "提示" }, result: { back: "返回", purpose: "用途", howTo: "服用方法", effects: "副作用", warnings: "警告", disclaimer: "仅供教育。请咨询医生。" }, history: { title: "历史", search: "搜索...", empty: "无药物", export: "导出" }, settings: { title: "设置", language: "语言", clear: "清除", privacy: "隐私", about: "关于" }, guide: { title: "使用方法", s1: "扫描", s1d: "对准药物", s2: "分析", s2d: "AI识别", s3: "学习", s3d: "阅读说明" }, privacy: { title: "隐私", t1: "数据", d1: "图像不存储。", t2: "用途", d2: "仅用于识别。", t3: "声明", d3: "教育工具。" } },
  hi: { nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" }, home: { greeting: "नमस्ते", title: "CocoMed", subtitle: "आपका दवा सहायक", tap: "स्कैन करें", analyzing: "विश्लेषण", recent: "हाल के", empty: "कोई स्कैन नहीं", tip: "सुझाव" }, result: { back: "वापस", purpose: "उद्देश्य", howTo: "कैसे लें", effects: "दुष्प्रभाव", warnings: "चेतावनी", disclaimer: "शैक्षिक उद्देश्य। डॉक्टर से परामर्श करें।" }, history: { title: "इतिहास", search: "खोजें...", empty: "कोई दवा नहीं", export: "निर्यात" }, settings: { title: "सेटिंग्स", language: "भाषा", clear: "साफ़ करें", privacy: "गोपनीयता", about: "जानकारी" }, guide: { title: "उपयोग", s1: "स्कैन", s1d: "कैमरा दिखाएं", s2: "विश्लेषण", s2d: "AI पहचान", s3: "सीखें", s3d: "निर्देश पढ़ें" }, privacy: { title: "गोपनीयता", t1: "डेटा", d1: "छवियां संग्रहीत नहीं।", t2: "उपयोग", d2: "केवल पहचान।", t3: "अस्वीकरण", d3: "शैक्षिक उपकरण।" } },
  ta: { nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" }, home: { greeting: "வணக்கம்", title: "CocoMed", subtitle: "உங்கள் மருந்து உதவியாளர்", tap: "ஸ்கேன்", analyzing: "ஆய்வு", recent: "சமீபத்திய", empty: "ஸ்கேன் இல்லை", tip: "குறிப்பு" }, result: { back: "திரும்ப", purpose: "நோக்கம்", howTo: "எப்படி எடுப்பது", effects: "பக்க விளைவுகள்", warnings: "எச்சரிக்கைகள்", disclaimer: "கல்வி நோக்கம். மருத்துவரை அணுகவும்." }, history: { title: "வரலாறு", search: "தேடு...", empty: "மருந்துகள் இல்லை", export: "ஏற்றுமதி" }, settings: { title: "அமைப்புகள்", language: "மொழி", clear: "அழி", privacy: "தனியுரிமை", about: "பற்றி" }, guide: { title: "பயன்பாடு", s1: "ஸ்கேன்", s1d: "கேமரா காட்டு", s2: "ஆய்வு", s2d: "AI கண்டறியும்", s3: "கற்க", s3d: "படிக்கவும்" }, privacy: { title: "தனியுரிமை", t1: "தரவு", d1: "படங்கள் சேமிக்கப்படுவதில்லை.", t2: "பயன்பாடு", d2: "அடையாளம் மட்டும்.", t3: "மறுப்பு", d3: "கல்வி கருவி." } }
};

const t = (lang, key) => key.split('.').reduce((o, k) => o?.[k], UI[lang] || UI.en) || key.split('.').reduce((o, k) => o?.[k], UI.en) || "";

// --- GLASS CARD COMPONENT ---
const GlassCard = ({ children, className = "", onClick, hover = true }) => (
  <div 
    onClick={onClick}
    className={`backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-lg shadow-black/5 
      ${hover ? 'hover:bg-white/15 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98]' : ''} 
      transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- MAIN APP ---
export default function MedScanApp() {
  const [screen, setScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [dailyTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [time, setTime] = useState(new Date());
  const fileRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('cocomed_lang');
    const hist = localStorage.getItem('cocomed_hist');
    if (saved && LANGUAGES.some(l => l.code === saved)) setLang(saved);
    if (hist) setHistory(JSON.parse(hist));
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { localStorage.setItem('cocomed_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cocomed_hist', JSON.stringify(history)); }, [history]);

  const hour = time.getHours();
  const gradientClass = hour >= 6 && hour < 12 ? 'from-emerald-600 via-teal-500 to-cyan-400' 
    : hour >= 12 && hour < 18 ? 'from-emerald-500 via-teal-600 to-emerald-700'
    : hour >= 18 && hour < 21 ? 'from-teal-700 via-emerald-800 to-slate-900'
    : 'from-slate-900 via-emerald-950 to-slate-900';

  const callGemini = async (payload) => {
    const key = getApiKey();
    if (key && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: payload }] })
      });
      return res.json();
    }
    const res = await fetch(`${VERCEL_BACKEND_URL}/api/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: payload[0].text, image: payload[1]?.inlineData?.data })
    });
    if (!res.ok) throw new Error("Server error");
    return res.json();
  };

  const handleScan = async (file) => {
    setLoading(true); setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = compressed.split(',')[1];
      const prompt = `You are a pharmacist assistant. Check if image is medication. If NO: { "error": "NOT_MEDICINE" }. If YES, extract in ${langNames[lang]}: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;
      const data = await callGemini([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      if (!json) throw new Error("Could not analyze image");
      const parsed = JSON.parse(json);
      if (parsed.error) throw new Error("Please scan a medicine label or package.");
      const clean = sanitize(parsed);
      const newScan = { ...clean, id: Date.now(), date: new Date().toISOString(), img: compressed, languageCode: lang };
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      setScreen('result');
    } catch (err) {
      setError(err.message || "Scan failed.");
    } finally { setLoading(false); }
  };

  const reAnalyze = async (scan) => {
    if (scan.languageCode === lang || isTranslating) return;
    setIsTranslating(true);
    try {
      const base64 = scan.img.split(',')[1];
      const prompt = `Translate medication info to ${langNames[lang]}: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;
      const data = await callGemini([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      if (json) {
        const clean = sanitize(JSON.parse(json));
        const updated = { ...scan, ...clean, languageCode: lang };
        setScanResult(updated);
        setHistory(prev => prev.map(h => h.id === scan.id ? updated : h));
      }
    } catch (e) {} finally { setIsTranslating(false); }
  };

  useEffect(() => { if (screen === 'result' && scanResult) reAnalyze(scanResult); }, [lang]);

  const filtered = history.filter(h => h.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || h.genericName.toLowerCase().includes(searchQuery.toLowerCase()));

  // --- HOME SCREEN ---
  const HomeScreen = () => (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative px-6 pt-8 pb-12 md:px-12 md:pt-12">
        <div className="max-w-6xl mx-auto">
          {/* Greeting */}
          <div className="mb-8 md:mb-12">
            <p className="text-white/60 text-sm font-medium tracking-wide uppercase">{t(lang, 'home.greeting')}</p>
            <h1 className="text-5xl md:text-7xl font-extralight text-white tracking-tight mt-1">{t(lang, 'home.title')}</h1>
            <p className="text-white/50 text-lg mt-2">{t(lang, 'home.subtitle')}</p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scan Button - Hero */}
            <div className="lg:col-span-5">
              <div 
                onClick={() => !loading && fileRef.current?.click()}
                className="relative group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60" />
                <GlassCard className="relative p-8 md:p-12 min-h-[320px] md:min-h-[380px] flex flex-col items-center justify-center overflow-hidden" hover={!loading}>
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
                  
                  {loading ? (
                    <div className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
                        <div className="absolute inset-4 rounded-full bg-white/10 flex items-center justify-center">
                          <Pill className="text-white" size={28} />
                        </div>
                      </div>
                      <p className="text-white text-xl font-light">{t(lang, 'home.analyzing')}</p>
                      <div className="flex gap-1 justify-center mt-3">
                        {[0,1,2].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-white/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-white/30 to-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-black/20">
                        <Camera size={48} className="text-white" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-light text-white mb-2">{t(lang, 'home.tap')}</h3>
                      <p className="text-white/50 text-center text-sm max-w-[200px]">Point your camera at any medicine packaging</p>
                      
                      {/* Decorative elements */}
                      <div className="absolute top-6 right-6 w-20 h-20 rounded-full bg-white/5 blur-2xl" />
                      <div className="absolute bottom-8 left-8 w-32 h-32 rounded-full bg-emerald-400/10 blur-3xl" />
                    </>
                  )}
                </GlassCard>
              </div>

              {/* Error Toast */}
              {error && (
                <GlassCard className="mt-4 p-4 bg-red-500/20 border-red-400/30" hover={false}>
                  <div className="flex items-center gap-3">
                    <XCircle className="text-red-300 shrink-0" size={20} />
                    <p className="text-red-100 text-sm flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-red-300 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Daily Tip */}
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400/30 to-orange-500/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">{dailyTip.icon}</span>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">{t(lang, 'home.tip')}</p>
                    <p className="text-white/90 text-base leading-relaxed">{dailyTip.text}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Recent Scans */}
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider">{t(lang, 'home.recent')}</h3>
                  {history.length > 0 && (
                    <button onClick={() => setScreen('history')} className="text-emerald-300/80 text-sm font-medium hover:text-emerald-300 transition-colors">
                      View All →
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <GlassCard className="p-8 text-center" hover={false}>
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="text-white/30" size={28} />
                    </div>
                    <p className="text-white/40">{t(lang, 'home.empty')}</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history.slice(0, 4).map((item, i) => (
                      <GlassCard key={i} className="p-4" onClick={() => { setScanResult(item); setScreen('result'); }}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0">
                            <img src={item.img} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-orange-300/80 text-[10px] font-medium uppercase tracking-wider">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <h4 className="text-white font-medium truncate mt-0.5">{item.brandName}</h4>
                            <p className="text-white/50 text-sm truncate">{item.genericName}</p>
                          </div>
                          <ChevronRight className="text-white/30 shrink-0" size={20} />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // --- RESULT SCREEN ---
  const ResultScreen = () => (
    <div className="min-h-full px-6 py-8 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button onClick={() => setScreen('home')} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">{t(lang, 'result.back')}</span>
        </button>

        {/* Hero Card */}
        <GlassCard className="p-8 mb-6 overflow-hidden relative" hover={false}>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white/10 shrink-0 shadow-2xl shadow-black/30">
              <img src={scanResult.img} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1.5 rounded-full bg-orange-400/20 text-orange-300 text-xs font-medium uppercase tracking-wider border border-orange-400/20">
                  {scanResult.dosageForm}
                </span>
                {scanResult.strength !== 'N/A' && (
                  <span className="px-3 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-medium">
                    {scanResult.strength}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight">{scanResult.brandName}</h1>
              <p className="text-white/50 text-xl mt-2">{scanResult.genericName}</p>
              {scanResult.manufacturer !== 'N/A' && (
                <p className="text-white/30 text-sm mt-3 flex items-center gap-2">
                  <MapPin size={14} /> {scanResult.manufacturer}
                </p>
              )}
            </div>
          </div>
          
          {isTranslating && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/40 to-transparent">
              <div className="flex items-center gap-3 text-emerald-300">
                <RefreshCw size={16} className="animate-spin" />
                <span className="text-sm">Translating...</span>
              </div>
            </div>
          )}
          
          {/* Decorative */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-emerald-400/10 blur-3xl" />
        </GlassCard>

        {/* Info Cards */}
        <div className="space-y-4">
          {scanResult.purpose && scanResult.purpose !== 'N/A' && (
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center shrink-0">
                  <Heart className="text-emerald-300" size={20} />
                </div>
                <div>
                  <h4 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{t(lang, 'result.purpose')}</h4>
                  <p className="text-white/90 leading-relaxed">{scanResult.purpose}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {scanResult.howToTake && scanResult.howToTake !== 'N/A' && (
            <GlassCard className="p-6" hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center shrink-0">
                  <Clock className="text-blue-300" size={20} />
                </div>
                <div>
                  <h4 className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">{t(lang, 'result.howTo')}</h4>
                  <p className="text-white/90 leading-relaxed">{scanResult.howToTake}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {scanResult.sideEffects?.length > 0 && (
            <GlassCard className="p-6 bg-orange-500/10 border-orange-400/20" hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-orange-400/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-orange-300" size={20} />
                </div>
                <div>
                  <h4 className="text-orange-300/80 text-xs font-medium uppercase tracking-wider mb-3">{t(lang, 'result.effects')}</h4>
                  <ul className="space-y-2">
                    {scanResult.sideEffects.map((effect, i) => (
                      <li key={i} className="text-white/80 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400/60 mt-2 shrink-0" />
                        {effect}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}

          {scanResult.warnings?.length > 0 && (
            <GlassCard className="p-6 bg-red-500/10 border-red-400/20" hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="text-red-300" size={20} />
                </div>
                <div>
                  <h4 className="text-red-300/80 text-xs font-medium uppercase tracking-wider mb-3">{t(lang, 'result.warnings')}</h4>
                  <ul className="space-y-2">
                    {scanResult.warnings.map((warn, i) => (
                      <li key={i} className="text-white/80 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400/60 mt-2 shrink-0" />
                        {warn}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-white/30 text-xs">{t(lang, 'result.disclaimer')}</p>
        </div>
      </div>
    </div>
  );

  // --- HISTORY SCREEN ---
  const HistoryScreen = () => (
    <div className="min-h-full px-6 py-8 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight">{t(lang, 'history.title')}</h1>
          <button onClick={() => { const text = history.map(h => `${h.brandName} (${h.strength})`).join('\n'); navigator.clipboard?.writeText(text); }} className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-sm font-medium transition-all border border-white/10">
            {t(lang, 'history.export')}
          </button>
        </div>

        {/* Search */}
        <GlassCard className="p-2 mb-8" hover={false}>
          <div className="flex items-center gap-3 px-4">
            <Search className="text-white/40" size={20} />
            <input 
              type="text" 
              placeholder={t(lang, 'history.search')} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/30 py-3"
            />
          </div>
        </GlassCard>

        {/* Grid */}
        {filtered.length === 0 ? (
          <GlassCard className="p-12 text-center" hover={false}>
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Search className="text-white/20" size={32} />
            </div>
            <p className="text-white/40">{t(lang, 'history.empty')}</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item, i) => (
              <GlassCard key={i} className="p-5 group" onClick={() => { setScanResult(item); setScreen('result'); }}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 shrink-0">
                    <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-white font-medium truncate">{item.brandName}</h4>
                    <p className="text-white/50 text-sm truncate">{item.genericName}</p>
                    <p className="text-white/30 text-xs mt-1">{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // --- GUIDE SCREEN ---
  const GuideScreen = () => (
    <div className="min-h-full px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight mb-8">{t(lang, 'guide.title')}</h1>
        
        <div className="space-y-4">
          {[
            { icon: Camera, color: 'emerald', num: '01', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') },
            { icon: Sparkles, color: 'purple', num: '02', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') },
            { icon: BookOpen, color: 'orange', num: '03', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') },
          ].map((step, i) => (
            <GlassCard key={i} className="p-6" hover={false}>
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-${step.color}-400/20 flex items-center justify-center shrink-0`}>
                  <step.icon className={`text-${step.color}-300`} size={28} />
                </div>
                <div>
                  <span className="text-white/30 text-xs font-mono">{step.num}</span>
                  <h3 className="text-white text-xl font-medium">{step.title}</h3>
                  <p className="text-white/50 mt-1">{step.desc}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );

  // --- SETTINGS SCREEN ---
  const SettingsScreen = () => (
    <div className="min-h-full px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight mb-8">{t(lang, 'settings.title')}</h1>

        {/* Language */}
        <GlassCard className="overflow-hidden mb-6" hover={false}>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <Globe className="text-white/40" size={20} />
            <span className="text-white/60 font-medium">{t(lang, 'settings.language')}</span>
          </div>
          <div className="p-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${lang === l.code ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/70 hover:bg-white/5'}`}>
                <span className="font-medium">{l.nativeName}</span>
                {lang === l.code && <CheckCircle2 size={20} />}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Actions */}
        <div className="space-y-3">
          <GlassCard className="p-5" onClick={() => setScreen('privacy')}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Lock className="text-white/60" size={20} />
              </div>
              <span className="text-white/80 font-medium flex-1">{t(lang, 'settings.privacy')}</span>
              <ChevronRight className="text-white/30" size={20} />
            </div>
          </GlassCard>

          <GlassCard className="p-5 bg-red-500/10 border-red-400/20" onClick={() => { if (confirm('Clear all data?')) { setHistory([]); localStorage.clear(); }}}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-400/20 flex items-center justify-center">
                <Trash2 className="text-red-300" size={20} />
              </div>
              <span className="text-red-300 font-medium">{t(lang, 'settings.clear')}</span>
            </div>
          </GlassCard>
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/20 text-sm">CocoMed v2.0</p>
          <p className="text-white/10 text-xs mt-1">Made with ♥ for better health</p>
        </div>
      </div>
    </div>
  );

  // --- PRIVACY SCREEN ---
  const PrivacyScreen = () => (
    <div className="min-h-full px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setScreen('settings')} className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> <span className="font-medium">{t(lang, 'settings.title')}</span>
        </button>
        
        <h1 className="text-4xl md:text-5xl font-extralight text-white tracking-tight mb-8">{t(lang, 'privacy.title')}</h1>

        <GlassCard className="p-8" hover={false}>
          <div className="space-y-8">
            {[1, 2, 3].map(i => (
              <div key={i}>
                <h3 className="text-white font-medium text-lg mb-2">{t(lang, `privacy.t${i}`)}</h3>
                <p className="text-white/50 leading-relaxed">{t(lang, `privacy.d${i}`)}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // --- DESKTOP SIDEBAR ---
  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-6 border-r border-white/10">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <Pill className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-white font-semibold text-lg">CocoMed</h1>
          <p className="text-white/40 text-xs">Medicine Scanner</p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="space-y-2 flex-1">
        {[
          { id: 'home', icon: Home, label: t(lang, 'nav.home') },
          { id: 'history', icon: History, label: t(lang, 'nav.history') },
          { id: 'guide', icon: BookOpen, label: t(lang, 'nav.guide') },
          { id: 'settings', icon: Settings, label: t(lang, 'nav.settings') },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setScreen(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
              screen === item.id || (screen === 'result' && item.id === 'home') || (screen === 'privacy' && item.id === 'settings')
                ? 'bg-white/15 text-white shadow-lg shadow-black/10' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="pt-6 border-t border-white/10">
        <p className="text-white/20 text-xs text-center">Educational Use Only</p>
      </div>
    </div>
  );

  // --- MOBILE NAV ---
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 z-50">
      <div className="backdrop-blur-2xl bg-black/40 border border-white/20 rounded-[2rem] p-2 shadow-2xl shadow-black/40">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: Home },
            { id: 'history', icon: History },
            { id: 'guide', icon: BookOpen },
            { id: 'settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`flex-1 flex flex-col items-center py-3 px-4 rounded-2xl transition-all ${
                screen === item.id || (screen === 'result' && item.id === 'home') || (screen === 'privacy' && item.id === 'settings')
                  ? 'bg-white/20 text-white' 
                  : 'text-white/40'
              }`}
            >
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-medium">{t(lang, `nav.${item.id}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-gradient-to-br ${gradientClass} transition-colors duration-1000`}>
        <div className="flex">
          <DesktopNav />
          
          <main className="flex-1 min-h-screen pb-32 lg:pb-8">
            {screen === 'home' && <HomeScreen />}
            {screen === 'result' && scanResult && <ResultScreen />}
            {screen === 'history' && <HistoryScreen />}
            {screen === 'guide' && <GuideScreen />}
            {screen === 'settings' && <SettingsScreen />}
            {screen === 'privacy' && <PrivacyScreen />}
          </main>
        </div>
        
        <MobileNav />
      </div>
    </ErrorBoundary>
  );
}
