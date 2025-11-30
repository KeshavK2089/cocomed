import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Info, Pill, Home, Globe, Sparkles, 
  ShieldCheck, HelpCircle, CheckCircle2, RefreshCw, AlertOctagon, XCircle, BookOpen, 
  Lock, Calendar, ChevronRight, ArrowLeft, Search, Heart, Clock, Bell, Users, 
  Mic, Volume2, VolumeX, Plus, Check, SkipForward, AlertCircle, Zap, ChevronDown,
  Filter, User, UserPlus, Shuffle, Play, Square
} from 'lucide-react';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50 font-sans">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-sm w-full">
            <div className="bg-red-50 p-4 rounded-full inline-flex mb-6"><AlertOctagon size={40} className="text-red-500" /></div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-slate-500 mb-8 text-sm">The app encountered an error. Your data is safe.</p>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Restart CocoMed</button>
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
  if (typeof process !== 'undefined' && process.env?.REACT_APP_GEMINI_API_KEY) return process.env.REACT_APP_GEMINI_API_KEY;
  try { if (import.meta?.env?.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY; } catch (e) {}
  return "";
};

// --- UTILITIES ---
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
  const arr = (a) => Array.isArray(a) ? a.map(i => typeof i === 'string' ? i : JSON.stringify(i)) : [];
  return { ...data, brandName: str(data.brandName), genericName: str(data.genericName), manufacturer: str(data.manufacturer), dosageForm: str(data.dosageForm), strength: str(data.strength), purpose: str(data.purpose), howToTake: str(data.howToTake), storage: str(data.storage || "Store at room temperature"), missedDose: str(data.missedDose || "Take as soon as you remember, unless it's almost time for your next dose."), drugClass: str(data.drugClass || ""), commonSideEffects: arr(data.commonSideEffects || data.sideEffects), warnings: arr(data.warnings), interactsWith: arr(data.interactsWith || []), genericAvailable: !!data.genericAvailable };
};

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

// --- LOCALIZATION ---
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
];

const UI = {
  en: {
    nav: { home: "Home", history: "History", reminders: "Reminders", interactions: "Interactions", settings: "Settings" },
    home: { greeting: "Hello", title: "Scan Medicine", subtitle: "Take a clear photo of the medication label or packaging.", tap: "Tap to Capture", analyzing: "Analyzing...", recent: "Recent Scans", empty: "No scans yet. Try scanning a medicine!", tip: "Health Tip", profile: "Profile", switchProfile: "Switch Profile" },
    result: { back: "Back", share: "Share", purpose: "What It's For", howToTake: "How to Take", sideEffects: "Possible Side Effects", warnings: "Important Warnings", storage: "Storage", missedDose: "If You Miss a Dose", interactions: "May Interact With", generic: "Generic Alternative", genericAvail: "A generic version may be available. Ask your pharmacist about cost savings.", disclaimer: "For educational purposes only. This is not medical advice. Always consult your doctor or pharmacist.", setReminder: "Set Reminder", checkInteractions: "Check Interactions" },
    history: { title: "Medication History", search: "Search medications...", empty: "No medications found.", filter: "Filter", sortNew: "Newest", sortAlpha: "A-Z", deleteConfirm: "Delete this medication?" },
    reminders: { title: "Medication Reminders", add: "Add Reminder", empty: "No reminders set.", next: "Next:", taken: "Taken", skip: "Skip", enable: "Enable notifications to receive reminders", adherence: "This Week", times: "Times", days: "Days", selectMed: "Select Medication", save: "Save Reminder", daily: "Daily", specificDays: "Specific Days", sun: "S", mon: "M", tue: "T", wed: "W", thu: "T", fri: "F", sat: "S" },
    interactions: { title: "Interaction Checker", subtitle: "Select 2 or more medications to check for potential interactions.", check: "Check Interactions", select: "Select medications", checking: "Checking...", safe: "No major interactions found", results: "Results", severity: { major: "Major", moderate: "Moderate", minor: "Minor" }, disclaimer: "This is educational information only. Always verify with your pharmacist.", noHistory: "Scan some medications first to check interactions." },
    settings: { title: "Settings", language: "Language", profiles: "Family Profiles", addProfile: "Add Profile", deleteProfile: "Delete Profile", clearHistory: "Clear All Data", privacy: "Privacy Policy", about: "About CocoMed" },
    profile: { title: "Family Profiles", add: "Add Member", name: "Name", relationship: "Relationship", self: "Myself", spouse: "Spouse", parent: "Parent", child: "Child", other: "Other", save: "Save", active: "Active" },
    voice: { listening: "Listening...", speak: "Tap to speak", reading: "Reading..." },
    common: { cancel: "Cancel", delete: "Delete", save: "Save", done: "Done", loading: "Loading..." }
  },
  es: {
    nav: { home: "Inicio", history: "Historial", reminders: "Recordatorios", interactions: "Interacciones", settings: "Ajustes" },
    home: { greeting: "Hola", title: "Escanear Medicina", subtitle: "Tome una foto clara de la etiqueta del medicamento.", tap: "Toca para Capturar", analyzing: "Analizando...", recent: "Escaneos Recientes", empty: "Sin escaneos aún.", tip: "Consejo de Salud", profile: "Perfil", switchProfile: "Cambiar Perfil" },
    result: { back: "Volver", share: "Compartir", purpose: "Para Qué Sirve", howToTake: "Cómo Tomar", sideEffects: "Efectos Secundarios", warnings: "Advertencias", storage: "Almacenamiento", missedDose: "Si Olvida una Dosis", interactions: "Puede Interactuar Con", generic: "Alternativa Genérica", genericAvail: "Puede haber una versión genérica. Consulte a su farmacéutico.", disclaimer: "Solo con fines educativos. Esto no es consejo médico.", setReminder: "Crear Recordatorio", checkInteractions: "Verificar Interacciones" },
    history: { title: "Historial de Medicamentos", search: "Buscar medicamentos...", empty: "No se encontraron medicamentos.", filter: "Filtrar", sortNew: "Recientes", sortAlpha: "A-Z", deleteConfirm: "¿Eliminar este medicamento?" },
    reminders: { title: "Recordatorios", add: "Agregar", empty: "Sin recordatorios.", next: "Siguiente:", taken: "Tomado", skip: "Omitir", enable: "Active las notificaciones", adherence: "Esta Semana", times: "Horarios", days: "Días", selectMed: "Seleccionar Medicamento", save: "Guardar", daily: "Diario", specificDays: "Días Específicos", sun: "D", mon: "L", tue: "M", wed: "M", thu: "J", fri: "V", sat: "S" },
    interactions: { title: "Verificar Interacciones", subtitle: "Seleccione 2+ medicamentos para verificar interacciones.", check: "Verificar", select: "Seleccionar", checking: "Verificando...", safe: "Sin interacciones mayores", results: "Resultados", severity: { major: "Mayor", moderate: "Moderada", minor: "Menor" }, disclaimer: "Información educativa. Verifique con su farmacéutico.", noHistory: "Escanee medicamentos primero." },
    settings: { title: "Ajustes", language: "Idioma", profiles: "Perfiles Familiares", addProfile: "Agregar Perfil", deleteProfile: "Eliminar Perfil", clearHistory: "Borrar Datos", privacy: "Privacidad", about: "Acerca de" },
    profile: { title: "Perfiles Familiares", add: "Agregar", name: "Nombre", relationship: "Relación", self: "Yo", spouse: "Cónyuge", parent: "Padre/Madre", child: "Hijo/a", other: "Otro", save: "Guardar", active: "Activo" },
    voice: { listening: "Escuchando...", speak: "Toca para hablar", reading: "Leyendo..." },
    common: { cancel: "Cancelar", delete: "Eliminar", save: "Guardar", done: "Listo", loading: "Cargando..." }
  }
};

const t = (lang, key) => key.split('.').reduce((o, k) => o?.[k], UI[lang] || UI.en) || key.split('.').reduce((o, k) => o?.[k], UI.en) || key;

const TIPS = [
  { text: "Stay hydrated! Water helps medication absorption.", icon: "💧" },
  { text: "Always check expiration dates before taking medication.", icon: "📅" },
  { text: "Store medicines in a cool, dry place away from sunlight.", icon: "☀️" },
  { text: "Keep a list of your medications for doctor visits.", icon: "📋" },
  { text: "Never share prescription medications with others.", icon: "🚫" },
  { text: "Take antibiotics exactly as prescribed, even if you feel better.", icon: "💊" },
  { text: "Ask your pharmacist about generic alternatives to save money.", icon: "💰" }
];

// --- COMPONENTS ---
const NavTab = ({ icon: Icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 h-full transition-all relative ${active ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-[10px] font-medium mt-1">{label}</span>
    {badge > 0 && <span className="absolute top-1 right-1/4 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{badge}</span>}
  </button>
);

const InfoBlock = ({ title, content, type = 'neutral', icon: Icon = Info }) => {
  const isWarn = type === 'warning';
  if (!content || (Array.isArray(content) && content.length === 0)) return null;
  return (
    <div className={`p-5 rounded-2xl mb-3 ${isWarn ? 'bg-orange-50 border border-orange-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
      <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isWarn ? 'text-orange-700' : 'text-slate-400'}`}>
        <Icon size={14} /> {title}
      </h4>
      <div className={`text-sm leading-relaxed ${isWarn ? 'text-orange-900' : 'text-slate-700'}`}>
        {Array.isArray(content) ? (
          <ul className="space-y-1.5">{content.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${isWarn ? 'bg-orange-400' : 'bg-slate-300'}`} />
              {item}
            </li>
          ))}</ul>
        ) : <p>{content}</p>}
      </div>
    </div>
  );
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] overflow-hidden shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[60vh]">{children}</div>
      </div>
    </div>
  );
};

const VoiceButton = ({ onResult, lang }) => {
  const [listening, setListening] = useState(false);
  const recogRef = useRef(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recogRef.current = new SR();
    recogRef.current.lang = lang === 'es' ? 'es-ES' : 'en-US';
    recogRef.current.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false); };
    recogRef.current.onerror = () => setListening(false);
    recogRef.current.onend = () => setListening(false);
    recogRef.current.start();
    setListening(true);
  };

  const stopListening = () => { recogRef.current?.stop(); setListening(false); };

  return (
    <button onClick={listening ? stopListening : startListening} className={`p-3 rounded-full transition-all ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
      {listening ? <Square size={20} /> : <Mic size={20} />}
    </button>
  );
};

const SpeakButton = ({ text, lang }) => {
  const [speaking, setSpeaking] = useState(false);
  const speak = () => {
    if (!text) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'es' ? 'es-ES' : 'en-US';
    utter.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };
  return (
    <button onClick={speak} className={`p-2 rounded-full transition-all ${speaking ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
      {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
};

const MedCard = ({ med, onClick, onDelete, compact }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${compact ? 'p-3' : 'p-4'}`}>
    <div className="flex gap-3 items-center">
      <img src={med.img} className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-xl object-cover bg-slate-100`} alt="" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-orange-600 uppercase">{new Date(med.date).toLocaleDateString()}</p>
        <h4 className="font-bold text-slate-800 truncate">{med.brandName}</h4>
        <p className="text-xs text-slate-500 truncate">{med.genericName}</p>
      </div>
      {onDelete && (
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition-all">
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </div>
);

// --- MAIN APP ---
export default function MedScanApp() {
  const [screen, setScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [profiles, setProfiles] = useState([{ id: 'default', name: 'Me', relationship: 'self' }]);
  const [activeProfile, setActiveProfile] = useState('default');
  const [history, setHistory] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [adherence, setAdherence] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [dailyTip] = useState(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [selectedMeds, setSelectedMeds] = useState([]);
  const [interactionResult, setInteractionResult] = useState(null);
  const [checkingInteractions, setCheckingInteractions] = useState(false);
  const [newProfile, setNewProfile] = useState({ name: '', relationship: 'self' });
  const [newReminder, setNewReminder] = useState({ medicineId: '', times: ['08:00'], days: [], enabled: true });
  const fileRef = useRef(null);

  // Load data
  useEffect(() => {
    const saved = localStorage.getItem('cocomed_lang');
    if (saved) setLang(saved);
    const profs = localStorage.getItem('cocomed_profiles');
    if (profs) setProfiles(JSON.parse(profs));
    const active = localStorage.getItem('cocomed_active_profile');
    if (active) setActiveProfile(active);
  }, []);

  useEffect(() => {
    const hist = localStorage.getItem(`cocomed_hist_${activeProfile}`);
    if (hist) setHistory(JSON.parse(hist));
    else setHistory([]);
    const rems = localStorage.getItem(`cocomed_reminders_${activeProfile}`);
    if (rems) setReminders(JSON.parse(rems));
    else setReminders([]);
    const adh = localStorage.getItem(`cocomed_adherence_${activeProfile}`);
    if (adh) setAdherence(JSON.parse(adh));
    else setAdherence([]);
  }, [activeProfile]);

  // Save data
  useEffect(() => { localStorage.setItem('cocomed_lang', lang); }, [lang]);
  useEffect(() => { localStorage.setItem('cocomed_profiles', JSON.stringify(profiles)); }, [profiles]);
  useEffect(() => { localStorage.setItem('cocomed_active_profile', activeProfile); }, [activeProfile]);
  useEffect(() => { localStorage.setItem(`cocomed_hist_${activeProfile}`, JSON.stringify(history)); }, [history, activeProfile]);
  useEffect(() => { localStorage.setItem(`cocomed_reminders_${activeProfile}`, JSON.stringify(reminders)); }, [reminders, activeProfile]);
  useEffect(() => { localStorage.setItem(`cocomed_adherence_${activeProfile}`, JSON.stringify(adherence)); }, [adherence, activeProfile]);

  const currentProfile = profiles.find(p => p.id === activeProfile) || profiles[0];

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
      const prompt = `You are an educational pharmacy assistant. Analyze this medication image.
Return JSON only: { "brandName": "...", "genericName": "...", "manufacturer": "...", "drugClass": "...", "dosageForm": "...", "strength": "...", "purpose": "What this medication is commonly used for", "howToTake": "General instructions", "commonSideEffects": ["...", "..."], "warnings": ["...", "..."], "storage": "Storage instructions", "missedDose": "What to do if a dose is missed", "interactsWith": ["common drug interactions"], "genericAvailable": true/false }
If not a medication, return: { "error": "NOT_MEDICINE" }
Use simple language. This is educational only.`;
      const data = await callGemini([{ text: prompt }, { inlineData: { mimeType: "image/jpeg", data: base64 } }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      if (!json) throw new Error("Could not analyze image");
      const parsed = JSON.parse(json);
      if (parsed.error) throw new Error(parsed.error === "NOT_MEDICINE" ? "This doesn't appear to be a medication. Please scan a medicine label or package." : parsed.error);
      const clean = sanitize(parsed);
      const newScan = { ...clean, id: genId(), date: new Date().toISOString(), img: compressed };
      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      setScreen('result');
    } catch (err) {
      setError(err.message || "Scan failed. Please try again.");
    } finally { setLoading(false); }
  };

  const checkInteractions = async () => {
    if (selectedMeds.length < 2) return;
    setCheckingInteractions(true); setInteractionResult(null);
    try {
      const medNames = selectedMeds.map(id => history.find(h => h.id === id)?.brandName).filter(Boolean);
      const prompt = `Provide educational information about potential interactions between these medications: ${medNames.join(', ')}
Return JSON: { "interactions": [{ "between": ["Med A", "Med B"], "severity": "major/moderate/minor", "description": "Educational explanation", "recommendation": "General guidance" }], "summary": "Brief overall summary" }
If no significant interactions, return: { "interactions": [], "summary": "No major interactions identified between these medications." }
This is for educational purposes only.`;
      const data = await callGemini([{ text: prompt }]);
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      const json = text?.match(/\{[\s\S]*\}/)?.[0];
      if (json) setInteractionResult(JSON.parse(json));
    } catch (err) {
      setError("Could not check interactions. Please try again.");
    } finally { setCheckingInteractions(false); }
  };

  const addProfile = () => {
    if (!newProfile.name.trim()) return;
    const prof = { id: genId(), name: newProfile.name.trim(), relationship: newProfile.relationship };
    setProfiles(prev => [...prev, prof]);
    setNewProfile({ name: '', relationship: 'self' });
    setShowProfileModal(false);
  };

  const addReminder = () => {
    if (!newReminder.medicineId) return;
    const med = history.find(h => h.id === newReminder.medicineId);
    if (!med) return;
    const rem = { id: genId(), medicineId: med.id, medicineName: med.brandName, times: newReminder.times, days: newReminder.days, enabled: true, createdAt: new Date().toISOString() };
    setReminders(prev => [...prev, rem]);
    setNewReminder({ medicineId: '', times: ['08:00'], days: [], enabled: true });
    setShowReminderModal(false);
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  };

  const logAdherence = (remId, status) => {
    setAdherence(prev => [...prev, { id: genId(), reminderId: remId, status, timestamp: new Date().toISOString() }]);
  };

  const getAdherenceRate = () => {
    const week = adherence.filter(a => new Date(a.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    if (week.length === 0) return null;
    const taken = week.filter(a => a.status === 'taken').length;
    return Math.round((taken / week.length) * 100);
  };

  const filteredHistory = history.filter(h => h.brandName.toLowerCase().includes(searchQuery.toLowerCase()) || h.genericName.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => sortBy === 'alpha' ? a.brandName.localeCompare(b.brandName) : new Date(b.date) - new Date(a.date));

  // --- SCREENS ---
  const HomeScreen = () => (
    <div className="p-6 pb-32 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-slate-500">{t(lang, 'home.greeting')}, <span className="font-bold text-slate-800">{currentProfile.name}</span></p>
          <h1 className="text-2xl font-bold text-slate-900">{t(lang, 'home.title')}</h1>
        </div>
        <button onClick={() => setShowProfileModal(true)} className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm">
          {currentProfile.name.charAt(0).toUpperCase()}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
          <XCircle className="text-red-500 shrink-0" size={20} />
          <div className="flex-1"><p className="text-red-700 text-sm">{error}</p></div>
          <button onClick={() => setError(null)}><X size={16} className="text-red-400" /></button>
        </div>
      )}

      <div onClick={() => !loading && fileRef.current?.click()} className={`bg-white rounded-3xl border-2 border-dashed ${loading ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'} transition-all cursor-pointer p-10 flex flex-col items-center justify-center min-h-[250px] mb-6`}>
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileRef} onChange={(e) => { if (e.target.files[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />
        {loading ? (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-emerald-700 font-bold">{t(lang, 'home.analyzing')}</p>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <Camera size={36} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">{t(lang, 'home.tap')}</h3>
            <p className="text-slate-400 text-sm text-center max-w-xs">{t(lang, 'home.subtitle')}</p>
          </>
        )}
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex gap-3 items-start mb-6">
        <span className="text-2xl">{dailyTip.icon}</span>
        <div>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">{t(lang, 'home.tip')}</p>
          <p className="text-sm text-emerald-800">{dailyTip.text}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-slate-800 flex items-center gap-2"><Clock size={18} className="text-slate-400" /> {t(lang, 'home.recent')}</h2>
        {history.length > 0 && <button onClick={() => setScreen('history')} className="text-emerald-600 text-sm font-bold">View All</button>}
      </div>

      {history.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-100">
          <Sparkles className="mx-auto mb-3 text-slate-300" size={32} />
          <p className="text-slate-400 text-sm">{t(lang, 'home.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.slice(0, 3).map(med => (
            <MedCard key={med.id} med={med} onClick={() => { setScanResult(med); setScreen('result'); }} compact />
          ))}
        </div>
      )}

      <Modal open={showProfileModal} onClose={() => setShowProfileModal(false)} title={t(lang, 'profile.title')}>
        <div className="space-y-3 mb-6">
          {profiles.map(p => (
            <div key={p.id} onClick={() => { setActiveProfile(p.id); setShowProfileModal(false); }} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${p.id === activeProfile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">{p.name.charAt(0)}</div>
              <div className="flex-1">
                <p className="font-bold text-slate-800">{p.name}</p>
                <p className="text-xs text-slate-500 capitalize">{t(lang, `profile.${p.relationship}`)}</p>
              </div>
              {p.id === activeProfile && <CheckCircle2 className="text-emerald-500" size={20} />}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-100 pt-6">
          <p className="text-sm font-bold text-slate-700 mb-3">{t(lang, 'profile.add')}</p>
          <input type="text" placeholder={t(lang, 'profile.name')} value={newProfile.name} onChange={e => setNewProfile({ ...newProfile, name: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 mb-3" />
          <select value={newProfile.relationship} onChange={e => setNewProfile({ ...newProfile, relationship: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 mb-4 bg-white">
            {['self', 'spouse', 'parent', 'child', 'other'].map(r => <option key={r} value={r}>{t(lang, `profile.${r}`)}</option>)}
          </select>
          <button onClick={addProfile} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors">{t(lang, 'profile.save')}</button>
        </div>
      </Modal>
    </div>
  );

  const ResultScreen = () => {
    const speakText = scanResult ? `${scanResult.brandName}. ${scanResult.purpose}. ${scanResult.howToTake}` : '';
    return (
      <div className="p-6 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setScreen('home')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium"><ArrowLeft size={20} /> {t(lang, 'result.back')}</button>
          <SpeakButton text={speakText} lang={lang} />
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 mb-6">
          <div className="flex gap-4 items-start">
            <img src={scanResult.img} className="w-24 h-24 rounded-2xl object-cover bg-slate-100" alt="" />
            <div className="flex-1 min-w-0">
              <span className="px-2 py-1 rounded-lg bg-orange-50 text-orange-700 text-[10px] font-bold uppercase">{scanResult.dosageForm}</span>
              <h1 className="text-2xl font-bold text-slate-900 mt-2">{scanResult.brandName}</h1>
              <p className="text-slate-500">{scanResult.genericName}</p>
              {scanResult.strength !== 'N/A' && <p className="text-sm text-slate-400 mt-1">{scanResult.strength}</p>}
            </div>
          </div>
        </div>

        {scanResult.genericAvailable && (
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl mb-4 flex gap-3">
            <Pill className="text-green-600 shrink-0" size={20} />
            <div>
              <p className="font-bold text-green-800 text-sm">{t(lang, 'result.generic')}</p>
              <p className="text-green-700 text-xs mt-1">{t(lang, 'result.genericAvail')}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 mb-6">
          <button onClick={() => { setNewReminder({ ...newReminder, medicineId: scanResult.id }); setShowReminderModal(true); }} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors">
            <Bell size={18} /> {t(lang, 'result.setReminder')}
          </button>
          <button onClick={() => { setSelectedMeds([scanResult.id]); setScreen('interactions'); }} className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors">
            <Zap size={18} /> {t(lang, 'result.checkInteractions')}
          </button>
        </div>

        <InfoBlock title={t(lang, 'result.purpose')} content={scanResult.purpose} icon={Heart} />
        <InfoBlock title={t(lang, 'result.howToTake')} content={scanResult.howToTake} icon={Clock} />
        <InfoBlock title={t(lang, 'result.sideEffects')} content={scanResult.commonSideEffects} type="warning" icon={AlertCircle} />
        <InfoBlock title={t(lang, 'result.warnings')} content={scanResult.warnings} type="warning" icon={AlertTriangle} />
        <InfoBlock title={t(lang, 'result.storage')} content={scanResult.storage} icon={Info} />
        <InfoBlock title={t(lang, 'result.missedDose')} content={scanResult.missedDose} icon={RefreshCw} />
        {scanResult.interactsWith?.length > 0 && <InfoBlock title={t(lang, 'result.interactions')} content={scanResult.interactsWith} type="warning" icon={Zap} />}

        <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-2"><ShieldCheck size={14} /> {t(lang, 'result.disclaimer')}</p>
        </div>

        <Modal open={showReminderModal} onClose={() => setShowReminderModal(false)} title={t(lang, 'reminders.add')}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">{t(lang, 'reminders.times')}</p>
              {newReminder.times.map((time, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="time" value={time} onChange={e => { const t = [...newReminder.times]; t[i] = e.target.value; setNewReminder({ ...newReminder, times: t }); }} className="flex-1 p-3 rounded-xl border border-slate-200" />
                  {newReminder.times.length > 1 && <button onClick={() => setNewReminder({ ...newReminder, times: newReminder.times.filter((_, j) => j !== i) })} className="p-3 text-red-500"><X size={20} /></button>}
                </div>
              ))}
              <button onClick={() => setNewReminder({ ...newReminder, times: [...newReminder.times, '12:00'] })} className="text-emerald-600 text-sm font-bold">+ Add Time</button>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">{t(lang, 'reminders.days')}</p>
              <div className="flex gap-2">
                {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map((d, i) => (
                  <button key={d} onClick={() => setNewReminder({ ...newReminder, days: newReminder.days.includes(i) ? newReminder.days.filter(x => x !== i) : [...newReminder.days, i] })} className={`w-10 h-10 rounded-full font-bold text-sm ${newReminder.days.includes(i) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {t(lang, `reminders.${d}`)}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">{newReminder.days.length === 0 ? t(lang, 'reminders.daily') : t(lang, 'reminders.specificDays')}</p>
            </div>
            <button onClick={addReminder} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold">{t(lang, 'reminders.save')}</button>
          </div>
        </Modal>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="p-6 pb-32 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t(lang, 'history.title')}</h1>
      
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input type="text" placeholder={t(lang, 'history.search')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white" />
        </div>
        <VoiceButton onResult={setSearchQuery} lang={lang} />
        <button onClick={() => setSortBy(sortBy === 'date' ? 'alpha' : 'date')} className="px-4 py-3 bg-slate-100 rounded-xl text-slate-600 font-medium text-sm flex items-center gap-2">
          <Filter size={16} /> {sortBy === 'date' ? t(lang, 'history.sortNew') : t(lang, 'history.sortAlpha')}
        </button>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100">
          <Search className="mx-auto mb-4 text-slate-300" size={40} />
          <p className="text-slate-400">{t(lang, 'history.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map(med => (
            <MedCard key={med.id} med={med} onClick={() => { setScanResult(med); setScreen('result'); }} onDelete={() => { if (confirm(t(lang, 'history.deleteConfirm'))) setHistory(prev => prev.filter(h => h.id !== med.id)); }} />
          ))}
        </div>
      )}
    </div>
  );

  const RemindersScreen = () => {
    const rate = getAdherenceRate();
    return (
      <div className="p-6 pb-32 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{t(lang, 'reminders.title')}</h1>
          <button onClick={() => setShowReminderModal(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={18} /> {t(lang, 'reminders.add')}</button>
        </div>

        {rate !== null && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg">{rate}%</div>
            <div>
              <p className="font-bold text-emerald-800">{t(lang, 'reminders.adherence')}</p>
              <p className="text-sm text-emerald-600">Keep up the great work!</p>
            </div>
          </div>
        )}

        {reminders.length === 0 ? (
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100">
            <Bell className="mx-auto mb-4 text-slate-300" size={40} />
            <p className="text-slate-400 mb-4">{t(lang, 'reminders.empty')}</p>
            <button onClick={() => setShowReminderModal(true)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold">{t(lang, 'reminders.add')}</button>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map(rem => (
              <div key={rem.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-800">{rem.medicineName}</h3>
                    <p className="text-sm text-slate-500">{rem.times.join(', ')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={rem.enabled} onChange={() => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, enabled: !r.enabled } : r))} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-checked:bg-emerald-500 rounded-full peer-focus:ring-2 peer-focus:ring-emerald-300 transition-all after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => logAdherence(rem.id, 'taken')} className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><Check size={16} /> {t(lang, 'reminders.taken')}</button>
                  <button onClick={() => logAdherence(rem.id, 'skipped')} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm flex items-center justify-center gap-1"><SkipForward size={16} /> {t(lang, 'reminders.skip')}</button>
                  <button onClick={() => setReminders(prev => prev.filter(r => r.id !== rem.id))} className="px-3 py-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal open={showReminderModal} onClose={() => setShowReminderModal(false)} title={t(lang, 'reminders.add')}>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">{t(lang, 'reminders.selectMed')}</p>
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm">Scan a medication first</p>
              ) : (
                <select value={newReminder.medicineId} onChange={e => setNewReminder({ ...newReminder, medicineId: e.target.value })} className="w-full p-3 rounded-xl border border-slate-200 bg-white">
                  <option value="">Select...</option>
                  {history.map(h => <option key={h.id} value={h.id}>{h.brandName}</option>)}
                </select>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-2">{t(lang, 'reminders.times')}</p>
              {newReminder.times.map((time, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input type="time" value={time} onChange={e => { const t = [...newReminder.times]; t[i] = e.target.value; setNewReminder({ ...newReminder, times: t }); }} className="flex-1 p-3 rounded-xl border border-slate-200" />
                  {newReminder.times.length > 1 && <button onClick={() => setNewReminder({ ...newReminder, times: newReminder.times.filter((_, j) => j !== i) })} className="p-3 text-red-500"><X size={20} /></button>}
                </div>
              ))}
              <button onClick={() => setNewReminder({ ...newReminder, times: [...newReminder.times, '12:00'] })} className="text-emerald-600 text-sm font-bold">+ Add Time</button>
            </div>
            <button onClick={addReminder} disabled={!newReminder.medicineId} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-50">{t(lang, 'reminders.save')}</button>
          </div>
        </Modal>
      </div>
    );
  };

  const InteractionsScreen = () => (
    <div className="p-6 pb-32 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">{t(lang, 'interactions.title')}</h1>
      <p className="text-slate-500 text-sm mb-6">{t(lang, 'interactions.subtitle')}</p>

      {history.length === 0 ? (
        <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100">
          <Zap className="mx-auto mb-4 text-slate-300" size={40} />
          <p className="text-slate-400">{t(lang, 'interactions.noHistory')}</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
            <p className="text-sm font-bold text-slate-700 mb-3">{t(lang, 'interactions.select')}</p>
            <div className="flex flex-wrap gap-2">
              {history.map(med => (
                <button key={med.id} onClick={() => setSelectedMeds(prev => prev.includes(med.id) ? prev.filter(x => x !== med.id) : [...prev, med.id])} className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${selectedMeds.includes(med.id) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {med.brandName}
                </button>
              ))}
            </div>
          </div>

          <button onClick={checkInteractions} disabled={selectedMeds.length < 2 || checkingInteractions} className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold mb-6 disabled:opacity-50 flex items-center justify-center gap-2">
            {checkingInteractions ? <><RefreshCw className="animate-spin" size={20} /> {t(lang, 'interactions.checking')}</> : <><Zap size={20} /> {t(lang, 'interactions.check')}</>}
          </button>

          {interactionResult && (
            <div className="space-y-4">
              <h2 className="font-bold text-slate-800">{t(lang, 'interactions.results')}</h2>
              {interactionResult.interactions?.length === 0 ? (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex gap-3">
                  <CheckCircle2 className="text-green-600 shrink-0" size={24} />
                  <p className="text-green-800">{t(lang, 'interactions.safe')}</p>
                </div>
              ) : (
                interactionResult.interactions?.map((int, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${int.severity === 'major' ? 'bg-red-50 border-red-100' : int.severity === 'moderate' ? 'bg-orange-50 border-orange-100' : 'bg-yellow-50 border-yellow-100'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${int.severity === 'major' ? 'bg-red-200 text-red-800' : int.severity === 'moderate' ? 'bg-orange-200 text-orange-800' : 'bg-yellow-200 text-yellow-800'}`}>
                        {t(lang, `interactions.severity.${int.severity}`)}
                      </span>
                      <span className="font-bold text-slate-800">{int.between?.join(' + ')}</span>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{int.description}</p>
                    <p className="text-sm text-slate-500 italic">{int.recommendation}</p>
                  </div>
                ))
              )}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs text-slate-400 text-center"><ShieldCheck size={14} className="inline mr-1" /> {t(lang, 'interactions.disclaimer')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const SettingsScreen = () => (
    <div className="p-6 pb-32 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">{t(lang, 'settings.title')}</h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Globe size={20} className="text-slate-400" />
          <span className="font-bold text-slate-700">{t(lang, 'settings.language')}</span>
        </div>
        <div className="p-2">
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} className={`w-full p-3 rounded-xl flex items-center justify-between ${lang === l.code ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}>
              <span className="font-medium">{l.nativeName}</span>
              {lang === l.code && <CheckCircle2 size={20} />}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
        <button onClick={() => setShowProfileModal(true)} className="w-full p-4 flex items-center gap-3 hover:bg-slate-50">
          <Users size={20} className="text-slate-400" />
          <span className="font-bold text-slate-700 flex-1 text-left">{t(lang, 'settings.profiles')}</span>
          <ChevronRight size={20} className="text-slate-300" />
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <button onClick={() => { if (confirm('Clear all data? This cannot be undone.')) { localStorage.clear(); window.location.reload(); } }} className="w-full p-4 flex items-center gap-3 hover:bg-red-50 text-red-600">
          <Trash2 size={20} />
          <span className="font-bold flex-1 text-left">{t(lang, 'settings.clearHistory')}</span>
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-slate-400">CocoMed v2.0 • Educational Use Only</p>
        <p className="text-xs text-slate-400 mt-1">Not a substitute for professional medical advice</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
        <header className="bg-white/90 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setScreen('home')}>
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white shadow-sm">
                <Pill size={18} />
              </div>
              <span className="font-bold text-lg text-slate-900">CocoMed</span>
            </div>
            <div className="hidden md:flex items-center gap-1">
              {['home', 'history', 'reminders', 'interactions', 'settings'].map(tab => (
                <button key={tab} onClick={() => setScreen(tab)} className={`px-4 py-2 rounded-lg text-sm font-medium ${screen === tab ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'}`}>
                  {t(lang, `nav.${tab}`)}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1">
          {screen === 'home' && <HomeScreen />}
          {screen === 'result' && scanResult && <ResultScreen />}
          {screen === 'history' && <HistoryScreen />}
          {screen === 'reminders' && <RemindersScreen />}
          {screen === 'interactions' && <InteractionsScreen />}
          {screen === 'settings' && <SettingsScreen />}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 h-16 flex z-50 pb-safe">
          <NavTab icon={Home} label={t(lang, 'nav.home')} active={screen === 'home'} onClick={() => setScreen('home')} />
          <NavTab icon={History} label={t(lang, 'nav.history')} active={screen === 'history'} onClick={() => setScreen('history')} badge={history.length} />
          <NavTab icon={Bell} label={t(lang, 'nav.reminders')} active={screen === 'reminders'} onClick={() => setScreen('reminders')} badge={reminders.filter(r => r.enabled).length} />
          <NavTab icon={Zap} label={t(lang, 'nav.interactions')} active={screen === 'interactions'} onClick={() => setScreen('interactions')} />
          <NavTab icon={Settings} label={t(lang, 'nav.settings')} active={screen === 'settings'} onClick={() => setScreen('settings')} />
        </nav>
      </div>
    </ErrorBoundary>
  );
}
