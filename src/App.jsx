import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, History, Settings, Upload, X, Share2, ChevronDown, 
  Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, Sun, HelpCircle, Palmtree, CheckCircle2, 
  RefreshCw, Stethoscope, AlertOctagon, XCircle 
} from 'lucide-react';

// --- ERROR BOUNDARY (Layer 1: The Safety Net) ---
// Catches rendering crashes and provides a restart button instead of a white screen.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("MedScan Crash Caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 font-sans">
          <div className="bg-red-100 p-5 rounded-full mb-6 shadow-sm">
            <XCircle size={64} className="text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-3">App Overload</h2>
          <p className="text-slate-500 text-lg mb-8 max-w-md leading-relaxed">
            The image was too large or complex. We've reset the scanner for you.
          </p>
          <button 
            onClick={() => {
                this.setState({ hasError: false });
                window.location.reload(); 
            }} 
            className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold shadow-lg hover:bg-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Reset Scanner
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- SYSTEM CONFIGURATION ---

const getApiKey = () => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  }
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
      return import.meta.env.VITE_GEMINI_API_KEY;
    }
  } catch (e) {}
  return ""; 
};

// *** MOBILE CONFIGURATION ***
const VERCEL_BACKEND_URL = "https://cocomed.vercel.app"; 

// --- IMAGE COMPRESSOR ENGINE (The "Shrink Ray") ---
// Prevents memory crashes on mobile by resizing 12MB+ photos to ~1024px
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
        
        // Compress to JPEG at 70% quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// --- DATA SANITIZER (Layer 2: Data Cleaning) ---
// Forces AI output into safe strings/arrays to prevent React rendering errors
const sanitizeScanData = (data) => {
  if (!data || typeof data !== 'object') return null;
  
  const safeString = (val) => {
    if (val === null || val === undefined) return "N/A";
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    if (Array.isArray(val)) return val.join(", ");
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  };

  const safeArray = (arr) => {
    if (!arr) return [];
    if (!Array.isArray(arr)) return [safeString(arr)];
    return arr.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return item.text || item.value || item.description || JSON.stringify(item);
      }
      return String(item);
    }).filter(Boolean);
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

// --- LOCALE DATA ---
const LOCALE_DATA = {
  en: {
    app: { name: "CocoMed", tagline: "Natural Health Companion" },
    nav: { home: "Home", history: "Collection", guide: "Guide", settings: "Settings" },
    home: { title: "Scan Medicine", capture: "Capture Photo", upload: "Gallery Upload", recentScans: "Your Collection", analyzing: "Analyzing image...", greeting: "Good Day" },
    result: { genericName: "Active Ingredient", manufacturer: "Maker", whatIsItFor: "Purpose", howToTake: "Usage Instructions", sideEffects: "Possible Effects", warnings: "Important Warnings", saveToHistory: "Saved to Collection", scanAnother: "New Scan", share: "Share Info", translating: "Translating to English...", medicalDisclaimer: "This result is generated by AI. It is not a substitute for professional medical advice. Always consult a doctor." },
    history: { title: "History", empty: "Your collection is empty. Start your journey by scanning a medicine.", scannedOn: "Discovered on", clearConfirm: "Are you sure you want to delete your entire history? This cannot be undone." },
    settings: { title: "Preferences", language: "Language", about: "About", version: "Version", clearHistory: "Clear Collection", disclaimer: "AI-generated insights. Consult a professional for medical advice." },
    help: { title: "How it Works", step1: "Snap a Photo", step1Desc: "Ensure good lighting and hold steady.", step2: "AI Analysis", step2Desc: "Our engine identifies the medicine.", step3: "Get Insights", step3Desc: "Read dosage, usage, and warnings in your language.", safetyTitle: "Safety First", safetyDesc: "CocoMed uses advanced AI to read labels, but it does not replace your doctor. Always double-check with a professional." }
  },
  ta: {
    app: { name: "CocoMed", tagline: "இயற்கை மருத்துவ நண்பன்" },
    nav: { home: "முகப்பு", history: "தொகுப்பு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { title: "மருந்தை ஸ்கேன் செய்", capture: "புகைப்படம் எடு", upload: "கேலரி", recentScans: "உங்கள் தொகுப்பு", analyzing: "ஆய்வு செய்கிறது...", greeting: "வணக்கம்" },
    result: { genericName: "வேதிப்பெயர்", manufacturer: "தயாரிப்பாளர்", whatIsItFor: "பயன்", howToTake: "பயன்படுத்தும் முறை", sideEffects: "பக்க விளைவுகள்", warnings: "எச்சரிக்கைகள்", saveToHistory: "சேமிக்கப்பட்டது", scanAnother: "புதிய ஸ்கேன்", share: "பகிர்", translating: "தமிழுக்கு மாற்றுகிறது...", medicalDisclaimer: "இது AI உருவாக்கிய தகவல். மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகவும்." },
    history: { title: "வரலாறு", empty: "இன்னும் ஸ்கேன்கள் இல்லை.", scannedOn: "தேதி", clearConfirm: "முழு வரலாற்றையும் அழிக்க விரும்புகிறீர்களா?" },
    settings: { title: "அமைப்புகள்", language: "மொழி", about: "பற்றி", version: "பதிப்பு", clearHistory: "வரலாற்றை அழி", disclaimer: "மருத்துவ ஆலோசனைக்கு மருத்துவரை அணுகவும்." },
    help: { title: "எப்படி இது செயல்படுகிறது", step1: "புகைப்படம் எடுக்கவும்", step1Desc: "நல்ல வெளிச்சம் இருப்பதை உறுதி செய்யவும்.", step2: "AI ஆய்வு", step2Desc: "எங்கள் தொழில்நுட்பம் மருந்தை கண்டறியும்.", step3: "தகவல் பெறுங்கள்", step3Desc: "உங்கள் மொழியில் விவரங்களை படியுங்கள்.", safetyTitle: "பாதுகாப்பு முக்கியம்", safetyDesc: "CocoMed AI தொழில்நுட்பத்தை பயன்படுத்துகிறது. எப்போதும் மருத்துவரிடம் சரிபார்க்கவும்." }
  },
  hi: {
    app: { name: "CocoMed", tagline: "प्राकृतिक स्वास्थ्य साथी" },
    nav: { home: "होम", history: "संग्रह", guide: "गाइड", settings: "सेटिंग्स" },
    home: { title: "दवा स्कैन करें", capture: "फोटो लें", upload: "गैलरी", recentScans: "आपका संग्रह", analyzing: "विश्लेषण हो रहा है...", greeting: "नमस्ते" },
    result: { genericName: "जेनेरिक नाम", manufacturer: "निर्माता", whatIsItFor: "उपयोग", howToTake: "लेने का तरीका", sideEffects: "दुष्प्रभाव", warnings: "चेतावनी", saveToHistory: "सहेज लिया गया", scanAnother: "नया स्कैन", share: "साझा करें", translating: "हिंदी में अनुवाद हो रहा है...", medicalDisclaimer: "यह जानकारी AI द्वारा दी गई है। डॉक्टर की सलाह का विकल्प नहीं है।" },
    history: { title: "इतिहास", empty: "कोई स्कैन नहीं।", scannedOn: "तारीख", clearConfirm: "क्या आप पूरा इतिहास मिटाना चाहते हैं?" },
    settings: { title: "सेटिंग्स", language: "भाषा", about: "के बारे में", version: "वर्जन", clearHistory: "इतिहास साफ़ करें", disclaimer: "चिकित्सा सलाह के लिए डॉक्टर से मिलें।" },
    help: { title: "यह कैसे काम करता है", step1: "फोटो लें", step1Desc: "अच्छी रोशनी सुनिश्चित करें।", step2: "AI विश्लेषण", step2Desc: "हमारा इंजन दवा की पहचान करता है।", step3: " जानकारी प्राप्त करें", step3Desc: "अपनी भाषा में विवरण पढ़ें।", safetyTitle: "सुरक्षा पहले", safetyDesc: "CocoMed AI का उपयोग करता है। हमेशा डॉक्टर से सलाह लें।" }
  },
  te: {
    app: { name: "CocoMed", tagline: "మీ ఆరోగ్య మిత్రుడు" },
    nav: { home: "హోమ్", history: "చరిత్ర", guide: "గైడ్", settings: "అమరికలు" },
    home: { title: "మందును స్కాన్ చేయండి", capture: "ఫోటో తీయండి", upload: "గ్యాలరీ", recentScans: "మీ సేకరణ", analyzing: "విశ్లేషిస్తోంది...", greeting: "నమస్కారం" },
    result: { genericName: "సాధారణ పేరు", manufacturer: "తయారీదారు", whatIsItFor: "ఉపయోగం", howToTake: "వాడే విధానం", sideEffects: "దుష్ప్రభావాలు", warnings: "హెచ్చరికలు", saveToHistory: "సేవ్ చేయబడింది", scanAnother: "కొత్త స్కాన్", share: "షేర్ చేయండి", translating: "తెలుగులోకి అనువదిస్తోంది...", medicalDisclaimer: "ఇది AI రూపొందించిన సమాచారం. వైద్య సలహా కోసం డాక్టర్‌ను సంప్రదించండి." },
    history: { title: "చరిత్ర", empty: "స్కాన్‌లు లేవు.", scannedOn: "తేదీ", clearConfirm: "మీరు మొత్తం చరిత్రను తొలగించాలనుకుంటున్నారా?" },
    settings: { title: "సెట్టింగ్‌లు", language: "భాష", about: "గురించి", version: "వెర్షన్", clearHistory: "చరిత్రను క్లియర్ చేయండి", disclaimer: "వైద్య సలహా కోసం డాక్టర్‌ను సంప్రదించండి." },
    help: { title: "ఇది ఎలా పనిచేస్తుంది", step1: "ఫోటో తీయండి", step1Desc: "మంచి లైటింగ్ ఉండేలా చూసుకోండి.", step2: "AI విశ్లేషణ", step2Desc: "మా ఇంజిన్ మందును గుర్తిస్తుంది.", step3: "సమాచారం పొందండి", step3Desc: "మీ భాషలో వివరాలను చదవండి.", safetyTitle: "భద్రత ముఖ్యం", safetyDesc: "CocoMed AIని ఉపయోగిస్తుంది. ఎల్లప్పుడూ నిపుణుడిని సంప్రదించండి." }
  },
  kn: {
    app: { name: "CocoMed", tagline: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಂಗಾತಿ" },
    nav: { home: "ಮುಖಪುಟ", history: "ಇತಿಹಾಸ", guide: "ಮಾರ್ಗದರ್ಶಿ", settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು" },
    home: { title: "ಔಷಧಿಯನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಿ", capture: "ಫೋಟೋ ತೆಗೆಯಿರಿ", upload: "ಗ್ಯಾಲರಿ", recentScans: "ನಿಮ್ಮ ಸಂಗ್ರಹ", analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...", greeting: "ನಮಸ್ಕಾರ" },
    result: { genericName: "ಸಾಮಾನ್ಯ ಹೆಸರು", manufacturer: "ತಯಾರಕರು", whatIsItFor: "ಉಪಯೋಗ", howToTake: "ತೆಗೆದುಕೊಳ್ಳುವ ವಿಧಾನ", sideEffects: "ಅಡ್ಡ ಪರಿಣಾಮಗಳು", warnings: "ಎಚ್ಚರಿಕೆಗಳು", saveToHistory: "ಉಳಿಸಲಾಗಿದೆ", scanAnother: "ಹೊಸ ಸ್ಕ್ಯಾನ್", share: "ಹಂಚಿಕೊಳ್ಳಿ", translating: "ಕನ್ನಡಕ್ಕೆ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...", medicalDisclaimer: "ಇದು AI ನಿಂದ ರಚಿತವಾಗಿದೆ. ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ." },
    history: { title: "ಇತಿಹಾಸ", empty: "ಯಾವುದೇ ಸ್ಕ್ಯಾನ್‌ಗಳಿಲ್ಲ.", scannedOn: "ದಿನಾಂಕ", clearConfirm: "ನೀವು ಸಂಪೂರ್ಣ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?" },
    settings: { title: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು", language: "ಭಾಷೆ", about: "ಕುರಿತು", version: "ಆವೃತ್ತಿ", clearHistory: "ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿ", disclaimer: "ವೈದ್ಯಕೀಯ ಸಲಹೆಗಾಗಿ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ." },
    help: { title: "ಇದು ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ", step1: "ಫೋಟೋ ತೆಗೆಯಿರಿ", step1Desc: "ಒಳ್ಳೆಯ ಬೆಳಕು ಇದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.", step2: "AI ವಿಶ್ಲೇಷಣೆ", step2Desc: "ನಮ್ಮ ಎಂಜಿನ್ ಔಷಧಿಯನ್ನು ಗುರುತಿಸುತ್ತದೆ.", step3: "ಮಾಹಿತಿ ಪಡೆಯಿರಿ", step3Desc: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ವಿವರಗಳನ್ನು ಓದಿ.", safetyTitle: "ಸುರಕ್ಷತೆ ಮೊದಲು", safetyDesc: "CocoMed AI ಅನ್ನು ಬಳಸುತ್ತದೆ. ಯಾವಾಗಲೂ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ." }
  },
  ml: {
    app: { name: "CocoMed", tagline: "നിങ്ങളുടെ ആരോഗ്യ സുഹൃത്ത്" },
    nav: { home: "ഹോം", history: "ചരിത്രം", guide: "ഗൈഡ്", settings: "ക്രമീകരണങ്ങൾ" },
    home: { title: "മരുന്ന് സ്കാൻ ചെയ്യുക", capture: "ഫോട്ടോ എടുക്കുക", upload: "ഗാലറി", recentScans: "നിങ്ങളുടെ ശേഖരം", analyzing: "വിശകലനം ചെയ്യുന്നു...", greeting: "നമസ്കാരം" },
    result: { genericName: "ജനറിക് പേര്", manufacturer: "നിർമ്മാതാവ്", whatIsItFor: "ഉപയോഗം", howToTake: "കഴിക്കേണ്ട വിധം", sideEffects: "പാർശ്വഫലങ്ങൾ", warnings: "മുന്നറിയിപ്പുകൾ", saveToHistory: "സേവ് ചെയ്തു", scanAnother: "പുതിയ സ്കാൻ", share: "പങ്ക് വെക്കുക", translating: "മലയാളത്തിലേക്ക് വിവർത്തനം ചെയ്യുന്നു...", medicalDisclaimer: "ഇത് AI നൽകുന്ന വിവരങ്ങളാണ്. വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക." },
    history: { title: "ചരിത്രം", empty: "സ്കാനുകൾ ഒന്നുമില്ല.", scannedOn: "തീയതി", clearConfirm: "ചരിത്രം പൂർണ്ണമായും മായ്ക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്നുണ്ടോ?" },
    settings: { title: "ക്രമീകരണങ്ങൾ", language: "ഭാഷ", about: "കുറിച്ച്", version: "പതിപ്പ്", clearHistory: "ചരിത്രം മായ്ക്കുക", disclaimer: "വൈദ്യോപദേശത്തിന് ഡോക്ടറെ സമീപിക്കുക." },
    help: { title: "ഇതെങ്ങനെ പ്രവർത്തിക്കുന്നു", step1: "ഫോട്ടോ എടുക്കുക", step1Desc: "നല്ല വെളിച്ചം ഉറപ്പാക്കുക.", step2: "AI വിശകലനം", step2Desc: "ഞങ്ങളുടെ എഞ്ചിൻ മരുന്ന് തിരിച്ചറിയുന്നു.", step3: "വിവരങ്ങൾ നേടുക", step3Desc: "നിങ്ങളുടെ ഭാഷയിൽ വിവരങ്ങൾ വായിക്കുക.", safetyTitle: "സുരക്ഷ പ്രധാനം", safetyDesc: "CocoMed AI ഉപയോഗിക്കുന്നു. എല്ലായ്പ്പോഴും ഒരു ഡോക്ടറുടെ ഉപദേശം തേടുക." }
  }
};

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

const languageNames = {
  en: 'English', ta: 'Tamil', hi: 'Hindi', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam'
};

// --- APP COMPONENT ---
export default function MedScanApp() {
  const [currentScreen, setCurrentScreen] = useState('home'); 
  const [language, setLanguage] = useState('en');
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false); 
  const [scanResult, setScanResult] = useState(null);
  const [apiError, setApiError] = useState(null); 
  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('medscan_language');
    const savedHistory = localStorage.getItem('medscan_history');
    if (savedLang) setLanguage(savedLang);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('medscan_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('medscan_history', JSON.stringify(history));
  }, [history]);
  
  const t = (path) => {
    const keys = path.split('.');
    let value = LOCALE_DATA[language];
    for (const k of keys) value = value?.[k];
    return value || path;
  };

  // --- SMART AI TRANSLATION ---
  useEffect(() => {
    const checkAndTranslate = async () => {
      if (currentScreen === 'result' && scanResult && scanResult.languageCode !== language && !isTranslating && !isLoading) {
        await translateCurrentScan(scanResult.imageUri, scanResult.id);
      }
    };
    checkAndTranslate();
  }, [currentScreen, language, scanResult]);

  // Unified function to call the Vercel Backend
  const callBackendAPI = async (promptText, base64Image) => {
    const envApiKey = getApiKey();
    // LOCAL DEV: Use direct API key if available
    if (envApiKey && process.env.NODE_ENV === 'development') {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${envApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: promptText },
                        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
                    ]
                }]
            })
        });
        const data = await response.json();
        return data;
    }

    // PRODUCTION / MOBILE: Call Vercel Backend using FULL URL
    console.log("Calling Backend:", `${VERCEL_BACKEND_URL}/api/analyze`);
    
    const response = await fetch(`${VERCEL_BACKEND_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: promptText,
            image: base64Image
        })
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || "Failed to contact backend");
    }
    return data;
  };

  const translateCurrentScan = async (fullImageUri, scanId) => {
    setIsTranslating(true);
    
    const promptText = `You are a helpful pharmacist assistant analyzing a medicine package image.
    TASK: Extract medicine information and provide a patient-friendly explanation.
    RESPOND IN: ${languageNames[language]} language only.
    
    Extract and provide the following in JSON format:
    {
      "brandName": "exact brand name from package",
      "genericName": "generic/salt name",
      "manufacturer": "company name",
      "dosageForm": "tablet/capsule/syrup/injection/cream/etc",
      "strength": "dosage strength like 500mg, 10ml",
      "purpose": "2-3 sentences explaining what this medicine treats in simple terms",
      "howToTake": "clear instructions on how to take this medicine, timing, with or without food",
      "sideEffects": ["side effect 1", "side effect 2", "side effect 3"],
      "warnings": ["warning 1", "warning 2"]
    }
    
    IMPORTANT RULES:
    1. Respond ONLY in ${languageNames[language]}
    2. Keep the information consistent with the image provided.
    3. If you cannot read the medicine name clearly, set brandName to "Unable to read"`;

    try {
      const rawBase64 = fullImageUri.split(',')[1] || fullImageUri;
      const data = await callBackendAPI(promptText, rawBase64);
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        const cleanData = sanitizeScanData(parsedResult);
        const updatedScanData = {
          ...cleanData,
          scannedAt: new Date().toISOString(),
          imageUri: fullImageUri,
          languageCode: language,
          id: scanId
        };
        setScanResult(updatedScanData);
        setHistory(prev => prev.map(item => item.id === scanId ? updatedScanData : item));
      } else {
        throw new Error("Could not parse translated info");
      }
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShare = async (data) => {
    const warningsText = Array.isArray(data.warnings) ? data.warnings.join(', ') : String(data.warnings);
    const textToShare = `
💊 *${data.brandName}* (${data.strength})
🔬 ${data.genericName}
📋 *Purpose:* ${data.purpose}
🕰 *Instructions:* ${data.howToTake}
⚠️ *Warnings:* ${warningsText}
-- Scanned with CocoMed`.trim();

    if (navigator.share) {
      try { await navigator.share({ title: `Medicine Info: ${data.brandName}`, text: textToShare }); } catch (error) { console.log('Error sharing:', error); }
    } else {
      try { await navigator.clipboard.writeText(textToShare); alert('Medicine info copied to clipboard!'); } catch (err) { alert('Could not copy text.'); }
    }
  };

  const analyzeMedicine = async (base64Image) => {
    setIsLoading(true);
    setApiError(null);

    // The "Smart Scout" Workflow
    const promptText = `You are a helpful pharmacist assistant analyzing a medicine package image.
    STEP 1: CHECK IF MEDICINE
    Look at the image. Is there clearly a medication packaging, bottle, blister pack, or medical text?
    - If NO (it's a pet, random object, blurry mess, or unreadable): Return JSON { "error": "NOT_MEDICINE" }
    - If YES: Proceed to Step 2.

    STEP 2: EXTRACT INFO
    Extract medicine information and provide a patient-friendly explanation.
    RESPOND IN: ${languageNames[language]} language only.
    
    Extract and provide the following in JSON format:
    {
      "brandName": "exact brand name from package",
      "genericName": "generic/salt name",
      "manufacturer": "company name",
      "dosageForm": "tablet/capsule/syrup/injection/cream/etc",
      "strength": "dosage strength like 500mg, 10ml",
      "purpose": "2-3 sentences explaining what this medicine treats in simple terms",
      "howToTake": "clear instructions on how to take this medicine, timing, with or without food",
      "sideEffects": ["side effect 1", "side effect 2", "side effect 3"],
      "warnings": ["warning 1", "warning 2"]
    }
    
    IMPORTANT RULES:
    1. Use simple, everyday language a non-medical person can understand
    2. Respond ONLY in ${languageNames[language]}
    3. If you cannot read the medicine name clearly, set brandName to "Unable to read"
    4. Always include common side effects and important warnings`;

    try {
      const data = await callBackendAPI(promptText, base64Image);
      
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResult = JSON.parse(jsonMatch[0]);
        
        // FAIL-SAFE: Check if AI rejected the image
        if (parsedResult.error === "NOT_MEDICINE") {
            throw new Error("Image does not appear to be a medication.");
        }
        if (parsedResult.error) { 
           throw new Error(parsedResult.error);
        }
        
        const cleanData = sanitizeScanData(parsedResult);
        if (!cleanData || !cleanData.brandName) throw new Error("Could not identify medication data.");

        const scanData = {
          ...cleanData,
          id: Date.now(), 
          scannedAt: new Date().toISOString(),
          imageUri: `data:image/jpeg;base64,${base64Image}`,
          languageCode: language 
        };
        setScanResult(scanData);
        setHistory(prev => [scanData, ...prev]);
        setCurrentScreen('result');
      } else {
        throw new Error("Could not parse medicine info from AI response");
      }
    } catch (error) {
      console.error(error);
      const errMessage = error.message || "Scan failed";
      
      // "Safety Valve": Route to home with specific error message
      let displayMessage = "This medication is not supported in our search or the image was unclear. Please try again.";
      if (errMessage.includes("NOT_MEDICINE")) {
          displayMessage = "This doesn't look like a medicine package. Please scan a pill bottle, box, or blister pack.";
      } else if (errMessage.includes("Failed to fetch")) {
          displayMessage = "Connection failed. Please check your internet.";
      }
      
      setApiError(displayMessage);
      setCurrentScreen('home');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    
    // CRITICAL FIX: Reset input so same file can be selected again after error
    event.target.value = ''; 

    if (file) {
      try {
          const compressedBase64 = await compressImage(file);
          const rawBase64 = compressedBase64.split(',')[1];
          analyzeMedicine(rawBase64);
      } catch (err) {
          console.error("Compression failed", err);
          setApiError("Image processing failed. Please try a smaller image.");
      }
    }
  };

  // --- UI COMPONENTS ---
  const NavButton = ({ icon: Icon, label, screen }) => {
    const isActive = currentScreen === screen;
    return (
      <button onClick={() => setCurrentScreen(screen)} className={`flex flex-col items-center justify-center py-3 px-6 rounded-2xl transition-all duration-300 relative overflow-hidden group w-full md:w-auto ${isActive ? 'text-emerald-900 bg-emerald-100/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
        <Icon size={24} className={`mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
        <span className="text-[10px] font-bold tracking-wider uppercase">{label}</span>
        {isActive && <div className="absolute bottom-0 w-1/3 h-1 bg-emerald-500 rounded-t-full" />}
      </button>
    );
  };

  const InfoCard = ({ title, content, type = 'info' }) => {
    const [expanded, setExpanded] = useState(true);
    let Icon = Info;
    let containerClass = "border-emerald-100 bg-white/60 shadow-emerald-100/50";
    let headerClass = "text-emerald-900";
    let iconColor = "text-emerald-500";
    if (type === 'warning') { 
      Icon = AlertTriangle; containerClass = "border-red-100 bg-red-50/50 shadow-red-100/50"; headerClass = "text-red-900"; iconColor = "text-red-500";
    }
    return (
      <div className={`mb-4 rounded-3xl overflow-hidden border backdrop-blur-sm shadow-sm transition-all duration-300 ${containerClass}`}>
        <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center justify-between p-5 ${headerClass}`}>
          <div className="flex items-center gap-3 font-bold tracking-tight text-lg">
            <div className={`p-2 rounded-full ${type === 'warning' ? 'bg-red-100' : 'bg-emerald-100'}`}><Icon size={18} className={iconColor} /></div>
            {title}
          </div>
          <ChevronDown size={20} className={`transition-transform duration-300 text-slate-400 ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5 pt-0 text-slate-600 text-base leading-relaxed font-medium">
            {Array.isArray(content) ? (
                <ul className="space-y-3">{content.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 bg-white/50 p-2 rounded-lg">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                        {/* Ensure item is text, fallback to stringify if object slipped through */}
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                    </li>
                ))}</ul>
            ) : (
                <p>{typeof content === 'object' ? JSON.stringify(content) : String(content)}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ... UI Screens (Header, HelpScreen, HomeScreen, etc.) ...
  
  const Header = () => (
    <div className="bg-white/90 backdrop-blur-xl border-b border-emerald-50 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentScreen('home')}>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-2.5 rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center relative overflow-hidden group">
          <Palmtree size={22} className="relative z-10" />
          <Pill size={14} className="absolute bottom-1 right-1 z-10 rotate-45 text-emerald-100" />
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{t('app.name')}</h1>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hidden sm:block mt-1">{t('app.tagline')}</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full">
         <button onClick={() => setCurrentScreen('home')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentScreen === 'home' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('nav.home')}</button>
         <button onClick={() => setCurrentScreen('history')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentScreen === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('nav.history')}</button>
         <button onClick={() => setCurrentScreen('help')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentScreen === 'help' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('nav.guide')}</button>
         <button onClick={() => setCurrentScreen('settings')} className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${currentScreen === 'settings' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{t('nav.settings')}</button>
      </div>
      <div className="flex items-center gap-2">
         <button onClick={() => setCurrentScreen('help')} className="md:hidden p-2 text-slate-400 hover:text-emerald-500 transition-colors"><HelpCircle size={24} /></button>
        <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
          <Globe size={12} /><span>{LANGUAGES.find(l => l.code === language)?.nativeName}</span>
        </div>
      </div>
    </div>
  );

  const HelpScreen = () => (
    <div className="flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full">
       <div className="text-center mb-12">
         <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mb-4 animate-bounce-slow"><Sparkles size={32} /></div>
         <h1 className="text-3xl md:text-5xl font-black text-slate-800 mb-4">{t('help.title')}</h1>
         <p className="text-slate-500 text-lg max-w-2xl mx-auto">Use our advanced AI to instantly understand your medication. It's safe, private, and easy.</p>
       </div>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mb-16">
         <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-emerald-100 via-teal-100 to-emerald-100 -z-10 transform -translate-y-1/2"></div>
         {[1, 2, 3].map((step) => (
           <div key={step} className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-500">
             <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center text-white font-black text-3xl mb-6 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500 relative">
               {step}
               {step === 1 && <Camera size={32} className="absolute opacity-20" />}
               {step === 2 && <Sparkles size={32} className="absolute opacity-20" />}
               {step === 3 && <Pill size={32} className="absolute opacity-20" />}
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">{t(`help.step${step}`)}</h3>
             <p className="text-slate-500 font-medium leading-relaxed">{t(`help.step${step}Desc`)}</p>
           </div>
         ))}
       </div>
       <div className="bg-red-50 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-red-100 mb-16">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 text-red-500"><Stethoscope size={40} /></div>
          <div className="text-center md:text-left"><h2 className="text-2xl font-bold text-red-900 mb-2">{t('help.safetyTitle')}</h2><p className="text-red-800/80 text-lg">{t('help.safetyDesc')}</p></div>
       </div>
       <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="text-left"><h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to start?</h2><p className="text-emerald-100 text-lg">Your personal health assistant is one tap away.</p></div>
           <button onClick={() => setCurrentScreen('home')} className="bg-white text-emerald-600 font-bold py-4 px-10 rounded-full shadow-lg hover:bg-emerald-50 transition-colors transform hover:scale-105">Scan Now</button>
         </div>
       </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full p-6 md:p-12 items-center">
      <div className="w-full md:w-5/12 flex flex-col">
         {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex gap-3 items-start animate-enter shadow-sm">
              <AlertOctagon className="text-red-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-bold text-red-800">Scan Failed</h3>
                <p className="text-red-600 text-sm mt-1">{apiError}</p>
                <button onClick={() => setApiError(null)} className="text-xs font-bold text-red-500 mt-2 underline">Dismiss</button>
              </div>
            </div>
         )}

         <div className="mb-8 pl-4">
           <div className="flex items-center gap-2 text-emerald-600 mb-2"><Sun size={20} className="animate-spin-slow" /><span className="text-xs font-bold uppercase tracking-widest">{t('home.greeting')}</span></div>
           <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-6 leading-tight">{t('home.title')}</h1>
           <p className="text-slate-500 font-medium text-lg leading-relaxed border-l-4 border-emerald-200 pl-4">Instant identification powered by nature-inspired AI.</p>
         </div>
         <div className="group relative bg-white rounded-[3rem] shadow-2xl shadow-emerald-100 border border-emerald-50 p-10 flex flex-col items-center justify-center gap-8 flex-1 min-h-[500px] overflow-hidden">
            <div className="absolute inset-0 opacity-[0.4] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-teal-50 rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="w-56 h-56 rounded-full flex items-center justify-center mb-8 relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] animate-blob"></div>
                 <div className="absolute inset-4 bg-white rounded-[50%_40%_30%_70%/60%_30%_70%_40%] shadow-inner flex items-center justify-center"><Camera size={64} className="text-emerald-500" /></div>
              </div>
              {isLoading && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center">
                  <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-6 text-emerald-800 font-bold text-lg animate-pulse tracking-wide">{t('home.analyzing')}</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
            <div className="w-full max-w-sm space-y-4 z-10">
              <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full bg-slate-900 text-white font-bold py-5 px-8 rounded-full shadow-xl shadow-slate-300 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"><Camera size={24} strokeWidth={2.5} className="group-hover:rotate-12 transition-transform" /><span className="text-lg tracking-wide">{isLoading ? 'PROCESSING...' : t('home.capture')}</span></button>
              <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white border-2 border-slate-100 text-slate-600 font-bold py-4 px-8 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-colors flex items-center justify-center gap-2"><Upload size={20} />{t('home.upload')}</button>
            </div>
         </div>
      </div>
      <div className="w-full md:w-7/12 flex flex-col justify-center pl-0 md:pl-12">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 text-2xl flex items-center gap-3"><div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><History size={24} /></div>{t('home.recentScans')}</h3>
          <button onClick={() => setCurrentScreen('help')} className="text-emerald-600 font-bold text-sm hover:underline">How to use?</button>
        </div>
        {history.length === 0 ? (
           <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
             <div className="w-24 h-24 bg-gradient-to-tr from-emerald-50 to-teal-50 rounded-full flex items-center justify-center mb-6"><Sparkles size={32} className="text-emerald-300" /></div>
             <p className="text-slate-400 font-medium max-w-xs text-lg">{t('history.empty')}</p>
             <button onClick={() => setCurrentScreen('help')} className="mt-6 text-emerald-600 font-bold text-sm bg-emerald-50 px-6 py-2 rounded-full">View Guide</button>
           </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
             {history.slice(0, 4).map((item, idx) => (
               <div key={idx} onClick={() => { setScanResult(item); setCurrentScreen('result'); }} className="group bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-300 cursor-pointer relative overflow-hidden">
                 <div className="flex items-start gap-4">
                   <div className="w-20 h-20 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner relative"><img src={item.imageUri} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /></div>
                   <div className="flex-1 min-w-0 pt-1"><p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1 flex items-center gap-1"><CheckCircle2 size={10} />{new Date(item.scannedAt).toLocaleDateString()}</p><p className="font-bold text-slate-800 text-lg leading-tight truncate mb-1">{item.brandName}</p><span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full">{item.dosageForm}</span></div>
                 </div>
                 <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0 duration-300"><div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg"><ChevronDown size={16} className="-rotate-90" /></div></div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );

  const ResultScreen = () => {
    if (!scanResult) return null;
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto bg-white min-h-screen md:min-h-0 md:my-8 md:rounded-[3rem] shadow-2xl shadow-emerald-100/50 overflow-hidden flex flex-col md:flex-row border border-slate-100">
          <div className="w-full md:w-5/12 relative bg-slate-900 group">
            <img src={scanResult.imageUri} className="w-full h-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-60" alt="Medicine" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
            <button onClick={() => setCurrentScreen('home')} className="absolute top-8 left-8 flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-sm font-bold text-white shadow-lg hover:bg-white/20 transition-all border border-white/10"><X size={16} /> CLOSE</button>
            {isTranslating && (<div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-emerald-400 font-bold animate-pulse">{t('result.translating')}</p></div>)}
            <div className="absolute bottom-0 left-0 right-0 p-10 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-6"><span className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-lg shadow-emerald-900/20">{scanResult.dosageForm}</span><span className="px-4 py-1.5 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-widest border border-white/10">{scanResult.strength}</span></div>
              <h1 className="text-5xl font-black leading-none mb-3 tracking-tight">{scanResult.brandName}</h1>
              <p className="text-slate-300 font-medium text-xl border-l-2 border-emerald-500 pl-4">{scanResult.genericName}</p>
            </div>
          </div>
          <div className="flex-1 p-8 md:p-12 bg-white relative">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-50">
              <div className="flex items-center gap-3"><div className="bg-emerald-50 p-2 rounded-full"><ShieldCheck size={20} className="text-emerald-600" /></div><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('result.manufacturer')}</p><p className="font-bold text-slate-800">{scanResult.manufacturer}</p></div></div>
              <div className="flex gap-2">
                  {scanResult.languageCode !== language && !isTranslating && (<button onClick={() => translateCurrentScan(scanResult.imageUri, scanResult.id)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-colors" title="Retry Translation"><RefreshCw size={16} /></button>)}
                  <button onClick={() => handleShare(scanResult)} className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 font-bold text-sm hover:bg-emerald-100 transition-colors"><Share2 size={16} />{t('result.share')}</button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mb-8">
              <InfoCard title={t('result.whatIsItFor')} content={scanResult.purpose} />
              <InfoCard title={t('result.howToTake')} content={scanResult.howToTake} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"><InfoCard title={t('result.sideEffects')} content={scanResult.sideEffects} type="warning" /><InfoCard title={t('result.warnings')} content={scanResult.warnings} type="warning" /></div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start mb-8"><AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" /><p className="text-sm text-amber-800 font-medium">{t('result.medicalDisclaimer')}</p></div>
            <div className="flex justify-center"><button onClick={() => setCurrentScreen('home')} className="w-full md:w-auto px-12 py-4 bg-slate-900 text-white font-bold rounded-full shadow-xl shadow-slate-200 hover:bg-black transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"><Camera size={20} />{t('result.scanAnother')}</button></div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-12">
        <div><h1 className="text-4xl font-black text-slate-800 mb-2">{t('history.title')}</h1><p className="text-slate-400 font-medium">Your personal medicine archive</p></div>
        {history.length > 0 && (<button onClick={() => { if(confirm(t('history.clearConfirm'))) setHistory([]); }} className="text-xs font-bold text-red-500 hover:text-red-700 px-5 py-2.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors flex items-center gap-2"><Trash2 size={14} />CLEAR ALL</button>)}
      </div>
      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm p-8">
          <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-6"><History size={48} className="text-slate-300" /></div>
          <p className="text-slate-500 font-medium text-lg mb-6">{t('history.empty')}</p>
          <button onClick={() => setCurrentScreen('home')} className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:bg-emerald-700 transition-colors">Start Scanning</button>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {history.map((item, idx) => (
            <div key={idx} className="break-inside-avoid bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 cursor-pointer overflow-hidden group" onClick={() => { setScanResult(item); setCurrentScreen('result'); }}>
              <div className="h-56 relative overflow-hidden">
                <img src={item.imageUri} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6 text-white w-full pr-12"><h3 className="font-black text-2xl leading-none mb-2">{item.brandName}</h3><div className="flex items-center gap-2"><span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-1 rounded">{new Date(item.scannedAt).toLocaleDateString()}</span><span className="text-[10px] font-bold bg-emerald-500 px-2 py-1 rounded">{item.dosageForm}</span></div></div>
                <button onClick={(e) => { e.stopPropagation(); if(confirm('Remove artifact?')) { setHistory(prev => prev.filter((_, i) => i !== idx)); } }} className="absolute top-4 right-4 p-2 bg-black/20 text-white rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
              </div>
              <div className="p-6">
                 <p className="text-slate-500 text-sm line-clamp-3 font-medium leading-relaxed">{item.purpose}</p>
                 <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between"><span className="text-xs font-bold text-emerald-600">View Details</span><div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ChevronDown size={16} className="-rotate-90" /></div></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const SettingsScreen = () => (
    <div className="flex-1 p-6 md:p-12 max-w-4xl mx-auto w-full">
      <h1 className="text-4xl font-black text-slate-800 mb-10">{t('settings.title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/50">
             <div className="flex items-center gap-3"><div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl"><Globe size={20} /></div><h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('settings.language')}</h2></div>
             <p className="text-slate-400 text-xs mt-2 ml-1">Future scans will be analyzed in the selected language.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 p-4">
            {LANGUAGES.map((lang, idx) => (
              <label key={lang.code} className={`flex items-center justify-between p-4 m-2 rounded-2xl cursor-pointer transition-all border-2 ${language === lang.code ? 'border-emerald-500 bg-emerald-50/50' : 'border-transparent hover:bg-slate-50'}`}>
                <div className="flex flex-col"><span className={`font-bold text-lg ${language === lang.code ? 'text-emerald-900' : 'text-slate-600'}`}>{lang.nativeName}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lang.name}</span></div>
                {language === lang.code && <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-lg shadow-emerald-200 ring-2 ring-offset-2 ring-emerald-300" />}
                <input type="radio" name="language" checked={language === lang.code} onChange={() => setLanguage(lang.code)} className="hidden" />
              </label>
            ))}
          </div>
        </div>
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-300 relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center justify-between mb-8"><span className="font-bold text-slate-400">{t('settings.version')}</span><span className="text-xs font-mono bg-white/10 px-3 py-1 rounded-full">v3.0 Nature</span></div>
               <div className="flex gap-4 items-start mb-6 opacity-80"><ShieldCheck size={24} className="text-emerald-400 flex-shrink-0" /><p className="text-xs leading-relaxed font-medium">{t('settings.disclaimer')}</p></div>
             </div>
             <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
          </div>
          <div className="bg-emerald-50 rounded-[2.5rem] p-8 border border-emerald-100">
             <h3 className="font-bold text-emerald-900 mb-2">Privacy First</h3>
             <p className="text-xs text-emerald-700/80 leading-relaxed font-medium">Your health data stays on your device. We use secure runtime environments for all AI processing.</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Main Render with Error Boundary
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen w-full bg-[#f8fafc] text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <main className="flex-1 flex flex-col w-full relative">
          {currentScreen === 'home' && <HomeScreen />}
          {currentScreen === 'result' && <ResultScreen />}
          {currentScreen === 'history' && <HistoryScreen />}
          {currentScreen === 'settings' && <SettingsScreen />}
          {currentScreen === 'help' && <HelpScreen />}
        </main>
        <div className={`md:hidden bg-white/90 backdrop-blur-lg border-t border-slate-100 flex justify-around items-center fixed bottom-0 w-full pb-safe pt-2 z-50 transition-transform duration-500 ${currentScreen === 'result' ? 'translate-y-full' : 'translate-y-0'}`}>
            <NavButton icon={Home} label={t('nav.home')} screen="home" />
            <NavButton icon={History} label={t('nav.history')} screen="history" />
            <NavButton icon={HelpCircle} label={t('nav.guide')} screen="help" />
            <NavButton icon={Settings} label={t('nav.settings')} screen="settings" />
        </div>
        <div className={`md:hidden h-24 ${currentScreen === 'result' ? 'hidden' : 'block'}`}></div>
      </div>
    </ErrorBoundary>
  );
}
