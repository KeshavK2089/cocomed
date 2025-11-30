import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Pill, Home, Globe, Sparkles, ShieldCheck, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, Lock, Calendar, ChevronRight, ArrowLeft, Heart, Clock, MapPin, Upload, Scan, Zap, Shield, Eye, Star, Layers, Fingerprint, Image, ChevronDown, Smartphone, Sun, Users, TrendingUp, Award, Target, Lightbulb, Info, CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================================
// PROFESSIONAL SPACE CANVAS - Globe with Satellites & Moon
// ============================================================================
const SpaceCanvas = ({ size = 300 }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = size * 1.5;
    const h = canvas.height = size * 1.5;
    let time = 0;
    let animId;
    
    // Stars background
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.3
    }));
    
    // Satellites
    const satellites = Array.from({ length: 3 }, (_, i) => ({
      angle: (i / 3) * Math.PI * 2,
      distance: 85 + i * 10,
      speed: 0.5 + i * 0.15,
      size: 3
    }));
    
    const animate = () => {
      // Dark space background
      const bgGradient = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w/2);
      bgGradient.addColorStop(0, '#1e293b');
      bgGradient.addColorStop(1, '#0f172a');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, w, h);
      
      // Draw stars
      stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.5 + Math.sin(time + star.x) * 0.5)})`;
        ctx.fill();
      });
      
      const cx = w / 2;
      const cy = h / 2;
      const globeRadius = 45;
      
      // Earth shadow/glow
      const shadowGradient = ctx.createRadialGradient(cx, cy, globeRadius, cx, cy, globeRadius + 15);
      shadowGradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
      shadowGradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.1)');
      shadowGradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius + 15, 0, Math.PI * 2);
      ctx.fillStyle = shadowGradient;
      ctx.fill();
      
      // Earth globe - main body
      const earthGradient = ctx.createRadialGradient(cx - 15, cy - 15, 0, cx, cy, globeRadius);
      earthGradient.addColorStop(0, '#34d399');
      earthGradient.addColorStop(0.4, '#10b981');
      earthGradient.addColorStop(0.7, '#059669');
      earthGradient.addColorStop(1, '#047857');
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.fillStyle = earthGradient;
      ctx.fill();
      
      // Continents (simple representation)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.3);
      ctx.fillStyle = 'rgba(5, 150, 105, 0.6)';
      
      // Draw simple continent shapes
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dist = globeRadius * 0.6;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist * 0.5;
        ctx.beginPath();
        ctx.ellipse(x, y, 8, 12, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      
      // Globe rim highlight
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Latitude/Longitude lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Latitude lines
      for (let i = -2; i <= 2; i++) {
        const yOffset = (i / 2) * globeRadius * 0.6;
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOffset, globeRadius * 0.95, globeRadius * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Longitude lines
      ctx.save();
      ctx.translate(cx, cy);
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 6);
        ctx.beginPath();
        ctx.ellipse(0, 0, globeRadius * 0.3, globeRadius, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      
      // Satellites orbiting
      satellites.forEach((sat, i) => {
        const angle = time * sat.speed + sat.angle;
        const x = cx + Math.cos(angle) * sat.distance;
        const y = cy + Math.sin(angle) * sat.distance * 0.6;
        const z = Math.sin(angle);
        
        // Satellite orbit path
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(cx, cy, sat.distance, sat.distance * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Satellite body
        const satGradient = ctx.createRadialGradient(x, y, 0, x, y, sat.size * 3);
        satGradient.addColorStop(0, z > 0 ? 'rgba(167, 139, 250, 1)' : 'rgba(139, 92, 246, 0.8)');
        satGradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.5)');
        satGradient.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, sat.size * 2, 0, Math.PI * 2);
        ctx.fillStyle = satGradient;
        ctx.fill();
        
        // Satellite core
        ctx.beginPath();
        ctx.arc(x, y, sat.size, 0, Math.PI * 2);
        ctx.fillStyle = z > 0 ? '#a78bfa' : '#8b5cf6';
        ctx.fill();
        
        // Satellite panels (when visible)
        if (z > 0) {
          ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
          ctx.fillRect(x - sat.size * 3, y - sat.size * 0.5, sat.size * 2, sat.size);
          ctx.fillRect(x + sat.size, y - sat.size * 0.5, sat.size * 2, sat.size);
        }
      });
      
      // Moon
      const moonAngle = time * 0.2;
      const moonDist = 120;
      const moonX = cx + Math.cos(moonAngle) * moonDist;
      const moonY = cy + Math.sin(moonAngle) * moonDist * 0.5;
      const moonRadius = 12;
      
      // Moon glow
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius + 8);
      moonGlow.addColorStop(0, 'rgba(226, 232, 240, 0.4)');
      moonGlow.addColorStop(0.5, 'rgba(226, 232, 240, 0.2)');
      moonGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius + 8, 0, Math.PI * 2);
      ctx.fillStyle = moonGlow;
      ctx.fill();
      
      // Moon body
      const moonGradient = ctx.createRadialGradient(moonX - 3, moonY - 3, 0, moonX, moonY, moonRadius);
      moonGradient.addColorStop(0, '#f1f5f9');
      moonGradient.addColorStop(0.7, '#cbd5e1');
      moonGradient.addColorStop(1, '#94a3b8');
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
      ctx.fillStyle = moonGradient;
      ctx.fill();
      
      // Moon craters
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      [[2, -2, 3], [-3, 3, 2], [3, 4, 2.5]].forEach(([ox, oy, r]) => {
        ctx.beginPath();
        ctx.arc(moonX + ox, moonY + oy, r, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Connection lines (data transmission visualization)
      if (Math.sin(time * 2) > 0) {
        satellites.forEach((sat, i) => {
          const angle = time * sat.speed + sat.angle;
          const x = cx + Math.cos(angle) * sat.distance;
          const y = cy + Math.sin(angle) * sat.distance * 0.6;
          
          const gradient = ctx.createLinearGradient(cx, cy, x, y);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.3)');
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(x, y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1;
          ctx.stroke();
        });
      }
      
      time += 0.015;
      animId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animId);
  }, [size]);
  
  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-full" />;
};

// ============================================================================
// SPLASH SCREEN
// ============================================================================
const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 300); return 100; }
        return p + 2;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [onComplete]);
  
  useEffect(() => {
    if (progress > 30) setPhase(1);
    if (progress > 60) setPhase(2);
    if (progress > 90) setPhase(3);
  }, [progress]);
  
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="absolute opacity-40">
        <SpaceCanvas size={340} />
      </div>
      
      <div className="relative z-10 text-center">
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50" style={{ transform: `scale(${0.8 + progress * 0.004})` }}>
            <Pill className="text-white" size={44} />
          </div>
          <div className="absolute -inset-4 rounded-[2rem] border border-emerald-400/30 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        
        <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent mb-2">MedScan AI</h1>
        <p className="text-emerald-300/70 text-sm mb-10 tracking-widest uppercase">Global Medicine Intelligence</p>
        
        <div className="w-64 mx-auto">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full transition-all duration-300 relative" style={{ width: `${progress}%` }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
          <div className="mt-4 flex justify-between text-xs">
            <span className={`transition-colors ${phase >= 0 ? 'text-emerald-400' : 'text-slate-600'}`}>Initialize</span>
            <span className={`transition-colors ${phase >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>Connect</span>
            <span className={`transition-colors ${phase >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>Ready</span>
          </div>
        </div>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } } .animate-shimmer { animation: shimmer 1.5s infinite; }`}</style>
    </div>
  );
};

// ============================================================================
// SCANNING ANIMATION
// ============================================================================
const ScanningAnimation = ({ lang, t }) => (
  <div className="flex flex-col items-center py-4">
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-r from-emerald-500/20 via-violet-500/20 to-emerald-500/20 rounded-full blur-2xl animate-pulse" />
      <div className="relative rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-emerald-500/20 bg-slate-900">
        <SpaceCanvas size={220} />
      </div>
      <div className="absolute inset-0 rounded-full border-2 border-emerald-400/20" style={{ animation: 'spin 8s linear infinite' }} />
    </div>
    
    <div className="mt-6 text-center">
      <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent">{t(lang, 'home.analyzing')}</h3>
      <p className="text-slate-500 text-sm mt-1">AI recognition in progress...</p>
      
      <div className="flex justify-center gap-2 mt-4">
        {['Scan', 'Process', 'Identify'].map((s, i) => (
          <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-teal-500' : 'bg-cyan-500'}`} style={{ animationDelay: `${i * 200}ms` }} />
            <span className="text-xs text-slate-600 font-medium">{s}</span>
          </div>
        ))}
      </div>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
  return { brandName: safeStr(data.brandName), genericName: safeStr(data.genericName), manufacturer: safeStr(data.manufacturer), dosageForm: safeStr(data.dosageForm), strength: safeStr(data.strength), purpose: safeStr(data.purpose), howToTake: safeStr(data.howToTake), sideEffects: safeArr(data.sideEffects), warnings: safeArr(data.warnings), storage: safeStr(data.storage, "Store at room temperature."), interactions: safeArr(data.interactions || data.drugInteractions) };
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
    home: { greeting: "Welcome to", title: "MedScan AI", subtitle: "Global Medicine Intelligence", scan: "Scan Medicine", scanDesc: "Tap to analyze any medication", analyzing: "Analyzing Medicine", recent: "Recent Scans", empty: "No scans yet", emptyDesc: "Start by scanning a medicine", disclaimer: "⚠️ Educational only. Always consult healthcare professionals.", scanCount: "medicines analyzed", camera: "Take Photo", gallery: "Choose from Gallery", cancel: "Cancel" },
    result: { back: "Back", purpose: "Purpose", howTo: "Dosage", effects: "Side Effects", warnings: "Warnings", storage: "Storage", interactions: "Interactions", disclaimer: "Consult your healthcare provider.", translating: "Translating...", share: "Share" },
    history: { title: "Medicine Library", subtitle: "Your scan history", noHistory: "No scans yet", noHistoryDesc: "Your scanned medicines appear here", export: "Export", deleteAll: "Clear", newest: "Newest First", oldest: "Oldest First", alphabetical: "A to Z", confirmDelete: "Delete?", confirmDeleteAll: "Clear all?" },
    settings: { title: "Settings", subtitle: "Preferences", language: "Language", languageDesc: "Select language", clear: "Clear Data", clearDesc: "Remove all scans", privacy: "Privacy", privacyDesc: "Data handling", about: "About", version: "Version 4.0", madeWith: "Made with ♥" },
    guide: {
      title: "How to Use MedScan AI",
      subtitle: "Complete user guide",
      gettingStarted: "Getting Started",
      step1Title: "Position Your Camera",
      step1Desc: "Hold your device steady and point the camera directly at the medicine packaging. Ensure the text is clearly visible.",
      step2Title: "Capture the Image",
      step2Desc: "Tap the scan button and take a clear photo. The AI will automatically detect and extract information from the packaging.",
      step3Title: "Review Results",
      step3Desc: "Read the comprehensive medication details including purpose, dosage, warnings, and storage instructions.",
      bestPractices: "Best Practices",
      tip1: "Use good lighting",
      tip1Desc: "Natural daylight or bright indoor lighting improves accuracy significantly.",
      tip2: "Keep packaging flat",
      tip2Desc: "Place the medicine on a flat surface to avoid shadows and blurred text.",
      tip3: "Focus on labels",
      tip3Desc: "Capture the main label with brand name, generic name, and dosage information clearly visible.",
      tip4: "Avoid reflections",
      tip4Desc: "Tilt slightly if there's glare from plastic wrapping or glossy surfaces.",
      accuracy: "Accuracy Tips",
      accTip1: "Clean packaging works best",
      accTip2: "Include the entire label in frame",
      accTip3: "Hold device parallel to packaging",
      accTip4: "Scan in well-lit areas",
      safety: "Safety Information",
      safety1: "Educational Purpose Only",
      safety1Desc: "This app is designed for informational purposes. Always consult healthcare professionals before taking any medication.",
      safety2: "Verify Information",
      safety2Desc: "Cross-reference the AI results with official product documentation and consult your pharmacist or doctor.",
      safety3: "Store Safely",
      safety3Desc: "Keep all medicines out of reach of children and follow storage instructions on the packaging.",
      troubleshooting: "Troubleshooting",
      problem1: "Blurry results?",
      problem1Fix: "Ensure good lighting and hold camera steady for 2-3 seconds.",
      problem2: "Wrong information detected?",
      problem2Fix: "Retake photo with better focus on the label. Ensure full text is visible.",
      problem3: "App not detecting medicine?",
      problem3Fix: "Check if packaging has clear text. Try different angles or lighting.",
      languages: "Multi-Language Support",
      langDesc: "MedScan AI supports English, Spanish, Chinese, Hindi, and Tamil. Change language anytime in Settings.",
      privacy: "Privacy & Data",
      privacyDesc: "All scans are processed locally. Images are stored only on your device and never uploaded to external servers."
    },
    privacy: { title: "Privacy", subtitle: "Your data matters", t1: "Processing", d1: "Images analyzed in real-time", t2: "Storage", d2: "Data stays on your device", t3: "Camera", d3: "Used only for scanning", t4: "Disclaimer", d4: "Educational tool only" },
    errors: { notMedicine: "Not a medicine detected", scanFailed: "Scan failed", networkError: "Network error", generic: "Something went wrong" }
  },
  es: {
    nav: { home: "Inicio", history: "Historial", guide: "Guía", settings: "Ajustes" },
    home: { greeting: "Bienvenido a", title: "MedScan AI", subtitle: "Inteligencia Médica Global", scan: "Escanear", scanDesc: "Toca para analizar medicamentos", analyzing: "Analizando", recent: "Recientes", empty: "Sin escaneos", emptyDesc: "Escanea un medicamento", disclaimer: "⚠️ Solo educativo. Consulta profesionales.", scanCount: "medicamentos", camera: "Tomar Foto", gallery: "Elegir de Galería", cancel: "Cancelar" },
    result: { back: "Volver", purpose: "Propósito", howTo: "Dosis", effects: "Efectos", warnings: "Advertencias", storage: "Almacenamiento", interactions: "Interacciones", disclaimer: "Consulta a tu médico.", translating: "Traduciendo...", share: "Compartir" },
    history: { title: "Biblioteca", subtitle: "Tu historial", noHistory: "Sin historial", noHistoryDesc: "Tus medicamentos aquí", export: "Exportar", deleteAll: "Borrar", newest: "Recientes", oldest: "Antiguos", alphabetical: "A-Z", confirmDelete: "¿Eliminar?", confirmDeleteAll: "¿Borrar todo?" },
    settings: { title: "Ajustes", subtitle: "Preferencias", language: "Idioma", languageDesc: "Seleccionar", clear: "Borrar", clearDesc: "Eliminar escaneos", privacy: "Privacidad", privacyDesc: "Datos", about: "Acerca de", version: "Versión 4.0", madeWith: "Hecho con ♥" },
    guide: {
      title: "Cómo Usar MedScan AI",
      subtitle: "Guía completa",
      gettingStarted: "Comenzar",
      step1Title: "Posiciona la Cámara",
      step1Desc: "Mantén tu dispositivo estable y apunta la cámara directamente al empaque del medicamento.",
      step2Title: "Captura la Imagen",
      step2Desc: "Toca el botón de escaneo y toma una foto clara. La IA detectará automáticamente la información.",
      step3Title: "Revisa Resultados",
      step3Desc: "Lee los detalles completos del medicamento incluyendo propósito, dosis, advertencias y almacenamiento.",
      bestPractices: "Mejores Prácticas",
      tip1: "Usa buena iluminación",
      tip1Desc: "La luz natural o interior brillante mejora significativamente la precisión.",
      tip2: "Mantén el empaque plano",
      tip2Desc: "Coloca el medicamento en una superficie plana para evitar sombras.",
      tip3: "Enfócate en etiquetas",
      tip3Desc: "Captura la etiqueta principal con nombre de marca, genérico y dosis claramente visibles.",
      tip4: "Evita reflejos",
      tip4Desc: "Inclina ligeramente si hay brillo del plástico o superficies brillantes.",
      accuracy: "Consejos de Precisión",
      accTip1: "El empaque limpio funciona mejor",
      accTip2: "Incluye toda la etiqueta en el encuadre",
      accTip3: "Mantén el dispositivo paralelo",
      accTip4: "Escanea en áreas bien iluminadas",
      safety: "Información de Seguridad",
      safety1: "Solo Propósito Educativo",
      safety1Desc: "Esta aplicación es solo informativa. Consulta siempre a profesionales de la salud.",
      safety2: "Verifica la Información",
      safety2Desc: "Verifica los resultados con documentación oficial y consulta a tu farmacéutico.",
      safety3: "Almacena Seguramente",
      safety3Desc: "Mantén todos los medicamentos fuera del alcance de los niños.",
      troubleshooting: "Solución de Problemas",
      problem1: "¿Resultados borrosos?",
      problem1Fix: "Asegura buena iluminación y mantén la cámara estable por 2-3 segundos.",
      problem2: "¿Información incorrecta?",
      problem2Fix: "Retoma la foto con mejor enfoque en la etiqueta.",
      problem3: "¿No detecta medicamento?",
      problem3Fix: "Verifica que el empaque tenga texto claro. Prueba diferentes ángulos.",
      languages: "Soporte Multiidioma",
      langDesc: "MedScan AI admite inglés, español, chino, hindi y tamil. Cambia el idioma en Ajustes.",
      privacy: "Privacidad y Datos",
      privacyDesc: "Todos los escaneos se procesan localmente. Las imágenes solo se almacenan en tu dispositivo."
    },
    privacy: { title: "Privacidad", subtitle: "Tus datos importan", t1: "Procesamiento", d1: "Análisis en tiempo real", t2: "Almacenamiento", d2: "Datos en tu dispositivo", t3: "Cámara", d3: "Solo para escanear", t4: "Aviso", d4: "Herramienta educativa" },
    errors: { notMedicine: "No es medicamento", scanFailed: "Escaneo fallido", networkError: "Error de red", generic: "Algo salió mal" }
  },
  zh: {
    nav: { home: "首页", history: "历史", guide: "指南", settings: "设置" },
    home: { greeting: "欢迎使用", title: "MedScan AI", subtitle: "全球药物智能", scan: "扫描药物", scanDesc: "点击分析任何药物", analyzing: "分析中", recent: "最近扫描", empty: "暂无扫描", emptyDesc: "开始扫描药物", disclaimer: "⚠️ 仅供教育。请咨询医生。", scanCount: "药物已分析", camera: "拍照", gallery: "从相册选择", cancel: "取消" },
    result: { back: "返回", purpose: "用途", howTo: "剂量", effects: "副作用", warnings: "警告", storage: "储存", interactions: "相互作用", disclaimer: "请咨询医生。", translating: "翻译中...", share: "分享" },
    history: { title: "药物库", subtitle: "扫描历史", noHistory: "暂无扫描", noHistoryDesc: "扫描药物将显示在这里", export: "导出", deleteAll: "清除", newest: "最新", oldest: "最旧", alphabetical: "A-Z", confirmDelete: "删除？", confirmDeleteAll: "清除全部？" },
    settings: { title: "设置", subtitle: "偏好", language: "语言", languageDesc: "选择语言", clear: "清除数据", clearDesc: "删除扫描", privacy: "隐私", privacyDesc: "数据处理", about: "关于", version: "版本 4.0", madeWith: "用♥制作" },
    guide: {
      title: "如何使用 MedScan AI",
      subtitle: "完整用户指南",
      gettingStarted: "开始使用",
      step1Title: "定位相机",
      step1Desc: "稳定握住设备，将相机直接对准药品包装。确保文字清晰可见。",
      step2Title: "捕获图像",
      step2Desc: "点击扫描按钮并拍摄清晰照片。AI将自动检测并提取包装信息。",
      step3Title: "查看结果",
      step3Desc: "阅读包括用途、剂量、警告和储存说明在内的全面药物详情。",
      bestPractices: "最佳实践",
      tip1: "使用良好照明",
      tip1Desc: "自然光或明亮的室内照明可显著提高准确性。",
      tip2: "保持包装平整",
      tip2Desc: "将药品放在平面上以避免阴影和模糊文字。",
      tip3: "聚焦标签",
      tip3Desc: "捕获带有品牌名称、通用名称和剂量信息清晰可见的主标签。",
      tip4: "避免反光",
      tip4Desc: "如果塑料包装或光滑表面有眩光，请稍微倾斜。",
      accuracy: "准确性提示",
      accTip1: "干净包装效果最佳",
      accTip2: "在框架中包含整个标签",
      accTip3: "保持设备与包装平行",
      accTip4: "在光线充足的区域扫描",
      safety: "安全信息",
      safety1: "仅用于教育目的",
      safety1Desc: "此应用仅供参考。服用任何药物前请咨询医疗专业人员。",
      safety2: "验证信息",
      safety2Desc: "将AI结果与官方产品文档交叉参考，并咨询药剂师或医生。",
      safety3: "安全存储",
      safety3Desc: "将所有药物放在儿童接触不到的地方，并遵循包装上的储存说明。",
      troubleshooting: "故障排除",
      problem1: "结果模糊？",
      problem1Fix: "确保良好照明，并稳定握住相机2-3秒。",
      problem2: "检测到错误信息？",
      problem2Fix: "重新拍照，更好地聚焦标签。确保完整文字可见。",
      problem3: "应用未检测到药物？",
      problem3Fix: "检查包装是否有清晰文字。尝试不同角度或照明。",
      languages: "多语言支持",
      langDesc: "MedScan AI支持英语、西班牙语、中文、印地语和泰米尔语。随时在设置中更改语言。",
      privacy: "隐私和数据",
      privacyDesc: "所有扫描都在本地处理。图像仅存储在您的设备上，不会上传到外部服务器。"
    },
    privacy: { title: "隐私", subtitle: "数据安全", t1: "处理", d1: "实时分析", t2: "存储", d2: "数据在设备上", t3: "相机", d3: "仅用于扫描", t4: "声明", d4: "教育工具" },
    errors: { notMedicine: "未检测到药物", scanFailed: "扫描失败", networkError: "网络错误", generic: "出错了" }
  },
  hi: {
    nav: { home: "होम", history: "इतिहास", guide: "गाइड", settings: "सेटिंग्स" },
    home: { greeting: "स्वागत है", title: "MedScan AI", subtitle: "वैश्विक दवा बुद्धिमत्ता", scan: "दवा स्कैन करें", scanDesc: "विश्लेषण के लिए टैप करें", analyzing: "विश्लेषण हो रहा है", recent: "हाल के स्कैन", empty: "कोई स्कैन नहीं", emptyDesc: "दवा स्कैन करें", disclaimer: "⚠️ केवल शैक्षिक। डॉक्टर से परामर्श करें।", scanCount: "दवाएं विश्लेषित", camera: "फोटो लें", gallery: "गैलरी से चुनें", cancel: "रद्द करें" },
    result: { back: "वापस", purpose: "उद्देश्य", howTo: "खुराक", effects: "दुष्प्रभाव", warnings: "चेतावनी", storage: "भंडारण", interactions: "इंटरैक्शन", disclaimer: "डॉक्टर से परामर्श करें।", translating: "अनुवाद...", share: "साझा करें" },
    history: { title: "दवा पुस्तकालय", subtitle: "स्कैन इतिहास", noHistory: "कोई स्कैन नहीं", noHistoryDesc: "दवाएं यहां दिखेंगी", export: "निर्यात", deleteAll: "साफ़", newest: "नवीनतम", oldest: "पुराना", alphabetical: "A-Z", confirmDelete: "हटाएं?", confirmDeleteAll: "सब साफ़?" },
    settings: { title: "सेटिंग्स", subtitle: "प्राथमिकताएं", language: "भाषा", languageDesc: "चुनें", clear: "डेटा साफ़", clearDesc: "स्कैन हटाएं", privacy: "गोपनीयता", privacyDesc: "डेटा", about: "जानकारी", version: "संस्करण 4.0", madeWith: "♥ से बनाया" },
    guide: {
      title: "MedScan AI का उपयोग कैसे करें",
      subtitle: "पूर्ण उपयोगकर्ता गाइड",
      gettingStarted: "शुरू करना",
      step1Title: "कैमरा स्थापित करें",
      step1Desc: "अपने डिवाइस को स्थिर रखें और कैमरे को सीधे दवा की पैकेजिंग की ओर इंगित करें।",
      step2Title: "छवि कैप्चर करें",
      step2Desc: "स्कैन बटन टैप करें और एक स्पष्ट फोटो लें। AI स्वचालित रूप से जानकारी निकालेगा।",
      step3Title: "परिणाम देखें",
      step3Desc: "उद्देश्य, खुराक, चेतावनी और भंडारण निर्देश सहित व्यापक दवा विवरण पढ़ें।",
      bestPractices: "सर्वोत्तम प्रथाएं",
      tip1: "अच्छी रोशनी का उपयोग करें",
      tip1Desc: "प्राकृतिक दिन का प्रकाश या उज्ज्वल इनडोर प्रकाश सटीकता में काफी सुधार करता है।",
      tip2: "पैकेजिंग को सपाट रखें",
      tip2Desc: "छाया और धुंधले पाठ से बचने के लिए दवा को सपाट सतह पर रखें।",
      tip3: "लेबल पर ध्यान दें",
      tip3Desc: "ब्रांड नाम, सामान्य नाम और खुराक जानकारी स्पष्ट रूप से दिखाई देने वाले मुख्य लेबल को कैप्चर करें।",
      tip4: "प्रतिबिंबों से बचें",
      tip4Desc: "यदि प्लास्टिक रैपिंग या चमकदार सतहों से चमक है तो थोड़ा झुकाएं।",
      accuracy: "सटीकता युक्तियाँ",
      accTip1: "साफ पैकेजिंग सबसे अच्छा काम करती है",
      accTip2: "फ्रेम में पूरा लेबल शामिल करें",
      accTip3: "डिवाइस को पैकेजिंग के समानांतर रखें",
      accTip4: "अच्छी तरह से रोशनी वाले क्षेत्रों में स्कैन करें",
      safety: "सुरक्षा जानकारी",
      safety1: "केवल शैक्षिक उद्देश्य",
      safety1Desc: "यह ऐप केवल सूचनात्मक उद्देश्यों के लिए है। कोई भी दवा लेने से पहले स्वास्थ्य पेशेवरों से परामर्श करें।",
      safety2: "जानकारी सत्यापित करें",
      safety2Desc: "आधिकारिक उत्पाद दस्तावेज़ के साथ AI परिणामों को क्रॉस-रेफरेंस करें।",
      safety3: "सुरक्षित रूप से स्टोर करें",
      safety3Desc: "सभी दवाओं को बच्चों की पहुंच से दूर रखें और पैकेजिंग पर भंडारण निर्देशों का पालन करें।",
      troubleshooting: "समस्या निवारण",
      problem1: "धुंधले परिणाम?",
      problem1Fix: "अच्छी रोशनी सुनिश्चित करें और 2-3 सेकंड के लिए कैमरा स्थिर रखें।",
      problem2: "गलत जानकारी का पता चला?",
      problem2Fix: "लेबल पर बेहतर फोकस के साथ फोटो दोबारा लें।",
      problem3: "ऐप दवा का पता नहीं लगा रहा है?",
      problem3Fix: "जांचें कि क्या पैकेजिंग में स्पष्ट पाठ है। विभिन्न कोणों या प्रकाश का प्रयास करें।",
      languages: "बहु-भाषा समर्थन",
      langDesc: "MedScan AI अंग्रेजी, स्पेनिश, चीनी, हिंदी और तमिल का समर्थन करता है। सेटिंग्स में किसी भी समय भाषा बदलें।",
      privacy: "गोपनीयता और डेटा",
      privacyDesc: "सभी स्कैन स्थानीय रूप से संसाधित होते हैं। छवियां केवल आपके डिवाइस पर संग्रहीत होती हैं।"
    },
    privacy: { title: "गोपनीयता", subtitle: "आपका डेटा मायने रखता है", t1: "प्रोसेसिंग", d1: "रीयल-टाइम विश्लेषण", t2: "स्टोरेज", d2: "डेटा आपके डिवाइस पर", t3: "कैमरा", d3: "केवल स्कैनिंग के लिए", t4: "अस्वीकरण", d4: "शैक्षिक उपकरण" },
    errors: { notMedicine: "दवा नहीं मिली", scanFailed: "स्कैन विफल", networkError: "नेटवर्क त्रुटि", generic: "कुछ गलत हुआ" }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", guide: "வழிகாட்டி", settings: "அமைப்புகள்" },
    home: { greeting: "வரவேற்கிறோம்", title: "MedScan AI", subtitle: "உலகளாவிய மருந்து நுண்ணறிவு", scan: "மருந்து ஸ்கேன்", scanDesc: "பகுப்பாய்வு செய்ய தட்டவும்", analyzing: "பகுப்பாய்வு செய்கிறது", recent: "சமீபத்திய", empty: "ஸ்கேன்கள் இல்லை", emptyDesc: "மருந்தை ஸ்கேன் செய்யுங்கள்", disclaimer: "⚠️ கல்விக்கு மட்டுமே. மருத்துவரை அணுகவும்.", scanCount: "மருந்துகள்", camera: "புகைப்படம் எடு", gallery: "கேலரியிலிருந்து தேர்வு", cancel: "ரத்து" },
    result: { back: "திரும்பு", purpose: "நோக்கம்", howTo: "அளவு", effects: "பக்க விளைவுகள்", warnings: "எச்சரிக்கைகள்", storage: "சேமிப்பு", interactions: "தொடர்புகள்", disclaimer: "மருத்துவரை அணுகவும்.", translating: "மொழிபெயர்க்கிறது...", share: "பகிர்" },
    history: { title: "மருந்து நூலகம்", subtitle: "ஸ்கேன் வரலாறு", noHistory: "ஸ்கேன் இல்லை", noHistoryDesc: "மருந்துகள் இங்கே தோன்றும்", export: "ஏற்றுமதி", deleteAll: "அழி", newest: "புதியது", oldest: "பழையது", alphabetical: "A-Z", confirmDelete: "நீக்கவா?", confirmDeleteAll: "அனைத்தும் அழிக்கவா?" },
    settings: { title: "அமைப்புகள்", subtitle: "விருப்பங்கள்", language: "மொழி", languageDesc: "தேர்வு", clear: "தரவு அழி", clearDesc: "ஸ்கேன் நீக்கு", privacy: "தனியுரிமை", privacyDesc: "தரவு", about: "பற்றி", version: "பதிப்பு 4.0", madeWith: "♥ உடன்" },
    guide: {
      title: "MedScan AI ஐ எப்படி பயன்படுத்துவது",
      subtitle: "முழு பயனர் வழிகாட்டி",
      gettingStarted: "தொடங்குதல்",
      step1Title: "கேமராவை நிலைநிறுத்துங்கள்",
      step1Desc: "உங்கள் சாதனத்தை நிலையாக வைத்திருங்கள் மற்றும் கேமராவை நேரடியாக மருந்து பேக்கேஜிங்கை நோக்கி செலுத்துங்கள்.",
      step2Title: "படத்தை எடுங்கள்",
      step2Desc: "ஸ்கேன் பொத்தானை தட்டி தெளிவான புகைப்படம் எடுங்கள். AI தானாகவே தகவலைப் பிரித்தெடுக்கும்.",
      step3Title: "முடிவுகளை மதிப்பாய்வு செய்யுங்கள்",
      step3Desc: "நோக்கம், அளவு, எச்சரிக்கைகள் மற்றும் சேமிப்பு வழிமுறைகள் உள்ளிட்ட விரிவான மருந்து விவரங்களைப் படியுங்கள்.",
      bestPractices: "சிறந்த நடைமுறைகள்",
      tip1: "நல்ல வெளிச்சத்தைப் பயன்படுத்துங்கள்",
      tip1Desc: "இயற்கை பகல் வெளிச்சம் அல்லது பிரகாசமான உட்புற வெளிச்சம் துல்லியத்தை கணிசமாக மேம்படுத்துகிறது.",
      tip2: "பேக்கேஜிங்கை தட்டையாக வைத்திருங்கள்",
      tip2Desc: "நிழல்கள் மற்றும் மங்கலான உரையைத் தவிர்க்க மருந்தை தட்டையான மேற்பரப்பில் வைக்கவும்.",
      tip3: "லேபிள்களில் கவனம் செலுத்துங்கள்",
      tip3Desc: "பிராண்ட் பெயர், பொதுவான பெயர் மற்றும் அளவு தகவல் தெளிவாக தெரியும் முக்கிய லேபிளை எடுக்கவும்.",
      tip4: "பிரதிபலிப்புகளைத் தவிர்க்கவும்",
      tip4Desc: "பிளாஸ்டிக் ரேப்பிங் அல்லது பளபளப்பான மேற்பரப்புகளிலிருந்து பிரகாசம் இருந்தால் சற்று சாய்த்து வைக்கவும்.",
      accuracy: "துல்லியம் குறிப்புகள்",
      accTip1: "சுத்தமான பேக்கேஜிங் சிறப்பாக செயல்படுகிறது",
      accTip2: "சட்டகத்தில் முழு லேபிளையும் சேர்க்கவும்",
      accTip3: "சாதனத்தை பேக்கேஜிங்கிற்கு இணையாக வைக்கவும்",
      accTip4: "நன்கு ஒளிரும் பகுதிகளில் ஸ்கேன் செய்யுங்கள்",
      safety: "பாதுகாப்பு தகவல்",
      safety1: "கல்வி நோக்கத்திற்காக மட்டும்",
      safety1Desc: "இந்த ஆப் தகவல் நோக்கங்களுக்காக வடிவமைக்கப்பட்டுள்ளது. எந்த மருந்தையும் எடுப்பதற்கு முன் சுகாதார வல்லுநர்களை அணுகவும்.",
      safety2: "தகவலை சரிபார்க்கவும்",
      safety2Desc: "அதிகாரப்பூர்வ தயாரிப்பு ஆவணங்களுடன் AI முடிவுகளை குறுக்கு குறிப்பு செய்யுங்கள்.",
      safety3: "பாதுகாப்பாக சேமிக்கவும்",
      safety3Desc: "அனைத்து மருந்துகளையும் குழந்தைகளின் எட்டாத இடத்தில் வைக்கவும்.",
      troubleshooting: "சிக்கல் தீர்வு",
      problem1: "மங்கலான முடிவுகளா?",
      problem1Fix: "நல்ல வெளிச்சத்தை உறுதிசெய்து 2-3 வினாடிகள் கேமராவை நிலையாக வைத்திருங்கள்.",
      problem2: "தவறான தகவல் கண்டறியப்பட்டதா?",
      problem2Fix: "லேபிளில் சிறந்த கவனம் செலுத்தி புகைப்படத்தை மீண்டும் எடுக்கவும்.",
      problem3: "ஆப் மருந்தைக் கண்டறியவில்லையா?",
      problem3Fix: "பேக்கேஜிங்கில் தெளிவான உரை உள்ளதா என்பதைச் சரிபார்க்கவும். வெவ்வேறு கோணங்கள் முயற்சிக்கவும்.",
      languages: "பல மொழி ஆதரவு",
      langDesc: "MedScan AI ஆங்கிலம், ஸ்பானிஷ், சீனம், இந்தி மற்றும் தமிழை ஆதரிக்கிறது. அமைப்புகளில் எந்த நேரத்திலும் மொழியை மாற்றவும்.",
      privacy: "தனியுரிமை மற்றும் தரவு",
      privacyDesc: "அனைத்து ஸ்கேன்களும் உள்நாட்டில் செயலாக்கப்படுகின்றன. படங்கள் உங்கள் சாதனத்தில் மட்டுமே சேமிக்கப்படுகின்றன."
    },
    privacy: { title: "தனியுரிமை", subtitle: "உங்கள் தரவு முக்கியம்", t1: "செயலாக்கம்", d1: "நிகழ்நேர பகுப்பாய்வு", t2: "சேமிப்பு", d2: "தரவு உங்கள் சாதனத்தில்", t3: "கேமரா", d3: "ஸ்கேனிங்கிற்கு மட்டும்", t4: "மறுப்பு", d4: "கல்வி கருவி" },
    errors: { notMedicine: "மருந்து இல்லை", scanFailed: "ஸ்கேன் தோல்வி", networkError: "நெட்வொர்க் பிழை", generic: "பிழை நிகழ்ந்தது" }
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
// GLASS CARD
// ============================================================================
const GlassCard = ({ children, className = "", onClick, variant = "default", glow = false }) => {
  const variants = {
    default: "bg-white/90 border-slate-200/60",
    elevated: "bg-white border-slate-200 shadow-xl",
    warning: "bg-amber-50/90 border-amber-200/60",
    danger: "bg-red-50/90 border-red-200/60",
    success: "bg-emerald-50/90 border-emerald-200/60",
    info: "bg-blue-50/90 border-blue-200/60"
  };
  return (
    <div onClick={onClick} className={`relative backdrop-blur-xl border rounded-2xl transition-all duration-300 ${variants[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl active:scale-[0.99]' : ''} ${glow ? 'shadow-lg shadow-emerald-500/10' : 'shadow-sm'} ${className}`}>
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

  const createPrompt = (targetLang) => `You are a professional pharmacist providing clear, accurate medication information for general consumers. Analyze this medication image.

STEP 1: If NOT a medication, respond: {"error": "NOT_MEDICINE"}

STEP 2: If it IS medication, extract information in ${LANGUAGE_NAMES[targetLang]} following these STRICT FORMATTING RULES:

FORMATTING REQUIREMENTS:
- Write in complete, grammatically correct sentences
- Always end sentences with proper punctuation (periods, question marks, exclamation points)
- Use professional medical language that is clear to non-medical professionals
- Keep all responses concise but informative (2-3 sentences maximum per field)
- Avoid abbreviations unless they are standard medical terms (mg, ml, etc.)
- Use proper capitalization
- No bullet points or special characters in the text - only in the JSON array format
- Write naturally as if speaking to a patient

RESPONSE LENGTH LIMITS:
- purpose: 2-3 concise sentences explaining what the medication treats
- howToTake: 2-3 sentences with clear dosage instructions
- storage: 1-2 sentences maximum
- sideEffects: 3-5 most common effects only (array format)
- warnings: 3-4 most critical warnings only (array format)
- interactions: 2-4 most important interactions only (array format)

Return ONLY valid JSON in this exact format:
{
  "brandName": "Brand name from packaging",
  "genericName": "Generic/chemical name",
  "manufacturer": "Company name",
  "dosageForm": "Tablet/Capsule/Syrup/etc",
  "strength": "Dosage with unit (e.g., 500mg, 10ml)",
  "purpose": "Clear 2-3 sentence explanation of what this medication treats. Use proper grammar and punctuation.",
  "howToTake": "Clear 2-3 sentence dosage instructions. Include frequency and timing. Use proper grammar.",
  "sideEffects": ["Common side effect one", "Common side effect two", "Common side effect three"],
  "warnings": ["Critical warning one", "Critical warning two", "Critical warning three"],
  "storage": "1-2 sentence storage instruction with proper punctuation.",
  "interactions": ["Important interaction one", "Important interaction two"]
}

QUALITY CHECKLIST before responding:
✓ All sentences end with periods
✓ Proper capitalization throughout
✓ No grammar errors
✓ Professional medical tone
✓ Concise but complete information
✓ Client-deliverable quality`;

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

  const ScanOptionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowScanOptions(false)}>
      <div className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-6" />
        <h3 className="text-xl font-bold text-slate-800 text-center mb-6">{t(lang, 'home.scan')}</h3>
        <div className="space-y-3">
          <button onClick={() => cameraRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition-all">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center"><Camera size={24} /></div>
            <span className="text-lg">{t(lang, 'home.camera')}</span>
            <ChevronRight className="ml-auto opacity-50" size={20} />
          </button>
          <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-100 text-slate-800 font-semibold hover:bg-slate-200 transition-all">
            <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center"><Image size={24} /></div>
            <span className="text-lg">{t(lang, 'home.gallery')}</span>
            <ChevronRight className="ml-auto opacity-30" size={20} />
          </button>
          <button onClick={() => setShowScanOptions(false)} className="w-full p-4 rounded-2xl text-slate-500 font-medium mt-2 hover:bg-slate-50 transition-all">{t(lang, 'home.cancel')}</button>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <p className="text-emerald-600 text-sm font-semibold">{t(lang, 'home.greeting')}</p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-800">{t(lang, 'home.title')}</h1>
          <p className="text-slate-500 mt-1">{t(lang, 'home.subtitle')}</p>
          {history.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-bold">{history.length}</span>
              <span className="text-emerald-600 text-sm">{t(lang, 'home.scanCount')}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <GlassCard onClick={() => !loading && setShowScanOptions(true)} className={`p-6 min-h-[340px] flex flex-col items-center justify-center ${loading ? 'bg-slate-50' : ''}`} glow={!loading}>
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
              
              {loading ? <ScanningAnimation lang={lang} t={t} /> : (
                <>
                  <div className="relative mb-6">
                    <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                      <Scan size={44} className="text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{t(lang, 'home.scan')}</h3>
                  <p className="text-slate-500 mt-1 text-center">{t(lang, 'home.scanDesc')}</p>
                  <div className="flex gap-2 mt-5">
                    <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">AI Powered</span>
                    <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">Instant</span>
                  </div>
                </>
              )}
            </GlassCard>

            {error && (
              <GlassCard className="p-4 mt-4" variant="danger">
                <div className="flex items-center gap-3">
                  <XCircle className="text-red-500 shrink-0" size={20} />
                  <p className="text-red-700 flex-1 text-sm">{error}</p>
                  <button onClick={() => setError(null)} className="text-red-400"><X size={18} /></button>
                </div>
              </GlassCard>
            )}
          </div>

          <div className="lg:col-span-7 space-y-5">
            <GlassCard className="p-4" variant="warning">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0"><Shield className="text-amber-600" size={20} /></div>
                <p className="text-amber-800 text-sm leading-relaxed">{t(lang, 'home.disclaimer')}</p>
              </div>
            </GlassCard>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  {t(lang, 'home.recent')}
                </h3>
                {history.length > 0 && <button onClick={() => navigateTo('history')} className="text-emerald-600 font-semibold text-sm flex items-center gap-1">View All <ChevronRight size={16} /></button>}
              </div>
              
              {history.length === 0 ? (
                <GlassCard className="p-10 text-center">
                  <Sparkles className="mx-auto mb-4 text-slate-300" size={32} />
                  <h4 className="text-slate-700 font-semibold">{t(lang, 'home.empty')}</h4>
                  <p className="text-slate-500 text-sm mt-1">{t(lang, 'home.emptyDesc')}</p>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {history.slice(0, 4).map((item) => (
                    <GlassCard key={item.id} className="p-3" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'home'); }}>
                      <div className="flex items-center gap-3">
                        <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-emerald-600 font-semibold">{new Date(item.date).toLocaleDateString()}</p>
                          <h4 className="text-slate-800 font-bold text-sm truncate">{item.brandName}</h4>
                          <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                        </div>
                        <ChevronRight className="text-slate-300" size={18} />
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
  );

  const ResultScreen = () => {
    if (!scanResult) return null;
    return (
      <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goBack} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm"><ArrowLeft size={18} /> {t(lang, 'result.back')}</button>
            <button onClick={() => navigator.share?.({ title: scanResult.brandName, text: scanResult.purpose })} className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm"><Share2 size={18} className="text-slate-600" /></button>
          </div>

          <GlassCard className="p-5 mb-5" variant="elevated" glow>
            <div className="flex gap-4">
              <img src={scanResult.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-100 border border-slate-200" alt="" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold">{scanResult.dosageForm}</span>
                  {scanResult.strength !== 'N/A' && <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">{scanResult.strength}</span>}
                </div>
                <h1 className="text-2xl font-black text-slate-800 truncate">{scanResult.brandName}</h1>
                <p className="text-slate-500 truncate">{scanResult.genericName}</p>
                {scanResult.manufacturer !== 'N/A' && <p className="text-slate-400 text-xs mt-1 flex items-center gap-1"><MapPin size={12} /> {scanResult.manufacturer}</p>}
              </div>
            </div>
            {isTranslating && <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-700"><RefreshCw size={16} className="animate-spin" /><span className="text-sm font-medium">{t(lang, 'result.translating')}</span></div>}
          </GlassCard>

          <div className="space-y-3">
            {scanResult.purpose !== 'N/A' && <GlassCard className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0"><Heart className="text-emerald-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.purpose')}</h4><p className="text-slate-700 text-sm">{scanResult.purpose}</p></div></div></GlassCard>}
            {scanResult.howToTake !== 'N/A' && <GlassCard className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0"><Clock className="text-blue-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.howTo')}</h4><p className="text-slate-700 text-sm">{scanResult.howToTake}</p></div></div></GlassCard>}
            {scanResult.storage !== 'N/A' && <GlassCard className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0"><Layers className="text-violet-600" size={18} /></div><div><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-0.5">{t(lang, 'result.storage')}</h4><p className="text-slate-700 text-sm">{scanResult.storage}</p></div></div></GlassCard>}
            {scanResult.sideEffects?.length > 0 && <GlassCard className="p-4" variant="warning"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-amber-200 flex items-center justify-center shrink-0"><AlertTriangle className="text-amber-700" size={18} /></div><div className="flex-1"><h4 className="text-amber-700 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.effects')}</h4><ul className="space-y-1">{scanResult.sideEffects.map((e, i) => <li key={i} className="text-amber-900 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />{e}</li>)}</ul></div></div></GlassCard>}
            {scanResult.warnings?.length > 0 && <GlassCard className="p-4" variant="danger"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-red-200 flex items-center justify-center shrink-0"><ShieldCheck className="text-red-700" size={18} /></div><div className="flex-1"><h4 className="text-red-700 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.warnings')}</h4><ul className="space-y-1">{scanResult.warnings.map((w, i) => <li key={i} className="text-red-900 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />{w}</li>)}</ul></div></div></GlassCard>}
            {scanResult.interactions?.length > 0 && <GlassCard className="p-4"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center shrink-0"><Zap className="text-pink-600" size={18} /></div><div className="flex-1"><h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-1">{t(lang, 'result.interactions')}</h4><ul className="space-y-1">{scanResult.interactions.map((int, idx) => <li key={idx} className="text-slate-700 text-sm flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />{int}</li>)}</ul></div></div></GlassCard>}
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
            <h1 className="text-2xl font-black text-slate-800">{t(lang, 'history.title')}</h1>
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
          <GlassCard className="p-14 text-center">
            <History className="mx-auto mb-4 text-slate-300" size={44} />
            <h3 className="text-slate-700 font-bold text-xl mb-1">{t(lang, 'history.noHistory')}</h3>
            <p className="text-slate-500 mb-6">{t(lang, 'history.noHistoryDesc')}</p>
            <button onClick={() => navigateTo('home')} className="px-6 py-3 rounded-xl bg-slate-900 text-white font-bold">Scan Medicine</button>
          </GlassCard>
        ) : (
          <>
            <div className="mb-5">
              <div className="relative inline-block">
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="appearance-none px-5 py-2.5 pr-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium text-sm shadow-sm cursor-pointer">
                  <option value="newest">{t(lang, 'history.newest')}</option>
                  <option value="oldest">{t(lang, 'history.oldest')}</option>
                  <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedHistory.map((item) => (
                <GlassCard key={item.id} className="p-3 group" variant="elevated" onClick={() => { setScanResult(item); navigateTo('result', 'history'); }}>
                  <div className="flex items-center gap-3">
                    <img src={item.img} className="w-14 h-14 rounded-xl object-cover bg-slate-100" alt="" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-800 font-bold text-sm truncate">{item.brandName}</h4>
                      <p className="text-slate-500 text-xs truncate">{item.genericName}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 flex items-center gap-1"><Calendar size={10} /> {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }} className="w-9 h-9 rounded-lg opacity-0 group-hover:opacity-100 bg-red-50 flex items-center justify-center text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const GuideScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-slate-800 mb-1">{t(lang, 'guide.title')}</h1>
          <p className="text-slate-500 text-sm">{t(lang, 'guide.subtitle')}</p>
        </div>

        {/* Getting Started */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Target className="text-emerald-500" size={20} />
            {t(lang, 'guide.gettingStarted')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { icon: Camera, color: 'emerald', title: t(lang, 'guide.step1Title'), desc: t(lang, 'guide.step1Desc'), num: '01' },
              { icon: Scan, color: 'violet', title: t(lang, 'guide.step2Title'), desc: t(lang, 'guide.step2Desc'), num: '02' },
              { icon: CheckCircle, color: 'blue', title: t(lang, 'guide.step3Title'), desc: t(lang, 'guide.step3Desc'), num: '03' }
            ].map((step, i) => (
              <GlassCard key={i} className="p-4">
                <div className={`w-12 h-12 rounded-xl bg-${step.color}-100 flex items-center justify-center mb-3`}>
                  <step.icon className={`text-${step.color}-600`} size={24} />
                </div>
                <div className="text-slate-300 text-xs font-mono font-bold mb-1">{step.num}</div>
                <h3 className="text-slate-800 font-bold mb-1">{step.title}</h3>
                <p className="text-slate-600 text-sm">{step.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star className="text-amber-500" size={20} />
            {t(lang, 'guide.bestPractices')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { icon: Sun, color: 'amber', title: t(lang, 'guide.tip1'), desc: t(lang, 'guide.tip1Desc') },
              { icon: Layers, color: 'blue', title: t(lang, 'guide.tip2'), desc: t(lang, 'guide.tip2Desc') },
              { icon: Target, color: 'emerald', title: t(lang, 'guide.tip3'), desc: t(lang, 'guide.tip3Desc') },
              { icon: Eye, color: 'violet', title: t(lang, 'guide.tip4'), desc: t(lang, 'guide.tip4Desc') }
            ].map((tip, i) => (
              <GlassCard key={i} className="p-4" variant="info">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${tip.color}-100 flex items-center justify-center shrink-0`}>
                    <tip.icon className={`text-${tip.color}-600`} size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm mb-0.5">{tip.title}</h4>
                    <p className="text-slate-600 text-xs">{tip.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Accuracy Tips */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-emerald-500" size={20} />
            {t(lang, 'guide.accuracy')}
          </h2>
          <GlassCard className="p-4" variant="success">
            <ul className="space-y-2">
              {[t(lang, 'guide.accTip1'), t(lang, 'guide.accTip2'), t(lang, 'guide.accTip3'), t(lang, 'guide.accTip4')].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm">
                  <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>

        {/* Safety Information */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Shield className="text-red-500" size={20} />
            {t(lang, 'guide.safety')}
          </h2>
          <div className="space-y-3">
            {[
              { icon: AlertCircle, color: 'red', title: t(lang, 'guide.safety1'), desc: t(lang, 'guide.safety1Desc') },
              { icon: CheckCircle, color: 'blue', title: t(lang, 'guide.safety2'), desc: t(lang, 'guide.safety2Desc') },
              { icon: Lock, color: 'amber', title: t(lang, 'guide.safety3'), desc: t(lang, 'guide.safety3Desc') }
            ].map((item, i) => (
              <GlassCard key={i} className="p-4" variant="warning">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-${item.color}-100 flex items-center justify-center shrink-0`}>
                    <item.icon className={`text-${item.color}-600`} size={18} />
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm mb-0.5">{item.title}</h4>
                    <p className="text-slate-600 text-xs">{item.desc}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Info className="text-blue-500" size={20} />
            {t(lang, 'guide.troubleshooting')}
          </h2>
          <div className="space-y-3">
            {[
              { problem: t(lang, 'guide.problem1'), fix: t(lang, 'guide.problem1Fix') },
              { problem: t(lang, 'guide.problem2'), fix: t(lang, 'guide.problem2Fix') },
              { problem: t(lang, 'guide.problem3'), fix: t(lang, 'guide.problem3Fix') }
            ].map((item, i) => (
              <GlassCard key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 font-bold text-slate-600 text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold text-sm mb-1">{item.problem}</h4>
                    <p className="text-slate-600 text-xs flex items-start gap-2">
                      <Lightbulb className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                      {item.fix}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Languages & Privacy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5" variant="info">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Globe className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-sm">{t(lang, 'guide.languages')}</h3>
              </div>
            </div>
            <p className="text-slate-600 text-xs">{t(lang, 'guide.langDesc')}</p>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {LANGUAGES.map(l => (
                <span key={l.code} className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
                  {l.flag} {l.nativeName}
                </span>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5" variant="success">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                <Lock className="text-emerald-600" size={20} />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-sm">{t(lang, 'guide.privacy')}</h3>
              </div>
            </div>
            <p className="text-slate-600 text-xs">{t(lang, 'guide.privacyDesc')}</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );

  const SettingsScreen = () => (
    <div className="px-5 pt-14 pb-8 md:px-10 md:pt-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-black text-slate-800 mb-1">{t(lang, 'settings.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'settings.subtitle')}</p>
        <GlassCard className="overflow-hidden mb-5">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50"><Globe className="text-emerald-500" size={20} /><div><span className="text-slate-800 font-bold text-sm">{t(lang, 'settings.language')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.languageDesc')}</p></div></div>
          <div className="p-2">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-3 rounded-xl flex items-center justify-between transition-all mb-1 ${lang === l.code ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50'}`}>
                <div className="flex items-center gap-3"><span className="text-xl">{l.flag}</span><span className="font-medium text-slate-700 text-sm">{l.nativeName}</span></div>
                {lang === l.code && <CheckCircle2 size={18} className="text-emerald-500" />}
              </button>
            ))}
          </div>
        </GlassCard>
        <div className="space-y-2">
          <GlassCard className="p-4" onClick={() => navigateTo('privacy')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Lock className="text-slate-500" size={18} /></div>
              <div className="flex-1"><span className="text-slate-800 font-bold text-sm">{t(lang, 'settings.privacy')}</span><p className="text-slate-500 text-xs">{t(lang, 'settings.privacyDesc')}</p></div>
              <ChevronRight className="text-slate-300" size={18} />
            </div>
          </GlassCard>
          <GlassCard className="p-4" variant="danger" onClick={clearAllHistory}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center"><Trash2 className="text-red-500" size={18} /></div>
              <div className="flex-1"><span className="text-red-700 font-bold text-sm">{t(lang, 'settings.clear')}</span><p className="text-red-500 text-xs">{t(lang, 'settings.clearDesc')}</p></div>
            </div>
          </GlassCard>
        </div>
        <div className="mt-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/30"><Pill className="text-white" size={28} /></div>
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
        <h1 className="text-2xl font-black text-slate-800 mb-1">{t(lang, 'privacy.title')}</h1>
        <p className="text-slate-500 text-sm mb-6">{t(lang, 'privacy.subtitle')}</p>
        <GlassCard className="p-5">
          <div className="space-y-6">
            {[{ icon: Eye, bg: 'bg-emerald-100', color: 'text-emerald-600' }, { icon: Fingerprint, bg: 'bg-violet-100', color: 'text-violet-600' }, { icon: Camera, bg: 'bg-blue-100', color: 'text-blue-600' }, { icon: Shield, bg: 'bg-amber-100', color: 'text-amber-600' }].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0`}><item.icon className={item.color} size={18} /></div>
                <div><h3 className="text-slate-800 font-bold text-sm mb-0.5">{t(lang, `privacy.t${i + 1}`)}</h3><p className="text-slate-500 text-sm">{t(lang, `privacy.d${i + 1}`)}</p></div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );

  const DesktopNav = () => (
    <div className="hidden lg:flex flex-col w-64 h-screen sticky top-0 p-5 bg-white border-r border-slate-200">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"><Pill className="text-white" size={24} /></div>
        <div><h1 className="text-slate-800 font-black">MedScan AI</h1><p className="text-slate-400 text-[10px] font-medium">Global Intelligence</p></div>
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
      <div className="pt-4 border-t border-slate-100 text-center"><p className="text-slate-400 text-[10px]">Educational Use Only</p></div>
    </div>
  );

  const MobileNav = () => (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pt-2 pb-7 bg-white/95 backdrop-blur-xl border-t border-slate-200">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
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
