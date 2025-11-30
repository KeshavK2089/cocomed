import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, 
  ChevronRight, ArrowLeft, Search, Heart, Clock, MapPin, Image, Upload, AlertCircle, Scan,
  Zap, Activity, Shield, Eye, Star, TrendingUp, Layers, Cpu, Fingerprint, Waves
} from 'lucide-react';

// ============================================================================
// ERROR BOUNDARY - Catches runtime errors gracefully
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  componentDidCatch(error, errorInfo) { 
    console.error("CocoMed Error:", error, errorInfo); 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #a7f3d0 100%)' }}>
          <div className="backdrop-blur-2xl bg-white/70 p-10 rounded-[2.5rem] border border-emerald-200/50 shadow-2xl shadow-emerald-900/10 max-w-md w-full text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-red-200/50">
              <AlertOctagon size={48} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Oops! Something went wrong</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">The application encountered an unexpected error. Your data is safe and secure.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Restart CocoMed
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// CONFIGURATION & API SETUP
// ============================================================================
const CONFIG = {
  API_URL: "https://cocomed.vercel.app",
  MAX_IMAGE_SIZE: 1024,
  COMPRESSION_QUALITY: 0.75,
  ANIMATION_DURATION: 300,
  PARTICLE_COUNT: 50,
};

const getApiKey = () => {
  try { 
    if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEMINI_API_KEY) return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (import.meta?.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY; 
  } catch (e) {}
  return "";
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new window.Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(CONFIG.MAX_IMAGE_SIZE / Math.max(img.width, img.height), 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', CONFIG.COMPRESSION_QUALITY));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  };
  reader.onerror = () => reject(new Error('Failed to read file'));
});

const sanitizeMedicationData = (data) => {
  if (!data || typeof data !== 'object') return null;
  const safeStr = (v, fallback = "N/A") => {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (typeof v === 'number') return String(v);
    return fallback;
  };
  const safeArr = (a) => {
    if (!Array.isArray(a)) return [];
    return a.map(i => typeof i === 'string' ? i.trim() : String(i)).filter(Boolean);
  };
  return {
    brandName: safeStr(data.brandName),
    genericName: safeStr(data.genericName),
    manufacturer: safeStr(data.manufacturer),
    dosageForm: safeStr(data.dosageForm),
    strength: safeStr(data.strength),
    purpose: safeStr(data.purpose),
    howToTake: safeStr(data.howToTake),
    sideEffects: safeArr(data.sideEffects),
    warnings: safeArr(data.warnings),
    storage: safeStr(data.storage, "Store at room temperature away from moisture and heat."),
    interactions: safeArr(data.interactions || data.drugInteractions),
  };
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// ============================================================================
// LOCALIZATION SYSTEM
// ============================================================================
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

const LANGUAGE_NAMES = { 
  en: 'English', 
  es: 'Spanish', 
  zh: 'Simplified Chinese', 
  hi: 'Hindi', 
  ta: 'Tamil' 
};

const UI_STRINGS = {
  en: {
    nav: { home: "Home", history: "History", guide: "Guide", settings: "Settings" },
    home: { 
      greeting: "Welcome to", 
      title: "CocoMed", 
      subtitle: "AI-Powered Medicine Assistant",
      scan: "Tap to Scan", 
      scanDesc: "Use your camera to scan medicine",
      upload: "Upload from Gallery", 
      uploadDesc: "Choose an existing photo",
      analyzing: "Analyzing Medicine",
      analyzeDesc: "AI is processing your image...",
      recent: "Recent Scans", 
      empty: "No scans yet",
      emptyDesc: "Scan your first medicine to get started",
      disclaimer: "⚠️ Educational purposes only. This is not medical advice. Always consult a healthcare professional before taking any medication.",
      aiPowered: "Powered by Advanced AI",
      scanCount: "scans completed"
    },
    result: { 
      back: "Back to Home", 
      purpose: "What It's For",
      howTo: "How to Take", 
      effects: "Possible Side Effects", 
      warnings: "Important Warnings",
      storage: "Storage Instructions",
      interactions: "Drug Interactions",
      disclaimer: "This information is for educational purposes only. Always consult your doctor or pharmacist before taking any medication.",
      translating: "Translating to your language...",
      share: "Share",
      viewMore: "View More Details",
      confidence: "AI Confidence"
    },
    history: { 
      title: "Scan History", 
      subtitle: "Your medication library",
      search: "Search by name, generic, or manufacturer...", 
      empty: "No medicines found",
      emptyDesc: "Try a different search term",
      noHistory: "No scan history yet",
      noHistoryDesc: "Your scanned medicines will appear here",
      export: "Export List",
      deleteAll: "Clear All",
      sortBy: "Sort by",
      newest: "Newest",
      oldest: "Oldest",
      alphabetical: "A-Z",
      confirmDelete: "Delete this scan?",
      confirmDeleteAll: "Clear all scan history? This cannot be undone."
    },
    settings: { 
      title: "Settings", 
      subtitle: "Customize your experience",
      language: "Language",
      languageDesc: "Choose your preferred language",
      clear: "Clear All Data",
      clearDesc: "Remove all scans and reset app",
      privacy: "Privacy Policy",
      privacyDesc: "How we handle your data",
      about: "About CocoMed",
      version: "Version 3.0",
      madeWith: "Made with ♥ for better health"
    },
    guide: { 
      title: "How to Use", 
      subtitle: "Get started in 3 easy steps",
      s1: "Capture", 
      s1d: "Point your camera at any medicine packaging, label, or pill bottle. Make sure the text is clearly visible.",
      s2: "Analyze", 
      s2d: "Our advanced AI instantly identifies the medication and extracts all relevant information.",
      s3: "Learn", 
      s3d: "Get comprehensive details including purpose, dosage, side effects, and important warnings.",
      tip: "Pro Tip",
      tipText: "For best results, ensure good lighting and hold your device steady."
    },
    privacy: { 
      title: "Privacy Policy",
      subtitle: "Your privacy matters to us",
      t1: "Data Collection", 
      d1: "Images are processed in real-time using secure AI technology. We do not permanently store any photos on our servers. All analysis happens instantly and the image data is discarded after processing.",
      t2: "Local Storage", 
      d2: "Your scan history is stored locally on your device only. This data never leaves your device unless you explicitly choose to export or share it.",
      t3: "Camera Access", 
      d3: "Camera permissions are used exclusively for scanning medication. We never access your camera without your explicit action.",
      t4: "Medical Disclaimer", 
      d4: "CocoMed is an educational tool designed to help you learn about medications. It is not intended to replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider."
    },
    errors: {
      notMedicine: "This doesn't appear to be a medication. Please scan a medicine label, package, or pill bottle.",
      scanFailed: "Scan failed. Please try again with a clearer image.",
      networkError: "Network error. Please check your connection and try again.",
      generic: "Something went wrong. Please try again."
    }
  },
  es: {
    nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" },
    home: { 
      greeting: "Bienvenido a", 
      title: "CocoMed", 
      subtitle: "Asistente de Medicamentos con IA",
      scan: "Toca para Escanear", 
      scanDesc: "Usa tu cámara para escanear",
      upload: "Subir de Galería", 
      uploadDesc: "Elige una foto existente",
      analyzing: "Analizando Medicamento",
      analyzeDesc: "La IA está procesando...",
      recent: "Escaneos Recientes", 
      empty: "Sin escaneos",
      emptyDesc: "Escanea tu primer medicamento",
      disclaimer: "⚠️ Solo para fines educativos. Esto no es consejo médico. Siempre consulte a un profesional de la salud.",
      aiPowered: "Impulsado por IA Avanzada",
      scanCount: "escaneos completados"
    },
    result: { 
      back: "Volver al Inicio", 
      purpose: "Para Qué Sirve",
      howTo: "Cómo Tomar", 
      effects: "Posibles Efectos Secundarios", 
      warnings: "Advertencias Importantes",
      storage: "Almacenamiento",
      interactions: "Interacciones",
      disclaimer: "Esta información es solo para fines educativos. Consulte a su médico.",
      translating: "Traduciendo...",
      share: "Compartir",
      viewMore: "Ver Más",
      confidence: "Confianza IA"
    },
    history: { 
      title: "Historial", 
      subtitle: "Tu biblioteca de medicamentos",
      search: "Buscar por nombre...", 
      empty: "No se encontraron medicamentos",
      emptyDesc: "Intenta con otro término",
      noHistory: "Sin historial",
      noHistoryDesc: "Tus medicamentos aparecerán aquí",
      export: "Exportar",
      deleteAll: "Borrar Todo",
      sortBy: "Ordenar",
      newest: "Recientes",
      oldest: "Antiguos",
      alphabetical: "A-Z",
      confirmDelete: "¿Eliminar este escaneo?",
      confirmDeleteAll: "¿Borrar todo el historial?"
    },
    settings: { 
      title: "Ajustes", 
      subtitle: "Personaliza tu experiencia",
      language: "Idioma",
      languageDesc: "Elige tu idioma preferido",
      clear: "Borrar Datos",
      clearDesc: "Eliminar todos los escaneos",
      privacy: "Privacidad",
      privacyDesc: "Cómo manejamos tus datos",
      about: "Acerca de",
      version: "Versión 3.0",
      madeWith: "Hecho con ♥"
    },
    guide: { 
      title: "Cómo Usar", 
      subtitle: "Comienza en 3 pasos",
      s1: "Capturar", 
      s1d: "Apunta tu cámara al empaque del medicamento.",
      s2: "Analizar", 
      s2d: "Nuestra IA identifica el medicamento.",
      s3: "Aprender", 
      s3d: "Obtén información detallada.",
      tip: "Consejo",
      tipText: "Asegúrate de tener buena iluminación."
    },
    privacy: { 
      title: "Privacidad",
      subtitle: "Tu privacidad nos importa",
      t1: "Recolección de Datos", 
      d1: "Las imágenes se procesan en tiempo real. No almacenamos fotos.",
      t2: "Almacenamiento Local", 
      d2: "Tu historial se guarda solo en tu dispositivo.",
      t3: "Acceso a Cámara", 
      d3: "Solo usamos la cámara para escanear medicamentos.",
      t4: "Aviso Médico", 
      d4: "CocoMed es una herramienta educativa, no sustituye el consejo médico."
    },
    errors: {
      notMedicine: "Esto no parece ser un medicamento.",
      scanFailed: "Escaneo fallido. Intenta de nuevo.",
      networkError: "Error de red. Verifica tu conexión.",
      generic: "Algo salió mal. Intenta de nuevo."
    }
  },
  zh: {
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" },
    home: { 
      greeting: "欢迎使用", 
      title: "CocoMed", 
      subtitle: "AI驱动的药物助手",
      scan: "点击扫描", 
      scanDesc: "使用相机扫描药物",
      upload: "从相册上传", 
      uploadDesc: "选择现有照片",
      analyzing: "正在分析药物",
      analyzeDesc: "AI正在处理...",
      recent: "最近扫描", 
      empty: "暂无扫描",
      emptyDesc: "扫描您的第一个药物",
      disclaimer: "⚠️ 仅供教育用途。这不是医疗建议。请务必咨询医疗专业人员。",
      aiPowered: "由先进AI驱动",
      scanCount: "次扫描完成"
    },
    result: { 
      back: "返回首页", 
      purpose: "用途",
      howTo: "服用方法", 
      effects: "可能的副作用", 
      warnings: "重要警告",
      storage: "储存说明",
      interactions: "药物相互作用",
      disclaimer: "此信息仅供教育参考。请咨询医生。",
      translating: "正在翻译...",
      share: "分享",
      viewMore: "查看更多",
      confidence: "AI置信度"
    },
    history: { 
      title: "扫描历史", 
      subtitle: "您的药物库",
      search: "按名称搜索...", 
      empty: "未找到药物",
      emptyDesc: "尝试其他搜索词",
      noHistory: "暂无历史",
      noHistoryDesc: "扫描的药物将显示在这里",
      export: "导出",
      deleteAll: "清除全部",
      sortBy: "排序",
      newest: "最新",
      oldest: "最旧",
      alphabetical: "字母",
      confirmDelete: "删除此扫描？",
      confirmDeleteAll: "清除所有历史？"
    },
    settings: { 
      title: "设置", 
      subtitle: "自定义您的体验",
      language: "语言",
      languageDesc: "选择您的首选语言",
      clear: "清除数据",
      clearDesc: "删除所有扫描",
      privacy: "隐私政策",
      privacyDesc: "我们如何处理您的数据",
      about: "关于",
      version: "版本 3.0",
      madeWith: "用 ♥ 制作"
    },
    guide: { 
      title: "使用方法", 
      subtitle: "3步开始",
      s1: "拍摄", 
      s1d: "将相机对准药品包装。",
      s2: "分析", 
      s2d: "AI识别药物信息。",
      s3: "学习", 
      s3d: "获取详细信息。",
      tip: "提示",
      tipText: "确保光线充足。"
    },
    privacy: { 
      title: "隐私政策",
      subtitle: "我们重视您的隐私",
      t1: "数据收集", 
      d1: "图像实时处理，不会存储。",
      t2: "本地存储", 
      d2: "历史仅存储在您的设备上。",
      t3: "相机访问", 
      d3: "仅用于扫描药物。",
      t4: "医疗声明", 
      d4: "CocoMed是教育工具，不能替代医疗建议。"
    },
    errors: {
      notMedicine: "这似乎不是药物。",
      scanFailed: "扫描失败，请重试。",
      networkError: "网络错误，请检查连接。",
      generic: "出错了，请重试。"
    }
  },
  hi: {
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" },
    home: { 
      greeting: "स्वागत है", 
      title: "CocoMed", 
      subtitle: "AI-संचालित दवा सहायक",
      scan: "स्कैन करने के लिए टैप करें", 
      scanDesc: "दवा स्कैन करने के लिए कैमरा उपयोग करें",
      upload: "गैलरी से अपलोड करें", 
      uploadDesc: "मौजूदा फोटो चुनें",
      analyzing: "दवा का विश्लेषण",
      analyzeDesc: "AI प्रोसेस कर रहा है...",
      recent: "हाल के स्कैन", 
      empty: "कोई स्कैन नहीं",
      emptyDesc: "अपनी पहली दवा स्कैन करें",
      disclaimer: "⚠️ केवल शैक्षिक उद्देश्यों के लिए। यह चिकित्सा सलाह नहीं है।",
      aiPowered: "उन्नत AI द्वारा संचालित",
      scanCount: "स्कैन पूर्ण"
    },
    result: { 
      back: "होम पर वापस", 
      purpose: "उद्देश्य",
      howTo: "कैसे लें", 
      effects: "संभावित दुष्प्रभाव", 
      warnings: "महत्वपूर्ण चेतावनी",
      storage: "भंडारण निर्देश",
      interactions: "दवा इंटरैक्शन",
      disclaimer: "यह जानकारी केवल शैक्षिक है। डॉक्टर से परामर्श करें।",
      translating: "अनुवाद हो रहा है...",
      share: "साझा करें",
      viewMore: "और देखें",
      confidence: "AI विश्वास"
    },
    history: { 
      title: "स्कैन इतिहास", 
      subtitle: "आपकी दवा लाइब्रेरी",
      search: "नाम से खोजें...", 
      empty: "कोई दवा नहीं मिली",
      emptyDesc: "दूसरा शब्द आज़माएं",
      noHistory: "कोई इतिहास नहीं",
      noHistoryDesc: "स्कैन की गई दवाएं यहां दिखाई देंगी",
      export: "निर्यात",
      deleteAll: "सब हटाएं",
      sortBy: "क्रमबद्ध",
      newest: "नवीनतम",
      oldest: "पुराना",
      alphabetical: "A-Z",
      confirmDelete: "इस स्कैन को हटाएं?",
      confirmDeleteAll: "सारा इतिहास साफ़ करें?"
    },
    settings: { 
      title: "सेटिंग्स", 
      subtitle: "अपना अनुभव अनुकूलित करें",
      language: "भाषा",
      languageDesc: "अपनी पसंदीदा भाषा चुनें",
      clear: "डेटा साफ़ करें",
      clearDesc: "सभी स्कैन हटाएं",
      privacy: "गोपनीयता",
      privacyDesc: "हम आपके डेटा को कैसे संभालते हैं",
      about: "जानकारी",
      version: "संस्करण 3.0",
      madeWith: "♥ से बनाया"
    },
    guide: { 
      title: "उपयोग कैसे करें", 
      subtitle: "3 आसान चरणों में शुरू करें",
      s1: "कैप्चर", 
      s1d: "दवा पैकेजिंग पर कैमरा इंगित करें।",
      s2: "विश्लेषण", 
      s2d: "AI दवा की पहचान करता है।",
      s3: "सीखें", 
      s3d: "विस्तृत जानकारी प्राप्त करें।",
      tip: "सुझाव",
      tipText: "अच्छी रोशनी सुनिश्चित करें।"
    },
    privacy: { 
      title: "गोपनीयता नीति",
      subtitle: "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है",
      t1: "डेटा संग्रह", 
      d1: "छवियां रीयल-टाइम में संसाधित होती हैं।",
      t2: "स्थानीय भंडारण", 
      d2: "इतिहास केवल आपके डिवाइस पर संग्रहीत है।",
      t3: "कैमरा एक्सेस", 
      d3: "केवल दवा स्कैनिंग के लिए।",
      t4: "चिकित्सा अस्वीकरण", 
      d4: "CocoMed एक शैक्षिक उपकरण है।"
    },
    errors: {
      notMedicine: "यह दवा नहीं लगती।",
      scanFailed: "स्कैन विफल। पुनः प्रयास करें।",
      networkError: "नेटवर्क त्रुटि।",
      generic: "कुछ गलत हुआ।"
    }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { 
      greeting: "வரவேற்கிறோம்", 
      title: "CocoMed", 
      subtitle: "AI-இயக்கப்படும் மருந்து உதவியாளர்",
      scan: "ஸ்கேன் செய்ய தட்டவும்", 
      scanDesc: "மருந்தை ஸ்கேன் செய்ய கேமராவைப் பயன்படுத்தவும்",
      upload: "கேலரியில் இருந்து பதிவேற்றவும்", 
      uploadDesc: "ஏற்கனவே உள்ள புகைப்படத்தைத் தேர்வு செய்யவும்",
      analyzing: "மருந்தை பகுப்பாய்வு செய்கிறது",
      analyzeDesc: "AI செயலாக்குகிறது...",
      recent: "சமீபத்திய ஸ்கேன்கள்", 
      empty: "ஸ்கேன்கள் இல்லை",
      emptyDesc: "உங்கள் முதல் மருந்தை ஸ்கேன் செய்யுங்கள்",
      disclaimer: "⚠️ கல்வி நோக்கங்களுக்கு மட்டுமே. இது மருத்துவ ஆலோசனை அல்ல.",
      aiPowered: "மேம்பட்ட AI ஆல் இயக்கப்படுகிறது",
      scanCount: "ஸ்கேன்கள் முடிந்தன"
    },
    result: { 
      back: "முகப்புக்கு திரும்பு", 
      purpose: "நோக்கம்",
      howTo: "எப்படி எடுப்பது", 
      effects: "சாத்தியமான பக்க விளைவுகள்", 
      warnings: "முக்கிய எச்சரிக்கைகள்",
      storage: "சேமிப்பு வழிமுறைகள்",
      interactions: "மருந்து தொடர்புகள்",
      disclaimer: "இந்த தகவல் கல்விக்காக மட்டுமே. மருத்துவரை அணுகவும்.",
      translating: "மொழிபெயர்க்கிறது...",
      share: "பகிர்",
      viewMore: "மேலும் பார்க்க",
      confidence: "AI நம்பிக்கை"
    },
    history: { 
      title: "ஸ்கேன் வரலாறு", 
      subtitle: "உங்கள் மருந்து நூலகம்",
      search: "பெயரால் தேடு...", 
      empty: "மருந்துகள் இல்லை",
      emptyDesc: "வேறு சொல்லை முயற்சிக்கவும்",
      noHistory: "வரலாறு இல்லை",
      noHistoryDesc: "ஸ்கேன் செய்த மருந்துகள் இங்கே தோன்றும்",
      export: "ஏற்றுமதி",
      deleteAll: "அனைத்தையும் அழி",
      sortBy: "வரிசைப்படுத்து",
      newest: "புதியது",
      oldest: "பழையது",
      alphabetical: "A-Z",
      confirmDelete: "இந்த ஸ்கேனை நீக்கவா?",
      confirmDeleteAll: "அனைத்து வரலாற்றையும் அழிக்கவா?"
    },
    settings: { 
      title: "அமைப்புகள்", 
      subtitle: "உங்கள் அனுபவத்தைத் தனிப்பயனாக்கு",
      language: "மொழி",
      languageDesc: "உங்கள் விருப்பமான மொழியைத் தேர்வு செய்யவும்",
      clear: "தரவை அழி",
      clearDesc: "அனைத்து ஸ்கேன்களையும் அகற்று",
      privacy: "தனியுரிமை",
      privacyDesc: "உங்கள் தரவை எவ்வாறு கையாளுகிறோம்",
      about: "பற்றி",
      version: "பதிப்பு 3.0",
      madeWith: "♥ உடன் உருவாக்கப்பட்டது"
    },
    guide: { 
      title: "பயன்படுத்துவது எப்படி", 
      subtitle: "3 எளிய படிகளில் தொடங்குங்கள்",
      s1: "பிடிப்பு", 
      s1d: "மருந்து பேக்கேஜிங்கில் கேமராவை சுட்டிக்காட்டவும்.",
      s2: "பகுப்பாய்வு", 
      s2d: "AI மருந்தை அடையாளம் காணும்.",
      s3: "கற்றுக்கொள்", 
      s3d: "விரிவான தகவலைப் பெறுங்கள்.",
      tip: "குறிப்பு",
      tipText: "நல்ல வெளிச்சத்தை உறுதி செய்யுங்கள்."
    },
    privacy: { 
      title: "தனியுரிமை கொள்கை",
      subtitle: "உங்கள் தனியுரிமை எங்களுக்கு முக்கியம்",
      t1: "தரவு சேகரிப்பு", 
      d1: "படங்கள் நிகழ்நேரத்தில் செயலாக்கப்படுகின்றன.",
      t2: "உள்ளூர் சேமிப்பு", 
      d2: "வரலாறு உங்கள் சாதனத்தில் மட்டுமே சேமிக்கப்படும்.",
      t3: "கேமரா அணுகல்", 
      d3: "மருந்து ஸ்கேனிங்கிற்கு மட்டுமே.",
      t4: "மருத்துவ மறுப்பு", 
      d4: "CocoMed ஒரு கல்விக் கருவி."
    },
    errors: {
      notMedicine: "இது மருந்து போல் தெரியவில்லை.",
      scanFailed: "ஸ்கேன் தோல்வி. மீண்டும் முயற்சிக்கவும்.",
      networkError: "நெட்வொர்க் பிழை.",
      generic: "ஏதோ தவறு நடந்தது."
    }
  }
};

const t = (lang, key) => {
  const keys = key.split('.');
  let result = UI_STRINGS[lang];
  for (const k of keys) {
    result = result?.[k];
    if (result === undefined) break;
  }
  if (result === undefined) {
    result = UI_STRINGS.en;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) return key;
    }
  }
  return result || key;
};

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

// Floating Particle System
const ParticleField = ({ count = 30 }) => {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    })), [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-emerald-400/20 to-teal-400/10"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px) scale(1.1); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-10px) scale(0.9); opacity: 0.4; }
          75% { transform: translateY(-30px) translateX(5px) scale(1.05); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

// Animated Gradient Orbs
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-300/40 to-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
    <div className="absolute top-1/3 -right-32 w-96 h-96 bg-gradient-to-br from-cyan-300/30 to-emerald-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
    <div className="absolute -bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-teal-300/30 to-green-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
  </div>
);

// DNA Helix Animation for Loading
const DNALoader = () => (
  <div className="relative w-16 h-24">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="absolute w-full flex justify-between" style={{ top: `${i * 12}%` }}>
        <div 
          className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-400/50"
          style={{ 
            animation: `dnaLeft 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
        <div 
          className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-400/50"
          style={{ 
            animation: `dnaRight 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      </div>
    ))}
    <style>{`
      @keyframes dnaLeft {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(20px); }
      }
      @keyframes dnaRight {
        0%, 100% { transform: translateX(0); }
        50% { transform: translateX(-20px); }
      }
    `}</style>
  </div>
);

// Pulse Ring Animation
const PulseRings = ({ color = "emerald" }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[0, 1, 2].map(i => (
      <div
        key={i}
        className={`absolute w-full h-full rounded-full border-2 border-${color}-400/30`}
        style={{
          animation: `pulseRing 2s ease-out infinite`,
          animationDelay: `${i * 0.4}s`,
        }}
      />
    ))}
    <style>{`
      @keyframes pulseRing {
        0% { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `}</style>
  </div>
);

// Glass Card Component
const GlassCard = ({ 
  children, 
  className = "", 
  onClick, 
  hover = true, 
  variant = "default",
  glow = false 
}) => {
  const variants = {
    default: "bg-white/70 border-white/80 shadow-lg shadow-slate-900/5",
    elevated: "bg-white/80 border-white shadow-xl shadow-slate-900/10",
    warning: "bg-gradient-to-br from-amber-50/95 to-orange-50/95 border-amber-200/60",
    danger: "bg-gradient-to-br from-red-50/95 to-rose-50/95 border-red-200/60",
    success: "bg-gradient-to-br from-emerald-50/95 to-teal-50/95 border-emerald-200/60",
    dark: "bg-white/50 border-emerald-200/40 shadow-xl shadow-emerald-900/10",
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative backdrop-blur-xl border rounded-3xl transition-all duration-300
        ${variants[variant]}
        ${hover && onClick ? 'hover:bg-white/90 hover:shadow-2xl hover:shadow-emerald-900/15 hover:scale-[1.02] hover:-translate-y-1 active:scale-[0.98] cursor-pointer' : ''}
        ${glow ? 'ring-2 ring-emerald-400/20 ring-offset-2 ring-offset-transparent' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Animated Counter
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [display, setDisplay] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const end = parseInt(value);
    if (start === end) return;
    
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplay(end);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{display}</span>;
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================
export default function MedScanApp() {
  // Navigation & UI State
  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [lang, setLang] = useState('en');
  
  // Data State
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  
  // Loading & Error State
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const searchInputRef = useRef(null);

  // ========================================
  // PERSISTENCE - Load & Save Data
  // ========================================
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('cocomed_lang');
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
        setLang(savedLang);
      }
      
      const savedHistory = localStorage.getItem('cocomed_history');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('cocomed_lang', lang);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('cocomed_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  // ========================================
  // NAVIGATION HELPERS
  // ========================================
  const navigateTo = useCallback((newScreen) => {
    setPreviousScreen(screen);
    setScreen(newScreen);
    setError(null);
  }, [screen]);

  const goBack = useCallback(() => {
    if (screen === 'result') {
      setScreen('home');
    } else if (screen === 'privacy') {
      setScreen('settings');
    } else {
      setScreen(previousScreen || 'home');
    }
    setError(null);
  }, [screen, previousScreen]);

  // ========================================
  // AUTO-TRANSLATION ON LANGUAGE CHANGE
  // ========================================
  useEffect(() => {
    const translateCurrentResult = async () => {
      if (
        screen === 'result' && 
        scanResult && 
        scanResult.languageCode !== lang && 
        !isTranslating && 
        !loading
      ) {
        await reAnalyzeForLanguage(scanResult);
      }
    };
    translateCurrentResult();
  }, [lang, screen, scanResult]);

  // ========================================
  // AI API INTEGRATION
  // ========================================
  const callGeminiAPI = async (payload) => {
    const apiKey = getApiKey();
    
    // Development mode with API key
    if (apiKey && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: payload }] })
        }
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
    
    // Production mode via backend
    const response = await fetch(`${CONFIG.API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: payload[0].text,
        image: payload[1]?.inlineData?.data
      })
    });
    
    if (!response.ok) {
      throw new Error(response.status === 429 ? 'Rate limited. Please try again.' : `Server Error: ${response.status}`);
    }
    return response.json();
  };

  const createAnalysisPrompt = (targetLang) => `You are an expert pharmacist AI assistant. Analyze this medication image carefully.

INSTRUCTIONS:
1. First, determine if the image shows a medication (pill, tablet, capsule, bottle, package, label, etc.)
2. If NOT a medication, respond with ONLY: {"error": "NOT_MEDICINE"}
3. If it IS a medication, extract ALL available information

RESPOND IN: ${LANGUAGE_NAMES[targetLang]}

OUTPUT FORMAT (JSON only, no markdown):
{
  "brandName": "Brand/Trade name",
  "genericName": "Generic/Chemical name", 
  "manufacturer": "Company name",
  "dosageForm": "tablet/capsule/liquid/cream/etc",
  "strength": "Dosage strength (e.g., 500mg)",
  "purpose": "What condition(s) this medication treats - explain in simple terms",
  "howToTake": "Detailed dosing instructions and timing",
  "sideEffects": ["List", "of", "common", "side", "effects"],
  "warnings": ["Important", "safety", "warnings"],
  "storage": "Storage instructions",
  "interactions": ["Known", "drug", "interactions"]
}

Be thorough but use simple, patient-friendly language. If information is not visible, make reasonable inferences based on the medication type.`;

  // ========================================
  // SCAN HANDLER
  // ========================================
  const handleScan = async (file) => {
    if (!file || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Compress the image
      const compressedImage = await compressImage(file);
      const base64Data = compressedImage.split(',')[1];
      
      // Create the prompt
      const prompt = createAnalysisPrompt(lang);
      
      // Call the API
      const response = await callGeminiAPI([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ]);
      
      // Extract the response text
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error(t(lang, 'errors.scanFailed'));
      }
      
      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error(t(lang, 'errors.scanFailed'));
      }
      
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Check for NOT_MEDICINE error
      if (parsedData.error === "NOT_MEDICINE") {
        throw new Error(t(lang, 'errors.notMedicine'));
      }
      
      // Sanitize and create the scan record
      const sanitizedData = sanitizeMedicationData(parsedData);
      const newScan = {
        ...sanitizedData,
        id: generateId(),
        date: new Date().toISOString(),
        img: compressedImage,
        languageCode: lang,
      };
      
      // Update state
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      navigateTo('result');
      
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || t(lang, 'errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // RE-ANALYZE FOR TRANSLATION
  // ========================================
  const reAnalyzeForLanguage = async (currentScan) => {
    if (!currentScan?.img || isTranslating) return;
    
    setIsTranslating(true);
    
    try {
      const base64Data = currentScan.img.split(',')[1];
      const prompt = createAnalysisPrompt(lang);
      
      const response = await callGeminiAPI([
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Data } }
      ]);
      
      const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        if (!parsedData.error) {
          const sanitizedData = sanitizeMedicationData(parsedData);
          const updatedScan = {
            ...currentScan,
            ...sanitizedData,
            languageCode: lang,
          };
          
          setScanResult(updatedScan);
          setHistory(prev => prev.map(item => 
            item.id === currentScan.id ? updatedScan : item
          ));
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // ========================================
  // SEARCH & FILTER LOGIC
  // ========================================
  const filteredAndSortedHistory = useMemo(() => {
    let results = [...history];
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(item => {
        const brandName = (item.brandName || '').toLowerCase();
        const genericName = (item.genericName || '').toLowerCase();
        const manufacturer = (item.manufacturer || '').toLowerCase();
        const purpose = (item.purpose || '').toLowerCase();
        
        return brandName.includes(query) ||
               genericName.includes(query) ||
               manufacturer.includes(query) ||
               purpose.includes(query);
      });
    }
    
    // Apply sorting
    results.sort((a, b) => {
      switch (sortOrder) {
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'alphabetical':
          return (a.brandName || '').localeCompare(b.brandName || '');
        case 'newest':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
    
    return results;
  }, [history, searchQuery, sortOrder]);

  // Debounced search handler
  const handleSearchChange = useCallback(
    debounce((value) => setSearchQuery(value), 200),
    []
  );

  // ========================================
  // EXPORT FUNCTIONALITY
  // ========================================
  const exportHistory = useCallback(() => {
    const exportData = history.map(item => ({
      name: item.brandName,
      generic: item.genericName,
      strength: item.strength,
      manufacturer: item.manufacturer,
      date: new Date(item.date).toLocaleDateString(),
    }));
    
    const text = exportData.map(item => 
      `${item.name} (${item.generic}) - ${item.strength}\nManufacturer: ${item.manufacturer}\nScanned: ${item.date}`
    ).join('\n\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My CocoMed Medication List',
        text: text,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Medication list copied to clipboard!');
    }
  }, [history]);

  // ========================================
  // DELETE HANDLERS
  // ========================================
  const deleteScan = useCallback((id) => {
    if (window.confirm(t(lang, 'history.confirmDelete'))) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  }, [lang]);

  const clearAllHistory = useCallback(() => {
    if (window.confirm(t(lang, 'history.confirmDeleteAll'))) {
      setHistory([]);
      localStorage.removeItem('cocomed_history');
    }
  }, [lang]);

  // ========================================
  // HOME SCREEN
  // ========================================
  const HomeScreen = () => (
    <div className="min-h-full relative">
      <ParticleField count={40} />
      <GradientOrbs />
      
      <div className="relative px-6 pt-8 pb-12 md:px-12 md:pt-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-2 mb-2">
              <Cpu size={16} className="text-emerald-500" />
              <span className="text-emerald-600 text-xs font-bold uppercase tracking-widest">{t(lang, 'home.aiPowered')}</span>
            </div>
            <p className="text-emerald-600/60 text-sm font-medium tracking-wide">{t(lang, 'home.greeting')}</p>
            <h1 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-slate-800 via-emerald-700 to-teal-600 bg-clip-text text-transparent tracking-tight mt-1">
              {t(lang, 'home.title')}
            </h1>
            <p className="text-slate-500 text-lg mt-2 font-light">{t(lang, 'home.subtitle')}</p>
            
            {/* Scan Counter */}
            {history.length > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur border border-emerald-200/50 shadow-lg shadow-emerald-200/20">
                <Activity size={16} className="text-emerald-500" />
                <span className="text-emerald-700 font-bold"><AnimatedCounter value={history.length} /></span>
                <span className="text-emerald-600 text-sm">{t(lang, 'home.scanCount')}</span>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Scan Section */}
            <div className="lg:col-span-5 space-y-4">
              {/* Camera Scan Button */}
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-[2.5rem] blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                <GlassCard 
                  onClick={() => !loading && cameraRef.current?.click()}
                  className="relative p-8 md:p-10 min-h-[300px] md:min-h-[340px] flex flex-col items-center justify-center overflow-hidden"
                  variant="dark"
                  glow={!loading}
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment" 
                    className="hidden" 
                    ref={cameraRef} 
                    onChange={(e) => { 
                      if (e.target.files?.[0]) handleScan(e.target.files[0]); 
                      e.target.value = ''; 
                    }} 
                  />
                  
                  {loading ? (
                    <div className="text-center">
                      <div className="mb-8">
                        <DNALoader />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{t(lang, 'home.analyzing')}</h3>
                      <p className="text-slate-500 text-sm">{t(lang, 'home.analyzeDesc')}</p>
                      <div className="mt-6 flex items-center justify-center gap-3">
                        <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-8">
                        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-2xl shadow-emerald-500/40 group-hover:scale-110 group-hover:shadow-emerald-500/60 transition-all duration-500">
                          <Camera size={56} className="text-white drop-shadow-lg" />
                        </div>
                        <PulseRings />
                        <div className="absolute -inset-6 rounded-full border-2 border-dashed border-emerald-300/40 animate-spin" style={{ animationDuration: '25s' }} />
                        <div className="absolute -inset-10 rounded-full border border-dashed border-teal-300/20 animate-spin" style={{ animationDuration: '35s', animationDirection: 'reverse' }} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">{t(lang, 'home.scan')}</h3>
                      <p className="text-slate-500 text-center text-sm max-w-[220px]">{t(lang, 'home.scanDesc')}</p>
                    </>
                  )}
                </GlassCard>
              </div>

              {/* Upload from Gallery */}
              <GlassCard 
                onClick={() => !loading && fileRef.current?.click()}
                className="p-5 flex items-center gap-5"
                variant="elevated"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  ref={fileRef} 
                  onChange={(e) => { 
                    if (e.target.files?.[0]) handleScan(e.target.files[0]); 
                    e.target.value = ''; 
                  }} 
                />
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-xl shadow-violet-400/30">
                  <Image className="text-white" size={28} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 text-lg">{t(lang, 'home.upload')}</h4>
                  <p className="text-slate-500 text-sm">{t(lang, 'home.uploadDesc')}</p>
                </div>
                <ChevronRight className="text-slate-400" size={24} />
              </GlassCard>

              {/* Error Display */}
              {error && (
                <GlassCard className="p-5" variant="danger" hover={false}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0 shadow-lg shadow-red-400/30">
                      <XCircle className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-red-800 font-medium">{error}</p>
                    </div>
                    <button 
                      onClick={() => setError(null)} 
                      className="text-red-400 hover:text-red-600 transition-colors p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Medical Disclaimer */}
              <GlassCard className="p-6" variant="warning" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shrink-0 shadow-xl shadow-amber-400/30">
                    <Shield className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-amber-900 font-medium leading-relaxed">{t(lang, 'home.disclaimer')}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Recent Scans */}
              <div>
                <div className="flex items-center justify-between mb-5 px-1">
                  <h3 className="text-slate-700 font-bold text-lg flex items-center gap-2">
                    <Clock size={20} className="text-emerald-500" />
                    {t(lang, 'home.recent')}
                  </h3>
                  {history.length > 0 && (
                    <button 
                      onClick={() => navigateTo('history')} 
                      className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors flex items-center gap-1 group"
                    >
                      View All 
                      <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
                
                {history.length === 0 ? (
                  <GlassCard className="p-12 text-center" hover={false}>
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Sparkles className="text-slate-300" size={40} />
                    </div>
                    <h4 className="text-slate-600 font-bold text-xl mb-2">{t(lang, 'home.empty')}</h4>
                    <p className="text-slate-400">{t(lang, 'home.emptyDesc')}</p>
                  </GlassCard>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history.slice(0, 4).map((item) => (
                      <GlassCard 
                        key={item.id} 
                        className="p-5 group" 
                        variant="elevated"
                        onClick={() => { setScanResult(item); navigateTo('result'); }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-18 h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shrink-0 shadow-lg shadow-slate-200/50 border border-white">
                            <img src={item.img} className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-orange-500 text-[10px] font-bold uppercase tracking-wider">
                              {new Date(item.date).toLocaleDateString()}
                            </p>
                            <h4 className="text-slate-800 font-bold truncate mt-1">{item.brandName}</h4>
                            <p className="text-slate-500 text-sm truncate">{item.genericName}</p>
                          </div>
                          <ChevronRight className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" size={22} />
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

  // ========================================
  // RESULT SCREEN
  // ========================================
  const ResultScreen = () => {
    if (!scanResult) return null;
    
    return (
      <div className="min-h-full relative">
        <GradientOrbs />
        
        <div className="relative px-6 py-8 md:px-12">
          <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={goBack} 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur border border-white/80 text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all font-medium shadow-lg shadow-slate-200/30"
              >
                <ArrowLeft size={20} /> 
                <span>{t(lang, 'result.back')}</span>
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ 
                      title: scanResult.brandName,
                      text: `${scanResult.brandName} (${scanResult.genericName}) - ${scanResult.purpose}`
                    });
                  }
                }} 
                className="p-3 rounded-xl bg-white/60 backdrop-blur border border-white/80 text-slate-500 hover:text-emerald-600 hover:bg-white/80 transition-all shadow-lg shadow-slate-200/30"
              >
                <Share2 size={20} />
              </button>
            </div>

            {/* Hero Card */}
            <GlassCard className="p-8 mb-6 overflow-hidden relative" variant="elevated" hover={false}>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shrink-0 shadow-2xl shadow-slate-300/50 border-4 border-white">
                  <img src={scanResult.img} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-400/30">
                      {scanResult.dosageForm}
                    </span>
                    {scanResult.strength !== 'N/A' && (
                      <span className="px-4 py-2 rounded-full bg-white/80 text-slate-700 text-xs font-bold border border-slate-200/50 shadow-sm">
                        {scanResult.strength}
                      </span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">{scanResult.brandName}</h1>
                  <p className="text-slate-500 text-xl mt-2 font-medium">{scanResult.genericName}</p>
                  {scanResult.manufacturer !== 'N/A' && (
                    <p className="text-slate-400 text-sm mt-4 flex items-center gap-2">
                      <MapPin size={16} /> {scanResult.manufacturer}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Translation Indicator */}
              {isTranslating && (
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50">
                  <div className="flex items-center gap-3 text-emerald-700">
                    <RefreshCw size={18} className="animate-spin" />
                    <span className="font-medium">{t(lang, 'result.translating')}</span>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Info Cards */}
            <div className="space-y-4">
              {scanResult.purpose && scanResult.purpose !== 'N/A' && (
                <GlassCard className="p-6" variant="elevated" hover={false}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-xl shadow-emerald-400/30">
                      <Heart className="text-white" size={26} />
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t(lang, 'result.purpose')}</h4>
                      <p className="text-slate-700 leading-relaxed text-lg">{scanResult.purpose}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {scanResult.howToTake && scanResult.howToTake !== 'N/A' && (
                <GlassCard className="p-6" variant="elevated" hover={false}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-xl shadow-blue-400/30">
                      <Clock className="text-white" size={26} />
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t(lang, 'result.howTo')}</h4>
                      <p className="text-slate-700 leading-relaxed">{scanResult.howToTake}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {scanResult.storage && scanResult.storage !== 'N/A' && (
                <GlassCard className="p-6" variant="elevated" hover={false}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shrink-0 shadow-xl shadow-violet-400/30">
                      <Layers className="text-white" size={26} />
                    </div>
                    <div>
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{t(lang, 'result.storage')}</h4>
                      <p className="text-slate-700 leading-relaxed">{scanResult.storage}</p>
                    </div>
                  </div>
                </GlassCard>
              )}

              {scanResult.sideEffects?.length > 0 && (
                <GlassCard className="p-6" variant="warning" hover={false}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-xl shadow-amber-400/30">
                      <AlertTriangle className="text-white" size={26} />
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
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shrink-0 shadow-xl shadow-red-400/30">
                      <ShieldCheck className="text-white" size={26} />
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

              {scanResult.interactions?.length > 0 && (
                <GlassCard className="p-6" variant="elevated" hover={false}>
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0 shadow-xl shadow-pink-400/30">
                      <Zap className="text-white" size={26} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">{t(lang, 'result.interactions')}</h4>
                      <ul className="space-y-2">
                        {scanResult.interactions.map((interaction, i) => (
                          <li key={i} className="text-slate-700 flex items-start gap-3">
                            <span className="w-2 h-2 rounded-full bg-pink-400 mt-2 shrink-0" />
                            {interaction}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Disclaimer Footer */}
            <div className="mt-8 p-6 rounded-2xl bg-slate-100/60 border border-slate-200/50 text-center">
              <p className="text-slate-500 text-sm">{t(lang, 'result.disclaimer')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // HISTORY SCREEN
  // ========================================
  const HistoryScreen = () => (
    <div className="min-h-full relative">
      <GradientOrbs />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight">{t(lang, 'history.title')}</h1>
              <p className="text-slate-500 mt-2">{t(lang, 'history.subtitle')}</p>
            </div>
            {history.length > 0 && (
              <div className="flex gap-3">
                <button 
                  onClick={exportHistory} 
                  className="px-5 py-3 rounded-xl bg-white/70 backdrop-blur border border-white/80 hover:bg-white/90 text-slate-700 font-semibold transition-all shadow-lg shadow-slate-200/30 flex items-center gap-2"
                >
                  <Upload size={18} /> {t(lang, 'history.export')}
                </button>
                <button 
                  onClick={clearAllHistory} 
                  className="px-5 py-3 rounded-xl bg-red-50 border border-red-200/50 hover:bg-red-100 text-red-600 font-semibold transition-all flex items-center gap-2"
                >
                  <Trash2 size={18} /> {t(lang, 'history.deleteAll')}
                </button>
              </div>
            )}
          </div>

          {history.length === 0 ? (
            <GlassCard className="p-16 text-center" hover={false}>
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                <History className="text-slate-300" size={48} />
              </div>
              <h3 className="text-slate-700 font-bold text-2xl mb-3">{t(lang, 'history.noHistory')}</h3>
              <p className="text-slate-500 mb-8">{t(lang, 'history.noHistoryDesc')}</p>
              <button 
                onClick={() => navigateTo('home')} 
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all hover:scale-[1.02]"
              >
                Scan Your First Medicine
              </button>
            </GlassCard>
          ) : (
            <>
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <GlassCard className="flex-1 p-2" hover={false}>
                  <div className="flex items-center gap-3 px-4">
                    <Search className="text-slate-400" size={22} />
                    <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder={t(lang, 'history.search')}
                      defaultValue={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-3 text-base"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => {
                          setSearchQuery('');
                          if (searchInputRef.current) searchInputRef.current.value = '';
                        }} 
                        className="text-slate-400 hover:text-slate-600 p-1"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                </GlassCard>
                
                <GlassCard className="p-2 sm:w-auto" hover={false}>
                  <select 
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="bg-transparent border-none outline-none text-slate-700 font-medium px-4 py-3 cursor-pointer w-full"
                  >
                    <option value="newest">{t(lang, 'history.newest')}</option>
                    <option value="oldest">{t(lang, 'history.oldest')}</option>
                    <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
                  </select>
                </GlassCard>
              </div>

              {/* Results */}
              {filteredAndSortedHistory.length === 0 ? (
                <GlassCard className="p-16 text-center" hover={false}>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <Search className="text-slate-300" size={40} />
                  </div>
                  <h3 className="text-slate-600 font-bold text-xl mb-2">{t(lang, 'history.empty')}</h3>
                  <p className="text-slate-400">{t(lang, 'history.emptyDesc')}</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedHistory.map((item) => (
                    <GlassCard 
                      key={item.id} 
                      className="p-5 group" 
                      variant="elevated"
                      onClick={() => { setScanResult(item); navigateTo('result'); }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-18 h-18 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shrink-0 shadow-lg shadow-slate-200/50 border border-white">
                          <img src={item.img} className="w-16 h-16 object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-slate-800 font-bold truncate">{item.brandName}</h4>
                          <p className="text-slate-500 text-sm truncate">{item.genericName}</p>
                          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                            <Calendar size={12} /> {new Date(item.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }} 
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ========================================
  // GUIDE SCREEN
  // ========================================
  const GuideScreen = () => (
    <div className="min-h-full relative">
      <GradientOrbs />
      <ParticleField count={20} />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">{t(lang, 'guide.title')}</h1>
          <p className="text-slate-500 mb-10">{t(lang, 'guide.subtitle')}</p>
          
          <div className="space-y-5">
            {[
              { icon: Scan, gradient: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-400/30', num: '01', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') },
              { icon: Cpu, gradient: 'from-violet-400 to-purple-500', shadow: 'shadow-violet-400/30', num: '02', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') },
              { icon: BookOpen, gradient: 'from-orange-400 to-amber-500', shadow: 'shadow-orange-400/30', num: '03', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') },
            ].map((step, i) => (
              <GlassCard key={i} className="p-6" variant="elevated" hover={false}>
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shrink-0 shadow-xl ${step.shadow}`}>
                    <step.icon className="text-white" size={30} />
                  </div>
                  <div>
                    <span className="text-slate-300 text-xs font-mono font-bold">{step.num}</span>
                    <h3 className="text-slate-800 text-xl font-bold mt-1">{step.title}</h3>
                    <p className="text-slate-500 mt-2 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Pro Tip */}
          <GlassCard className="mt-8 p-6" variant="success" hover={false}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-400/30">
                <Star className="text-white" size={24} />
              </div>
              <div>
                <h4 className="text-emerald-800 font-bold">{t(lang, 'guide.tip')}</h4>
                <p className="text-emerald-700 mt-1">{t(lang, 'guide.tipText')}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  // ========================================
  // SETTINGS SCREEN
  // ========================================
  const SettingsScreen = () => (
    <div className="min-h-full relative">
      <GradientOrbs />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">{t(lang, 'settings.title')}</h1>
          <p className="text-slate-500 mb-10">{t(lang, 'settings.subtitle')}</p>

          {/* Language Selector */}
          <GlassCard className="overflow-hidden mb-6" variant="elevated" hover={false}>
            <div className="p-5 border-b border-slate-200/30 flex items-center gap-3 bg-white/30">
              <Globe className="text-emerald-500" size={22} />
              <div>
                <span className="text-slate-800 font-bold">{t(lang, 'settings.language')}</span>
                <p className="text-slate-500 text-sm">{t(lang, 'settings.languageDesc')}</p>
              </div>
            </div>
            <div className="p-3">
              {LANGUAGES.map(l => (
                <button 
                  key={l.code} 
                  onClick={() => setLang(l.code)} 
                  className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all mb-1 ${
                    lang === l.code 
                      ? 'bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-200/30 border border-emerald-200/50' 
                      : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{l.flag}</span>
                    <span className="font-semibold">{l.nativeName}</span>
                  </div>
                  {lang === l.code && <CheckCircle2 size={24} className="text-emerald-500" />}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="space-y-3">
            <GlassCard className="p-5" variant="elevated" onClick={() => navigateTo('privacy')}>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center shadow-lg shadow-slate-200/50">
                  <Lock className="text-slate-500" size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-slate-800 font-bold">{t(lang, 'settings.privacy')}</span>
                  <p className="text-slate-500 text-sm">{t(lang, 'settings.privacyDesc')}</p>
                </div>
                <ChevronRight className="text-slate-400" size={22} />
              </div>
            </GlassCard>

            <GlassCard 
              className="p-5" 
              variant="danger"
              onClick={clearAllHistory}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-100 to-rose-50 flex items-center justify-center shadow-lg shadow-red-200/50">
                  <Trash2 className="text-red-500" size={24} />
                </div>
                <div className="flex-1">
                  <span className="text-red-700 font-bold">{t(lang, 'settings.clear')}</span>
                  <p className="text-red-500 text-sm">{t(lang, 'settings.clearDesc')}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/30">
              <Pill className="text-white" size={36} />
            </div>
            <h3 className="text-slate-800 font-bold text-xl">{t(lang, 'settings.about')}</h3>
            <p className="text-slate-500 mt-1">{t(lang, 'settings.version')}</p>
            <p className="text-slate-400 text-sm mt-4">{t(lang, 'settings.madeWith')}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ========================================
  // PRIVACY SCREEN
  // ========================================
  const PrivacyScreen = () => (
    <div className="min-h-full relative">
      <GradientOrbs />
      
      <div className="relative px-6 py-8 md:px-12">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={goBack} 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 backdrop-blur border border-white/80 text-slate-600 hover:text-slate-800 hover:bg-white/80 transition-all font-medium mb-8 shadow-lg shadow-slate-200/30"
          >
            <ArrowLeft size={20} /> 
            <span>{t(lang, 'settings.title')}</span>
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 tracking-tight mb-2">{t(lang, 'privacy.title')}</h1>
          <p className="text-slate-500 mb-10">{t(lang, 'privacy.subtitle')}</p>

          <GlassCard className="p-8" variant="elevated" hover={false}>
            <div className="space-y-10">
              {[
                { icon: Eye, color: 'emerald' },
                { icon: Fingerprint, color: 'violet' },
                { icon: Camera, color: 'blue' },
                { icon: Shield, color: 'amber' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${item.color}-100 to-${item.color}-50 flex items-center justify-center shrink-0 shadow-lg shadow-${item.color}-200/30`}>
                    <item.icon className={`text-${item.color}-500`} size={24} />
                  </div>
                  <div>
                    <h3 className="text-slate-800 font-bold text-lg mb-2">{t(lang, `privacy.t${i + 1}`)}</h3>
                    <p className="text-slate-500 leading-relaxed">{t(lang, `privacy.d${i + 1}`)}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  // ========================================
  // DESKTOP SIDEBAR NAVIGATION
  // ========================================
  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-72 h-screen sticky top-0 p-6 bg-white/50 backdrop-blur-xl border-r border-emerald-200/30">
      {/* Logo */}
      <div className="flex items-center gap-4 mb-12">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 flex items-center justify-center shadow-xl shadow-emerald-500/30">
          <Pill className="text-white drop-shadow" size={28} />
        </div>
        <div>
          <h1 className="text-slate-800 font-black text-xl tracking-tight">CocoMed</h1>
          <p className="text-slate-400 text-xs font-medium">AI Medicine Scanner</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2 flex-1">
        {[
          { id: 'home', icon: Home, label: t(lang, 'nav.home') },
          { id: 'history', icon: History, label: t(lang, 'nav.history') },
          { id: 'guide', icon: BookOpen, label: t(lang, 'nav.guide') },
          { id: 'settings', icon: Settings, label: t(lang, 'nav.settings') },
        ].map(item => {
          const isActive = screen === item.id || 
                          (screen === 'result' && item.id === 'home') || 
                          (screen === 'privacy' && item.id === 'settings');
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-100 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-200/30 border border-emerald-200/50 font-bold' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/60 font-medium'
              }`}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              {item.id === 'history' && history.length > 0 && (
                <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {history.length}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="pt-6 border-t border-emerald-200/30 text-center">
        <p className="text-slate-400 text-xs font-medium">Educational Use Only</p>
        <p className="text-slate-300 text-[10px] mt-1">v3.0 • AI Powered</p>
      </div>
    </div>
  );

  // ========================================
  // MOBILE BOTTOM NAVIGATION
  // ========================================
  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-6">
      <div className="backdrop-blur-2xl bg-white/85 border border-white/50 rounded-[2rem] p-2 shadow-2xl shadow-slate-900/15 max-w-md mx-auto">
        <div className="flex justify-around">
          {[
            { id: 'home', icon: Home },
            { id: 'history', icon: History },
            { id: 'guide', icon: BookOpen },
            { id: 'settings', icon: Settings },
          ].map(item => {
            const isActive = screen === item.id || 
                            (screen === 'result' && item.id === 'home') || 
                            (screen === 'privacy' && item.id === 'settings');
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`relative flex-1 flex flex-col items-center py-3 px-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600 shadow-lg shadow-emerald-200/50' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {t(lang, `nav.${item.id}`)}
                </span>
                {item.id === 'history' && history.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-orange-400/30">
                    {history.length > 9 ? '9+' : history.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ========================================
  // MAIN RENDER
  // ========================================
  return (
    <ErrorBoundary>
      <div 
        className="min-h-screen transition-colors duration-700"
        style={{ 
          background: 'linear-gradient(145deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 60%, #6ee7b7 100%)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="flex">
          <DesktopNav />
          
          <main className="flex-1 min-h-screen pb-32 lg:pb-8">
            {screen === 'home' && <HomeScreen />}
            {screen === 'result' && <ResultScreen />}
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
