import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, 
  ChevronRight, ArrowLeft, Search, Heart, Clock, MapPin, Image, Upload, AlertCircle, Scan
} from 'lucide-react';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}>
          <div className="backdrop-blur-2xl bg-white/70 p-8 rounded-[2.5rem] border border-emerald-200/50 shadow-2xl shadow-emerald-900/10 max-w-sm w-full text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200/50">
              <AlertOctagon size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-8 text-sm">The app encountered an error. Your data is safe.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
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
    const img = new window.Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX = 1024, scale = Math.min(MAX / img.width, 1);
      canvas.width = img.width * scale; 
      canvas.height = img.height * scale;
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
  const arr = (a) => Array.isArray(a) ? a.map(i => typeof i === 'string' ? i : String(i)).filter(Boolean) : [];
  return { 
    ...data, 
    brandName: str(data.brandName), 
    genericName: str(data.genericName), 
    manufacturer: str(data.manufacturer), 
    dosageForm: str(data.dosageForm), 
    strength: str(data.strength), 
    purpose: str(data.purpose), 
    howToTake: str(data.howToTake), 
    sideEffects: arr(data.sideEffects), 
    warnings: arr(data.warnings) 
  };
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

const UI = {
  en: { 
    nav: { home: "Home", history: "History", guide: "Guide", settings: "Settings" }, 
    home: { greeting: "Welcome to", title: "CocoMed", subtitle: "Your Personal Medicine Assistant", scan: "Tap to Scan", upload: "Choose from Photos", analyzing: "Analyzing", recent: "Recent Scans", empty: "No scans yet", disclaimer: "For educational purposes only. This is not medical advice. Always consult a healthcare professional." }, 
    result: { back: "Back", purpose: "Purpose", howTo: "How to Take", effects: "Possible Side Effects", warnings: "Important Warnings", disclaimer: "Educational information only. Consult your doctor or pharmacist.", translating: "Translating to your language...", share: "Share" }, 
    history: { title: "Scan History", search: "Search medicines...", empty: "No medicines found", export: "Export List" }, 
    settings: { title: "Settings", language: "Language", clear: "Clear All Data", privacy: "Privacy Policy", about: "About CocoMed" }, 
    guide: { title: "How to Use", s1: "Scan", s1d: "Point your camera at any medicine packaging or label", s2: "Analyze", s2d: "Our AI identifies the medication and extracts key information", s3: "Learn", s3d: "Read purpose, dosage, side effects and warnings instantly" }, 
    privacy: { title: "Privacy Policy", t1: "Data Collection", d1: "Images are processed in real-time and never stored on our servers.", t2: "Camera Usage", d2: "Camera access is used strictly for medication identification.", t3: "Medical Disclaimer", d3: "This is an educational tool only, not a substitute for professional medical advice." } 
  },
  es: { 
    nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" }, 
    home: { greeting: "Bienvenido a", title: "CocoMed", subtitle: "Tu Asistente de Medicamentos", scan: "Toca para Escanear", upload: "Elegir de Fotos", analyzing: "Analizando", recent: "Escaneos Recientes", empty: "Sin escaneos aún", disclaimer: "Solo con fines educativos. Esto no es consejo médico. Consulte siempre a un profesional de la salud." }, 
    result: { back: "Volver", purpose: "Propósito", howTo: "Cómo Tomar", effects: "Posibles Efectos Secundarios", warnings: "Advertencias Importantes", disclaimer: "Información educativa. Consulte a su médico.", translating: "Traduciendo...", share: "Compartir" }, 
    history: { title: "Historial", search: "Buscar medicamentos...", empty: "Sin medicamentos", export: "Exportar" }, 
    settings: { title: "Ajustes", language: "Idioma", clear: "Borrar Datos", privacy: "Privacidad", about: "Acerca de" }, 
    guide: { title: "Cómo Usar", s1: "Escanear", s1d: "Apunta la cámara al empaque del medicamento", s2: "Analizar", s2d: "Nuestra IA identifica el medicamento", s3: "Aprender", s3d: "Lee el propósito, dosis y advertencias" }, 
    privacy: { title: "Privacidad", t1: "Datos", d1: "Las imágenes se procesan en tiempo real y no se almacenan.", t2: "Cámara", d2: "Solo se usa para identificar medicamentos.", t3: "Aviso Médico", d3: "Herramienta educativa, no sustituye el consejo médico." } 
  },
  zh: { 
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" }, 
    home: { greeting: "欢迎使用", title: "CocoMed", subtitle: "您的个人药物助手", scan: "点击扫描", upload: "从相册选择", analyzing: "分析中", recent: "最近扫描", empty: "暂无扫描", disclaimer: "仅供教育用途。这不是医疗建议。请务必咨询医疗专业人员。" }, 
    result: { back: "返回", purpose: "用途", howTo: "服用方法", effects: "可能的副作用", warnings: "重要警告", disclaimer: "仅供教育参考。请咨询医生。", translating: "正在翻译...", share: "分享" }, 
    history: { title: "扫描历史", search: "搜索药物...", empty: "未找到药物", export: "导出" }, 
    settings: { title: "设置", language: "语言", clear: "清除数据", privacy: "隐私政策", about: "关于" }, 
    guide: { title: "使用方法", s1: "扫描", s1d: "将相机对准药品包装", s2: "分析", s2d: "AI识别药物信息", s3: "学习", s3d: "阅读用途、剂量和警告" }, 
    privacy: { title: "隐私政策", t1: "数据收集", d1: "图像实时处理，不会存储。", t2: "相机使用", d2: "仅用于药物识别。", t3: "医疗声明", d3: "教育工具，不能替代医疗建议。" } 
  },
  hi: { 
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" }, 
    home: { greeting: "स्वागत है", title: "CocoMed", subtitle: "आपका व्यक्तिगत दवा सहायक", scan: "स्कैन करें", upload: "फोटो से चुनें", analyzing: "विश्लेषण", recent: "हाल के स्कैन", empty: "कोई स्कैन नहीं", disclaimer: "केवल शैक्षिक उद्देश्यों के लिए। यह चिकित्सा सलाह नहीं है। हमेशा स्वास्थ्य पेशेवर से परामर्श करें।" }, 
    result: { back: "वापस", purpose: "उद्देश्य", howTo: "कैसे लें", effects: "संभावित दुष्प्रभाव", warnings: "महत्वपूर्ण चेतावनी", disclaimer: "शैक्षिक जानकारी। डॉक्टर से परामर्श करें।", translating: "अनुवाद हो रहा है...", share: "साझा करें" }, 
    history: { title: "स्कैन इतिहास", search: "दवाएं खोजें...", empty: "कोई दवा नहीं मिली", export: "निर्यात" }, 
    settings: { title: "सेटिंग्स", language: "भाषा", clear: "डेटा साफ़ करें", privacy: "गोपनीयता", about: "जानकारी" }, 
    guide: { title: "उपयोग कैसे करें", s1: "स्कैन", s1d: "कैमरा दवा पैकेज की ओर करें", s2: "विश्लेषण", s2d: "AI दवा की पहचान करता है", s3: "सीखें", s3d: "उद्देश्य, खुराक और चेतावनी पढ़ें" }, 
    privacy: { title: "गोपनीयता नीति", t1: "डेटा संग्रह", d1: "छवियां रीयल-टाइम में संसाधित होती हैं।", t2: "कैमरा उपयोग", d2: "केवल दवा पहचान के लिए।", t3: "चिकित्सा अस्वीकरण", d3: "शैक्षिक उपकरण, चिकित्सा सलाह का विकल्प नहीं।" } 
  },
  ta: { 
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" }, 
    home: { greeting: "வரவேற்கிறோம்", title: "CocoMed", subtitle: "உங்கள் மருந்து உதவியாளர்", scan: "ஸ்கேன் செய்ய தட்டவும்", upload: "புகைப்படங்களிலிருந்து தேர்வு", analyzing: "பகுப்பாய்வு", recent: "சமீபத்திய ஸ்கேன்கள்", empty: "ஸ்கேன்கள் இல்லை", disclaimer: "கல்வி நோக்கங்களுக்கு மட்டுமே. இது மருத்துவ ஆலோசனை அல்ல." }, 
    result: { back: "திரும்ப", purpose: "நோக்கம்", howTo: "எப்படி எடுப்பது", effects: "பக்க விளைவுகள்", warnings: "முக்கிய எச்சரிக்கைகள்", disclaimer: "கல்வி தகவல். மருத்துவரை அணுகவும்.", translating: "மொழிபெயர்க்கிறது...", share: "பகிர்" }, 
    history: { title: "ஸ்கேன் வரலாறு", search: "மருந்துகளைத் தேடு...", empty: "மருந்துகள் இல்லை", export: "ஏற்றுமதி" }, 
    settings: { title: "அமைப்புகள்", language: "மொழி", clear: "தரவை அழி", privacy: "தனியுரிமை", about: "பற்றி" }, 
    guide: { title: "பயன்படுத்துவது எப்படி", s1: "ஸ்கேன்", s1d: "மருந்து பேக்கேஜிங்கில் கேமராவை காட்டு", s2: "பகுப்பாய்வு", s2d: "AI மருந்தை அடையாளம் காணும்", s3: "கற்க", s3d: "நோக்கம், அளவு மற்றும் எச்சரிக்கைகளைப் படிக்கவும்" }, 
    privacy: { title: "தனியுரிமை கொள்கை", t1: "தரவு சேகரிப்பு", d1: "படங்கள் நிகழ்நேரத்தில் செயலாக்கப்படுகின்றன.", t2: "கேமரா பயன்பாடு", d2: "மருந்து அடையாளத்திற்கு மட்டுமே.", t3: "மருத்துவ மறுப்பு", d3: "கல்வி கருவி, மருத்துவ ஆலோசனை அல்ல." } 
  }
};

const t = (lang, key) => key.split('.').reduce((o, k) => o?.[k], UI[lang] || UI.en) || key.split('.').reduce((o, k) => o?.[k], UI.en) || "";

// --- ANIMATED ORB COMPONENT ---
const FloatingOrb = ({ className, delay = 0 }) => (
  <div 
    className={`absolute rounded-full blur-3xl opacity-30 animate-pulse ${className}`}
    style={{ animationDelay: `${delay}s`, animationDuration: '4s' }}
  />
);

// --- GLASS CARD COMPONENT ---
const GlassCard = ({ children, className = "", onClick, hover = true, variant = "default" }) => {
  const variants = {
    default: "bg-white/60 border-white/80 shadow-lg shadow-emerald-900/5",
    dark: "bg-white/40 border-emerald-200/50 shadow-xl shadow-emerald-900/10",
    warning: "bg-gradient-to-br from-amber-50/90 to-orange-50/90 border-amber-200/60",
    danger: "bg-gradient-to-br from-red-50/90 to-orange-50/90 border-red-200/60",
  };
  return (
    <div 
      onClick={onClick}
      className={`backdrop-blur-xl border rounded-3xl transition-all duration-300 
        ${variants[variant]}
        ${hover && onClick ? 'hover:bg-white/80 hover:shadow-xl hover:shadow-emerald-900/10 hover:scale-[1.02] active:scale-[0.98] cursor-pointer' : ''} 
        ${className}`}
    >
      {children}
    </div>
  );
};

// --- PULSE RING ANIMATION ---
const PulseRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3].map(i => (
      <div 
        key={i}
        className="absolute w-full h-full rounded-full border-2 border-emerald-400/20 animate-ping"
        style={{ animationDelay: `${i * 0.5}s`, animationDuration: '3s' }}
      />
    ))}
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
  const cameraRef = useRef(null);
  const fileRef = useRef(null);

  // Load persisted data
  useEffect(() => {
    const savedLang = localStorage.getItem('cocomed_lang');
    const savedHist = localStorage.getItem('cocomed_hist');
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setLang(savedLang);
    if (savedHist) try { setHistory(JSON.parse(savedHist)); } catch (e) {}
  }, []);

  // Persist data
  useEffect(() => { localStorage.setItem('cocomed_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cocomed_hist', JSON.stringify(history)); }, [history]);

  // AUTO-TRANSLATE when language changes
  useEffect(() => {
    const translateIfNeeded = async () => {
      if (screen === 'result' && scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) {
        await reAnalyzeForLanguage(scanResult);
      }
    };
    translateIfNeeded();
  }, [screen, lang, scanResult]);

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
      const prompt = `You are a helpful pharmacist assistant. 
STEP 1: Check if image is medication. If NO, return JSON { "error": "NOT_MEDICINE" }.
STEP 2: If YES, extract info in ${langNames[lang]}.
Return JSON only: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;
      
      const data = await callGemini([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      
      if (!json) throw new Error("Could not analyze image. Please try again.");
      const parsed = JSON.parse(json);
      if (parsed.error) throw new Error("This doesn't appear to be a medication. Please scan a medicine label or package.");
      
      const clean = sanitize(parsed);
      const newScan = { ...clean, id: Date.now(), date: new Date().toISOString(), img: compressed, languageCode: lang };
      
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      setScreen('result');
    } catch (err) {
      console.error(err);
      setError(err.message || "Scan failed. Please try again.");
    } finally { setLoading(false); }
  };

  // Re-analyze for language translation
  const reAnalyzeForLanguage = async (currentScan) => {
    setIsTranslating(true);
    try {
      const base64 = currentScan.img.split(',')[1];
      const prompt = `Translate/Re-analyze this medication information into ${langNames[lang]}.
Return JSON only: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;
      
      const data = await callGemini([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      
      if (json) {
        const parsed = JSON.parse(json);
        const clean = sanitize(parsed);
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

  const exportHistory = () => {
    const text = history.map(h => `${h.brandName} (${h.strength}) - ${new Date(h.date).toLocaleDateString()}`).join('\n');
    if (navigator.share) navigator.share({ title: "My Medications", text });
    else { navigator.clipboard?.writeText(text); alert("Copied to clipboard!"); }
  };

  const filtered = history.filter(h => 
    h.brandName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.genericName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HOME SCREEN ---
  const HomeScreen = () => (
    <div className="min-h-full relative overflow-hidden">
      {/* Animated Background Orbs */}
      <FloatingOrb className="w-96 h-96 bg-emerald-300 -top-48 -left-48" delay={0} />
      <FloatingOrb className="w-80 h-80 bg-teal-300 top-1/2 -right-40" delay={1} />
      <FloatingOrb className="w-64 h-64 bg-cyan-300 bottom-20 left-1/4" delay={2} />
      
      <div className="relative px-6 pt-8 pb-12 md:px-12 md:pt-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <p className="text-emerald-600/70 text-sm font-semibold tracking-wide uppercase">{t(lang, 'home.greeting')}</p>
            <h1 className="text-5xl md:text-7xl font-extralight text-slate-800 tracking-tight mt-1 bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-600 bg-clip-text text-transparent">
              {t(lang, 'home.title')}
            </h1>
            <p className="text-slate-500 text-lg mt-2 font-light">{t(lang, 'home.subtitle')}</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Scan Section */}
            <div className="lg:col-span-5 space-y-4">
              {/* Camera Scan Button */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-[2.5rem] blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
                <GlassCard 
                  onClick={() => !loading && cameraRef.current?.click()}
                  className="relative p-8 md:p-10 min-h-[280px] md:min-h-[320px] flex flex-col items-center justify-center overflow-hidden"
                  variant="dark"
                >
                  <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={(e) => { if (e.target.files[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
                  
                  {loading ? (
                    <div className="text-center">
                      <div className="relative w-28 h-28 mx-auto mb-6">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-200" />
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shadow-inner">
                          <Pill className="text-emerald-600" size={32} />
                        </div>
                        <PulseRings />
                      </div>
                      <p className="text-slate-700 text-xl font-medium">{t(lang, 'home.analyzing')}</p>
                      <div className="flex gap-1.5 justify-center mt-4">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-6">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all duration-500">
                          <Camera size={48} className="text-white drop-shadow-lg" />
                        </div>
                        <div className="absolute -inset-4 rounded-full border-2 border-dashed border-emerald-300/50 animate-spin" style={{ animationDuration: '20s' }} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-medium text-slate-800 mb-2">{t(lang, 'home.scan')}</h3>
                      <p className="text-slate-500 text-center text-sm max-w-[200px]">Point your camera at any medicine</p>
                    </>
                  )}
                </GlassCard>
              </div>

              {/* Upload from Photos */}
              <GlassCard 
                onClick={() => !loading && fileRef.current?.click()}
                className="p-5 flex items-center gap-4"
              >
                <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-100 to-purple-50 flex items-center justify-center shadow-lg shadow-violet-200/50">
                  <Image className="text-violet-500" size={26} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-700">{t(lang, 'home.upload')}</h4>
                  <p className="text-slate-400 text-sm">Select from gallery or files</p>
                </div>
                <ChevronRight className="text-slate-300" size={24} />
              </GlassCard>

              {/* Error Toast */}
              {error && (
                <GlassCard className="p-4" variant="danger" hover={false}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                      <XCircle className="text-red-500" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Medical Disclaimer */}
              <GlassCard className="p-5" variant="warning" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-100 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/50">
                    <AlertCircle className="text-amber-600" size={24} />
                  </div>
                  <div>
                    <p className="text-amber-800 text-sm font-medium leading-relaxed">{t(lang, 'home.disclaimer')}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Recent Scans */}
              <div>
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-slate-600 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" />
                    {t(lang, 'home.recent')}
                  </h3>
                  {history.length > 0 && (
                    <button onClick={() => setScreen('history')} className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors flex items-center gap-1">
                      View All <ChevronRight size={16} />
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <GlassCard className="p-10 text-center" hover={false}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <Sparkles className="text-slate-300" size={32} />
                    </div>
                    <p className="text-slate-400 font-medium">{t(lang, 'home.empty')}</p>
                    <p className="text-slate-300 text-sm mt-1">Scan your first medicine to get started</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history.slice(0, 4).map((item, i) => (
                      <GlassCard key={i} className="p-4 group" onClick={() => { setScanResult(item); setScreen('result'); }}>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 shrink-0 shadow-lg shadow-slate-200/50">
                            <img src={item.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <h4 className="text-slate-800 font-semibold truncate mt-0.5">{item.brandName}</h4>
                            <p className="text-slate-400 text-sm truncate">{item.genericName}</p>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" size={20} />
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
    <div className="min-h-full relative overflow-hidden">
      <FloatingOrb className="w-80 h-80 bg-emerald-200 -top-40 -right-40" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-teal-200 bottom-20 -left-32" delay={1.5} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setScreen('home')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium">
              <ArrowLeft size={20} /> <span>{t(lang, 'result.back')}</span>
            </button>
            <button onClick={() => { navigator.share ? navigator.share({ title: scanResult.brandName }) : null; }} className="p-3 rounded-xl bg-white/60 backdrop-blur border border-white/80 text-slate-500 hover:text-emerald-600 hover:bg-white/80 transition-all">
              <Share2 size={20} />
            </button>
          </div>

          {/* Hero Card */}
          <GlassCard className="p-8 mb-6 overflow-hidden relative" variant="dark" hover={false}>
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shrink-0 shadow-2xl shadow-slate-300/50 border border-white/50">
                <img src={scanResult.img} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-50 text-orange-600 text-xs font-bold uppercase tracking-wider border border-orange-200/50 shadow-sm">
                    {scanResult.dosageForm}
                  </span>
                  {scanResult.strength !== 'N/A' && (
                    <span className="px-4 py-1.5 rounded-full bg-white/80 text-slate-600 text-xs font-semibold border border-slate-200/50">
                      {scanResult.strength}
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight leading-tight">{scanResult.brandName}</h1>
                <p className="text-slate-500 text-xl mt-2 font-light">{scanResult.genericName}</p>
                {scanResult.manufacturer !== 'N/A' && (
                  <p className="text-slate-400 text-sm mt-3 flex items-center gap-2">
                    <MapPin size={14} /> {scanResult.manufacturer}
                  </p>
                )}
              </div>
            </div>
            
            {/* Translation Indicator */}
            {isTranslating && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                <div className="flex items-center gap-3 text-emerald-700">
                  <RefreshCw size={18} className="animate-spin" />
                  <span className="text-sm font-medium">{t(lang, 'result.translating')}</span>
                </div>
              </div>
            )}
          </GlassCard>

          {/* Info Cards */}
          <div className="space-y-4">
            {scanResult.purpose && scanResult.purpose !== 'N/A' && (
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-200/50">
                    <Heart className="text-emerald-600" size={22} />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t(lang, 'result.purpose')}</h4>
                    <p className="text-slate-700 leading-relaxed">{scanResult.purpose}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {scanResult.howToTake && scanResult.howToTake !== 'N/A' && (
              <GlassCard className="p-6" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-50 flex items-center justify-center shrink-0 shadow-lg shadow-blue-200/50">
                    <Clock className="text-blue-600" size={22} />
                  </div>
                  <div>
                    <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t(lang, 'result.howTo')}</h4>
                    <p className="text-slate-700 leading-relaxed">{scanResult.howToTake}</p>
                  </div>
                </div>
              </GlassCard>
            )}

            {scanResult.sideEffects?.length > 0 && (
              <GlassCard className="p-6" variant="warning" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-100 flex items-center justify-center shrink-0 shadow-lg shadow-amber-200/50">
                    <AlertTriangle className="text-amber-600" size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-amber-700 text-xs font-bold uppercase tracking-wider mb-3">{t(lang, 'result.effects')}</h4>
                    <ul className="space-y-2">
                      {scanResult.sideEffects.map((effect, i) => (
                        <li key={i} className="text-amber-900 flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            )}

            {scanResult.warnings?.length > 0 && (
              <GlassCard className="p-6" variant="danger" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-200 to-rose-100 flex items-center justify-center shrink-0 shadow-lg shadow-red-200/50">
                    <ShieldCheck className="text-red-600" size={22} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-red-700 text-xs font-bold uppercase tracking-wider mb-3">{t(lang, 'result.warnings')}</h4>
                    <ul className="space-y-2">
                      {scanResult.warnings.map((warn, i) => (
                        <li key={i} className="text-red-900 flex items-start gap-3">
                          <span className="w-2 h-2 rounded-full bg-red-400 mt-2 shrink-0" />
                          {warn}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            )}
          </div>

          {/* Disclaimer Footer */}
          <div className="mt-8 text-center p-6 rounded-2xl bg-slate-100/50 border border-slate-200/50">
            <p className="text-slate-400 text-sm">{t(lang, 'result.disclaimer')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- HISTORY SCREEN ---
  const HistoryScreen = () => (
    <div className="min-h-full relative overflow-hidden">
      <FloatingOrb className="w-96 h-96 bg-emerald-200 -top-48 -right-48" delay={0} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight">{t(lang, 'history.title')}</h1>
            <button onClick={exportHistory} className="px-5 py-2.5 rounded-full bg-white/60 backdrop-blur border border-white/80 hover:bg-white/80 text-slate-600 text-sm font-semibold transition-all shadow-lg shadow-slate-200/30 flex items-center gap-2">
              <Upload size={16} /> {t(lang, 'history.export')}
            </button>
          </div>

          {/* Search */}
          <GlassCard className="p-2 mb-8" hover={false}>
            <div className="flex items-center gap-3 px-4">
              <Search className="text-slate-400" size={20} />
              <input 
                type="text" 
                placeholder={t(lang, 'history.search')} 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-3 text-base"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              )}
            </div>
          </GlassCard>

          {/* Grid */}
          {filtered.length === 0 ? (
            <GlassCard className="p-16 text-center" hover={false}>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Search className="text-slate-300" size={40} />
              </div>
              <p className="text-slate-400 text-lg font-medium">{t(lang, 'history.empty')}</p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <GlassCard key={i} className="p-5 group" onClick={() => { setScanResult(item); setScreen('result'); }}>
                  <div className="flex items-center gap-4">
                    <div className="w-18 h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shrink-0 shadow-lg shadow-slate-200/50">
                      <img src={item.img} className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-800 font-semibold truncate">{item.brandName}</h4>
                      <p className="text-slate-400 text-sm truncate">{item.genericName}</p>
                      <p className="text-slate-300 text-xs mt-1 flex items-center gap-1">
                        <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this scan?')) setHistory(prev => prev.filter(h => h.id !== item.id)); }} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // --- GUIDE SCREEN ---
  const GuideScreen = () => (
    <div className="min-h-full relative overflow-hidden">
      <FloatingOrb className="w-80 h-80 bg-teal-200 top-20 -right-40" delay={0} />
      <FloatingOrb className="w-64 h-64 bg-emerald-200 bottom-40 -left-32" delay={1} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight mb-8">{t(lang, 'guide.title')}</h1>
          
          <div className="space-y-4">
            {[
              { icon: Scan, gradient: 'from-emerald-400 to-teal-400', shadow: 'shadow-emerald-300/50', num: '01', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') },
              { icon: Sparkles, gradient: 'from-violet-400 to-purple-400', shadow: 'shadow-violet-300/50', num: '02', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') },
              { icon: BookOpen, gradient: 'from-orange-400 to-amber-400', shadow: 'shadow-orange-300/50', num: '03', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') },
            ].map((step, i) => (
              <GlassCard key={i} className="p-6" hover={false}>
                <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 shadow-xl ${step.shadow}`}>
                    <step.icon className="text-white drop-shadow" size={28} />
                  </div>
                  <div>
                    <span className="text-slate-300 text-xs font-mono font-bold">{step.num}</span>
                    <h3 className="text-slate-800 text-xl font-semibold">{step.title}</h3>
                    <p className="text-slate-500 mt-1">{step.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- SETTINGS SCREEN ---
  const SettingsScreen = () => (
    <div className="min-h-full relative overflow-hidden">
      <FloatingOrb className="w-72 h-72 bg-emerald-200 -top-36 -left-36" delay={0} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight mb-8">{t(lang, 'settings.title')}</h1>

          {/* Language Selector */}
          <GlassCard className="overflow-hidden mb-6" hover={false}>
            <div className="p-5 border-b border-slate-200/30 flex items-center gap-3 bg-white/30">
              <Globe className="text-slate-500" size={20} />
              <span className="text-slate-700 font-semibold">{t(lang, 'settings.language')}</span>
            </div>
            <div className="p-2">
              {LANGUAGES.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => setLang(l.code)} 
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${
                    lang === l.code 
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-200/30' 
                      : 'text-slate-600 hover:bg-white/50'
                  }`}
                >
                  <span className="font-medium">{l.nativeName}</span>
                  {lang === l.code && <CheckCircle2 size={22} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="space-y-3">
            <GlassCard className="p-5" onClick={() => setScreen('privacy')}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-lg shadow-slate-200/50">
                  <Lock className="text-slate-500" size={22} />
                </div>
                <span className="text-slate-700 font-semibold flex-1">{t(lang, 'settings.privacy')}</span>
                <ChevronRight className="text-slate-300" size={20} />
              </div>
            </GlassCard>

            <GlassCard 
              className="p-5" 
              variant="danger"
              onClick={() => { if (confirm('Clear all scan history and data?')) { setHistory([]); localStorage.removeItem('cocomed_hist'); }}}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-100 to-rose-50 flex items-center justify-center shadow-lg shadow-red-200/50">
                  <Trash2 className="text-red-500" size={22} />
                </div>
                <span className="text-red-600 font-semibold">{t(lang, 'settings.clear')}</span>
              </div>
            </GlassCard>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30">
              <Pill className="text-white" size={28} />
            </div>
            <p className="text-slate-500 font-medium">CocoMed v2.0</p>
            <p className="text-slate-400 text-sm mt-1">Your Personal Medicine Assistant</p>
            <p className="text-slate-300 text-xs mt-4">Made with ♥ for better health</p>
          </div>
        </div>
      </div>
    </div>
  );

  // --- PRIVACY SCREEN ---
  const PrivacyScreen = () => (
    <div className="min-h-full relative overflow-hidden">
      <FloatingOrb className="w-64 h-64 bg-teal-200 bottom-20 -right-32" delay={0} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setScreen('settings')} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors font-medium mb-8">
            <ArrowLeft size={20} /> <span>{t(lang, 'settings.title')}</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl font-light text-slate-800 tracking-tight mb-8">{t(lang, 'privacy.title')}</h1>

          <GlassCard className="p-8" hover={false}>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <h3 className="text-slate-800 font-semibold text-lg mb-2">{t(lang, `privacy.t${i}`)}</h3>
                  <p className="text-slate-500 leading-relaxed">{t(lang, `privacy.d${i}`)}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  // --- DESKTOP SIDEBAR ---
  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-6 bg-white/40 backdrop-blur-xl border-r border-emerald-200/30">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <Pill className="text-white drop-shadow" size={26} />
        </div>
        <div>
          <h1 className="text-slate-800 font-bold text-xl">CocoMed</h1>
          <p className="text-slate-400 text-xs">Medicine Scanner</p>
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
                ? 'bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-200/30 border border-emerald-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-emerald-200/30">
        <p className="text-slate-400 text-xs text-center">Educational Use Only</p>
      </div>
    </div>
  );

  // --- MOBILE NAV ---
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-6 left-4 right-4 z-50">
      <div className="backdrop-blur-2xl bg-white/80 border border-white/50 rounded-[2rem] p-2 shadow-2xl shadow-slate-900/10">
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
              className={`flex-1 flex flex-col items-center py-3 px-3 rounded-2xl transition-all ${
                screen === item.id || (screen === 'result' && item.id === 'home') || (screen === 'privacy' && item.id === 'settings')
                  ? 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-200/50' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <item.icon size={24} />
              <span className="text-[10px] mt-1 font-semibold">{t(lang, `nav.${item.id}`)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      {/* Light Green Gradient Background */}
      <div 
        className="min-h-screen transition-colors duration-500"
        style={{ 
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 25%, #a7f3d0 50%, #6ee7b7 75%, #34d399 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
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
