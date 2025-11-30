import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Pill, Home, Globe, Sparkles, 
  ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, 
  ChevronRight, ArrowLeft, Search, Heart, Clock, MapPin, Upload, Scan,
  Zap, Shield, Eye, Star, Layers, Fingerprint, Image
} from 'lucide-react';

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-emerald-50 to-teal-50">
          <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertOctagon size={40} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Something went wrong</h2>
            <p className="text-slate-500 mb-8">The application encountered an error.</p>
            <button onClick={() => window.location.reload()} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold">Restart MedScan AI</button>
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
    const width = canvas.width = 280;
    const height = canvas.height = 280;
    let time = 0;
    
    const particles = [];
    for (let i = 0; i < 40; i++) {
      particles.push({ x: Math.random() * width, y: Math.random() * height, size: Math.random() * 2.5 + 0.5, speedX: (Math.random() - 0.5) * 1.5, speedY: (Math.random() - 0.5) * 1.5, opacity: Math.random() * 0.4 + 0.1 });
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 253, 244, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.x += p.speedX; p.y += p.speedY;
        if (p.x < 0 || p.x > width) p.speedX *= -1;
        if (p.y < 0 || p.y > height) p.speedY *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${p.opacity})`;
        ctx.fill();
      });
      
      const centerX = width / 2, centerY = height / 2, helixRadius = 55, helixHeight = 180, numPoints = 28;
      
      for (let i = 0; i < numPoints; i++) {
        const t = (i / numPoints) * Math.PI * 4 + time;
        const y = (i / numPoints) * helixHeight - helixHeight / 2 + centerY;
        const x1 = centerX + Math.sin(t) * helixRadius, z1 = Math.cos(t);
        const x2 = centerX + Math.sin(t + Math.PI) * helixRadius, z2 = Math.cos(t + Math.PI);
        const size1 = 3.5 + z1 * 1.5, size2 = 3.5 + z2 * 1.5;
        
        const gradient1 = ctx.createRadialGradient(x1, y, 0, x1, y, size1 * 2.5);
        gradient1.addColorStop(0, `rgba(16, 185, 129, ${0.9 + z1 * 0.1})`);
        gradient1.addColorStop(0.6, `rgba(5, 150, 105, ${0.3 + z1 * 0.2})`);
        gradient1.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.beginPath(); ctx.arc(x1, y, size1 * 2, 0, Math.PI * 2); ctx.fillStyle = gradient1; ctx.fill();
        ctx.beginPath(); ctx.arc(x1, y, size1, 0, Math.PI * 2); ctx.fillStyle = `rgba(16, 185, 129, ${0.95 + z1 * 0.05})`; ctx.fill();
        
        const gradient2 = ctx.createRadialGradient(x2, y, 0, x2, y, size2 * 2.5);
        gradient2.addColorStop(0, `rgba(139, 92, 246, ${0.9 + z2 * 0.1})`);
        gradient2.addColorStop(0.6, `rgba(124, 58, 237, ${0.3 + z2 * 0.2})`);
        gradient2.addColorStop(1, 'rgba(139, 92, 246, 0)');
        ctx.beginPath(); ctx.arc(x2, y, size2 * 2, 0, Math.PI * 2); ctx.fillStyle = gradient2; ctx.fill();
        ctx.beginPath(); ctx.arc(x2, y, size2, 0, Math.PI * 2); ctx.fillStyle = `rgba(139, 92, 246, ${0.95 + z2 * 0.05})`; ctx.fill();
        
        if (i % 3 === 0 && z1 > -0.2) {
          ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.25 + (z1 + z2) * 0.12})`; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc((x1 + x2) / 2, y, 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(99, 102, 241, 0.7)'; ctx.fill();
        }
      }
      
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)'; ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(centerX, centerY, 70 + i * 18, 25 + i * 7, time * 0.4 + i * 0.5, 0, Math.PI * 2); ctx.stroke(); }
      
      const scanY = ((time * 40) % (height + 30)) - 15;
      const scanGradient = ctx.createLinearGradient(0, scanY - 15, 0, scanY + 15);
      scanGradient.addColorStop(0, 'rgba(16, 185, 129, 0)');
      scanGradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
      scanGradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = scanGradient; ctx.fillRect(0, scanY - 15, width, 30);
      
      time += 0.025;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, []);
  
  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-emerald-400/20 via-violet-400/20 to-emerald-400/20 animate-pulse blur-xl" />
      <div className="relative">
        <canvas ref={canvasRef} className="rounded-full" style={{ background: 'radial-gradient(circle, rgba(240,253,244,1) 0%, rgba(236,253,245,1) 100%)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent" style={{ background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #10b981, #8b5cf6, #10b981) border-box', animation: 'spin 3s linear infinite' }} />
      </div>
      <div className="mt-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">Analyzing Medicine</h3>
        <p className="text-slate-500 text-xs mt-1">AI-powered molecular analysis...</p>
      </div>
      <div className="mt-4 flex gap-2">
        {['Scanning', 'Processing', 'Analyzing'].map((step, i) => (
          <div key={step} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 shadow-sm">
            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-violet-500' : 'bg-indigo-500'} animate-pulse`} />
            <span className="text-[10px] font-medium text-slate-600">{step}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ============================================================================
// CONFIGURATION
// ============================================================================
const CONFIG = { API_URL: "https://cocomed.vercel.app", MAX_IMAGE_SIZE: 1024, COMPRESSION_QUALITY: 0.75 };

const getApiKey = () => { try { if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY; } catch (e) {} return ""; };

const compressImage = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (e) => {
    const img = new window.Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(CONFIG.MAX_IMAGE_SIZE / Math.max(img.width, img.height), 1);
      canvas.width = img.width * scale; canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', CONFIG.COMPRESSION_QUALITY));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
  };
  reader.onerror = () => reject(new Error('Failed to read file'));
});

const sanitizeMedicationData = (data) => {
  if (!data || typeof data !== 'object') return null;
  const safeStr = (v, fallback = "N/A") => (typeof v === 'string' && v.trim()) ? v.trim() : (typeof v === 'number') ? String(v) : fallback;
  const safeArr = (a) => Array.isArray(a) ? a.map(i => typeof i === 'string' ? i.trim() : String(i)).filter(Boolean) : [];
  return { brandName: safeStr(data.brandName), genericName: safeStr(data.genericName), manufacturer: safeStr(data.manufacturer), dosageForm: safeStr(data.dosageForm), strength: safeStr(data.strength), purpose: safeStr(data.purpose), howToTake: safeStr(data.howToTake), sideEffects: safeArr(data.sideEffects), warnings: safeArr(data.warnings), storage: safeStr(data.storage, "Store at room temperature away from moisture and heat."), interactions: safeArr(data.interactions || data.drugInteractions) };
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
    home: { greeting: "Welcome to", title: "MedScan AI", subtitle: "Your Personal Medicine Assistant", scan: "Tap to Scan", scanDesc: "Camera or Gallery", analyzing: "Analyzing Medicine", analyzeDesc: "Processing...", recent: "Recent Scans", empty: "No scans yet", emptyDesc: "Scan your first medicine", disclaimer: "⚠️ Educational purposes only. Not medical advice. Always consult a healthcare professional.", scanCount: "scans completed", camera: "Take Photo", gallery: "Choose from Gallery", cancel: "Cancel" },
    result: { back: "Back", purpose: "What It's For", howTo: "How to Take", effects: "Side Effects", warnings: "Warnings", storage: "Storage", interactions: "Interactions", disclaimer: "Educational purposes only. Consult your doctor.", translating: "Translating...", share: "Share" },
    history: { title: "Scan History", subtitle: "Your medication library", search: "Search medicines...", searchButton: "Search", empty: "No medicines found", emptyDesc: "Try different keywords", noHistory: "No scan history", noHistoryDesc: "Scanned medicines appear here", export: "Export", deleteAll: "Clear All", newest: "Newest", oldest: "Oldest", alphabetical: "A-Z", confirmDelete: "Delete this scan?", confirmDeleteAll: "Clear all history?" },
    settings: { title: "Settings", subtitle: "Customize experience", language: "Language", languageDesc: "Choose preferred language", clear: "Clear All Data", clearDesc: "Remove all scans", privacy: "Privacy Policy", privacyDesc: "How we handle data", about: "About MedScan AI", version: "Version 3.0", madeWith: "Made with ♥ for better health" },
    guide: { title: "How to Use", subtitle: "3 easy steps", s1: "Capture", s1d: "Point camera at medicine packaging or label.", s2: "Analyze", s2d: "AI identifies medication and extracts info.", s3: "Learn", s3d: "Get purpose, dosage, side effects, warnings.", tip: "Pro Tip", tipText: "Ensure good lighting for best results." },
    privacy: { title: "Privacy Policy", subtitle: "Your privacy matters", t1: "Data Collection", d1: "Images processed in real-time. Not stored on servers.", t2: "Local Storage", d2: "History stored locally on your device only.", t3: "Camera Access", d3: "Used exclusively for scanning medication.", t4: "Disclaimer", d4: "Educational tool. Not medical advice." },
    errors: { notMedicine: "Not a medication. Scan a medicine label or package.", scanFailed: "Scan failed. Try a clearer image.", networkError: "Network error. Check connection.", generic: "Something went wrong." }
  },
  es: {
    nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" },
    home: { greeting: "Bienvenido a", title: "MedScan AI", subtitle: "Tu Asistente de Medicamentos", scan: "Toca para Escanear", scanDesc: "Cámara o Galería", analyzing: "Analizando", analyzeDesc: "Procesando...", recent: "Escaneos Recientes", empty: "Sin escaneos", emptyDesc: "Escanea tu primer medicamento", disclaimer: "⚠️ Solo educativo. Consulta a un profesional.", scanCount: "escaneos", camera: "Tomar Foto", gallery: "Elegir de Galería", cancel: "Cancelar" },
    result: { back: "Volver", purpose: "Para Qué Sirve", howTo: "Cómo Tomar", effects: "Efectos Secundarios", warnings: "Advertencias", storage: "Almacenamiento", interactions: "Interacciones", disclaimer: "Solo educativo. Consulta a tu médico.", translating: "Traduciendo...", share: "Compartir" },
    history: { title: "Historial", subtitle: "Tu biblioteca", search: "Buscar...", searchButton: "Buscar", empty: "Sin resultados", emptyDesc: "Intenta otros términos", noHistory: "Sin historial", noHistoryDesc: "Los medicamentos aparecerán aquí", export: "Exportar", deleteAll: "Borrar Todo", newest: "Recientes", oldest: "Antiguos", alphabetical: "A-Z", confirmDelete: "¿Eliminar?", confirmDeleteAll: "¿Borrar todo?" },
    settings: { title: "Ajustes", subtitle: "Personalizar", language: "Idioma", languageDesc: "Elige idioma", clear: "Borrar Datos", clearDesc: "Eliminar escaneos", privacy: "Privacidad", privacyDesc: "Manejo de datos", about: "Acerca de", version: "Versión 3.0", madeWith: "Hecho con ♥" },
    guide: { title: "Cómo Usar", subtitle: "3 pasos", s1: "Capturar", s1d: "Apunta al empaque.", s2: "Analizar", s2d: "IA identifica el medicamento.", s3: "Aprender", s3d: "Obtén información.", tip: "Consejo", tipText: "Buena iluminación." },
    privacy: { title: "Privacidad", subtitle: "Nos importa", t1: "Datos", d1: "Procesamiento en tiempo real.", t2: "Local", d2: "Guardado en dispositivo.", t3: "Cámara", d3: "Solo para escanear.", t4: "Aviso", d4: "Herramienta educativa." },
    errors: { notMedicine: "No es medicamento.", scanFailed: "Escaneo fallido.", networkError: "Error de red.", generic: "Algo salió mal." }
  },
  zh: {
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" },
    home: { greeting: "欢迎使用", title: "MedScan AI", subtitle: "您的药物助手", scan: "点击扫描", scanDesc: "相机或相册", analyzing: "分析中", analyzeDesc: "处理中...", recent: "最近扫描", empty: "暂无扫描", emptyDesc: "扫描第一个药物", disclaimer: "⚠️ 仅供教育。请咨询医生。", scanCount: "次扫描", camera: "拍照", gallery: "从相册选择", cancel: "取消" },
    result: { back: "返回", purpose: "用途", howTo: "服用方法", effects: "副作用", warnings: "警告", storage: "储存", interactions: "相互作用", disclaimer: "仅供教育参考。", translating: "翻译中...", share: "分享" },
    history: { title: "扫描历史", subtitle: "药物库", search: "搜索...", searchButton: "搜索", empty: "未找到", emptyDesc: "尝试其他词", noHistory: "暂无历史", noHistoryDesc: "扫描药物将显示在这里", export: "导出", deleteAll: "清除", newest: "最新", oldest: "最旧", alphabetical: "字母", confirmDelete: "删除？", confirmDeleteAll: "清除全部？" },
    settings: { title: "设置", subtitle: "自定义", language: "语言", languageDesc: "选择语言", clear: "清除数据", clearDesc: "删除扫描", privacy: "隐私", privacyDesc: "数据处理", about: "关于", version: "版本 3.0", madeWith: "用♥制作" },
    guide: { title: "使用方法", subtitle: "3步", s1: "拍摄", s1d: "对准药品。", s2: "分析", s2d: "AI识别药物。", s3: "学习", s3d: "获取信息。", tip: "提示", tipText: "确保光线充足。" },
    privacy: { title: "隐私政策", subtitle: "重视隐私", t1: "数据", d1: "实时处理。", t2: "本地", d2: "仅存储在设备。", t3: "相机", d3: "仅用于扫描。", t4: "声明", d4: "教育工具。" },
    errors: { notMedicine: "不是药物。", scanFailed: "扫描失败。", networkError: "网络错误。", generic: "出错了。" }
  },
  hi: {
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" },
    home: { greeting: "स्वागत है", title: "MedScan AI", subtitle: "आपका दवा सहायक", scan: "स्कैन करें", scanDesc: "कैमरा या गैलरी", analyzing: "विश्लेषण", analyzeDesc: "प्रोसेसिंग...", recent: "हाल के स्कैन", empty: "कोई स्कैन नहीं", emptyDesc: "पहली दवा स्कैन करें", disclaimer: "⚠️ केवल शैक्षिक। डॉक्टर से परामर्श करें।", scanCount: "स्कैन", camera: "फोटो लें", gallery: "गैलरी से चुनें", cancel: "रद्द करें" },
    result: { back: "वापस", purpose: "उद्देश्य", howTo: "कैसे लें", effects: "दुष्प्रभाव", warnings: "चेतावनी", storage: "भंडारण", interactions: "इंटरैक्शन", disclaimer: "केवल शैक्षिक।", translating: "अनुवाद...", share: "साझा करें" },
    history: { title: "इतिहास", subtitle: "दवा लाइब्रेरी", search: "खोजें...", searchButton: "खोजें", empty: "नहीं मिला", emptyDesc: "दूसरा शब्द", noHistory: "कोई इतिहास नहीं", noHistoryDesc: "दवाएं यहां दिखेंगी", export: "निर्यात", deleteAll: "सब हटाएं", newest: "नवीनतम", oldest: "पुराना", alphabetical: "A-Z", confirmDelete: "हटाएं?", confirmDeleteAll: "सब हटाएं?" },
    settings: { title: "सेटिंग्स", subtitle: "अनुकूलित करें", language: "भाषा", languageDesc: "भाषा चुनें", clear: "डेटा साफ़", clearDesc: "स्कैन हटाएं", privacy: "गोपनीयता", privacyDesc: "डेटा प्रबंधन", about: "जानकारी", version: "संस्करण 3.0", madeWith: "♥ से बनाया" },
    guide: { title: "उपयोग", subtitle: "3 चरण", s1: "कैप्चर", s1d: "दवा पर कैमरा।", s2: "विश्लेषण", s2d: "AI पहचानता है।", s3: "सीखें", s3d: "जानकारी प्राप्त करें।", tip: "सुझाव", tipText: "अच्छी रोशनी।" },
    privacy: { title: "गोपनीयता", subtitle: "महत्वपूर्ण है", t1: "डेटा", d1: "रीयल-टाइम प्रोसेसिंग।", t2: "लोकल", d2: "डिवाइस पर।", t3: "कैमरा", d3: "स्कैनिंग के लिए।", t4: "अस्वीकरण", d4: "शैक्षिक उपकरण।" },
    errors: { notMedicine: "दवा नहीं।", scanFailed: "स्कैन विफल।", networkError: "नेटवर्क त्रुटि।", generic: "गलत हुआ।" }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { greeting: "வரவேற்கிறோம்", title: "MedScan AI", subtitle: "மருந்து உதவியாளர்", scan: "ஸ்கேன் செய்ய", scanDesc: "கேமரா அல்லது கேலரி", analyzing: "பகுப்பாய்வு", analyzeDesc: "செயலாக்குகிறது...", recent: "சமீபத்திய", empty: "ஸ்கேன்கள் இல்லை", emptyDesc: "முதல் மருந்தை ஸ்கேன்", disclaimer: "⚠️ கல்விக்கு மட்டுமே. மருத்துவரை அணுகவும்.", scanCount: "ஸ்கேன்கள்", camera: "புகைப்படம்", gallery: "கேலரியிலிருந்து", cancel: "ரத்து" },
    result: { back: "திரும்பு", purpose: "நோக்கம்", howTo: "எப்படி", effects: "பக்க விளைவுகள்", warnings: "எச்சரிக்கைகள்", storage: "சேமிப்பு", interactions: "தொடர்புகள்", disclaimer: "கல்விக்காக மட்டுமே.", translating: "மொழிபெயர்க்கிறது...", share: "பகிர்" },
    history: { title: "வரலாறு", subtitle: "நூலகம்", search: "தேடு...", searchButton: "தேடு", empty: "இல்லை", emptyDesc: "வேறு சொல்", noHistory: "வரலாறு இல்லை", noHistoryDesc: "மருந்துகள் இங்கே", export: "ஏற்றுமதி", deleteAll: "அழி", newest: "புதியது", oldest: "பழையது", alphabetical: "A-Z", confirmDelete: "நீக்கவா?", confirmDeleteAll: "அனைத்தும்?" },
    settings: { title: "அமைப்புகள்", subtitle: "தனிப்பயனாக்கு", language: "மொழி", languageDesc: "மொழி தேர்வு", clear: "தரவு அழி", clearDesc: "ஸ்கேன் அகற்று", privacy: "தனியுரிமை", privacyDesc: "தரவு கையாளுதல்", about: "பற்றி", version: "பதிப்பு 3.0", madeWith: "♥ உடன்" },
    guide: { title: "பயன்படுத்துவது", subtitle: "3 படிகள்", s1: "பிடிப்பு", s1d: "மருந்தை நோக்கு.", s2: "பகுப்பாய்வு", s2d: "AI அடையாளம்.", s3: "கற்றுக்கொள்", s3d: "தகவல் பெறு.", tip: "குறிப்பு", tipText: "வெளிச்சம் உறுதி." },
    privacy: { title: "தனியுரிமை", subtitle: "முக்கியம்", t1: "தரவு", d1: "நிகழ்நேர செயலாக்கம்.", t2: "உள்ளூர்", d2: "சாதனத்தில் மட்டும்.", t3: "கேமரா", d3: "ஸ்கேனிங்கிற்கு.", t4: "மறுப்பு", d4: "கல்வி கருவி." },
    errors: { notMedicine: "மருந்து இல்லை.", scanFailed: "ஸ்கேன் தோல்வி.", networkError: "நெட்வொர்க் பிழை.", generic: "தவறு நடந்தது." }
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
  const variants = { default: "bg-white border-slate-200 shadow-sm", elevated: "bg-white border-slate-200 shadow-md", warning: "bg-amber-50 border-amber-200", danger: "bg-red-50 border-red-200", success: "bg-emerald-50 border-emerald-200" };
  return <div onClick={onClick} className={`border rounded-2xl transition-all duration-200 ${variants[variant]} ${hover && onClick ? 'hover:shadow-lg active:scale-[0.99] cursor-pointer' : ''} ${className}`}>{children}</div>;
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
  const [showScanOptions, setShowScanOptions] = useState(false);
  
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    try {
      const savedLang = window.localStorage?.getItem('medscan_lang');
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setLang(savedLang);
      const savedHistory = window.localStorage?.getItem('medscan_history');
      if (savedHistory) { const parsed = JSON.parse(savedHistory); if (Array.isArray(parsed)) setHistory(parsed); }
    } catch (e) {}
  }, []);

  useEffect(() => { try { window.localStorage?.setItem('medscan_lang', lang); } catch(e){} }, [lang]);
  useEffect(() => { try { window.localStorage?.setItem('medscan_history', JSON.stringify(history)); } catch(e){} }, [history]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); if (mainRef.current) mainRef.current.scrollTop = 0; }, [screen]);

  useEffect(() => {
    const translateIfNeeded = async () => {
      if (screen === 'result' && scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) await reAnalyzeForLanguage(scanResult);
    };
    translateIfNeeded();
  }, [lang, screen, scanResult]);

  const navigateTo = useCallback((newScreen, fromScreen = null) => {
    if (fromScreen) setPreviousScreen(fromScreen);
    else if (screen !== 'result' && screen !== 'privacy') setPreviousScreen(screen);
    setScreen(newScreen);
    setError(null);
    setShowScanOptions(false);
  }, [screen]);

  const goBack = useCallback(() => {
    if (screen === 'result') setScreen(previousScreen || 'home');
    else if (screen === 'privacy') setScreen('settings');
    else setScreen('home');
    setError(null);
  }, [screen, previousScreen]);

  const callGeminiAPI = async (payload) => {
    const response = await fetch(`${CONFIG.API_URL}/api/analyze`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: payload[0].text, image: payload[1]?.inlineData?.data })
    });
    if (!response.ok) throw new Error(response.status === 429 ? 'Rate limited.' : 'Server Error');
    return response.json();
  };

  const createPrompt = (targetLang) => `You are a pharmacist assistant. Analyze this medication image.
STEP 1: If NOT a medication, respond: {"error": "NOT_MEDICINE"}
STEP 2: If it IS medication, extract information in ${LANGUAGE_NAMES[targetLang]}.
Return JSON only: { "brandName": "...", "genericName": "...", "manufacturer": "...", "dosageForm": "...", "strength": "...", "purpose": "...", "howToTake": "...", "sideEffects": [], "warnings": [], "storage": "...", "interactions": [] }
Use simple patient-friendly language.`;

  const handleScan = async (file) => {
    if (!file || loading) return;
    setLoading(true); setError(null); setShowScanOptions(false);
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
    } catch (err) { setError(err.message || t(lang, 'errors.generic')); }
    finally { setLoading(false); }
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

  const executeSearch = useCallback(() => { setSearchQuery(searchInput.trim()); }, [searchInput]);
  const handleSearchKeyDown = (e) => { if (e.key === 'Enter') executeSearch(); };
  const clearSearch = () => { setSearchInput(''); setSearchQuery(''); };

  const filteredHistory = useMemo(() => {
    let results = [...history];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => (item.brandName || '').toLowerCase().includes(query) || (item.genericName || '').toLowerCase().includes(query) || (item.manufacturer || '').toLowerCase().includes(query) || (item.purpose || '').toLowerCase().includes(query));
    }
    results.sort((a, b) => { if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date); if (sortOrder === 'alphabetical') return (a.brandName || '').localeCompare(b.brandName || ''); return new Date(b.date) - new Date(a.date); });
    return results;
  }, [history, searchQuery, sortOrder]);

  const exportHistory = useCallback(() => {
    const text = history.map(item => `${item.brandName} (${item.genericName}) - ${item.strength}\nManufacturer: ${item.manufacturer}\nScanned: ${new Date(item.date).toLocaleDateString()}`).join('\n\n');
    if (navigator.share) navigator.share({ title: 'My MedScan AI List', text }).catch(() => {});
    else if (navigator.clipboard) { navigator.clipboard.writeText(text); alert('Copied to clipboard!'); }
  }, [history]);

  const deleteScan = useCallback((id) => { if (window.confirm(t(lang, 'history.confirmDelete'))) setHistory(prev => prev.filter(item => item.id !== id)); }, [lang]);
  const clearAllHistory = useCallback(() => { if (window.confirm(t(lang, 'history.confirmDeleteAll'))) { setHistory([]); try { window.localStorage?.removeItem('medscan_history'); } catch(e){} } }, [lang]);

  // Scan Options Modal
  const ScanOptionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={() => setShowScanOptions(false)}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 safe-area-bottom" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{t(lang, 'home.scan')}</h3>
        <div className="space-y-3">
          <button onClick={() => { cameraRef.current?.click(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Camera size={24} /></div>
            <span className="text-lg">{t(lang, 'home.camera')}</span>
          </button>
          <button onClick={() => { fileRef.current?.click(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 text-white font-semibold shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Image size={24} /></div>
            <span className="text-lg">{t(lang, 'home.gallery')}</span>
          </button>
          <button onClick={() => setShowScanOptions(false)} className="w-full p-4 rounded-2xl bg-slate-100 text-slate-600 font-semibold mt-2">
            {t(lang, 'home.cancel')}
          </button>
        </div>
      </div>
    </div>
  );

  // ========== SCREENS ==========
  const HomeScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-emerald-600 text-sm font-medium">{t(lang, 'home.greeting')}</p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight">{t(lang, 'home.title')}</h1>
          <p className="text-slate-500 text-base mt-1">{t(lang, 'home.subtitle')}</p>
          {history.length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 font-semibold">{history.length}</span>
              <span className="text-emerald-600 text-sm">{t(lang, 'home.scanCount')}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card onClick={() => !loading && setShowScanOptions(true)} className={`p-6 min-h-[300px] flex flex-col items-center justify-center ${loading ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-violet-50' : 'border-2 border-dashed border-emerald-300 bg-emerald-50/50'}`} variant="default">
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; setShowScanOptions(false); }} />
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; setShowScanOptions(false); }} />
              
              {loading ? <DNALoadingAnimation /> : (
                <>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-5 shadow-xl shadow-emerald-500/30">
                    <Scan size={36} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800">{t(lang, 'home.scan')}</h3>
                  <p className="text-slate-500 text-sm mt-1">{t(lang, 'home.scanDesc')}</p>
                </>
              )}
            </Card>

            {error && (
              <Card className="p-4 mt-4" variant="danger" hover={false}>
                <div className="flex items-start gap-3">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm flex-1">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400"><X size={18} /></button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-7 space-y-5">
            <Card className="p-4" variant="warning" hover={false}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Shield className="text-amber-600" size={20} /></div>
                <p className="text-amber-800 text-sm leading-relaxed">{t(lang, 'home.disclaimer')}</p>
              </div>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-slate-700 font-semibold flex items-center gap-2"><Clock size={16} className="text-slate-400" />{t(lang, 'home.recent')}</h3>
                {history.length > 0 && <button onClick={() => navigateTo('history')} className="text-emerald-600 text-sm font-medium flex items-center gap-1">View All <ChevronRight size={14} /></button>}
              </div>
              
              {history.length === 0 ? (
                <Card className="p-8 text-center" hover={false}>
                  <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
                  <h4 className="text-slate-600 font-medium">{t(lang, 'home.empty')}</h4>
                  <p className="text-slate-400 text-sm mt-1">{t(lang, 'home.emptyDesc')}</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.slice(0, 4).map((item) => (
                    <Card key={item.id} className="p-3" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'home'); }}>
                      <div className="flex items-center gap-3">
                        <img src={item.img} className="w-12 h-12 rounded-xl object-cover bg-slate-100" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-emerald-600 font-medium">{new Date(item.date).toLocaleDateString()}</p>
                          <h4 className="text-slate-800 font-semibold text-sm truncate">{item.brandName}</h4>
                          <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                        </div>
                        <ChevronRight className="text-slate-300 shrink-0" size={16} />
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
      <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm"><ArrowLeft size={18} /> {t(lang, 'result.back')}</button>
            <button onClick={() => navigator.share?.({ title: scanResult.brandName, text: `${scanResult.brandName} - ${scanResult.purpose}` })} className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm"><Share2 size={18} /></button>
          </div>

          <Card className="p-5 mb-5" variant="elevated" hover={false}>
            <div className="flex gap-4">
              <img src={scanResult.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">{scanResult.dosageForm}</span>
                  {scanResult.strength !== 'N/A' && <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">{scanResult.strength}</span>}
                </div>
                <h1 className="text-2xl font-bold text-slate-800 truncate">{scanResult.brandName}</h1>
                <p className="text-slate-500 truncate">{scanResult.genericName}</p>
                {scanResult.manufacturer !== 'N/A' && <p className="text-slate-400 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {scanResult.manufacturer}</p>}
              </div>
            </div>
            {isTranslating && <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700"><RefreshCw size={14} className="animate-spin" /><span className="text-sm">{t(lang, 'result.translating')}</span></div>}
          </Card>

          <div className="space-y-3">
            {scanResult.purpose !== 'N/A' && <Card className="p-4" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Heart className="text-emerald-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{t(lang, 'result.purpose')}</h4><p className="text-slate-700 text-sm">{scanResult.purpose}</p></div></div></Card>}
            {scanResult.howToTake !== 'N/A' && <Card className="p-4" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Clock className="text-blue-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{t(lang, 'result.howTo')}</h4><p className="text-slate-700 text-sm">{scanResult.howToTake}</p></div></div></Card>}
            {scanResult.storage !== 'N/A' && <Card className="p-4" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0"><Layers className="text-violet-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">{t(lang, 'result.storage')}</h4><p className="text-slate-700 text-sm">{scanResult.storage}</p></div></div></Card>}
            {scanResult.sideEffects?.length > 0 && <Card className="p-4" variant="warning" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-700" size={18} /></div><div className="flex-1"><h4 className="text-amber-700 text-[10px] font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.effects')}</h4><ul className="space-y-0.5">{scanResult.sideEffects.map((e, i) => <li key={i} className="text-amber-900 text-sm flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-amber-500 mt-2 shrink-0" />{e}</li>)}</ul></div></div></Card>}
            {scanResult.warnings?.length > 0 && <Card className="p-4" variant="danger" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center shrink-0"><ShieldCheck className="text-red-700" size={18} /></div><div className="flex-1"><h4 className="text-red-700 text-[10px] font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.warnings')}</h4><ul className="space-y-0.5">{scanResult.warnings.map((w, i) => <li key={i} className="text-red-900 text-sm flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-red-500 mt-2 shrink-0" />{w}</li>)}</ul></div></div></Card>}
            {scanResult.interactions?.length > 0 && <Card className="p-4" hover={false}><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0"><Zap className="text-pink-600" size={18} /></div><div className="flex-1"><h4 className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-1">{t(lang, 'result.interactions')}</h4><ul className="space-y-0.5">{scanResult.interactions.map((int, idx) => <li key={idx} className="text-slate-700 text-sm flex items-start gap-2"><span className="w-1 h-1 rounded-full bg-pink-400 mt-2 shrink-0" />{int}</li>)}</ul></div></div></Card>}
          </div>
          <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center"><p className="text-slate-500 text-xs">{t(lang, 'result.disclaimer')}</p></div>
        </div>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-6">
          <div><h1 className="text-2xl font-bold text-slate-800">{t(lang, 'history.title')}</h1><p className="text-slate-500 text-sm">{t(lang, 'history.subtitle')}</p></div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <button onClick={exportHistory} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium text-xs flex items-center gap-1.5 shadow-sm"><Upload size={14} /> {t(lang, 'history.export')}</button>
              <button onClick={clearAllHistory} className="px-3 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 font-medium text-xs flex items-center gap-1.5"><Trash2 size={14} /> {t(lang, 'history.deleteAll')}</button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-12 text-center" hover={false}>
            <History className="mx-auto mb-3 text-slate-300" size={40} />
            <h3 className="text-slate-700 font-semibold text-lg mb-1">{t(lang, 'history.noHistory')}</h3>
            <p className="text-slate-500 text-sm mb-5">{t(lang, 'history.noHistoryDesc')}</p>
            <button onClick={() => navigateTo('home')} className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm">Scan Medicine</button>
          </Card>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <Card className="flex-1 p-1" hover={false}>
                <div className="flex items-center gap-2 px-3">
                  <Search className="text-slate-400 shrink-0" size={18} />
                  <input type="text" placeholder={t(lang, 'history.search')} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} onKeyDown={handleSearchKeyDown} className="flex-1 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 py-2 text-sm" />
                  {searchInput && <button onClick={clearSearch} className="text-slate-400 p-1"><X size={16} /></button>}
                </div>
              </Card>
              <button onClick={executeSearch} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-sm flex items-center gap-1.5 shadow-sm"><Search size={16} /> {t(lang, 'history.searchButton')}</button>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm cursor-pointer">
                <option value="newest">{t(lang, 'history.newest')}</option>
                <option value="oldest">{t(lang, 'history.oldest')}</option>
                <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
              </select>
            </div>

            {filteredHistory.length === 0 ? (
              <Card className="p-10 text-center" hover={false}>
                <Search className="mx-auto mb-3 text-slate-300" size={36} />
                <h3 className="text-slate-600 font-medium">{t(lang, 'history.empty')}</h3>
                <p className="text-slate-400 text-sm mt-1">{t(lang, 'history.emptyDesc')}</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredHistory.map((item) => (
                  <Card key={item.id} className="p-3 group" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'history'); }}>
                    <div className="flex items-center gap-3">
                      <img src={item.img} className="w-12 h-12 rounded-xl object-cover bg-slate-100" alt="" />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-slate-800 font-semibold text-sm truncate">{item.brandName}</h4>
                        <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1"><Calendar size={10} /> {new Date(item.date).toLocaleDateString()}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }} className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
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
    <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'guide.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'guide.subtitle')}</p>
        <div className="space-y-3">
          {[{ icon: Scan, color: 'emerald', num: '01', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') }, { icon: Eye, color: 'violet', num: '02', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') }, { icon: BookOpen, color: 'amber', num: '03', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') }].map((step, i) => (
            <Card key={i} className="p-4" hover={false}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color === 'emerald' ? 'bg-emerald-100' : step.color === 'violet' ? 'bg-violet-100' : 'bg-amber-100'}`}>
                  <step.icon className={step.color === 'emerald' ? 'text-emerald-600' : step.color === 'violet' ? 'text-violet-600' : 'text-amber-600'} size={22} />
                </div>
                <div><span className="text-slate-300 text-xs font-mono font-bold">{step.num}</span><h3 className="text-slate-800 font-semibold">{step.title}</h3><p className="text-slate-500 text-sm mt-0.5">{step.desc}</p></div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-5 p-4" variant="success" hover={false}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center shrink-0"><Star className="text-emerald-700" size={18} /></div>
            <div><h4 className="text-emerald-800 font-semibold">{t(lang, 'guide.tip')}</h4><p className="text-emerald-700 text-sm mt-0.5">{t(lang, 'guide.tipText')}</p></div>
          </div>
        </Card>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'settings.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'settings.subtitle')}</p>
        <Card className="overflow-hidden mb-5" hover={false}>
          <div className="p-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50"><Globe className="text-emerald-600" size={18} /><div><span className="text-slate-800 font-semibold text-sm">{t(lang, 'settings.language')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.languageDesc')}</p></div></div>
          <div className="p-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-2.5 rounded-xl flex items-center justify-between transition-all mb-1 ${lang === l.code ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-50'}`}>
                <div className="flex items-center gap-2.5"><span className="text-lg">{l.flag}</span><span className="font-medium text-sm">{l.nativeName}</span></div>
                {lang === l.code && <CheckCircle2 size={18} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-2">
          <Card className="p-3" onClick={() => navigateTo('privacy')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Lock className="text-slate-500" size={18} /></div>
              <div className="flex-1"><span className="text-slate-800 font-semibold text-sm">{t(lang, 'settings.privacy')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.privacyDesc')}</p></div>
              <ChevronRight className="text-slate-400" size={18} />
            </div>
          </Card>
          <Card className="p-3" variant="danger" onClick={clearAllHistory}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="text-red-500" size={18} /></div>
              <div className="flex-1"><span className="text-red-700 font-semibold text-sm">{t(lang, 'settings.clear')}</span><p className="text-red-500 text-xs">{t(lang, 'settings.clearDesc')}</p></div>
            </div>
          </Card>
        </div>
        <div className="mt-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg"><Pill className="text-white" size={24} /></div>
          <h3 className="text-slate-800 font-semibold">{t(lang, 'settings.about')}</h3>
          <p className="text-slate-500 text-sm">{t(lang, 'settings.version')}</p>
          <p className="text-slate-400 text-xs mt-2">{t(lang, 'settings.madeWith')}</p>
        </div>
      </div>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-12 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium text-sm mb-6 shadow-sm"><ArrowLeft size={16} /> {t(lang, 'settings.title')}</button>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'privacy.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'privacy.subtitle')}</p>
        <Card className="p-5" hover={false}>
          <div className="space-y-6">
            {[{ icon: Eye, color: 'emerald' }, { icon: Fingerprint, color: 'violet' }, { icon: Camera, color: 'blue' }, { icon: Shield, color: 'amber' }].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color === 'emerald' ? 'bg-emerald-100' : item.color === 'violet' ? 'bg-violet-100' : item.color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  <item.icon className={item.color === 'emerald' ? 'text-emerald-600' : item.color === 'violet' ? 'text-violet-600' : item.color === 'blue' ? 'text-blue-600' : 'text-amber-600'} size={18} />
                </div>
                <div><h3 className="text-slate-800 font-semibold text-sm mb-0.5">{t(lang, `privacy.t${i + 1}`)}</h3><p className="text-slate-500 text-sm">{t(lang, `privacy.d${i + 1}`)}</p></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-60 h-screen sticky top-0 p-4 bg-white border-r border-slate-200">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow"><Pill className="text-white" size={20} /></div>
        <div><h1 className="text-slate-800 font-bold">MedScan AI</h1><p className="text-slate-400 text-[10px]">Medicine Scanner</p></div>
      </div>
      <nav className="space-y-1 flex-1">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all text-sm ${isActive ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon size={18} /><span>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{history.length}</span>}
            </button>
          );
        })}
      </nav>
      <div className="pt-3 border-t border-slate-200 text-center"><p className="text-slate-400 text-[10px]">Educational Use Only</p></div>
    </div>
  );

  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pt-2 pb-7 bg-white border-t border-slate-200">
      <div className="flex justify-around max-w-md mx-auto">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`relative flex flex-col items-center py-1.5 px-4 rounded-xl transition-all ${isActive ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400'}`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[9px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">{history.length > 9 ? '9+' : history.length}</span>}
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
          <main ref={mainRef} className="flex-1 min-h-screen pb-24 lg:pb-6">
            {screen === 'home' && <HomeScreen />}
            {screen === 'result' && <ResultScreen />}
            {screen === 'history' && <HistoryScreen />}
            {screen === 'guide' && <GuideScreen />}
            {screen === 'settings' && <SettingsScreen />}
            {screen === 'privacy' && <PrivacyScreen />}
          </main>
        </div>
        <MobileNav />
        {showScanOptions && <ScanOptionsModal />}
      </div>
    </ErrorBoundary>
  );
}
