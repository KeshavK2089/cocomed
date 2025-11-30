import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, History, Settings, Upload, X, Share2, ChevronDown, 
  Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, Sun, HelpCircle, Palmtree, CheckCircle2, 
  RefreshCw, Stethoscope, AlertOctagon, XCircle, BookOpen, 
  Lock, Menu, Calendar, ChevronRight
} from 'lucide-react';

// --- ERROR BOUNDARY (The Safety Net) ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("App Crash:", error, errorInfo); }
  render() {
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

// *** VERCEL BACKEND URL ***
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

// --- DATA ---
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

// Simplified Localization Wrapper (In prod, use full JSONs)
const getLocaleText = (lang, key, fallback) => fallback; 

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

  // API Logic
  const handleScan = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = compressed.split(',')[1];
      
      // Determine if dev or prod
      const envKey = getApiKey();
      let data;
      
      const prompt = `You are a helpful pharmacist assistant. 
      STEP 1: Check if image is medication. If NO, return JSON { "error": "NOT_MEDICINE" }.
      STEP 2: If YES, extract info in ${languageNames[lang]}.
      Format: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [] }`;

      if (envKey && process.env.NODE_ENV === 'development') {
         const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${envKey}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }] }] })
         });
         data = await res.json();
      } else {
         const res = await fetch(`${VERCEL_BACKEND_URL}/api/analyze`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, image: base64 })
         });
         if (!res.ok) throw new Error("Server Error");
         data = await res.json();
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      
      if (!json) throw new Error("Could not understand image");
      
      const parsed = JSON.parse(json);
      if (parsed.error) throw new Error(parsed.error === "NOT_MEDICINE" ? "That doesn't look like medication. Please scan a label or package." : parsed.error);
      
      const clean = sanitizeScanData(parsed);
      const newScan = { ...clean, id: Date.now(), date: new Date().toISOString(), img: compressed, lang };
      
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

  // --- SCREENS ---

  const HomeScreen = () => (
    <div className="max-w-5xl mx-auto w-full p-6 flex flex-col md:flex-row gap-8 items-start">
      <div className="w-full md:w-5/12">
        <div className="mb-6">
           <span className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1 block">Today's Entry</span>
           <h1 className="text-3xl font-bold text-slate-900">Scan Medicine</h1>
           <p className="text-slate-500 mt-2">Take a clear photo of the packaging or label to identify contents instantly.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start mb-6 animate-fade-in">
            <XCircle className="text-red-500 shrink-0" size={20} />
            <div className="flex-1">
               <h3 className="font-bold text-red-900 text-sm">Analysis Failed</h3>
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
               <p className="text-orange-800 font-bold animate-pulse">Analyzing...</p>
             </div>
           ) : (
             <>
               <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Camera size={40} />
               </div>
               <h3 className="text-xl font-bold text-slate-800 mb-2">Tap to Capture</h3>
               <p className="text-slate-400 text-sm text-center max-w-xs">Ensure text is clear and well-lit.</p>
             </>
           )}
        </div>
      </div>

      <div className="w-full md:w-7/12">
        <div className="flex items-center justify-between mb-6">
           <h3 className="font-bold text-slate-900 flex items-center gap-2"><Calendar size={18} className="text-slate-400" /> Recent Scans</h3>
        </div>
        {history.length === 0 ? (
          <div className="bg-slate-50 rounded-3xl p-12 text-center border border-slate-100">
             <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300"><Sparkles /></div>
             <p className="text-slate-400">Your journal is empty.</p>
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
      <button onClick={() => setScreen('home')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm"><ChevronDown className="rotate-90" size={16} /> Back to Journal</button>
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 bg-slate-100 relative group h-64 md:h-auto">
           <img src={scanResult.img} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
        </div>
        <div className="flex-1 p-8 md:p-10">
           <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-wide mb-3">{scanResult.dosageForm}</span>
                <h1 className="text-3xl font-bold text-slate-900 leading-tight">{scanResult.brandName}</h1>
                <p className="text-lg text-slate-500 font-medium mt-1">{scanResult.genericName}</p>
              </div>
              <button onClick={() => {
                 navigator.share ? navigator.share({title: scanResult.brandName, text: `Medicine info for ${scanResult.brandName}`}) : alert("Copied!");
              }} className="p-3 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600"><Share2 size={20} /></button>
           </div>

           <div className="grid gap-2">
              <InfoBlock title="Purpose" content={scanResult.purpose} />
              <InfoBlock title="Instructions" content={scanResult.howToTake} />
              <div className="grid md:grid-cols-2 gap-4">
                 <InfoBlock title="Side Effects" content={scanResult.sideEffects} type="warning" />
                 <InfoBlock title="Warnings" content={scanResult.warnings} type="warning" />
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-400">
              <ShieldCheck size={14} />
              <span>AI-Generated content. Always consult a doctor.</span>
           </div>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Globe className="text-slate-400" />
            <span className="font-bold text-slate-700">Language</span>
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
         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Trash2 size={18} className="text-slate-400" /> Data Management</h3>
         <button onClick={() => { if(confirm("Delete all history?")) setHistory([]); }} className="text-red-600 font-bold text-sm hover:underline">Clear Scan History</button>
      </div>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="max-w-2xl mx-auto p-6">
       <h1 className="text-2xl font-bold text-slate-900 mb-6">Privacy Policy</h1>
       <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm prose prose-slate">
          <div className="flex items-center gap-3 mb-6 text-slate-400 font-medium"><Lock size={20} /> <span>Last Updated: Nov 2025</span></div>
          <h3 className="font-bold text-lg text-slate-800 mb-2">1. Data Collection</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">CocoMed scans are processed securely using Google Gemini AI. Images are processed in real-time and are not permanently stored on our servers. Your history is stored locally on your device.</p>
          <h3 className="font-bold text-lg text-slate-800 mb-2">2. Usage</h3>
          <p className="text-slate-600 mb-4 leading-relaxed">We use the camera solely to identify medications. No personal data is extracted or shared with third parties for advertising.</p>
          <h3 className="font-bold text-lg text-slate-800 mb-2">3. Medical Disclaimer</h3>
          <p className="text-slate-600 leading-relaxed">This app uses Artificial Intelligence and may produce inaccurate results. It is not a substitute for professional medical advice.</p>
       </div>
    </div>
  );

  const GuideScreen = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-12 mt-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">How to use CocoMed</h1>
        <p className="text-slate-500">Three simple steps to better health understanding.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
         {[
           { icon: Camera, title: "Snap", desc: "Take a clear photo of the medicine package." },
           { icon: Sparkles, title: "Analyze", desc: "AI identifies the drug and safety info." },
           { icon: BookOpen, title: "Learn", desc: "Read usage and warnings in your language." }
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
              
              {/* Desktop Tabs */}
              <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-full">
                 {['home', 'history', 'guide', 'settings', 'privacy'].map(tab => (
                   <button 
                     key={tab}
                     onClick={() => setScreen(tab)}
                     className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize transition-all ${screen === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                   >
                     {tab === 'history' ? 'Collection' : tab}
                   </button>
                 ))}
              </div>

              {/* Mobile Menu Button (Placeholder for now, utilizing bottom bar instead) */}
              <div className="md:hidden w-8" /> 
           </div>
        </header>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1 w-full relative pb-24 md:pb-0">
          {screen === 'home' && <HomeScreen />}
          {screen === 'result' && <ResultScreen />}
          {screen === 'history' && <div className="max-w-5xl mx-auto p-6"><h2 className="text-2xl font-bold mb-6">Your Collection</h2>{history.length ? <div className="grid sm:grid-cols-2 gap-4">{history.map((item,i) => <div key={i} onClick={() => {setScanResult(item); setScreen('result')}} className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4 cursor-pointer hover:border-orange-300"><img src={item.img} className="w-16 h-16 rounded-lg object-cover bg-slate-100" /><div><h4 className="font-bold">{item.brandName}</h4><p className="text-xs text-slate-500">{new Date(item.date).toLocaleDateString()}</p></div></div>)}</div> : <p className="text-slate-400 text-center mt-20">No scans yet.</p>}</div>}
          {screen === 'guide' && <GuideScreen />}
          {screen === 'settings' && <SettingsScreen />}
          {screen === 'privacy' && <PrivacyScreen />}
        </main>

        {/* --- MOBILE BOTTOM NAVIGATION --- */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe pt-1 px-4 flex justify-between items-center z-50 h-20">
           <NavTab icon={Home} label="Home" active={screen === 'home'} onClick={() => setScreen('home')} />
           <NavTab icon={History} label="History" active={screen === 'history'} onClick={() => setScreen('history')} />
           <NavTab icon={BookOpen} label="Guide" active={screen === 'guide'} onClick={() => setScreen('guide')} />
           <NavTab icon={Settings} label="Settings" active={screen === 'settings'} onClick={() => setScreen('settings')} />
        </div>
      </div>
    </ErrorBoundary>
  );
}
