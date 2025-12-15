import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Camera, History, Settings, X, Share2, Trash2, AlertTriangle, Home, Globe, CheckCircle2, ArrowLeft, Clock, Upload, Scan, ExternalLink, BookOpen, AlertCircle, Info, FileText, Calendar, ChevronRight, XCircle, Link2, Shield, Award, Menu, Search } from 'lucide-react';

// ============== CONFIGURATION ==============
const CONFIG = {
  API_URL: "https://cocomed.vercel.app",
  MAX_IMAGE_SIZE: 1200,
  COMPRESSION_QUALITY: 0.85,
  APP_VERSION: '7.0.0',
  LAST_UPDATED: '2025-12-13'
};

// ============== LANGUAGE CONFIGURATION ==============
const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
];

// ============== OFFICIAL REFERENCE SOURCES ==============
const REFERENCE_SOURCES = {
  dailymed: {
    name: 'DailyMed',
    authority: 'U.S. National Library of Medicine (NIH)',
    description: 'Official FDA-approved drug labeling and package inserts',
    category: 'Primary Source',
    getUrl: (drug) => `https://dailymed.nlm.nih.gov/dailymed/search.cfm?labeltype=all&query=${encodeURIComponent(drug)}`,
    reliability: 'Official Government Database'
  },
  fdaLabels: {
    name: 'FDA Drug Labels',
    authority: 'U.S. Food & Drug Administration',
    description: 'Complete FDA-approved prescribing information',
    category: 'Primary Source',
    getUrl: (drug) => `https://labels.fda.gov/?s=${encodeURIComponent(drug)}`,
    reliability: 'Official Government Database'
  },
  medlineplus: {
    name: 'MedlinePlus',
    authority: 'National Library of Medicine (NIH)',
    description: 'Peer-reviewed consumer health information',
    category: 'Educational Resource',
    getUrl: (drug) => `https://vsearch.nlm.nih.gov/vivisimo/cgi-bin/query-meta?v%3Aproject=medlineplus&v%3Asources=medlineplus-bundle&query=${encodeURIComponent(drug)}+drug`,
    reliability: 'NIH-Curated Resource'
  },
  rxnorm: {
    name: 'RxNorm',
    authority: 'National Library of Medicine (NIH)',
    description: 'Standardized nomenclature for clinical drugs',
    category: 'Reference Standard',
    getUrl: (drug) => `https://mor.nlm.nih.gov/RxNav/search?searchBy=String&searchTerm=${encodeURIComponent(drug)}`,
    reliability: 'NIH Terminology System'
  }
};

// ============== UI STRINGS ==============
const UI_STRINGS = {
  en: {
    nav: { home: "Home", history: "History", settings: "Settings" },
    home: {
      title: "MedLearn",
      subtitle: "Educational Medication Identification System",
      scan: "Scan Medication",
      scanDesc: "Upload medication packaging for identification",
      analyzing: "Analyzing medication packaging...",
      recent: "Recent Scans",
      empty: "No Scans Available",
      emptyDesc: "Begin by scanning medication packaging to identify medications",
      disclaimer: "EDUCATIONAL USE ONLY - This application is NOT intended for medical diagnosis, treatment, or prescription purposes. Always consult qualified healthcare professionals for medical advice.",
      scanCount: "Total Scans",
      upload: "Upload Image",
      dragDrop: "Drag & drop an image here, or click to browse",
      cancel: "Cancel",
      headerBanner: "EDUCATIONAL TOOL - NOT FOR CLINICAL USE"
    },
    result: {
      back: "Back to Home",
      identified: "Identified Medication",
      manufacturer: "Manufacturer",
      strength: "Strength",
      form: "Dosage Form",
      ndc: "NDC Code",
      summary: "Educational Summary",
      pictureLooksLike: "This picture looks like:",
      summaryDisclaimer: "This information was extracted via optical character recognition and AI analysis from the image YOU provided. Accuracy cannot be guaranteed.",
      verifyTitle: "Official Information Sources",
      verifyDesc: "For complete, accurate, and official medication information, consult these FDA and NIH databases:",
      legalNotice: "IMPORTANT LEGAL NOTICE",
      legalNoticeText: "This application provides educational information only. It does NOT provide medical advice, diagnosis, treatment recommendations, or prescription guidance. ALL information must be verified with licensed healthcare providers and official sources.",
      consultProvider: "Required Action: Consult your physician, pharmacist, or other qualified healthcare professional for all medical decisions.",
      disclaimer: "Information extracted via AI-powered OCR from user-provided image. Accuracy not guaranteed. Not FDA-cleared or approved as a medical device.",
      share: "Share",
      scannedAt: "Scan Date",
      sources: "Verify With Official Sources",
      dataSource: "Data Sources: FDA DailyMed & FDA Drug Labels",
      citationNotice: "All information should be verified against official FDA and NIH sources listed below"
    },
    history: {
      title: "Scan History",
      subtitle: "Previously identified medications",
      noHistory: "No History Available",
      noHistoryDesc: "Your scan history will appear here",
      export: "Export Data",
      deleteAll: "Clear All",
      newest: "Newest First",
      oldest: "Oldest First",
      alphabetical: "Alphabetical",
      confirmDelete: "Permanently delete this entry?",
      confirmDeleteAll: "Permanently delete all scan history?",
      search: "Search medications..."
    },
    settings: {
      title: "Application Settings",
      subtitle: "Configure preferences",
      language: "Display Language",
      languageDesc: "Select your preferred language",
      clear: "Clear All Data",
      clearDesc: "Permanently delete all scan history",
      about: "About This Application",
      version: "Version",
      lastUpdated: "Last Updated",
      description: "Educational tool for medication identification via image recognition technology",
      legal: "Legal Information",
      termsOfUse: "Terms of Use",
      privacyPolicy: "Privacy Policy",
      disclaimer: "Medical Disclaimer"
    },
    errors: {
      notMedicine: "No medication packaging detected in image. Please ensure medication label is clearly visible.",
      scanFailed: "Unable to extract information from image. Please try again with better lighting and focus.",
      networkError: "Network connection error. Please check your internet connection and try again.",
      generic: "An unexpected error occurred. Please try again.",
      insufficientData: "Limited information extracted. Ensure medication label is clearly visible and well-lit."
    },
    terms: {
      title: "Terms of Use and Medical Disclaimer",
      acceptButton: "I Acknowledge and Accept",
      closeButton: "Close",
      sections: {
        purpose: {
          title: "1. Educational Purpose",
          content: "MedLearn is an EDUCATIONAL TOOL designed solely for learning about medication identification technology. This application is NOT intended for medical diagnosis, treatment decisions, or any healthcare purpose."
        },
        notMedicalDevice: {
          title: "2. Not a Medical Device",
          content: "This application is NOT an FDA-cleared or FDA-approved medical device. It has NOT undergone clinical validation studies and may produce errors or incorrect identifications."
        },
        noMedicalAdvice: {
          title: "3. No Medical Advice",
          content: "This application does NOT provide medical advice, diagnosis, or treatment recommendations. ALWAYS seek the advice of qualified healthcare providers."
        },
        verification: {
          title: "4. Verification Required",
          content: "ALL information extracted by this application MUST be independently verified using official sources and licensed healthcare professionals."
        },
        liability: {
          title: "5. Limitation of Liability",
          content: "The developers assume NO liability for any damages or adverse outcomes resulting from use of this application. You use this application entirely at your own risk."
        },
        accuracy: {
          title: "6. No Accuracy Guarantee",
          content: "The developers make NO representations regarding the accuracy, reliability, or completeness of any information provided by this application."
        },
        professionalConsultation: {
          title: "7. Mandatory Professional Consultation",
          content: "You MUST consult licensed healthcare professionals for all medication-related decisions."
        },
        acceptance: {
          title: "8. Acceptance of Terms",
          content: "By clicking 'I Acknowledge and Accept,' you confirm that you understand this is an educational tool only."
        }
      }
    },
    disclaimer: {
      title: "Medical Disclaimer",
      content: [
        "This application is provided for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment.",
        "Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.",
        "The information provided by this application is extracted from images using optical character recognition (OCR) and artificial intelligence (AI) technology, which are subject to errors.",
        "This application is NOT an FDA-cleared or FDA-approved medical device and should not be relied upon for any medical decision-making.",
        "In case of a medical emergency, call your doctor or emergency services immediately.",
        "The developers assume no liability for any damages or adverse outcomes resulting from the use of this application."
      ]
    }
  },
  ta: {
    nav: { home: "முகப்பு", history: "வரலாறு", settings: "அமைப்புகள்" },
    home: {
      title: "MedLearn",
      subtitle: "கல்வி மருந்து அடையாளம் காணும் அமைப்பு",
      scan: "மருந்து ஸ்கேன்",
      scanDesc: "மருந்தை அடையாளம் காண படத்தைப் பதிவேற்றவும்",
      analyzing: "மருந்து பேக்கேஜிங் ஆராயப்படுகிறது...",
      recent: "சமீபத்திய ஸ்கேன்கள்",
      empty: "ஸ்கேன்கள் இல்லை",
      emptyDesc: "மருந்துகளை அடையாளம் காண மருந்து பேக்கேஜிங்கை ஸ்கேன் செய்து தொடங்குங்கள்",
      disclaimer: "கல்விக்கு மட்டுமே - இந்த செயலி மருத்துவ நோயறிதல், சிகிச்சை அல்லது மருந்து பரிந்துரைக்காக அல்ல.",
      scanCount: "மொத்த ஸ்கேன்கள்",
      upload: "படத்தைப் பதிவேற்று",
      dragDrop: "இங்கே படத்தை இழுத்து விடுங்கள் அல்லது உலாவ கிளிக் செய்யுங்கள்",
      cancel: "ரத்து",
      headerBanner: "கல்வி கருவி - மருத்துவ பயன்பாட்டிற்கு அல்ல"
    },
    result: {
      back: "முகப்புக்கு",
      identified: "அடையாளம் காணப்பட்ட மருந்து",
      manufacturer: "உற்பத்தியாளர்",
      strength: "வலிமை",
      form: "வடிவம்",
      ndc: "NDC குறியீடு",
      summary: "கல்வி சுருக்கம்",
      pictureLooksLike: "இந்த படம் பார்க்கிறது:",
      summaryDisclaimer: "இந்த தகவல் நீங்கள் வழங்கிய படத்திலிருந்து பிரித்தெடுக்கப்பட்டது. துல்லியம் உத்தரவாதம் அளிக்க முடியாது.",
      verifyTitle: "அதிகாரப்பூர்வ தகவல் ஆதாரங்கள்",
      verifyDesc: "முழுமையான மற்றும் அதிகாரப்பூர்வ மருந்து தகவலுக்கு, இந்த FDA மற்றும் NIH தரவுத்தளங்களை ஆலோசிக்கவும்:",
      legalNotice: "முக்கியமான சட்ட அறிவிப்பு",
      legalNoticeText: "இந்த செயலி கல்வி தகவலை மட்டுமே வழங்குகிறது. இது மருத்துவ ஆலோசனை வழங்காது.",
      consultProvider: "தேவையான நடவடிக்கை: உங்கள் மருத்துவரை அணுகவும்.",
      disclaimer: "AI-இயங்கும் OCR மூலம் பிரித்தெடுக்கப்பட்ட தகவல். துல்லியம் உத்தரவாதம் இல்லை.",
      share: "பகிர்",
      scannedAt: "ஸ்கேன் தேதி",
      sources: "அதிகாரப்பூர்வ மூலங்களுடன் சரிபார்க்கவும்",
      dataSource: "தரவு ஆதாரங்கள்: FDA DailyMed & FDA Drug Labels",
      citationNotice: "அனைத்து தகவல்களும் சரிபார்க்கப்பட வேண்டும்"
    },
    history: {
      title: "ஸ்கேன் வரலாறு",
      subtitle: "முன்பு அடையாளம் காணப்பட்ட மருந்துகள்",
      noHistory: "வரலாறு இல்லை",
      noHistoryDesc: "உங்கள் ஸ்கேன் வரலாறு இங்கே தோன்றும்",
      export: "தரவை ஏற்றுமதி",
      deleteAll: "அனைத்தையும் அழி",
      newest: "புதியவை முதல்",
      oldest: "பழையவை முதல்",
      alphabetical: "அகர வரிசை",
      confirmDelete: "இந்த உள்ளீட்டை நிரந்தரமாக நீக்கவா?",
      confirmDeleteAll: "அனைத்து வரலாற்றையும் நிரந்தரமாக நீக்கவா?",
      search: "மருந்துகளைத் தேடு..."
    },
    settings: {
      title: "செயலி அமைப்புகள்",
      subtitle: "விருப்பங்களை உள்ளமைக்கவும்",
      language: "காட்சி மொழி",
      languageDesc: "உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்",
      clear: "அனைத்து தரவையும் அழி",
      clearDesc: "அனைத்து வரலாற்றையும் நிரந்தரமாக நீக்கு",
      about: "இந்த செயலி பற்றி",
      version: "பதிப்பு",
      lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது",
      description: "மருந்து அடையாளத்திற்கான கல்வி கருவி",
      legal: "சட்ட தகவல்",
      termsOfUse: "பயன்பாட்டு விதிமுறைகள்",
      privacyPolicy: "தனியுரிமைக் கொள்கை",
      disclaimer: "மருத்துவ மறுப்பு"
    },
    errors: {
      notMedicine: "படத்தில் மருந்து கண்டறியப்படவில்லை.",
      scanFailed: "படத்திலிருந்து தகவலைப் பிரித்தெடுக்க முடியவில்லை.",
      networkError: "நெட்வொர்க் பிழை. மீண்டும் முயற்சிக்கவும்.",
      generic: "பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
      insufficientData: "குறைந்த தகவல் பிரித்தெடுக்கப்பட்டது."
    },
    terms: {
      title: "பயன்பாட்டு விதிமுறைகள் மற்றும் மருத்துவ மறுப்பு",
      acceptButton: "நான் ஒப்புக்கொள்கிறேன்",
      closeButton: "மூடு",
      sections: {
        purpose: {
          title: "1. கல்வி நோக்கம்",
          content: "MedLearn ஒரு கல்வி கருவி மட்டுமே."
        },
        notMedicalDevice: {
          title: "2. மருத்துவ சாதனம் அல்ல",
          content: "இது FDA-அங்கீகரிக்கப்பட்ட மருத்துவ சாதனம் அல்ல."
        },
        noMedicalAdvice: {
          title: "3. மருத்துவ ஆலோசனை இல்லை",
          content: "இது மருத்துவ ஆலோசனை வழங்காது."
        },
        verification: {
          title: "4. சரிபார்ப்பு தேவை",
          content: "அனைத்து தகவல்களும் சரிபார்க்கப்பட வேண்டும்."
        },
        liability: {
          title: "5. பொறுப்பு வரம்பு",
          content: "டெவலப்பர்கள் எந்தப் பொறுப்பும் ஏற்கவில்லை."
        },
        accuracy: {
          title: "6. துல்லியம் உத்தரவாதம் இல்லை",
          content: "துல்லியம் உத்தரவாதம் அளிக்கப்படவில்லை."
        },
        professionalConsultation: {
          title: "7. கட்டாய ஆலோசனை",
          content: "நிபுணர்களை அணுக வேண்டும்."
        },
        acceptance: {
          title: "8. விதிமுறைகள் ஏற்பு",
          content: "நீங்கள் விதிமுறைகளை ஏற்றுக்கொள்கிறீர்கள்."
        }
      }
    },
    disclaimer: {
      title: "மருத்துவ மறுப்பு",
      content: [
        "இது கல்வி நோக்கங்களுக்காக மட்டுமே.",
        "எப்போதும் மருத்துவரை அணுகவும்.",
        "தகவல் OCR மூலம் பிரித்தெடுக்கப்பட்டது.",
        "இது FDA-அங்கீகரிக்கப்பட்டது அல்ல.",
        "அவசரநிலையில் மருத்துவரை அழைக்கவும்.",
        "டெவலப்பர்கள் பொறுப்பேற்கவில்லை."
      ]
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

// ============== UTILITY FUNCTIONS ==============
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
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
      img.onerror = () => reject(new Error('Image load failed'));
    };
    reader.onerror = () => reject(new Error('File read failed'));
  });
};

const sanitizeMedicationData = (data) => {
  if (!data || typeof data !== 'object') return null;

  const safeStr = (v, fallback = "Not detected") => {
    if (v === null || v === undefined) return fallback;
    if (typeof v === 'string') {
      const trimmed = v.trim();
      const lower = trimmed.toLowerCase();
      if (trimmed && lower !== 'n/a' && lower !== 'unknown' && lower !== 'not found' &&
        lower !== 'none' && lower !== 'not visible' && lower !== 'not available' &&
        lower !== 'not detected' && trimmed !== '-' && trimmed !== '—' && trimmed.length > 0) {
        return trimmed;
      }
    }
    return fallback;
  };

  const result = {
    brandName: safeStr(data.brandName || data.brand_name || data.brand || data.tradeName || data.name),
    genericName: safeStr(data.genericName || data.generic_name || data.generic || data.activeIngredient),
    manufacturer: safeStr(data.manufacturer || data.mfr || data.company),
    dosageForm: safeStr(data.dosageForm || data.form || data.type, "Medication"),
    strength: safeStr(data.strength || data.dose || data.dosage),
    ndcNumber: safeStr(data.ndcNumber || data.ndc_number || data.ndc),
    summary: safeStr(data.summary || data.description || data.identification, "Medication identified from packaging image.")
  };

  const hasValidBrand = result.brandName !== "Not detected";
  const hasValidGeneric = result.genericName !== "Not detected";

  if (!hasValidBrand && !hasValidGeneric) return null;

  return result;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const formatDateTime = (date, lang) => {
  return new Date(date).toLocaleDateString(
    lang === 'ta' ? 'ta-IN' : 'en-US',
    { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  );
};

// ============== COMPONENTS ==============
const Card = ({ children, className = "", onClick, variant = "default" }) => {
  const variants = {
    default: "bg-white border-gray-200",
    warning: "bg-amber-50 border-amber-300",
    danger: "bg-red-50 border-red-300",
    info: "bg-blue-50 border-blue-300",
    success: "bg-emerald-50 border-emerald-300"
  };

  return (
    <div onClick={onClick}
      className={`border-2 rounded-xl transition-all ${variants[variant]} ${onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl' : 'shadow-sm'} ${className}`}>
      {children}
    </div>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-blue-100 text-blue-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700"
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const LegalGate = ({ onAccept, lang }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [canAccept, setCanAccept] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const progress = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollProgress(progress);
    if (progress > 90) setCanAccept(true);
  }, []);

  const sections = Object.entries(t(lang, 'terms.sections')).map(([key, value]) => ({
    title: value.title,
    content: value.content
  }));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 text-center shrink-0 border-b-4 border-red-600">
          <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Shield className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t(lang, 'terms.title')}</h2>
          <p className="text-red-200 text-sm font-semibold">REQUIRED READING - SCROLL TO CONTINUE</p>
        </div>

        <div className="h-2 bg-gray-200 shrink-0">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-emerald-600 transition-all duration-300"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="p-8 overflow-y-auto flex-1 space-y-5"
        >
          {sections.map((section, i) => (
            <div key={i} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 text-base mb-3 flex items-start gap-3">
                <span className="shrink-0 w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm">
                  {i + 1}
                </span>
                {section.title}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed pl-11">{section.content}</p>
            </div>
          ))}

          <div className="bg-red-50 border-2 border-red-400 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600 shrink-0 mt-1" size={24} />
              <div>
                <p className="text-red-900 text-sm font-bold leading-relaxed">
                  By accepting these terms, you acknowledge that this is an educational tool only and that you will NOT use it for medical decision-making. You agree to verify all information with licensed healthcare professionals and official sources.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 pt-4 shrink-0 bg-gray-50 border-t-2 border-gray-200">
          <button
            onClick={canAccept ? onAccept : undefined}
            disabled={!canAccept}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all ${canAccept
              ? 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {canAccept ? t(lang, 'terms.acceptButton') : 'Scroll to bottom to continue'}
          </button>
          {!canAccept && (
            <p className="text-center text-gray-500 text-sm mt-3">Please read all terms before accepting</p>
          )}
        </div>
      </div>
    </div>
  );
};

const LegalModal = ({ isOpen, onClose, type, lang }) => {
  if (!isOpen) return null;

  const content = type === 'terms' ? t(lang, 'terms.sections') : t(lang, 'disclaimer.content');
  const title = type === 'terms' ? t(lang, 'terms.title') : t(lang, 'disclaimer.title');

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={onClose}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-6 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          {type === 'terms' ? (
            <div className="space-y-5">
              {Object.entries(content).map(([key, section], i) => (
                <div key={i} className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
                  <h3 className="font-bold text-gray-900 text-base mb-3">{section.title}</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{section.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {content.map((paragraph, i) => (
                <p key={i} className="text-gray-700 text-base leading-relaxed">{paragraph}</p>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 pt-4 shrink-0 bg-gray-50 border-t-2 border-gray-200">
          <button onClick={onClose}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors">
            {t(lang, 'terms.closeButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============== MAIN APP ==============
export default function MedScanDesktop() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [screen, setScreen] = useState('home');
  const [previousScreen, setPreviousScreen] = useState('home');
  const [lang, setLang] = useState('en');
  const [history, setHistory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [legalModal, setLegalModal] = useState({ isOpen: false, type: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fileRef = useRef(null);

  useEffect(() => {
    try {
      const savedAgreement = localStorage.getItem('medscan_terms_accepted');
      const savedLang = localStorage.getItem('medscan_language');
      const savedHistory = localStorage.getItem('medscan_history');

      if (savedAgreement === 'true') setHasAcceptedTerms(true);
      if (savedLang && LANGUAGES.some(l => l.code === savedLang)) setLang(savedLang);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) setHistory(parsed);
        } catch (e) { }
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('medscan_language', lang);
    } catch (e) { }
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('medscan_history', JSON.stringify(history));
    } catch (e) { }
  }, [history]);

  const handleTermsAcceptance = useCallback(() => {
    setHasAcceptedTerms(true);
    try {
      localStorage.setItem('medscan_terms_accepted', 'true');
    } catch (e) { }
  }, []);

  const navigateTo = useCallback((newScreen, fromScreen = null) => {
    if (fromScreen) setPreviousScreen(fromScreen);
    else if (screen !== 'result') setPreviousScreen(screen);
    setScreen(newScreen);
    setError(null);
  }, [screen]);

  const goBack = useCallback(() => {
    if (screen === 'result') setScreen(previousScreen || 'home');
    else setScreen('home');
    setError(null);
  }, [screen, previousScreen]);

  const createPrompt = (targetLang) => {
    const langName = targetLang === 'ta' ? 'Tamil' : 'English';
    return `You are analyzing pharmaceutical packaging for educational medication identification purposes only.

**CRITICAL INSTRUCTION:** If this image does NOT show medication/pharmaceutical packaging with visible drug information, respond EXACTLY with: {"error":"NOT_MEDICINE"}

**Your task:** Extract basic identification information visible on the packaging and provide a COMPREHENSIVE educational summary.

**Required JSON format in ${langName} language:**
{
  "brandName": "Brand/trade name if visible",
  "genericName": "Active ingredient/generic name if visible",
  "manufacturer": "Manufacturing company name if visible",
  "dosageForm": "Form: Tablet, Capsule, Liquid, Cream, Injection, etc.",
  "strength": "Dosage strength with units if visible",
  "ndcNumber": "National Drug Code (NDC) if visible",
  "summary": "Write a COMPREHENSIVE 8-10 sentence educational summary. Structure: 1) Start with 'This picture looks like [medication name/type].' 2) Explain what this medication is 3) Describe its therapeutic category 4) Explain common uses 5) Note mechanism in simple terms 6) Include important general information 7) Emphasize educational use only 8) Remind to verify with official sources. Write in ${langName} language."
}

**CRITICAL RULES:**
1. Use "Not detected" for fields where information is not clearly visible
2. Summary MUST be 8-10 sentences, comprehensive and educational
3. MUST start with "This picture looks like..."
4. Write for average person - simple language
5. NO medical advice, dosage instructions, or usage directions
6. Include reminder to verify with FDA sources
7. Response in ${langName} language`;
  };

  const callGeminiAPI = async (payload) => {
    const response = await fetch(`${CONFIG.API_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: payload[0].text,
        image: payload[1]?.inlineData?.data
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${error}`);
    }
    return response.json();
  };

  const extractJSON = (text) => {
    if (!text) return null;

    text = text.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```\s*$/, '');

    try {
      return JSON.parse(text);
    } catch (e) {
      const patterns = [/\{[\s\S]*\}/, /(\{[^{}]*\{[^{}]*\}[^{}]*\})/];

      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          try {
            let jsonStr = match[0]
              .replace(/[\x00-\x1F\x7F]/g, ' ')
              .replace(/,(\s*[}\]])/g, '$1')
              .replace(/\n/g, ' ')
              .replace(/\r/g, '')
              .replace(/\t/g, ' ')
              .replace(/  +/g, ' ');
            return JSON.parse(jsonStr);
          } catch (e) { }
        }
      }
    }
    return null;
  };

  const handleScan = async (file) => {
    if (!file || loading) return;

    setLoading(true);
    setError(null);

    try {
      const compressed = await compressImage(file);
      const base64 = compressed.split(',')[1];

      const response = await callGeminiAPI([
        { text: createPrompt(lang) },
        { inlineData: { mimeType: "image/jpeg", data: base64 } }
      ]);

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(t(lang, 'errors.scanFailed'));

      const parsed = extractJSON(text);
      if (!parsed) throw new Error(t(lang, 'errors.scanFailed'));
      if (parsed.error === "NOT_MEDICINE") throw new Error(t(lang, 'errors.notMedicine'));

      const sanitized = sanitizeMedicationData(parsed);
      if (!sanitized) throw new Error(t(lang, 'errors.notMedicine'));

      const hasMinimumData = (
        (sanitized.brandName !== 'Not detected' || sanitized.genericName !== 'Not detected')
      );

      if (!hasMinimumData) {
        setError(t(lang, 'errors.insufficientData'));
      }

      const newScan = {
        ...sanitized,
        id: generateId(),
        date: new Date().toISOString(),
        img: compressed,
        languageCode: lang
      };

      setScanResult(newScan);
      setHistory(prev => [newScan, ...prev]);
      navigateTo('result', 'home');

    } catch (err) {
      console.error('Scan error:', err);
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
      const response = await callGeminiAPI([
        { text: createPrompt(lang) },
        { inlineData: { mimeType: "image/jpeg", data: base64 } }
      ]);

      const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = extractJSON(text);

      if (parsed && !parsed.error) {
        const sanitized = sanitizeMedicationData(parsed);
        if (sanitized) {
          const updated = { ...currentScan, ...sanitized, languageCode: lang };
          setScanResult(updated);
          setHistory(prev => prev.map(item => item.id === currentScan.id ? updated : item));
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    if (scanResult && scanResult.languageCode !== lang && !isTranslating && !loading) {
      reAnalyzeForLanguage(scanResult);
    }
  }, [lang, scanResult]);

  const sortedHistory = useMemo(() => {
    let results = [...history];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item =>
        item.brandName.toLowerCase().includes(query) ||
        item.genericName.toLowerCase().includes(query) ||
        item.manufacturer.toLowerCase().includes(query)
      );
    }
    
    results.sort((a, b) => {
      if (sortOrder === 'oldest') return new Date(a.date) - new Date(b.date);
      if (sortOrder === 'alphabetical') return (a.brandName || '').localeCompare(b.brandName || '');
      return new Date(b.date) - new Date(a.date);
    });
    return results;
  }, [history, sortOrder, searchQuery]);

  const exportHistory = useCallback(() => {
    const text = `MedLearn - Scan History Export
Generated: ${new Date().toLocaleString()}
Total Scans: ${history.length}

${history.map((item, i) => `
Scan ${i + 1}
Date: ${formatDateTime(item.date, lang)}
Brand Name: ${item.brandName}
Generic Name: ${item.genericName}
Strength: ${item.strength}
Form: ${item.dosageForm}
Manufacturer: ${item.manufacturer}
NDC: ${item.ndcNumber}
Summary: ${item.summary}
---
`).join('\n')}

DISCLAIMER: This data is for educational purposes only. All information must be verified with official sources and healthcare professionals.`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medscan-history-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [history, lang]);

  const deleteScan = useCallback((id) => {
    if (window.confirm(t(lang, 'history.confirmDelete'))) {
      setHistory(prev => prev.filter(item => item.id !== id));
    }
  }, [lang]);

  const clearAllHistory = useCallback(() => {
    if (window.confirm(t(lang, 'history.confirmDeleteAll'))) {
      setHistory([]);
      if (screen === 'result') navigateTo('home');
    }
  }, [lang, screen]);

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-white border-r-2 border-gray-200 transition-all duration-300 z-30 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
      <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between">
        {sidebarOpen && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
              <Scan size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black text-gray-900">MedLearn</h1>
              <p className="text-xs text-gray-500">v{CONFIG.APP_VERSION}</p>
            </div>
          </div>
        )}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Menu size={20} className="text-gray-600" />
        </button>
      </div>

      <nav className="p-4">
        {[
          { id: 'home', icon: Home, label: t(lang, 'nav.home') },
          { id: 'history', icon: History, label: t(lang, 'nav.history'), badge: history.length },
          { id: 'settings', icon: Settings, label: t(lang, 'nav.settings') }
        ].map(item => {
          const isActive = screen === item.id || (screen === 'result' && item.id === previousScreen);

          return (
            <button key={item.id} onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}>
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left font-semibold text-sm">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );

  const HomeScreen = () => (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t(lang, 'home.title')}</h1>
            <p className="text-gray-600 text-lg">{t(lang, 'home.subtitle')}</p>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-50 border-2 border-blue-200">
              <Award size={24} className="text-blue-600" />
              <div>
                <span className="text-3xl font-black text-blue-900">{history.length}</span>
                <p className="text-blue-700 text-sm font-semibold">{t(lang, 'home.scanCount')}</p>
              </div>
            </div>
          )}
        </div>

        <Card className="p-8 mb-6 border-2" variant="warning">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={28} />
            <div>
              <p className="text-amber-900 text-base font-semibold leading-relaxed">
                {t(lang, 'home.disclaimer')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className={`p-8 ${loading ? 'bg-gray-50' : 'hover:shadow-2xl cursor-pointer'}`}
            onClick={() => !loading && fileRef.current?.click()}>
            <input type="file" accept="image/*" className="hidden" ref={fileRef}
              onChange={(e) => { if (e.target.files?.[0]) handleScan(e.target.files[0]); e.target.value = ''; }} />

            {loading ? (
              <div className="flex flex-col items-center py-12">
                <div className="w-20 h-20 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-6" />
                <p className="text-gray-700 font-semibold text-lg">{t(lang, 'home.analyzing')}</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mx-auto mb-6">
                  <Upload size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t(lang, 'home.scan')}</h3>
                <p className="text-gray-600 text-base mb-4">{t(lang, 'home.scanDesc')}</p>
                <p className="text-gray-500 text-sm">{t(lang, 'home.dragDrop')}</p>
              </div>
            )}
          </Card>

          {error && (
            <Card className="p-5 mt-6" variant="danger">
              <div className="flex items-start gap-4">
                <XCircle className="text-red-600 shrink-0 mt-1" size={24} />
                <div className="flex-1">
                  <p className="text-red-800 text-base font-medium leading-relaxed">{error}</p>
                </div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                  <X size={20} />
                </button>
              </div>
            </Card>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-gray-600" />
              {t(lang, 'home.recent')}
            </h3>
            {history.length > 0 && (
              <button onClick={() => navigateTo('history')}
                className="text-blue-600 font-semibold text-sm flex items-center gap-1 hover:text-blue-700">
                View All <ChevronRight size={16} />
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <Card className="p-8 text-center">
              <Info className="mx-auto mb-3 text-gray-300" size={36} />
              <h4 className="text-gray-700 font-bold text-base mb-2">{t(lang, 'home.empty')}</h4>
              <p className="text-gray-500 text-sm">{t(lang, 'home.emptyDesc')}</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item) => (
                <Card key={item.id} className="p-4 hover:shadow-lg"
                  onClick={() => { setScanResult(item); navigateTo('result', 'home'); }}>
                  <div className="flex items-center gap-3">
                    <img src={item.img} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shadow-sm" alt="" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-blue-600 font-semibold mb-1">
                        {formatDateTime(item.date, lang)}
                      </p>
                      <h4 className="text-gray-900 font-bold text-sm truncate">{item.brandName}</h4>
                      <p className="text-gray-600 text-xs truncate">{item.genericName}</p>
                    </div>
                    <ChevronRight className="text-gray-400" size={20} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ResultScreen = () => {
    if (!scanResult) return null;

    const drug = scanResult.brandName !== 'Not detected' ? scanResult.brandName : scanResult.genericName;

    return (
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <button onClick={goBack}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base transition-colors">
            <ArrowLeft size={20} /> {t(lang, 'result.back')}
          </button>
          <button onClick={() => navigator.share?.({
            title: scanResult.brandName,
            text: `${scanResult.summary}`
          })}
            className="px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center gap-2 text-blue-700 font-semibold transition-colors">
            <Share2 size={18} /> {t(lang, 'result.share')}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 border-2" variant="danger">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-white" size={28} />
                </div>
                <div>
                  <h4 className="text-red-900 font-bold text-lg mb-3">{t(lang, 'result.legalNotice')}</h4>
                  <p className="text-red-800 text-sm mb-4 leading-relaxed">{t(lang, 'result.legalNoticeText')}</p>
                  <div className="p-4 bg-red-100 rounded-lg border border-red-300">
                    <p className="text-red-900 text-sm font-bold leading-relaxed">
                      {t(lang, 'result.consultProvider')}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {scanResult.summary !== 'Not detected' && (
              <Card className="p-6" variant="info">
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                    <BookOpen className="text-white" size={26} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-blue-900 font-bold text-xl mb-3">{t(lang, 'result.summary')}</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">Educational Content</Badge>
                      <Badge variant="success">FDA Referenced</Badge>
                    </div>
                  </div>
                </div>

                <div className="prose prose-base max-w-none mb-5">
                  <p className="text-gray-800 text-base leading-relaxed whitespace-pre-line">
                    {scanResult.summary}
                  </p>
                </div>

                {isTranslating && (
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 text-blue-700 mb-4">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold">Translating content...</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-amber-900 text-sm font-semibold flex items-center gap-2">
                      <AlertCircle size={16} />
                      {t(lang, 'result.summaryDisclaimer')}
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-emerald-900 text-sm font-bold mb-1 flex items-center gap-2">
                      <Shield size={16} />
                      {t(lang, 'result.dataSource')}
                    </p>
                    <p className="text-emerald-700 text-sm">
                      {t(lang, 'result.citationNotice')}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-6 border-2" variant="success">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                  <Link2 className="text-white" size={26} />
                </div>
                <div>
                  <h4 className="text-emerald-900 font-bold text-lg mb-2">{t(lang, 'result.verifyTitle')}</h4>
                  <p className="text-emerald-800 text-sm leading-relaxed">{t(lang, 'result.verifyDesc')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.values(REFERENCE_SOURCES).map((source, i) => (
                  <a key={i} href={source.getUrl(drug)} target="_blank" rel="noopener noreferrer"
                    className="block p-4 rounded-lg bg-white border-2 border-emerald-200 hover:border-emerald-500 hover:shadow-lg transition-all">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-gray-900 font-bold text-sm">{source.name}</p>
                        </div>
                        <p className="text-gray-600 text-xs mb-2">{source.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="success">{source.category}</Badge>
                          <ExternalLink className="text-emerald-600" size={14} />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <img src={scanResult.img} className="w-full h-48 rounded-lg object-cover bg-gray-100 shadow-md mb-4" alt="" />
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="primary">{scanResult.dosageForm}</Badge>
                {scanResult.strength !== 'Not detected' && (
                  <Badge variant="default">{scanResult.strength}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">{scanResult.brandName}</h1>
              <p className="text-gray-600 text-base mb-3">{scanResult.genericName}</p>
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Clock size={14} /> {formatDateTime(scanResult.date, lang)}
              </p>
            </Card>

            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Info size={18} className="text-blue-600" />
                {t(lang, 'result.identified')}
              </h3>

              <div className="space-y-3">
                {scanResult.manufacturer !== 'Not detected' && (
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{t(lang, 'result.manufacturer')}</p>
                    <p className="text-sm font-bold text-gray-900">{scanResult.manufacturer}</p>
                  </Card>
                )}
                {scanResult.ndcNumber !== 'Not detected' && (
                  <Card className="p-4">
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{t(lang, 'result.ndc')}</p>
                    <p className="text-sm font-bold text-gray-900">{scanResult.ndcNumber}</p>
                  </Card>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gray-100 border-2 border-gray-300 text-center">
              <AlertCircle className="mx-auto mb-2 text-gray-500" size={22} />
              <p className="text-gray-700 text-xs font-semibold leading-relaxed">
                {t(lang, 'result.disclaimer')}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HistoryScreen = () => (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900">{t(lang, 'history.title')}</h1>
            <p className="text-gray-600 text-lg">{t(lang, 'history.subtitle')}</p>
          </div>
          {history.length > 0 && (
            <div className="flex gap-3">
              <button onClick={exportHistory}
                className="px-5 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm flex items-center gap-2 hover:bg-blue-100 transition-colors border-2 border-blue-200">
                <Upload size={18} /> {t(lang, 'history.export')}
              </button>
              <button onClick={clearAllHistory}
                className="px-5 py-3 rounded-xl bg-red-50 text-red-700 font-semibold text-sm flex items-center gap-2 hover:bg-red-100 transition-colors border-2 border-red-200">
                <Trash2 size={18} /> {t(lang, 'history.deleteAll')}
              </button>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={t(lang, 'history.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 text-gray-700 border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base"
              />
            </div>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-3 rounded-xl bg-gray-50 text-gray-700 font-medium border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-base">
              <option value="newest">{t(lang, 'history.newest')}</option>
              <option value="oldest">{t(lang, 'history.oldest')}</option>
              <option value="alphabetical">{t(lang, 'history.alphabetical')}</option>
            </select>
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <Card className="p-12 text-center">
          <History className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-gray-700 font-bold text-xl mb-2">{t(lang, 'history.noHistory')}</h3>
          <p className="text-gray-500 text-base mb-6">{t(lang, 'history.noHistoryDesc')}</p>
          <button onClick={() => navigateTo('home')}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-base hover:bg-blue-700 transition-colors">
            {t(lang, 'home.scan')}
          </button>
        </Card>
      ) : sortedHistory.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="mx-auto mb-4 text-gray-300" size={48} />
          <h3 className="text-gray-700 font-bold text-xl mb-2">No results found</h3>
          <p className="text-gray-500 text-base">Try adjusting your search query</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedHistory.map((item) => (
            <Card key={item.id} className="p-5 hover:shadow-lg"
              onClick={() => { setScanResult(item); navigateTo('result', 'history'); }}>
              <div className="flex items-start gap-3 mb-3">
                <img src={item.img} className="w-16 h-16 rounded-lg object-cover bg-gray-100 shadow-sm" alt="" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-gray-900 font-bold text-base truncate mb-1">{item.brandName}</h4>
                  <p className="text-gray-600 text-sm truncate">{item.genericName}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar size={12} /> {formatDateTime(item.date, lang)}
                </p>
                <button onClick={(e) => { e.stopPropagation(); deleteScan(item.id); }}
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const SettingsScreen = () => (
    <div className="max-w-4xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t(lang, 'settings.title')}</h1>
        <p className="text-gray-600 text-lg">{t(lang, 'settings.subtitle')}</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <Globe size={16} />
            {t(lang, 'settings.language')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {LANGUAGES.map(l => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`p-4 rounded-xl flex items-center justify-between transition-all ${lang === l.code
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                }`}>
                <span className="font-semibold text-gray-900 text-base">{l.nativeName}</span>
                {lang === l.code && <CheckCircle2 size={20} className="text-blue-600" />}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Data Management</h2>
          <Card className="p-5" variant="danger" onClick={clearAllHistory}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <Trash2 className="text-red-600" size={20} />
              </div>
              <div className="flex-1">
                <span className="text-red-800 font-bold text-base block mb-1">{t(lang, 'settings.clear')}</span>
                <p className="text-red-600 text-sm">{t(lang, 'settings.clearDesc')}</p>
              </div>
              <ChevronRight className="text-red-400" size={20} />
            </div>
          </Card>
        </div>

        <div className="text-center py-6">
          <h3 className="text-gray-900 font-bold text-lg mb-2">{t(lang, 'settings.about')}</h3>
          <p className="text-gray-500 text-base mb-2">
            {t(lang, 'settings.version')} {CONFIG.APP_VERSION}
          </p>
          <p className="text-gray-400 text-sm mb-3">
            {t(lang, 'settings.lastUpdated')}: {CONFIG.LAST_UPDATED}
          </p>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            {t(lang, 'settings.description')}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">{t(lang, 'settings.legal')}</h2>
          <div className="space-y-3">
            <Card className="p-4 hover:shadow-lg" onClick={() => setLegalModal({ isOpen: true, type: 'terms' })}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={20} className="text-gray-600" />
                  <span className="text-gray-800 font-semibold text-base">{t(lang, 'settings.termsOfUse')}</span>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </Card>
            <Card className="p-4 hover:shadow-lg" onClick={() => setLegalModal({ isOpen: true, type: 'disclaimer' })}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-gray-600" />
                  <span className="text-gray-800 font-semibold text-base">{t(lang, 'settings.disclaimer')}</span>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {!hasAcceptedTerms && <LegalGate onAccept={handleTermsAcceptance} lang={lang} />}

      <LegalModal
        isOpen={legalModal.isOpen}
        onClose={() => setLegalModal({ isOpen: false, type: null })}
        type={legalModal.type}
        lang={lang}
      />

      <Sidebar />

      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-6 py-3 text-center border-b-2 border-red-600 fixed top-0 right-0 left-0 z-20"
        style={{ marginLeft: sidebarOpen ? '288px' : '80px' }}>
        <span className="text-sm font-bold tracking-wide uppercase">
          {t(lang, 'home.headerBanner')}
        </span>
      </div>

      <main className="transition-all duration-300 pt-14"
        style={{ marginLeft: sidebarOpen ? '288px' : '80px' }}>
        {screen === 'home' && <HomeScreen />}
        {screen === 'result' && <ResultScreen />}
        {screen === 'history' && <HistoryScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
}
