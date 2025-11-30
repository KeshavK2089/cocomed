import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Pill, Home, Globe, Sparkles, ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, ChevronRight, ArrowLeft, Heart, Clock, MapPin, Upload, Scan, Zap, Shield, Eye, Star, Layers, Fingerprint, Image, ChevronDown, Info, Users, Lightbulb, FileText, Activity, ThermometerSun, Baby, Coffee } from 'lucide-react';

// ============================================================================
// PROFESSIONAL ROTATING GLOBE
// ============================================================================
const RotatingGlobe = ({ size = 160 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = size * 2;
    const h = canvas.height = size * 2;
    const cx = w / 2, cy = h / 2, radius = size * 0.7;
    let rotation = 0;
    let animId;
    
    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      
      // Outer glow
      const glow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.3);
      glow.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);
      
      // Globe base
      const globeGrad = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.3, 0, cx, cy, radius);
      globeGrad.addColorStop(0, '#10b981');
      globeGrad.addColorStop(0.5, '#059669');
      globeGrad.addColorStop(1, '#047857');
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();
      
      // Latitude lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      for (let lat = -60; lat <= 60; lat += 30) {
        const y = cy + Math.sin(lat * Math.PI / 180) * radius;
        const latRadius = Math.cos(lat * Math.PI / 180) * radius;
        ctx.beginPath();
        ctx.ellipse(cx, y, latRadius, latRadius * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Longitude lines (rotating)
      for (let lon = 0; lon < 180; lon += 30) {
        const angle = (lon + rotation) * Math.PI / 180;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Math.abs(Math.cos(angle)) * radius, radius, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + Math.abs(Math.cos(angle)) * 0.2})`;
        ctx.stroke();
      }
      
      // Medical cross
      const crossSize = radius * 0.35;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(cx - crossSize * 0.15, cy - crossSize * 0.5, crossSize * 0.3, crossSize);
      ctx.fillRect(cx - crossSize * 0.5, cy - crossSize * 0.15, crossSize, crossSize * 0.3);
      
      // Shine
      const shine = ctx.createRadialGradient(cx - radius * 0.4, cy - radius * 0.4, 0, cx - radius * 0.4, cy - radius * 0.4, radius * 0.6);
      shine.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      shine.addColorStop(1, 'transparent');
      ctx.fillStyle = shine;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Orbiting dot
      const orbitAngle = rotation * 0.03;
      const orbitX = cx + Math.cos(orbitAngle) * (radius + 15);
      const orbitY = cy + Math.sin(orbitAngle) * (radius + 15) * 0.3;
      ctx.beginPath();
      ctx.arc(orbitX, orbitY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#34d399';
      ctx.fill();
      
      rotation += 0.8;
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animId);
  }, [size]);
  
  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
};

// ============================================================================
// SPLASH SCREEN
// ============================================================================
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 200); return 100; }
        return p + 3;
      });
    }, 35);
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex flex-col items-center justify-center">
      <div className="mb-8">
        <RotatingGlobe size={140} />
      </div>
      <h1 className="text-3xl font-bold text-white mb-1">MedScan AI</h1>
      <p className="text-emerald-300/70 text-sm mb-8">Global Medicine Intelligence</p>
      <div className="w-56">
        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-slate-400 text-xs text-center mt-3">{progress < 100 ? 'Loading...' : 'Ready'}</p>
      </div>
    </div>
  );
};

// ============================================================================
// SCANNING ANIMATION
// ============================================================================
const ScanningAnimation = ({ text }) => (
  <div className="flex flex-col items-center py-6">
    <RotatingGlobe size={180} />
    <h3 className="text-lg font-semibold text-slate-800 mt-4">{text}</h3>
    <p className="text-slate-500 text-sm mt-1">Analyzing medication data...</p>
    <div className="flex gap-1.5 mt-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
      ))}
    </div>
  </div>
);

// ============================================================================
// CONFIG & UTILITIES
// ============================================================================
const CONFIG = { API_URL: "https://cocomed.vercel.app", MAX_IMAGE_SIZE: 1024, COMPRESSION_QUALITY: 0.75 };

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
    img.onerror = () => reject(new Error('Failed'));
  };
  reader.onerror = () => reject(new Error('Failed'));
});

const sanitizeMedicationData = (data) => {
  if (!data || typeof data !== 'object') return null;
  const safeStr = (v, fb = "N/A") => (typeof v === 'string' && v.trim()) ? v.trim() : fb;
  const safeArr = (a) => Array.isArray(a) ? a.filter(i => typeof i === 'string' && i.trim()).map(i => i.trim()) : [];
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
    storage: safeStr(data.storage, "Store at room temperature."),
    interactions: safeArr(data.interactions || data.drugInteractions),
    contraindications: safeArr(data.contraindications),
    activeIngredients: safeArr(data.activeIngredients),
    pregnancyWarning: safeStr(data.pregnancyWarning, ""),
    foodInteractions: safeStr(data.foodInteractions, ""),
    onsetTime: safeStr(data.onsetTime, ""),
    duration: safeStr(data.duration, "")
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
    home: { greeting: "Welcome to", title: "MedScan AI", subtitle: "Smart Medicine Scanner", scan: "Scan Medicine", scanDesc: "Point camera at any medication", analyzing: "Analyzing", recent: "Recent Scans", empty: "No scans yet", emptyDesc: "Scan your first medicine", disclaimer: "⚠️ For educational purposes only. Always consult a healthcare professional before taking any medication.", scanCount: "medicines scanned", camera: "Take Photo", gallery: "Choose from Gallery", cancel: "Cancel" },
    result: { back: "Back", purpose: "Purpose & Uses", howTo: "Dosage Instructions", effects: "Side Effects", warnings: "Important Warnings", storage: "Storage", interactions: "Drug Interactions", disclaimer: "Always consult your doctor or pharmacist.", translating: "Translating...", share: "Share", contraindications: "Who Should Not Take", activeIngredients: "Active Ingredients", pregnancy: "Pregnancy & Nursing", food: "Food Interactions", onset: "Takes Effect", duration: "Duration" },
    history: { title: "Medicine Library", subtitle: "Your scanned medications", noHistory: "No scans yet", noHistoryDesc: "Scanned medicines will appear here", export: "Export", deleteAll: "Clear All", newest: "Newest", oldest: "Oldest", alphabetical: "A-Z", confirmDelete: "Delete this scan?", confirmDeleteAll: "Clear all history?" },
    settings: { title: "Settings", subtitle: "App preferences", language: "Language", languageDesc: "Select your language", clear: "Clear Data", clearDesc: "Remove all saved scans", privacy: "Privacy Policy", privacyDesc: "How we handle your data", about: "About MedScan AI", version: "Version 4.0", madeWith: "Made with ♥ for better health" },
    guide: { title: "User Guide", subtitle: "Learn how to use MedScan AI", s1: "Point & Capture", s1d: "Hold your phone steady and point the camera at the medicine label, packaging, or pill bottle. Ensure text is clearly visible.", s2: "AI Analysis", s2d: "Our AI instantly identifies the medication and extracts comprehensive information including usage, dosage, and safety data.", s3: "Review Results", s3d: "Get detailed information about your medicine including purpose, side effects, warnings, and drug interactions.", tip: "Pro Tips", tipText: "For best results, use good lighting and keep the medicine label flat.", features: "Key Features", f1: "Instant Recognition", f1d: "AI identifies medicines in seconds", f2: "Multi-language", f2d: "Results in 5 languages", f3: "Offline History", f3d: "Access past scans anytime", f4: "Privacy First", f4d: "Data stays on your device", safety: "Safety Information", safetyText: "MedScan AI is designed to help you understand your medications better. It does not replace professional medical advice. Always consult your doctor or pharmacist before starting, stopping, or changing any medication.", faq: "Common Questions", q1: "Is my data secure?", a1: "Yes. All scan data is stored locally on your device and never uploaded to external servers.", q2: "How accurate is the scan?", a2: "Our AI provides high accuracy for most medications, but always verify with your pharmacist.", q3: "Can I scan any medicine?", a3: "You can scan most prescription and over-the-counter medications with readable labels." },
    privacy: { title: "Privacy Policy", subtitle: "Your privacy matters", t1: "Data Processing", d1: "Images are processed in real-time and not stored on our servers", t2: "Local Storage", d2: "Your scan history is stored only on your device", t3: "Camera Access", d3: "Camera is used exclusively for scanning medicines", t4: "No Tracking", d4: "We do not track or collect personal information" },
    errors: { notMedicine: "This doesn't appear to be a medication", scanFailed: "Scan failed. Please try again", networkError: "Network error. Check your connection", generic: "Something went wrong" }
  },
  es: {
    nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" },
    home: { greeting: "Bienvenido a", title: "MedScan AI", subtitle: "Escáner Inteligente", scan: "Escanear", scanDesc: "Apunta la cámara al medicamento", analyzing: "Analizando", recent: "Recientes", empty: "Sin escaneos", emptyDesc: "Escanea tu primer medicamento", disclaimer: "⚠️ Solo para fines educativos. Siempre consulta a un profesional de salud.", scanCount: "medicamentos", camera: "Tomar Foto", gallery: "Elegir de Galería", cancel: "Cancelar" },
    result: { back: "Volver", purpose: "Propósito y Usos", howTo: "Instrucciones de Dosis", effects: "Efectos Secundarios", warnings: "Advertencias", storage: "Almacenamiento", interactions: "Interacciones", disclaimer: "Consulta siempre a tu médico.", translating: "Traduciendo...", share: "Compartir", contraindications: "Contraindicaciones", activeIngredients: "Ingredientes Activos", pregnancy: "Embarazo", food: "Interacciones con Alimentos", onset: "Inicio de Efecto", duration: "Duración" },
    history: { title: "Biblioteca", subtitle: "Tus medicamentos", noHistory: "Sin historial", noHistoryDesc: "Los medicamentos aparecerán aquí", export: "Exportar", deleteAll: "Borrar", newest: "Recientes", oldest: "Antiguos", alphabetical: "A-Z", confirmDelete: "¿Eliminar?", confirmDeleteAll: "¿Borrar todo?" },
    settings: { title: "Ajustes", subtitle: "Preferencias", language: "Idioma", languageDesc: "Selecciona idioma", clear: "Borrar Datos", clearDesc: "Eliminar escaneos", privacy: "Privacidad", privacyDesc: "Manejo de datos", about: "Acerca de", version: "Versión 4.0", madeWith: "Hecho con ♥" },
    guide: { title: "Guía de Usuario", subtitle: "Aprende a usar MedScan AI", s1: "Apuntar y Capturar", s1d: "Sostén tu teléfono y apunta al medicamento. Asegúrate que el texto sea visible.", s2: "Análisis IA", s2d: "Nuestra IA identifica el medicamento y extrae información completa.", s3: "Revisar Resultados", s3d: "Obtén información detallada sobre tu medicamento.", tip: "Consejos", tipText: "Usa buena iluminación para mejores resultados.", features: "Características", f1: "Reconocimiento Instantáneo", f1d: "IA identifica en segundos", f2: "Multi-idioma", f2d: "Resultados en 5 idiomas", f3: "Historial Offline", f3d: "Accede sin internet", f4: "Privacidad", f4d: "Datos en tu dispositivo", safety: "Información de Seguridad", safetyText: "MedScan AI te ayuda a entender tus medicamentos. No reemplaza el consejo médico profesional.", faq: "Preguntas Frecuentes", q1: "¿Mis datos están seguros?", a1: "Sí. Los datos se guardan localmente en tu dispositivo.", q2: "¿Qué tan preciso es?", a2: "Alta precisión, pero siempre verifica con tu farmacéutico.", q3: "¿Puedo escanear cualquier medicamento?", a3: "Sí, la mayoría de medicamentos con etiquetas legibles." },
    privacy: { title: "Privacidad", subtitle: "Tu privacidad importa", t1: "Procesamiento", d1: "Imágenes procesadas en tiempo real", t2: "Almacenamiento Local", d2: "Historial solo en tu dispositivo", t3: "Cámara", d3: "Solo para escanear medicamentos", t4: "Sin Rastreo", d4: "No recolectamos información personal" },
    errors: { notMedicine: "No parece ser un medicamento", scanFailed: "Escaneo fallido", networkError: "Error de red", generic: "Algo salió mal" }
  },
  zh: {
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" },
    home: { greeting: "欢迎使用", title: "MedScan AI", subtitle: "智能药物扫描", scan: "扫描药物", scanDesc: "将相机对准药物", analyzing: "分析中", recent: "最近扫描", empty: "暂无扫描", emptyDesc: "扫描您的第一个药物", disclaimer: "⚠️ 仅供教育目的。服药前请咨询医生。", scanCount: "药物已扫描", camera: "拍照", gallery: "从相册选择", cancel: "取消" },
    result: { back: "返回", purpose: "用途", howTo: "用法用量", effects: "副作用", warnings: "警告", storage: "储存", interactions: "药物相互作用", disclaimer: "请咨询医生或药剂师。", translating: "翻译中...", share: "分享", contraindications: "禁忌症", activeIngredients: "有效成分", pregnancy: "孕期须知", food: "食物相互作用", onset: "起效时间", duration: "持续时间" },
    history: { title: "药物库", subtitle: "已扫描的药物", noHistory: "暂无记录", noHistoryDesc: "扫描的药物将显示在这里", export: "导出", deleteAll: "清除", newest: "最新", oldest: "最旧", alphabetical: "A-Z", confirmDelete: "删除？", confirmDeleteAll: "清除全部？" },
    settings: { title: "设置", subtitle: "应用偏好", language: "语言", languageDesc: "选择语言", clear: "清除数据", clearDesc: "删除所有扫描", privacy: "隐私政策", privacyDesc: "数据处理方式", about: "关于", version: "版本 4.0", madeWith: "用♥制作" },
    guide: { title: "用户指南", subtitle: "了解如何使用", s1: "对准拍摄", s1d: "将手机对准药物标签，确保文字清晰可见。", s2: "AI分析", s2d: "AI即时识别药物并提取完整信息。", s3: "查看结果", s3d: "获取药物的详细信息。", tip: "技巧", tipText: "良好的光线可获得更好的结果。", features: "主要功能", f1: "即时识别", f1d: "AI秒速识别", f2: "多语言", f2d: "5种语言结果", f3: "离线历史", f3d: "随时访问", f4: "隐私优先", f4d: "数据存储在设备上", safety: "安全信息", safetyText: "MedScan AI帮助您了解药物。它不能替代专业医疗建议。", faq: "常见问题", q1: "我的数据安全吗？", a1: "是的，数据仅存储在您的设备上。", q2: "扫描准确吗？", a2: "高准确度，但请向药剂师确认。", q3: "可以扫描任何药物吗？", a3: "可以扫描大多数有可读标签的药物。" },
    privacy: { title: "隐私政策", subtitle: "您的隐私很重要", t1: "数据处理", d1: "图像实时处理，不存储", t2: "本地存储", d2: "历史仅存储在您的设备上", t3: "相机访问", d3: "仅用于扫描药物", t4: "无追踪", d4: "我们不收集个人信息" },
    errors: { notMedicine: "这似乎不是药物", scanFailed: "扫描失败", networkError: "网络错误", generic: "出错了" }
  },
  hi: {
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" },
    home: { greeting: "स्वागत है", title: "MedScan AI", subtitle: "स्मार्ट दवा स्कैनर", scan: "दवा स्कैन करें", scanDesc: "कैमरा दवा की ओर करें", analyzing: "विश्लेषण", recent: "हाल के स्कैन", empty: "कोई स्कैन नहीं", emptyDesc: "पहली दवा स्कैन करें", disclaimer: "⚠️ केवल शैक्षिक उद्देश्यों के लिए। दवा लेने से पहले डॉक्टर से परामर्श करें।", scanCount: "दवाएं स्कैन", camera: "फोटो लें", gallery: "गैलरी से चुनें", cancel: "रद्द करें" },
    result: { back: "वापस", purpose: "उद्देश्य और उपयोग", howTo: "खुराक निर्देश", effects: "दुष्प्रभाव", warnings: "चेतावनी", storage: "भंडारण", interactions: "दवा इंटरैक्शन", disclaimer: "अपने डॉक्टर से परामर्श करें।", translating: "अनुवाद...", share: "साझा करें", contraindications: "किसे नहीं लेनी चाहिए", activeIngredients: "सक्रिय तत्व", pregnancy: "गर्भावस्था", food: "खाद्य इंटरैक्शन", onset: "प्रभाव शुरू", duration: "अवधि" },
    history: { title: "दवा पुस्तकालय", subtitle: "स्कैन की गई दवाएं", noHistory: "कोई इतिहास नहीं", noHistoryDesc: "स्कैन की गई दवाएं यहां दिखेंगी", export: "निर्यात", deleteAll: "सब हटाएं", newest: "नवीनतम", oldest: "पुराना", alphabetical: "A-Z", confirmDelete: "हटाएं?", confirmDeleteAll: "सब हटाएं?" },
    settings: { title: "सेटिंग्स", subtitle: "ऐप प्राथमिकताएं", language: "भाषा", languageDesc: "भाषा चुनें", clear: "डेटा साफ़ करें", clearDesc: "सभी स्कैन हटाएं", privacy: "गोपनीयता", privacyDesc: "डेटा प्रबंधन", about: "जानकारी", version: "संस्करण 4.0", madeWith: "♥ से बनाया" },
    guide: { title: "उपयोगकर्ता गाइड", subtitle: "उपयोग करना सीखें", s1: "कैप्चर करें", s1d: "फोन को दवा लेबल की ओर करें। टेक्स्ट स्पष्ट होना चाहिए।", s2: "AI विश्लेषण", s2d: "AI दवा की पहचान करता है और जानकारी निकालता है।", s3: "परिणाम देखें", s3d: "दवा की विस्तृत जानकारी प्राप्त करें।", tip: "सुझाव", tipText: "बेहतर परिणामों के लिए अच्छी रोशनी का उपयोग करें।", features: "मुख्य विशेषताएं", f1: "तुरंत पहचान", f1d: "AI सेकंडों में पहचानता है", f2: "बहु-भाषा", f2d: "5 भाषाओं में परिणाम", f3: "ऑफलाइन इतिहास", f3d: "कभी भी एक्सेस करें", f4: "गोपनीयता पहले", f4d: "डेटा आपके डिवाइस पर", safety: "सुरक्षा जानकारी", safetyText: "MedScan AI आपको दवाओं को समझने में मदद करता है। यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है।", faq: "सामान्य प्रश्न", q1: "क्या मेरा डेटा सुरक्षित है?", a1: "हां, डेटा केवल आपके डिवाइस पर संग्रहीत है।", q2: "स्कैन कितना सटीक है?", a2: "उच्च सटीकता, लेकिन फार्मासिस्ट से पुष्टि करें।", q3: "क्या कोई भी दवा स्कैन कर सकता हूं?", a3: "पढ़ने योग्य लेबल वाली अधिकांश दवाएं।" },
    privacy: { title: "गोपनीयता", subtitle: "आपकी गोपनीयता महत्वपूर्ण है", t1: "प्रोसेसिंग", d1: "छवियां रीयल-टाइम में प्रोसेस", t2: "लोकल स्टोरेज", d2: "इतिहास केवल आपके डिवाइस पर", t3: "कैमरा", d3: "केवल स्कैनिंग के लिए", t4: "कोई ट्रैकिंग नहीं", d4: "व्यक्तिगत जानकारी नहीं लेते" },
    errors: { notMedicine: "यह दवा नहीं लगती", scanFailed: "स्कैन विफल", networkError: "नेटवर्क त्रुटि", generic: "कुछ गलत हुआ" }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { greeting: "வரவேற்கிறோம்", title: "MedScan AI", subtitle: "ஸ்மார்ட் மருந்து ஸ்கேனர்", scan: "மருந்து ஸ்கேன்", scanDesc: "கேமராவை மருந்தை நோக்கி வைக்கவும்", analyzing: "பகுப்பாய்வு", recent: "சமீபத்திய", empty: "ஸ்கேன்கள் இல்லை", emptyDesc: "முதல் மருந்தை ஸ்கேன் செய்யுங்கள்", disclaimer: "⚠️ கல்வி நோக்கங்களுக்கு மட்டுமே. மருந்து எடுப்பதற்கு முன் மருத்துவரை அணுகவும்.", scanCount: "மருந்துகள்", camera: "புகைப்படம் எடு", gallery: "கேலரியிலிருந்து தேர்வு", cancel: "ரத்து" },
    result: { back: "திரும்பு", purpose: "நோக்கம் & பயன்பாடுகள்", howTo: "அளவு வழிமுறைகள்", effects: "பக்க விளைவுகள்", warnings: "எச்சரிக்கைகள்", storage: "சேமிப்பு", interactions: "மருந்து தொடர்புகள்", disclaimer: "மருத்துவரை அணுகவும்.", translating: "மொழிபெயர்க்கிறது...", share: "பகிர்", contraindications: "யார் எடுக்கக்கூடாது", activeIngredients: "செயலில் உள்ள பொருட்கள்", pregnancy: "கர்ப்பம்", food: "உணவு தொடர்புகள்", onset: "விளைவு தொடக்கம்", duration: "கால அளவு" },
    history: { title: "மருந்து நூலகம்", subtitle: "ஸ்கேன் செய்த மருந்துகள்", noHistory: "வரலாறு இல்லை", noHistoryDesc: "ஸ்கேன் செய்த மருந்துகள் இங்கே தோன்றும்", export: "ஏற்றுமதி", deleteAll: "அழி", newest: "புதியது", oldest: "பழையது", alphabetical: "A-Z", confirmDelete: "நீக்கவா?", confirmDeleteAll: "அனைத்தும் அழிக்கவா?" },
    settings: { title: "அமைப்புகள்", subtitle: "ஆப் விருப்பங்கள்", language: "மொழி", languageDesc: "மொழி தேர்வு", clear: "தரவு அழி", clearDesc: "அனைத்து ஸ்கேன்களை நீக்கு", privacy: "தனியுரிமை", privacyDesc: "தரவு கையாளுதல்", about: "பற்றி", version: "பதிப்பு 4.0", madeWith: "♥ உடன் உருவாக்கப்பட்டது" },
    guide: { title: "பயனர் வழிகாட்டி", subtitle: "பயன்படுத்த கற்றுக்கொள்ளுங்கள்", s1: "பிடிப்பு", s1d: "தொலைபேசியை மருந்து லேபிளை நோக்கி வைக்கவும்.", s2: "AI பகுப்பாய்வு", s2d: "AI மருந்தை அடையாளம் கண்டு தகவல்களை பிரித்தெடுக்கிறது.", s3: "முடிவுகளைப் பார்க்க", s3d: "மருந்தின் விரிவான தகவல்களைப் பெறுங்கள்.", tip: "குறிப்புகள்", tipText: "சிறந்த முடிவுகளுக்கு நல்ல வெளிச்சத்தைப் பயன்படுத்தவும்.", features: "முக்கிய அம்சங்கள்", f1: "உடனடி அடையாளம்", f1d: "AI நொடிகளில் அடையாளம் காணும்", f2: "பல மொழி", f2d: "5 மொழிகளில் முடிவுகள்", f3: "ஆஃப்லைன் வரலாறு", f3d: "எப்போதும் அணுகலாம்", f4: "தனியுரிமை முதல்", f4d: "தரவு உங்கள் சாதனத்தில்", safety: "பாதுகாப்பு தகவல்", safetyText: "MedScan AI மருந்துகளைப் புரிந்துகொள்ள உதவுகிறது. இது தொழில்முறை மருத்துவ ஆலோசனையை மாற்றாது.", faq: "பொதுவான கேள்விகள்", q1: "என் தரவு பாதுகாப்பானதா?", a1: "ஆம், தரவு உங்கள் சாதனத்தில் மட்டுமே சேமிக்கப்படும்.", q2: "ஸ்கேன் எவ்வளவு துல்லியமானது?", a2: "உயர் துல்லியம், ஆனால் மருந்தாளரிடம் உறுதிப்படுத்தவும்.", q3: "எந்த மருந்தையும் ஸ்கேன் செய்யலாமா?", a3: "படிக்கக்கூடிய லேபிள்கள் கொண்ட பெரும்பாலான மருந்துகள்." },
    privacy: { title: "தனியுரிமை", subtitle: "உங்கள் தனியுரிமை முக்கியம்", t1: "செயலாக்கம்", d1: "படங்கள் நிகழ்நேரத்தில் செயலாக்கப்படும்", t2: "உள்ளூர் சேமிப்பு", d2: "வரலாறு உங்கள் சாதனத்தில் மட்டுமே", t3: "கேமரா", d3: "ஸ்கேனிங்கிற்கு மட்டுமே", t4: "கண்காணிப்பு இல்லை", d4: "தனிப்பட்ட தகவல்களை சேகரிக்கவில்லை" },
    errors: { notMedicine: "இது மருந்து போல் தெரியவில்லை", scanFailed: "ஸ்கேன் தோல்வி", networkError: "நெட்வொர்க் பிழை", generic: "ஏதோ தவறு நடந்தது" }
  }
};

const t = (lang, key) => {
  const keys = key.split('.');
  let r = UI_STRINGS[lang];
  for (const k of keys) { r = r?.[k]; if (r === undefined) break; }
  if (r === undefined) { r = UI_STRINGS.en; for (const k of keys) { r = r?.[k]; if (r === undefined) return key; } }
  return r || key;
};

// ============================================================================
// CARD COMPONENT
// ============================================================================
const Card = ({ children, className = "", onClick, variant = "default" }) => {
  const variants = {
    default: "bg-white border-slate-200",
    warning: "bg-amber-50 border-amber-200",
    danger: "bg-red-50 border-red-200",
    success: "bg-emerald-50 border-emerald-200"
  };
  return (
    <div onClick={onClick} className={`border rounded-2xl shadow-sm transition-all ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''} ${className}`}>
      {children}
    </div>
  );
};

// ============================================================================
// MAIN APP
// ============================================================================
export default function MedScanApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [showScanOptions, setShowScanOptions] = useState(false);
  
  const cameraRef = useRef(null);
  const fileRef = useRef(null);

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
    if (!response.ok) throw new Error('Server Error');
    return response.json();
  };

  // Enhanced prompt for more comprehensive data
  const createPrompt = (targetLang) => `You are a pharmaceutical expert. Analyze this medication image thoroughly.
If NOT a medication, respond: {"error": "NOT_MEDICINE"}
If it IS medication, extract ALL available information in ${LANGUAGE_NAMES[targetLang]}.
Return JSON with these fields:
{
  "brandName": "Brand/trade name",
  "genericName": "Generic/chemical name",
  "manufacturer": "Manufacturing company",
  "dosageForm": "tablet/capsule/liquid/etc",
  "strength": "Dosage strength",
  "purpose": "What this medicine treats - be detailed",
  "howToTake": "Complete dosage instructions including frequency, timing, with/without food",
  "sideEffects": ["List common side effects"],
  "warnings": ["Important safety warnings"],
  "storage": "Storage requirements",
  "interactions": ["Known drug interactions"],
  "contraindications": ["Who should NOT take this medicine"],
  "activeIngredients": ["List active ingredients"],
  "pregnancyWarning": "Safety during pregnancy/breastfeeding",
  "foodInteractions": "Foods to avoid or take with",
  "onsetTime": "How long until it takes effect",
  "duration": "How long effects last"
}
Be comprehensive and patient-friendly. Include all information visible on the packaging.`;

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

  useEffect(() => {
    if (screen === 'result' && scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) reAnalyzeForLanguage(scanResult);
  }, [lang, screen, scanResult]);

  const sortedHistory = useMemo(() => {
    let results = [...history];
    results.sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'alphabetical') return (a.brandName || '').localeCompare(b.brandName || '');
      return new Date(b.date) - new Date(a.date);
    });
    return results;
  }, [history, sortOrder]);

  const exportHistory = useCallback(() => {
    const text = history.map(item => `${item.brandName} (${item.genericName}) - ${item.strength}`).join('\n');
    if (navigator.share) navigator.share({ title: 'MedScan AI', text }).catch(() => {});
    else if (navigator.clipboard) navigator.clipboard.writeText(text);
  }, [history]);

  const deleteScan = useCallback((id) => { if (window.confirm(t(lang, 'history.confirmDelete'))) setHistory(prev => prev.filter(item => item.id !== id)); }, [lang]);
  const clearAllHistory = useCallback(() => { if (window.confirm(t(lang, 'history.confirmDeleteAll'))) { setHistory([]); try { window.localStorage?.removeItem('medscan_history'); } catch(e){} } }, [lang]);

  if (showSplash) return <SplashScreen onComplete={() => setShowSplash(false)} />;

  // Scan Modal
  const ScanOptionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={() => setShowScanOptions(false)}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{t(lang, 'home.scan')}</h3>
        <div className="space-y-3">
          <button onClick={() => cameraRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center"><Camera size={24} /></div>
            <span className="text-lg">{t(lang, 'home.camera')}</span>
            <ChevronRight className="ml-auto opacity-60" size={20} />
          </button>
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center"><Image size={24} /></div>
            <span className="text-lg">{t(lang, 'home.gallery')}</span>
            <ChevronRight className="ml-auto opacity-30" size={20} />
          </button>
          <button onClick={() => setShowScanOptions(false)} className="w-full p-4 text-slate-500 font-medium">{t(lang, 'home.cancel')}</button>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-emerald-600 text-sm font-semibold">{t(lang, 'home.greeting')}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{t(lang, 'home.title')}</h1>
          <p className="text-slate-500 mt-1">{t(lang, 'home.subtitle')}</p>
          {history.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-700 font-bold">{history.length}</span>
              <span className="text-emerald-600 text-sm">{t(lang, 'home.scanCount')}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <Card onClick={() => !loading && setShowScanOptions(true)} className="p-6 min-h-[320px] flex flex-col items-center justify-center">
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              
              {loading ? <ScanningAnimation text={t(lang, 'home.analyzing')} /> : (
                <>
                  <div className="mb-6">
                    <RotatingGlobe size={120} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{t(lang, 'home.scan')}</h3>
                  <p className="text-slate-500 mt-1 text-center">{t(lang, 'home.scanDesc')}</p>
                </>
              )}
            </Card>

            {error && (
              <Card className="p-4 mt-4" variant="danger">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <p className="text-red-700 flex-1 text-sm">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400"><X size={18} /></button>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-7 space-y-5">
            <Card className="p-4" variant="warning">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-600" size={20} /></div>
                <p className="text-amber-800 text-sm leading-relaxed">{t(lang, 'home.disclaimer')}</p>
              </div>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  {t(lang, 'home.recent')}
                </h3>
                {history.length > 0 && <button onClick={() => navigateTo('history')} className="text-emerald-600 font-semibold text-sm flex items-center gap-1">View All <ChevronRight size={16} /></button>}
              </div>
              
              {history.length === 0 ? (
                <Card className="p-10 text-center">
                  <Sparkles className="mx-auto mb-4 text-slate-300" size={32} />
                  <h4 className="text-slate-700 font-semibold">{t(lang, 'home.empty')}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t(lang, 'home.emptyDesc')}</p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.slice(0, 4).map((item) => (
                    <Card key={item.id} className="p-3" onClick={() => { setScanResult(item); navigateTo('result', 'home'); }}>
                      <div className="flex items-center gap-3">
                        <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-emerald-600 font-semibold">{new Date(item.date).toLocaleDateString()}</p>
                          <h4 className="text-slate-800 font-bold text-sm truncate">{item.brandName}</h4>
                          <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                        </div>
                        <ChevronRight className="text-slate-300" size={18} />
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
    const r = scanResult;
    return (
      <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm"><ArrowLeft size={18} /> {t(lang, 'result.back')}</button>
            <button onClick={() => navigator.share?.({ title: r.brandName, text: r.purpose })} className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"><Share2 size={18} className="text-slate-600" /></button>
          </div>

          <Card className="p-5 mb-5">
            <div className="flex gap-4">
              <img src={r.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">{r.dosageForm}</span>
                  {r.strength !== 'N/A' && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{r.strength}</span>}
                </div>
                <h1 className="text-2xl font-bold text-slate-800 truncate">{r.brandName}</h1>
                <p className="text-slate-500 truncate">{r.genericName}</p>
                {r.manufacturer !== 'N/A' && <p className="text-slate-400 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {r.manufacturer}</p>}
              </div>
            </div>
            {isTranslating && <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700"><RefreshCw size={16} className="animate-spin" /><span className="text-sm font-medium">{t(lang, 'result.translating')}</span></div>}
          </Card>

          <div className="space-y-3">
            {r.purpose !== 'N/A' && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Heart className="text-emerald-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.purpose')}</h4><p className="text-slate-700 text-sm">{r.purpose}</p></div></div></Card>}
            
            {r.activeIngredients?.length > 0 && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center shrink-0"><Activity className="text-cyan-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.activeIngredients')}</h4><div className="flex flex-wrap gap-1">{r.activeIngredients.map((ing, i) => <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded text-xs">{ing}</span>)}</div></div></div></Card>}
            
            {r.howToTake !== 'N/A' && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Clock className="text-blue-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.howTo')}</h4><p className="text-slate-700 text-sm">{r.howToTake}</p></div></div></Card>}
            
            {(r.onsetTime || r.duration) && <div className="grid grid-cols-2 gap-3">
              {r.onsetTime && <Card className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0"><Zap className="text-indigo-600" size={16} /></div><div><h4 className="text-slate-400 text-[9px] font-bold uppercase">{t(lang, 'result.onset')}</h4><p className="text-slate-700 text-sm font-medium">{r.onsetTime}</p></div></div></Card>}
              {r.duration && <Card className="p-4"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center shrink-0"><Clock className="text-purple-600" size={16} /></div><div><h4 className="text-slate-400 text-[9px] font-bold uppercase">{t(lang, 'result.duration')}</h4><p className="text-slate-700 text-sm font-medium">{r.duration}</p></div></div></Card>}
            </div>}
            
            {r.storage !== 'N/A' && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0"><ThermometerSun className="text-violet-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.storage')}</h4><p className="text-slate-700 text-sm">{r.storage}</p></div></div></Card>}
            
            {r.foodInteractions && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0"><Coffee className="text-orange-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.food')}</h4><p className="text-slate-700 text-sm">{r.foodInteractions}</p></div></div></Card>}
            
            {r.pregnancyWarning && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0"><Baby className="text-pink-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.pregnancy')}</h4><p className="text-slate-700 text-sm">{r.pregnancyWarning}</p></div></div></Card>}
            
            {r.sideEffects?.length > 0 && <Card className="p-4" variant="warning"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-700" size={18} /></div><div className="flex-1"><h4 className="text-amber-700 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.effects')}</h4><ul className="space-y-1">{r.sideEffects.map((e, i) => <li key={i} className="text-amber-900 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />{e}</li>)}</ul></div></div></Card>}
            
            {r.contraindications?.length > 0 && <Card className="p-4" variant="danger"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center shrink-0"><Users className="text-red-700" size={18} /></div><div className="flex-1"><h4 className="text-red-700 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.contraindications')}</h4><ul className="space-y-1">{r.contraindications.map((c, i) => <li key={i} className="text-red-900 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />{c}</li>)}</ul></div></div></Card>}
            
            {r.warnings?.length > 0 && <Card className="p-4" variant="danger"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center shrink-0"><ShieldCheck className="text-red-700" size={18} /></div><div className="flex-1"><h4 className="text-red-700 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.warnings')}</h4><ul className="space-y-1">{r.warnings.map((w, i) => <li key={i} className="text-red-900 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />{w}</li>)}</ul></div></div></Card>}
            
            {r.interactions?.length > 0 && <Card className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0"><Zap className="text-rose-600" size={18} /></div><div className="flex-1"><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.interactions')}</h4><ul className="space-y-1">{r.interactions.map((int, idx) => <li key={idx} className="text-slate-700 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />{int}</li>)}</ul></div></div></Card>}
          </div>
          <div className="mt-5 p-4 rounded-xl bg-slate-100 text-center"><p className="text-slate-500 text-sm">{t(lang, 'result.disclaimer')}</p></div>
        </div>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{t(lang, 'history.title')}</h1>
            <p className="text-slate-500 text-sm">{t(lang, 'history.subtitle')}</p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-2">
              <button onClick={exportHistory} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm flex items-center gap-2 shadow-sm"><Upload size={16} /> {t(lang, 'history.export')}</button>
              <button onClick={clearAllHistory} className="px-4 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm flex items-center gap-2"><Trash2 size={16} /> {t(lang, 'history.deleteAll')}</button>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <Card className="p-14 text-center">
            <History className="mx-auto mb-4 text-slate-300" size={44} />
            <h3 className="text-slate-700 font-bold text-xl mb-1">{t(lang, 'history.noHistory')}</h3>
            <p className="text-slate-500 mb-6">{t(lang, 'history.noHistoryDesc')}</p>
            <button onClick={() => navigateTo('home')} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold">Scan Medicine</button>
          </Card>
        ) : (
          <>
            <div className="mb-5">
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-sm">
                <option value="newest">{t(lang, 'history.newest')}</option>
                <option value="oldest">{t(lang, 'history.oldest')}</option>
                <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
              </select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedHistory.map((item) => (
                <Card key={item.id} className="p-3 group" onClick={() => { setScanResult(item); navigateTo('result', 'history'); }}>
                  <div className="flex items-center gap-3">
                    <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-800 font-bold text-sm truncate">{item.brandName}</h4>
                      <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }} className="w-9 h-9 rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 flex items-center justify-center text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Enhanced Guide Screen
  const GuideScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'guide.title')}</h1>
        <p className="text-slate-500 text-sm mb-8">{t(lang, 'guide.subtitle')}</p>
        
        {/* How to Use Steps */}
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><BookOpen size={20} className="text-emerald-500" /> How to Scan</h2>
        <div className="space-y-3 mb-8">
          {[
            { icon: Camera, color: 'emerald', num: '1', title: t(lang, 'guide.s1'), desc: t(lang, 'guide.s1d') },
            { icon: Globe, color: 'blue', num: '2', title: t(lang, 'guide.s2'), desc: t(lang, 'guide.s2d') },
            { icon: FileText, color: 'violet', num: '3', title: t(lang, 'guide.s3'), desc: t(lang, 'guide.s3d') }
          ].map((step, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${step.color === 'emerald' ? 'bg-emerald-100' : step.color === 'blue' ? 'bg-blue-100' : 'bg-violet-100'}`}>
                  <step.icon className={step.color === 'emerald' ? 'text-emerald-600' : step.color === 'blue' ? 'text-blue-600' : 'text-violet-600'} size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">{step.num}</span>
                    <h3 className="text-slate-800 font-bold">{step.title}</h3>
                  </div>
                  <p className="text-slate-500 text-sm">{step.desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pro Tips */}
        <Card className="p-4 mb-8" variant="success">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-200 flex items-center justify-center shrink-0"><Lightbulb className="text-emerald-700" size={20} /></div>
            <div>
              <h4 className="text-emerald-800 font-bold">{t(lang, 'guide.tip')}</h4>
              <p className="text-emerald-700 text-sm mt-1">{t(lang, 'guide.tipText')}</p>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Star size={20} className="text-amber-500" /> {t(lang, 'guide.features')}</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            { icon: Zap, title: t(lang, 'guide.f1'), desc: t(lang, 'guide.f1d'), color: 'amber' },
            { icon: Globe, title: t(lang, 'guide.f2'), desc: t(lang, 'guide.f2d'), color: 'blue' },
            { icon: History, title: t(lang, 'guide.f3'), desc: t(lang, 'guide.f3d'), color: 'violet' },
            { icon: Shield, title: t(lang, 'guide.f4'), desc: t(lang, 'guide.f4d'), color: 'emerald' }
          ].map((f, i) => (
            <Card key={i} className="p-4">
              <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center ${f.color === 'amber' ? 'bg-amber-100' : f.color === 'blue' ? 'bg-blue-100' : f.color === 'violet' ? 'bg-violet-100' : 'bg-emerald-100'}`}>
                <f.icon className={f.color === 'amber' ? 'text-amber-600' : f.color === 'blue' ? 'text-blue-600' : f.color === 'violet' ? 'text-violet-600' : 'text-emerald-600'} size={20} />
              </div>
              <h4 className="text-slate-800 font-bold text-sm">{f.title}</h4>
              <p className="text-slate-500 text-xs mt-0.5">{f.desc}</p>
            </Card>
          ))}
        </div>

        {/* Safety Info */}
        <Card className="p-4 mb-8" variant="warning">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-700" size={20} /></div>
            <div>
              <h4 className="text-amber-800 font-bold">{t(lang, 'guide.safety')}</h4>
              <p className="text-amber-700 text-sm mt-1">{t(lang, 'guide.safetyText')}</p>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2"><Info size={20} className="text-blue-500" /> {t(lang, 'guide.faq')}</h2>
        <div className="space-y-3">
          {[
            { q: t(lang, 'guide.q1'), a: t(lang, 'guide.a1') },
            { q: t(lang, 'guide.q2'), a: t(lang, 'guide.a2') },
            { q: t(lang, 'guide.q3'), a: t(lang, 'guide.a3') }
          ].map((faq, i) => (
            <Card key={i} className="p-4">
              <h4 className="text-slate-800 font-semibold text-sm mb-1">{faq.q}</h4>
              <p className="text-slate-500 text-sm">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'settings.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'settings.subtitle')}</p>
        <Card className="overflow-hidden mb-5">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50"><Globe className="text-emerald-500" size={20} /><div><span className="text-slate-800 font-bold text-sm">{t(lang, 'settings.language')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.languageDesc')}</p></div></div>
          <div className="p-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-3 rounded-xl flex items-center justify-between transition-all mb-1 ${lang === l.code ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3"><span className="text-xl">{l.flag}</span><span className="font-medium text-slate-700 text-sm">{l.nativeName}</span></div>
                {lang === l.code && <CheckCircle2 size={18} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </Card>
        <div className="space-y-2">
          <Card className="p-4" onClick={() => navigateTo('privacy')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Lock className="text-slate-500" size={18} /></div>
              <div className="flex-1"><span className="text-slate-800 font-bold text-sm">{t(lang, 'settings.privacy')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.privacyDesc')}</p></div>
              <ChevronRight className="text-slate-300" size={18} />
            </div>
          </Card>
          <Card className="p-4" variant="danger" onClick={clearAllHistory}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="text-red-500" size={18} /></div>
              <div className="flex-1"><span className="text-red-700 font-bold text-sm">{t(lang, 'settings.clear')}</span><p className="text-red-500 text-xs">{t(lang, 'settings.clearDesc')}</p></div>
            </div>
          </Card>
        </div>
        <div className="mt-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-lg"><Pill className="text-white" size={28} /></div>
          <h3 className="text-slate-800 font-bold">{t(lang, 'settings.about')}</h3>
          <p className="text-slate-500 text-sm">{t(lang, 'settings.version')}</p>
          <p className="text-slate-400 text-xs mt-2">{t(lang, 'settings.madeWith')}</p>
        </div>
      </div>
    </div>
  );

  const PrivacyScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm mb-6 shadow-sm"><ArrowLeft size={16} /> {t(lang, 'settings.title')}</button>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{t(lang, 'privacy.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'privacy.subtitle')}</p>
        <Card className="p-5">
          <div className="space-y-6">
            {[{ icon: Eye, color: 'emerald' }, { icon: Fingerprint, color: 'violet' }, { icon: Camera, color: 'blue' }, { icon: Shield, color: 'amber' }].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color === 'emerald' ? 'bg-emerald-100' : item.color === 'violet' ? 'bg-violet-100' : item.color === 'blue' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                  <item.icon className={item.color === 'emerald' ? 'text-emerald-600' : item.color === 'violet' ? 'text-violet-600' : item.color === 'blue' ? 'text-blue-600' : 'text-amber-600'} size={18} />
                </div>
                <div><h3 className="text-slate-800 font-bold text-sm mb-0.5">{t(lang, `privacy.t${i + 1}`)}</h3><p className="text-slate-500 text-sm">{t(lang, `privacy.d${i + 1}`)}</p></div>
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
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg"><Pill className="text-white" size={24} /></div>
        <div><h1 className="text-slate-800 font-bold">MedScan AI</h1><p className="text-slate-400 text-[10px]">Medicine Scanner</p></div>
      </div>
      <nav className="space-y-1 flex-1">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${isActive ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'text-slate-500 hover:bg-slate-50'}`}>
              <item.icon size={20} /><span>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{history.length}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-2 pb-7 bg-white border-t border-slate-200">
      <div className="flex justify-around max-w-md mx-auto">
        {[{ id: 'home', icon: Home }, { id: 'history', icon: History }, { id: 'guide', icon: BookOpen }, { id: 'settings', icon: Settings }].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen) || (screen === 'privacy' && item.id === 'settings');
          return (
            <button key={item.id} onClick={() => navigateTo(item.id)} className={`relative flex flex-col items-center py-2 px-4 rounded-xl transition-all ${isActive ? 'bg-emerald-50' : ''}`}>
              <item.icon size={22} className={isActive ? 'text-emerald-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold text-emerald-600' : 'text-slate-400'}`}>{t(lang, `nav.${item.id}`)}</span>
              {item.id === 'history' && history.length > 0 && <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] font-bold flex items-center justify-center">{history.length > 9 ? '9+' : history.length}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <DesktopNav />
        <main className="flex-1 min-h-screen pb-24 lg:pb-6">
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
  );
}
