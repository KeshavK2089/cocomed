import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, 
  ChevronRight, ArrowLeft, Search, Heart, Clock, MapPin, Image, Upload, AlertCircle, Scan,
  Zap, Shield, Eye, Star, Layers, Fingerprint
} from 'lucide-react';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false }; 
  }
  static getDerivedStateFromError() { 
    return { hasError: true }; 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h2>
            <p className="text-slate-500 mb-8">The application encountered an error. Your data is safe.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold transition-colors"
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
// ADVANCED DNA LOADING ANIMATION
// ============================================================================
const DNALoadingAnimation = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 300;
    const height = canvas.height = 300;
    let time = 0;
    
    // Particles array
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 253, 244, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      // Update and draw particles
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.fill();
      });
      
      // Draw DNA double helix
      const centerX = width / 2;
      const centerY = height / 2;
      const helixRadius = 60;
      const helixHeight = 200;
      const numPoints = 30;
      
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 4 + time;
        const y = (i / numPoints) * helixHeight - helixHeight / 2 + centerY;
        
        // First strand
        const x1 = centerX + Math.sin(t) * helixRadius;
        const z1 = Math.cos(t);
        
        // Second strand (180 degrees offset)
        const x2 = centerX + Math.sin(t + Math.PI) * helixRadius;
        const z2 = Math.cos(t + Math.PI);
        
        // Size based on z-depth
        const size1 = 4 + z1 * 2;
        const size2 = 4 + z2 * 2;
        
        // Glow effect
        const gradient1 = ctx.createRadialGradient(x1, y, 0, x1, y, size1 * 3);
        gradient1.addColorStop(0, `rgba(16, 185, 129, ${0.8 + z1 * 0.2})`);
        gradient1.addColorStop(0.5, `rgba(5, 150, 105, ${0.4 + z1 * 0.2})`);
        gradient1.addColorStop(1, 'rgba(16, 185, 129, 0)');
        
        ctx.beginPath();
        ctx.arc(x1, y, size1 * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient1;
        ctx.fill();
        
        // Core sphere 1
        ctx.beginPath();
        ctx.arc(x1, y, size1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${0.9 + z1 * 0.1})`;
        ctx.fill();
        
        const gradient2 = ctx.createRadialGradient(x2, y, 0, x2, y, size2 * 3);
        gradient2.addColorStop(0, `rgba(139, 92, 246, ${0.8 + z2 * 0.2})`);
        gradient2.addColorStop(0.5, `rgba(124, 58, 237, ${0.4 + z2 * 0.2})`);
        gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(x2, y, size2 * 2, 0, Math.PI * 2);
        ctx.fillStyle = gradient2;
        ctx.fill();
        
        // Core sphere 2
        ctx.beginPath();
        ctx.arc(x2, y, size2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${0.9 + z2 * 0.1})`;
        ctx.fill();
        
        // Draw connecting bars (base pairs)
        if (i % 3 === 0 && z1 > -0.3) {
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.3 + (z1 + z2) * 0.15})`;
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Center node
          const midX = (x1 + x2) / 2;
          ctx.beginPath();
          ctx.arc(midX, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, 0.8)`;
          ctx.fill();
        }
      }
      
      // Draw orbiting rings
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, 80 + i * 20, 30 + i * 8, time * 0.5 + i * 0.5, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Scanning line effect
      const scanY = ((time * 50) % (height + 40)) - 20;
      const scanGradient = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      scanGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');
      scanGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanY - 20, width, 40);
      
      time += 0.03;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Outer glow ring */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-r from-emerald-400/20 via-violet-400/20 to-emerald-400/20 animate-pulse blur-xl" />
      
      {/* Canvas container */}
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          className="rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(240,253,244,1) 0%, rgba(236,253,245,1) 100%)' }}
        />
        
        {/* Rotating border */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent" 
          style={{
            background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #10b981, #8b5cf6, #10b981) border-box',
            animation: 'spin 3s linear infinite'
          }} 
        />
      </div>
      
      {/* Animated text */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">
          Analyzing Medicine
        </h3>
        <p className="text-slate-500 text-sm mt-1">AI-powered molecular analysis in progress...</p>
      </div>
      
      {/* Progress indicators */}
      <div className="mt-6 flex gap-3">
        {['Scanning', 'Processing', 'Analyzing'].map((step, i) => (
          <div key={step} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 shadow-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-violet-500' : 'bg-indigo-500'} animate-pulse`} />
            <span className="text-xs font-medium text-slate-600">{step}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = {
  API_URL: "https://cocomed.vercel.app",
  MAX_IMAGE_SIZE: 1024,
  COMPRESSION_QUALITY: 0.75,
};

const getApiKey = () => {
  try { 
    if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GEMINI_API_KEY) return process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  } catch (e) {}
  return "";
};

// ============================================================================
// UTILITIES
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

// ============================================================================
// LOCALIZATION
// ============================================================================
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
];

const LANGUAGE_NAMES = { en: 'English', es: 'Spanish', zh: 'Simplified Chinese', hi: 'Hindi', ta: 'Tamil' };

const UI_STRINGS = {
  en: {
    nav: { home: "Home", history: "History", guide: "Guide", settings: "Settings" },
    home: { 
      greeting: "Welcome to", title: "CocoMed", subtitle: "Your Personal Medicine Assistant",
      scan: "Tap to Scan", scanDesc: "Use your camera to scan medicine",
      upload: "Upload from Gallery", uploadDesc: "Choose an existing photo",
      analyzing: "Analyzing Medicine", analyzeDesc: "Processing your image...",
      recent: "Recent Scans", empty: "No scans yet", emptyDesc: "Scan your first medicine to get started",
      disclaimer: "⚠️ Educational purposes only. This is not medical advice. Always consult a healthcare professional before taking any medication.",
      scanCount: "scans completed"
    },
    result: { 
      back: "Back", purpose: "What It's For", howTo: "How to Take", effects: "Possible Side Effects", 
      warnings: "Important Warnings", storage: "Storage Instructions", interactions: "Drug Interactions",
      disclaimer: "This information is for educational purposes only. Always consult your doctor or pharmacist before taking any medication.",
      translating: "Translating to your language...", share: "Share"
    },
    history: { 
      title: "Scan History", subtitle: "Your medication library",
      search: "Search by name, generic, or manufacturer...", searchButton: "Search",
      empty: "No medicines found", emptyDesc: "Try a different search term",
      noHistory: "No scan history yet", noHistoryDesc: "Your scanned medicines will appear here",
      export: "Export List", deleteAll: "Clear All", newest: "Newest", oldest: "Oldest", alphabetical: "A-Z",
      confirmDelete: "Delete this scan?", confirmDeleteAll: "Clear all scan history? This cannot be undone."
    },
    settings: { 
      title: "Settings", subtitle: "Customize your experience", language: "Language",
      languageDesc: "Choose your preferred language", clear: "Clear All Data",
      clearDesc: "Remove all scans and reset app", privacy: "Privacy Policy",
      privacyDesc: "How we handle your data", about: "About CocoMed",
      version: "Version 3.0", madeWith: "Made with ♥ for better health"
    },
    guide: { 
      title: "How to Use", subtitle: "Get started in 3 easy steps",
      s1: "Capture", s1d: "Point your camera at any medicine packaging, label, or pill bottle. Make sure the text is clearly visible.",
      s2: "Analyze", s2d: "The app will identify the medication and extract all relevant information from the image.",
      s3: "Learn", s3d: "Get comprehensive details including purpose, dosage, side effects, and important warnings.",
      tip: "Pro Tip", tipText: "For best results, ensure good lighting and hold your device steady."
    },
    privacy: { 
      title: "Privacy Policy", subtitle: "Your privacy matters to us",
      t1: "Data Collection", d1: "Images are processed in real-time using secure technology. We do not permanently store any photos on our servers.",
      t2: "Local Storage", d2: "Your scan history is stored locally on your device only. This data never leaves your device unless you explicitly choose to export or share it.",
      t3: "Camera Access", d3: "Camera permissions are used exclusively for scanning medication. We never access your camera without your explicit action.",
      t4: "Medical Disclaimer", d4: "CocoMed is an educational tool designed to help you learn about medications. It is not intended to replace professional medical advice."
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
    home: { greeting: "Bienvenido a", title: "CocoMed", subtitle: "Tu Asistente de Medicamentos",
      scan: "Toca para Escanear", scanDesc: "Usa tu cámara para escanear",
      upload: "Subir de Galería", uploadDesc: "Elige una foto existente",
      analyzing: "Analizando Medicamento", analyzeDesc: "Procesando tu imagen...",
      recent: "Escaneos Recientes", empty: "Sin escaneos", emptyDesc: "Escanea tu primer medicamento",
      disclaimer: "⚠️ Solo para fines educativos. Esto no es consejo médico.", scanCount: "escaneos completados"
    },
    result: { back: "Volver", purpose: "Para Qué Sirve", howTo: "Cómo Tomar", effects: "Posibles Efectos Secundarios", 
      warnings: "Advertencias Importantes", storage: "Almacenamiento", interactions: "Interacciones",
      disclaimer: "Esta información es solo para fines educativos.", translating: "Traduciendo...", share: "Compartir"
    },
    history: { title: "Historial", subtitle: "Tu biblioteca de medicamentos", search: "Buscar por nombre...", 
      searchButton: "Buscar", empty: "No se encontraron medicamentos", emptyDesc: "Intenta con otro término",
      noHistory: "Sin historial", noHistoryDesc: "Tus medicamentos aparecerán aquí", export: "Exportar",
      deleteAll: "Borrar Todo", newest: "Recientes", oldest: "Antiguos", alphabetical: "A-Z",
      confirmDelete: "¿Eliminar este escaneo?", confirmDeleteAll: "¿Borrar todo el historial?"
    },
    settings: { title: "Ajustes", subtitle: "Personaliza tu experiencia", language: "Idioma",
      languageDesc: "Elige tu idioma preferido", clear: "Borrar Datos", clearDesc: "Eliminar todos los escaneos",
      privacy: "Privacidad", privacyDesc: "Cómo manejamos tus datos", about: "Acerca de",
      version: "Versión 3.0", madeWith: "Hecho con ♥"
    },
    guide: { title: "Cómo Usar", subtitle: "Comienza en 3 pasos",
      s1: "Capturar", s1d: "Apunta tu cámara al empaque del medicamento.",
      s2: "Analizar", s2d: "La app identificará el medicamento.",
      s3: "Aprender", s3d: "Obtén información detallada.", tip: "Consejo", tipText: "Asegúrate de tener buena iluminación."
    },
    privacy: { title: "Privacidad", subtitle: "Tu privacidad nos importa",
      t1: "Recolección de Datos", d1: "Las imágenes se procesan en tiempo real.",
      t2: "Almacenamiento Local", d2: "Tu historial se guarda solo en tu dispositivo.",
      t3: "Acceso a Cámara", d3: "Solo usamos la cámara para escanear.",
      t4: "Aviso Médico", d4: "CocoMed es una herramienta educativa."
    },
    errors: { notMedicine: "Esto no parece ser un medicamento.", scanFailed: "Escaneo fallido.",
      networkError: "Error de red.", generic: "Algo salió mal."
    }
  },
  zh: {
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" },
    home: { greeting: "欢迎使用", title: "CocoMed", subtitle: "您的个人药物助手",
      scan: "点击扫描", scanDesc: "使用相机扫描药物", upload: "从相册上传", uploadDesc: "选择现有照片",
      analyzing: "正在分析药物", analyzeDesc: "正在处理您的图片...", recent: "最近扫描", empty: "暂无扫描",
      emptyDesc: "扫描您的第一个药物", disclaimer: "⚠️ 仅供教育用途。", scanCount: "次扫描完成"
    },
    result: { back: "返回", purpose: "用途", howTo: "服用方法", effects: "可能的副作用",
      warnings: "重要警告", storage: "储存说明", interactions: "药物相互作用",
      disclaimer: "此信息仅供教育参考。", translating: "正在翻译...", share: "分享"
    },
    history: { title: "扫描历史", subtitle: "您的药物库", search: "按名称搜索...", searchButton: "搜索",
      empty: "未找到药物", emptyDesc: "尝试其他搜索词", noHistory: "暂无历史", noHistoryDesc: "扫描的药物将显示在这里",
      export: "导出", deleteAll: "清除全部", newest: "最新", oldest: "最旧", alphabetical: "字母",
      confirmDelete: "删除此扫描？", confirmDeleteAll: "清除所有历史？"
    },
    settings: { title: "设置", subtitle: "自定义您的体验", language: "语言", languageDesc: "选择您的首选语言",
      clear: "清除数据", clearDesc: "删除所有扫描", privacy: "隐私政策", privacyDesc: "我们如何处理您的数据",
      about: "关于", version: "版本 3.0", madeWith: "用 ♥ 制作"
    },
    guide: { title: "使用方法", subtitle: "3步开始", s1: "拍摄", s1d: "将相机对准药品包装。",
      s2: "分析", s2d: "应用程序将识别药物。", s3: "学习", s3d: "获取详细信息。",
      tip: "提示", tipText: "确保光线充足。"
    },
    privacy: { title: "隐私政策", subtitle: "我们重视您的隐私", t1: "数据收集", d1: "图像实时处理。",
      t2: "本地存储", d2: "历史仅存储在您的设备上。", t3: "相机访问", d3: "仅用于扫描药物。",
      t4: "医疗声明", d4: "CocoMed是教育工具。"
    },
    errors: { notMedicine: "这似乎不是药物。", scanFailed: "扫描失败。", networkError: "网络错误。", generic: "出错了。" }
  },
  hi: {
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" },
    home: { greeting: "स्वागत है", title: "CocoMed", subtitle: "आपका व्यक्तिगत दवा सहायक",
      scan: "स्कैन करने के लिए टैप करें", scanDesc: "दवा स्कैन करने के लिए कैमरा उपयोग करें",
      upload: "गैलरी से अपलोड करें", uploadDesc: "मौजूदा फोटो चुनें", analyzing: "दवा का विश्लेषण",
      analyzeDesc: "आपकी छवि संसाधित हो रही है...", recent: "हाल के स्कैन", empty: "कोई स्कैन नहीं",
      emptyDesc: "अपनी पहली दवा स्कैन करें", disclaimer: "⚠️ केवल शैक्षिक उद्देश्यों के लिए।", scanCount: "स्कैन पूर्ण"
    },
    result: { back: "वापस", purpose: "उद्देश्य", howTo: "कैसे लें", effects: "संभावित दुष्प्रभाव",
      warnings: "महत्वपूर्ण चेतावनी", storage: "भंडारण निर्देश", interactions: "दवा इंटरैक्शन",
      disclaimer: "यह जानकारी केवल शैक्षिक है।", translating: "अनुवाद हो रहा है...", share: "साझा करें"
    },
    history: { title: "स्कैन इतिहास", subtitle: "आपकी दवा लाइब्रेरी", search: "नाम से खोजें...",
      searchButton: "खोजें", empty: "कोई दवा नहीं मिली", emptyDesc: "दूसरा शब्द आज़माएं",
      noHistory: "कोई इतिहास नहीं", noHistoryDesc: "स्कैन की गई दवाएं यहां दिखाई देंगी",
      export: "निर्यात", deleteAll: "सब हटाएं", newest: "नवीनतम", oldest: "पुराना", alphabetical: "A-Z",
      confirmDelete: "इस स्कैन को हटाएं?", confirmDeleteAll: "सारा इतिहास साफ़ करें?"
    },
    settings: { title: "सेटिंग्स", subtitle: "अपना अनुभव अनुकूलित करें", language: "भाषा",
      languageDesc: "अपनी पसंदीदा भाषा चुनें", clear: "डेटा साफ़ करें", clearDesc: "सभी स्कैन हटाएं",
      privacy: "गोपनीयता", privacyDesc: "हम आपके डेटा को कैसे संभालते हैं", about: "जानकारी",
      version: "संस्करण 3.0", madeWith: "♥ से बनाया"
    },
    guide: { title: "उपयोग कैसे करें", subtitle: "3 आसान चरणों में शुरू करें",
      s1: "कैप्चर", s1d: "दवा पैकेजिंग पर कैमरा इंगित करें।", s2: "विश्लेषण", s2d: "ऐप दवा की पहचान करेगा।",
      s3: "सीखें", s3d: "विस्तृत जानकारी प्राप्त करें।", tip: "सुझाव", tipText: "अच्छी रोशनी सुनिश्चित करें।"
    },
    privacy: { title: "गोपनीयता नीति", subtitle: "आपकी गोपनीयता हमारे लिए महत्वपूर्ण है",
      t1: "डेटा संग्रह", d1: "छवियां रीयल-टाइम में संसाधित होती हैं।",
      t2: "स्थानीय भंडारण", d2: "इतिहास केवल आपके डिवाइस पर संग्रहीत है।",
      t3: "कैमरा एक्सेस", d3: "केवल दवा स्कैनिंग के लिए।", t4: "चिकित्सा अस्वीकरण", d4: "CocoMed एक शैक्षिक उपकरण है।"
    },
    errors: { notMedicine: "यह दवा नहीं लगती।", scanFailed: "स्कैन विफल।", networkError: "नेटवर्क त्रुटि।", generic: "कुछ गलत हुआ।" }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { greeting: "வரவேற்கிறோம்", title: "CocoMed", subtitle: "உங்கள் மருந்து உதவியாளர்",
      scan: "ஸ்கேன் செய்ய தட்டவும்", scanDesc: "மருந்தை ஸ்கேன் செய்ய கேமராவைப் பயன்படுத்தவும்",
      upload: "கேலரியில் இருந்து பதிவேற்றவும்", uploadDesc: "ஏற்கனவே உள்ள புகைப்படத்தைத் தேர்வு செய்யவும்",
      analyzing: "மருந்தை பகுப்பாய்வு செய்கிறது", analyzeDesc: "உங்கள் படத்தை செயலாக்குகிறது...",
      recent: "சமீபத்திய ஸ்கேன்கள்", empty: "ஸ்கேன்கள் இல்லை", emptyDesc: "உங்கள் முதல் மருந்தை ஸ்கேன் செய்யுங்கள்",
      disclaimer: "⚠️ கல்வி நோக்கங்களுக்கு மட்டுமே.", scanCount: "ஸ்கேன்கள் முடிந்தன"
    },
    result: { back: "திரும்பு", purpose: "நோக்கம்", howTo: "எப்படி எடுப்பது", effects: "சாத்தியமான பக்க விளைவுகள்",
      warnings: "முக்கிய எச்சரிக்கைகள்", storage: "சேமிப்பு வழிமுறைகள்", interactions: "மருந்து தொடர்புகள்",
      disclaimer: "இந்த தகவல் கல்விக்காக மட்டுமே.", translating: "மொழிபெயர்க்கிறது...", share: "பகிர்"
    },
    history: { title: "ஸ்கேன் வரலாறு", subtitle: "உங்கள் மருந்து நூலகம்", search: "பெயரால் தேடு...",
      searchButton: "தேடு", empty: "மருந்துகள் இல்லை", emptyDesc: "வேறு சொல்லை முயற்சிக்கவும்",
      noHistory: "வரலாறு இல்லை", noHistoryDesc: "ஸ்கேன் செய்த மருந்துகள் இங்கே தோன்றும்",
      export: "ஏற்றுமதி", deleteAll: "அனைத்தையும் அழி", newest: "புதியது", oldest: "பழையது", alphabetical: "A-Z",
      confirmDelete: "இந்த ஸ்கேனை நீக்கவா?", confirmDeleteAll: "அனைத்து வரலாற்றையும் அழிக்கவா?"
    },
    settings: { title: "அமைப்புகள்", subtitle: "உங்கள் அனுபவத்தைத் தனிப்பயனாக்கு", language: "மொழி",
      languageDesc: "உங்கள் விருப்பமான மொழியைத் தேர்வு செய்யவும்", clear: "தரவை அழி",
      clearDesc: "அனைத்து ஸ்கேன்களையும் அகற்று", privacy: "தனியுரிமை", privacyDesc: "உங்கள் தரவை எவ்வாறு கையாளுகிறோம்",
      about: "பற்றி", version: "பதிப்பு 3.0", madeWith: "♥ உடன் உருவாக்கப்பட்டது"
    },
    guide: { title: "பயன்படுத்துவது எப்படி", subtitle: "3 எளிய படிகளில் தொடங்குங்கள்",
      s1: "பிடிப்பு", s1d: "மருந்து பேக்கேஜிங்கில் கேமராவை சுட்டிக்காட்டவும்.",
      s2: "பகுப்பாய்வு", s2d: "ஆப்ஸ் மருந்தை அடையாளம் காணும்.", s3: "கற்றுக்கொள்", s3d: "விரிவான தகவல்களைப் பெறுங்கள்.",
      tip: "குறிப்பு", tipText: "நல்ல வெளிச்சத்தை உறுதி செய்யுங்கள்."
    },
    privacy: { title: "தனியுரிமை கொள்கை", subtitle: "உங்கள் தனியுரிமை எங்களுக்கு முக்கியம்",
      t1: "தரவு சேகரிப்பு", d1: "படங்கள் நிகழ்நேரத்தில் செயலாக்கப்படுகின்றன.",
      t2: "உள்ளூர் சேமிப்பு", d2: "வரலாறு உங்கள் சாதனத்தில் மட்டுமே சேமிக்கப்படும்.",
      t3: "கேமரா அணுகல்", d3: "மருந்து ஸ்கேனிங்கிற்கு மட்டுமே.",
      t4: "மருத்துவ மறுப்பு", d4: "CocoMed ஒரு கல்விக் கருவி."
    },
    errors: { notMedicine: "இது மருந்து போல் தெரியவில்லை.", scanFailed: "ஸ்கேன் தோல்வி.", networkError: "நெட்வொர்க் பிழை.", generic: "ஏதோ தவறு நடந்தது." }
  }
};

const t = (lang, key) => {
  const keys = key.split('.');
  let result = UI_STRINGS[lang];
  for (const k of keys) { result = result?.[k]; if (result === undefined) break; }
  if (result === undefined) { result = UI_STRINGS.en; for (const k of keys) { result = result?.[k]; if (result === undefined) return key; } }
  return result || key;
};

// ============================================================================
// COMPONENTS
// ============================================================================
const Card = ({ children, className = "", onClick, hover = true, variant = "default" }) => {
  const variants = {
    default: "bg-white border-slate-200 shadow-sm",
    elevated: "bg-white border-slate-200 shadow-md",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
    success: "bg-emerald-50 border-emerald-200",
  };
  return (
    <div onClick={onClick} className={`border rounded-2xl transition-all duration-200 ${variants[variant]} ${hover && onClick ? 'hover:shadow-lg hover:border-slate-300 active:scale-[0.99] cursor-pointer' : ''} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// MAIN APPLICATION
// ============================================================================
export default function MedScanApp() {
  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    try {
      const savedLang = window.localStorage?.getItem('cocomed_lang');
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setLang(savedLang);
      const savedHistory = window.localStorage?.getItem('cocomed_history');
      if (savedHistory) { const parsed = JSON.parse(savedHistory); if (Array.isArray(parsed)) setHistory(parsed); }
    } catch (e) {}
  }, []);

  useEffect(() => { try { window.localStorage?.setItem('cocomed_lang', lang); } catch(e){} }, [lang]);
  useEffect(() => { try { window.localStorage?.setItem('cocomed_history', JSON.stringify(history)); } catch(e){} }, [history]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [screen]);

  useEffect(() => {
    const translateIfNeeded = async () => {
      if (screen === 'result' && scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) {
        await reAnalyzeForLanguage(scanResult);
      }
    };
    translateIfNeeded();
  }, [lang, screen, scanResult]);

  const navigateTo = useCallback((newScreen, fromScreen = null) => {
    if (fromScreen) setPreviousScreen(fromScreen);
    else if (screen !== 'result') setPreviousScreen(screen);
    setScreen(newScreen);
    setError(null);
  }, [screen]);

  const goBack = useCallback(() => {
    if (screen === 'result') {
      setScreen(previousScreen || 'home');
    } else if (screen === 'privacy') {
      setScreen('settings');
    } else {
      setScreen('home');
    }
    setError(null);
  }, [screen, previousScreen]);

  const callGeminiAPI = async (payload) => {
    const apiKey = getApiKey();
    if (apiKey && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: payload }] }) }
      );
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return response.json();
    }
    const response = await fetch(`${CONFIG.API_URL}/api/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: payload[0].text, image: payload[1]?.inlineData?.data })
    });
    if (!response.ok) throw new Error(response.status === 429 ? 'Rate limited. Please try again.' : `Server Error`);
    return response.json();
  };

  const createPrompt = (targetLang) => `You are a pharmacist assistant. Analyze this medication image.
STEP 1: If NOT a medication, respond: {"error": "NOT_MEDICINE"}
STEP 2: If it IS medication, extract information in ${LANGUAGE_NAMES[targetLang]}.
Return JSON only: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [], "storage": "...", "interactions": [] }
Use simple patient-friendly language.`;

  const handleScan = async (file) => {
    if (!file || loading) return;
    setLoading(true);
    setError(null);
    try {
      const compressed = await compressImage(file);
      const base64 = compressed.split(',')[1];
      const response = await callGeminiAPI([{ text: createPrompt(lang) }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(t(lang, 'errors.scanFailed'));
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(t(lang, 'errors.scanFailed'));
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error === "NOT_MEDICINE") throw new Error(t(lang, 'errors.notMedicine'));
      const sanitized = sanitizeMedicationData(parsed);
      const newScan = { ...sanitized, id: generateId(), date: new Date().toISOString(), img: compressed, languageCode: lang };
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      navigateTo('result', 'home');
    } catch (err) {
      setError(err.message || t(lang, 'errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  const reAnalyzeForLanguage = async (currentScan) => {
    if (!currentScan?.img || isTranslating) return;
    setIsTranslating(true);
    try {
      const base64 = currentScan.img.split(',')[1];
      const response = await callGeminiAPI([{ text: createPrompt(lang) }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      const jsonMatch = text?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (!parsed.error) {
          const sanitized = sanitizeMedicationData(parsed);
          const updated = { ...currentScan, ...sanitized, languageCode: lang };
          setScanResult(updated);
          setHistory(prev => prev.map(item => item.id === currentScan.id ? updated : item));
        }
      }
    } catch (err) {} finally { setIsTranslating(false); }
  };

  const executeSearch = useCallback(() => {
    setSearchQuery(searchInput.trim());
  }, [searchInput]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') executeSearch();
  };

  const clearSearch = () => { setSearchInput(''); setSearchQuery(''); };

  const filteredHistory = useMemo(() => {
    let results = [...history];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item =>
        (item.brandName || '').toLowerCase().includes(query) ||
        (item.genericName || '').toLowerCase().includes(query) ||
        (item.manufacturer || '').toLowerCase().includes(query) ||
        (item.purpose || '').toLowerCase().includes(query)
      );
    }
    results.sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'alphabetical') return (a.brandName || '').localeCompare(b.brandName || '');
      return new Date(b.date) - new Date(a.date);
    });
    return results;
  }, [history, searchQuery, sortOrder]);

  const exportHistory = useCallback(() => {
    const text = history.map(item => `${item.brandName} (${item.genericName}) - ${item.strength}\nManufacturer: ${item.manufacturer}\nScanned: ${new Date(item.date).toLocaleDateString()}`).join('\n\n');
    if (navigator.share) navigator.share({ title: 'My CocoMed Medication List', text }).catch(() => {});
    else if (navigator.clipboard) { navigator.clipboard.writeText(text); alert('Medication list copied to clipboard!'); }
  }, [history]);

  const deleteScan = useCallback((id) => {
    if (window.confirm(t(lang, 'history.confirmDelete'))) setHistory(prev => prev.filter(item => item.id !== id));
  }, [lang]);

  const clearAllHistory = useCallback(() => {
    if (window.confirm(t(lang, 'history.confirmDeleteAll'))) { setHistory([]); try { window.localStorage?.removeItem('cocomed_history'); } catch(e){} }
  }, [lang]);

  // ========== SCREENS ==========

  const HomeScreen = () => (
    <div className="px-6 py-8 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-emerald-600 text-sm font-medium">{t(lang, 'home.greeting')}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">{t(lang, 'home.title')}</h1>
          <p className="text-slate-500 text-lg mt-1">{t(lang, 'home.subtitle')}</p>
          {history.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 font-semibold">{history.length}</span>
              <span className="text-emerald-600 text-sm">{t(lang, 'home.scanCount')}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <Card 
              onClick={() => !loading && cameraRef.current?.click()}
              className={`p-8 min-h-[320px] flex flex-col items-center justify-center ${loading ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-violet-50' : 'border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-400'}`}
              variant="default"
            >
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} 
                onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              
              {loading ? (
                <DNALoadingAnimation />
              ) : (
                <>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30">
                    <Camera size={40} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{t(lang, 'home.scan')}</h3>
                  <p className="text-slate-500 text-sm text-center mt-1 max-w-[200px]">{t(lang, 'home.scanDesc')}</p>
                </>
              )}
            </Card>

            <Card onClick={() => !loading && fileRef.current?.click()} className="p-4 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-white hover:from-emerald-100" variant="elevated">
              <input type="file" accept="image/*" className="hidden" ref={fileRef} 
                onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Image className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-slate-800">{t(lang, 'home.upload')}</h4>
                <p className="text-slate-500 text-sm">{t(lang, 'home.uploadDesc')}</p>
              </div>
              <ChevronRight className="text-emerald-400" size={20} />
            </Card>

            {error && (
              <Card className="p-4" variant="danger" hover={false}>
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X size={18} /></button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <Card className="p-5" variant="warning" hover={false}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Shield className="text-amber-600" size={24} /></div>
                <p className="text-amber-800 text-sm leading-relaxed">{t(lang, 'home.disclaimer')}</p>
              </div>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-700 font-semibold flex items-center gap-2"><Clock size={18} className="text-slate-400" />{t(lang, 'home.recent')}</h3>
                {history.length > 0 && (
                  <button onClick={() => navigateTo('history')} className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1">
                    View All <ChevronRight size={16} />
                  </button>
                )}
              </div>
              
              {history.length === 0 ? (
                <Card className="p-10 text-center" hover={false}>
                  <Sparkles className="mx-auto mb-4 text-slate-300" size={36} />
                  <h4 className="text-slate-600 font-medium">{t(lang, 'home.empty')}</h4>
                  <p className="text-slate-400 text-sm mt-1">{t(lang, 'home.emptyDesc')}</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.slice(0, 4).map((item) => (
                    <Card key={item.id} className="p-4" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'home'); }}>
                      <div className="flex items-center gap-3">
                        <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-emerald-600 font-medium">{new Date(item.date).toLocaleDateString()}</p>
                          <h4 className="text-slate-800 font-semibold truncate">{item.brandName}</h4>
                          <p className="text-slate-500 text-sm truncate">{item.genericName}</p>
                        </div>
                        <ChevronRight className="text-slate-300 shrink-0" size={18} />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ResultScreen = () => {
    if (!scanResult) return null;
    return (
      <div className="px-6 py-8 md:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium shadow-sm">
              <ArrowLeft size={18} /> {t(lang, 'result.back')}
            </button>
            <button onClick={() => navigator.share?.({ title: scanResult.brandName, text: `${scanResult.brandName} - ${scanResult.purpose}` })} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm">
              <Share2 size={18} />
            </button>
          </div>

          <Card className="p-6 mb-6" variant="elevated" hover={false}>
            <div className="flex flex-col sm:flex-row gap-5">
              <img src={scanResult.img} className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover bg-slate-100 border border-slate-200" alt="" />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{scanResult.dosageForm}</span>
                  {scanResult.strength !== 'N/A' && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{scanResult.strength}</span>}
                </div>
                <h1 className="text-3xl font-bold text-slate-800">{scanResult.brandName}</h1>
                <p className="text-slate-500 text-lg mt-1">{scanResult.genericName}</p>
                {scanResult.manufacturer !== 'N/A' && <p className="text-slate-400 text-sm mt-2 flex items-center gap-1"><MapPin size={14} /> {scanResult.manufacturer}</p>}
              </div>
            </div>
            {isTranslating && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700">
                <RefreshCw size={16} className="animate-spin" /><span className="text-sm font-medium">{t(lang, 'result.translating')}</span>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            {scanResult.purpose !== 'N/A' && (
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Heart className="text-emerald-600" size={20} /></div>
                  <div><h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.purpose')}</h4><p className="text-slate-700">{scanResult.purpose}</p></div>
                </div>
              </Card>
            )}
            {scanResult.howToTake !== 'N/A' && (
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Clock className="text-blue-600" size={20} /></div>
                  <div><h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.howTo')}</h4><p className="text-slate-700">{scanResult.howToTake}</p></div>
                </div>
              </Card>
            )}
            {scanResult.storage !== 'N/A' && (
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-violet-100 flex items-center justify-center shrink-0"><Layers className="text-violet-600" size={20} /></div>
                  <div><h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.storage')}</h4><p className="text-slate-700">{scanResult.storage}</p></div>
                </div>
              </Card>
            )}
            {scanResult.sideEffects?.length > 0 && (
              <Card className="p-5" variant="warning" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-200 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-700" size={20} /></div>
                  <div className="flex-1"><h4 className="text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">{t(lang, 'result.effects')}</h4>
                    <ul className="space-y-1">{scanResult.sideEffects.map((e, i) => <li key={i} className="text-amber-900 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />{e}</li>)}</ul>
                  </div>
                </div>
              </Card>
            )}
            {scanResult.warnings?.length > 0 && (
              <Card className="p-5" variant="danger" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-red-200 flex items-center justify-center shrink-0"><ShieldCheck className="text-red-700" size={20} /></div>
                  <div className="flex-1"><h4 className="text-red-700 text-xs font-semibold uppercase tracking-wide mb-2">{t(lang, 'result.warnings')}</h4>
                    <ul className="space-y-1">{scanResult.warnings.map((w, i) => <li key={i} className="text-red-900 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />{w}</li>)}</ul>
                  </div>
                </div>
              </Card>
            )}
            {scanResult.interactions?.length > 0 && (
              <Card className="p-5" hover={false}>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-pink-100 flex items-center justify-center shrink-0"><Zap className="text-pink-600" size={20} /></div>
                  <div className="flex-1"><h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">{t(lang, 'result.interactions')}</h4>
                    <ul className="space-y-1">{scanResult.interactions.map((int, idx) => <li key={idx} className="text-slate-700 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-2 shrink-0" />{int}</li>)}</ul>
                  </div>
                </div>
              </Card>
            )}
          </div>
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center"><p className="text-slate-500 text-sm">{t(lang, 'result.disclaimer')}</p></div>
        </div>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="px-6 py-8 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div><h1 className="text-3xl font-bold text-slate-800">{t(lang, 'history.title')}</h1><p className="text-slate-500 mt-1">{t(lang, 'history.subtitle')}</p></div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <button onClick={exportHistory} className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium text-sm flex items-center gap-2 shadow-sm"><Upload size={16} /> {t(lang, 'history.export')}</button>
              <button onClick={clearAllHistory} className="px-4 py-2 rounded-xl bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-medium text-sm flex items-center gap-2"><Trash2 size={16} /> {t(lang, 'history.deleteAll')}</button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-16 text-center" hover={false}>
            <History className="mx-auto mb-4 text-slate-300" size={48} />
            <h3 className="text-slate-700 font-semibold text-xl mb-2">{t(lang, 'history.noHistory')}</h3>
            <p className="text-slate-500 mb-6">{t(lang, 'history.noHistoryDesc')}</p>
            <button onClick={() => navigateTo('home')} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors">Scan Your First Medicine</button>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Card className="flex-1 p-1" hover={false}>
                <div className="flex items-center gap-2 px-3">
                  <Search className="text-slate-400 shrink-0" size={20} />
                  <input type="text" placeholder={t(lang, 'history.search')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearchKeyDown} className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-2.5" />
                  {searchInput && <button onClick={clearSearch} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>}
                </div>
              </Card>
              <button onClick={executeSearch} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2 shadow-sm transition-colors"><Search size={18} /> {t(lang, 'history.searchButton')}</button>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium cursor-pointer">
                <option value="newest">{t(lang, 'history.newest')}</option>
                <option value="oldest">{t(lang, 'history.oldest')}</option>
                <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <Card className="p-12 text-center" hover={false}>
                <Search className="mx-auto mb-4 text-slate-300" size={40} />
                <h3 className="text-slate-600 font-medium text-lg">{t(lang, 'history.empty')}</h3>
                <p className="text-slate-400 mt-1">{t(lang, 'history.emptyDesc')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="p-4 group" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'history'); }}>
                    <div className="flex items-center gap-3">
                      <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-slate-800 font-semibold truncate">{item.brandName}</h4>
                        <p className="text-slate-500 text-sm truncate">{item.genericName}</p>
                        <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1"><Calendar size={12} /> {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }} className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const GuideScreen = () => (
    <div className="px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t(lang, 'guide.title')}</h1>
        <p className="text-slate-500 mb-8">{t(lang, 'guide.subtitle')}</p>
        <div className="space-y-4">
          {[
            { icon: Scan, color: 'emerald', num: '01', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') },
            { icon: Eye, color: 'violet', num: '02', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') },
            { icon: BookOpen, color: 'amber', num: '03', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') },
          ].map((step, i) => (
            <Card key={i} className="p-5" hover={false}>
              <div className="flex items-start gap-5">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${step.color === 'emerald' ? 'bg-emerald-100' : step.color === 'violet' ? 'bg-violet-100' : 'bg-amber-100'}`}>
                  <step.icon className={step.color === 'emerald' ? 'text-emerald-600' : step.color === 'violet' ? 'text-violet-600' : 'text-amber-600'} size={26} />
                </div>
                <div><span className="text-slate-300 text-xs font-mono font-bold">{step.num}</span><h3 className="text-slate-800 text-lg font-semibold">{step.title}</h3><p className="text-slate-500 mt-1 leading-relaxed">{step.desc}</p></div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-6 p-5" variant="success" hover={false}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-200 flex items-center justify-center shrink-0"><Star className="text-emerald-700" size={20} /></div>
            <div><h4 className="text-emerald-800 font-semibold">{t(lang, 'guide.tip')}</h4><p className="text-emerald-700 mt-1">{t(lang, 'guide.tipText')}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t(lang, 'settings.title')}</h1>
        <p className="text-slate-500 mb-8">{t(lang, 'settings.subtitle')}</p>
        <Card className="overflow-hidden mb-6" hover={false}>
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50"><Globe className="text-emerald-600" size={20} /><div><span className="text-slate-800 font-semibold">{t(lang, 'settings.language')}</span><p className="text-slate-500 text-sm">{t(lang, 'settings.languageDesc')}</p></div></div>
          <div className="p-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-3 rounded-xl flex items-center justify-between transition-all mb-1 ${lang === l.code ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3"><span className="text-xl">{l.flag}</span><span className="font-medium">{l.nativeName}</span></div>
                {lang === l.code && <CheckCircle2 size={20} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-3">
          <Card className="p-4" onClick={() => navigateTo('privacy')}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center"><Lock className="text-slate-500" size={20} /></div>
              <div className="flex-1"><span className="text-slate-800 font-semibold">{t(lang, 'settings.privacy')}</span><p className="text-slate-500 text-sm">{t(lang, 'settings.privacyDesc')}</p></div>
              <ChevronRight className="text-slate-400" size={20} />
            </div>
          </Card>
          <Card className="p-4" variant="danger" onClick={clearAllHistory}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="text-red-500" size={20} /></div>
              <div className="flex-1"><span className="text-red-700 font-semibold">{t(lang, 'settings.clear')}</span><p className="text-red-500 text-sm">{t(lang, 'settings.clearDesc')}</p></div>
            </div>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg"><Pill className="text-white" size={28} /></div>
          <h3 className="text-slate-800 font-semibold text-lg">{t(lang, 'settings.about')}</h3>
          <p className="text-slate-500 mt-1">{t(lang, 'settings.version')}</p>
          <p className="text-slate-400 text-sm mt-3">{t(lang, 'settings.madeWith')}</p>
        </div>
      </div>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="px-6 py-8 md:px-12">
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium mb-8 shadow-sm"><ArrowLeft size={18} /> {t(lang, 'settings.title')}</button>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">{t(lang, 'privacy.title')}</h1>
        <p className="text-slate-500 mb-8">{t(lang, 'privacy.subtitle')}</p>
        <Card className="p-6" hover={false}>
          <div className="space-y-8">
            {[{ icon: Eye, color: 'emerald' }, { icon: Fingerprint, color: 'violet' }, { icon: Camera, color: 'blue' }, { icon: Shield, color: 'amber' }].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${item.color === 'emerald' ? 'bg-emerald-100' : item.color === 'violet' ? 'bg-violet-100' : item.color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  <item.icon className={item.color === 'emerald' ? 'text-emerald-600' : item.color === 'violet' ? 'text-violet-600' : item.color === 'blue' ? 'text-blue-600' : 'text-amber-600'} size={20} />
                </div>
                <div><h3 className="text-slate-800 font-semibold mb-1">{t(lang, `privacy.t${i + 1}`)}</h3><p className="text-slate-500 leading-relaxed">{t(lang, `privacy.d${i + 1}`)}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 p-5 bg-white border-r border-slate-200">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center shadow"><Pill className="text-white" size={22} /></div>
        <div><h1 className="text-slate-800 font-bold text-lg">CocoMed</h1><p className="text-slate-400 text-xs">Medicine Scanner</p></div>
      </div>
      <nav className="space-y-1 flex-1">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <item.icon size={20} /><span>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{history.length}</span>}
            </button>
          );
        })}
      </nav>
      <div className="pt-4 border-t border-slate-200 text-center"><p className="text-slate-400 text-xs">Educational Use Only</p></div>
    </div>
  );

  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 pb-5 bg-white border-t border-slate-200">
      <div className="flex justify-around max-w-md mx-auto">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`relative flex flex-col items-center py-2 px-4 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">{history.length > 9 ? '9+' : history.length}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50">
        <div className="flex">
          <DesktopNav />
          <main ref={mainRef} className="flex-1 min-h-screen pb-28 lg:pb-8">
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
