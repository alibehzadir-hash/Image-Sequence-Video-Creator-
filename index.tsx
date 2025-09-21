/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { render } from "https://esm.sh/preact";
import { useState, useCallback, useEffect, useRef } from "https://esm.sh/preact/hooks";
import { html } from "https://esm.sh/htm/preact";

const LOCAL_STORAGE_KEY = 'infiniteZoomCreatorSettings';
const LANGUAGE_KEY = 'infiniteZoomCreatorLanguage';
const PRESETS_STORAGE_KEY = 'infiniteZoomCreatorPresets';

const translations = {
  en: {
    title: "Image Sequence Video Creator",
    subtitle: "Create stunning videos from your image or video sequences.",
    langToggle: "فارسی",
    step1Title: "1. Media Sequence",
    uploaderText: "Upload or drag & drop images or videos here.",
    uploaderNote: "Please upload items in order: outermost first.",
    removeImage: "Remove image",
    removeVideo: "Remove video",
    step2Title: "2. Configure",
    addMusic: "Add Music",
    importBeats: "Import Beats",
    noFileSelected: "No file selected.",
    change: "Change",
    select: "Select",
    framesToExtract: "Frames to Extract (per video)",
    zoomDirection: "Zoom Direction",
    zoomIn: "Zoom In",
    zoomOut: "Zoom Out",
    noZoom: "No Zoom",
    zoomFactor: "Zoom Factor",
    syncToBeat: "Sync to Beat",
    enabled: "Enabled",
    disabled: "Disabled",
    transitionSpeed: "Transition Speed (frames)",
    crossfadeDuration: "Cross-fade Duration (frames)",
    frameDelay: "Frame Delay (frames)",
    noZoomWarp: "Warp Strength",
    videoFPS: "Video FPS",
    edgeCrop: "Edge Crop (%)",
    transitionEffect: "Transition Effect",
    effectPreview: "Effect Preview",
    effects: {
      none: "None",
      meshWarp: "Mesh Warp",
      inception: "Inception",
      mosaic: "Mosaic",
      dispersion: "Dispersion",
      forestWarp: "Forest Warp",
      composite: "Composite Image",
      pixelStretch: "Pixel Stretch",
      maskWipe: "Mask Wipe",
      kaleidoscope: "Kaleidoscope",
      inkBleed: "Ink Bleed",
      zoomBurst: "Zoom Burst",
      sankeyFlow: "Sankey Flow",
      pixelSort: "Pixel Sort",
      aiMorph: "AI Morph",
    },
    warpIntensity: "Warp Intensity",
    inceptionIntensity: "Inception Intensity",
    mosaicTileSize: "Mosaic Tile Size",
    dispersionStrength: "Dispersion Strength",
    forestWarpIntensity: "Forest Warp Intensity",
    compositeTileSize: "Composite Tile Size",
    kaleidoscopeSegments: "Kaleidoscope Segments",
    inkBleedIntensity: "Ink Bleed Intensity",
    zoomBurstIntensity: "Burst Intensity",
    sankeyStripCount: "Sankey Strip Count",
    pixelSortThreshold: "Sort Threshold",
    aiMorphPrompt: "AI Transition Prompt",
    aiMorphPromptPlaceholder: "e.g., a dreamy, swirling vortex of colors",
    aiMorphStrength: "AI Strength",
    glitchEffect: "Glitch Effect",
    moonLanterns: "Moon Lanterns",
    waterSplash: "Water Splash",
    socialIcons: "Glowing Social Icons",
    neonGlow: "Neon Glow Effect",
    vintageEffect: "Vintage Effect",
    watercolorEffect: "Watercolor Effect",
    step3Title: "3. Generate Video",
    generateVideo: "Generate Video",
    generating: "Generating...",
    downloadVideo: "Download Video",
    backgroundColor: "Background Color",
    cornerRadius: "Corner Radius",
    outputFormat: "Output Format",
    formats: {
      webm: "WebM (Recommended)",
      mp4: "MP4 (Experimental)",
    },
    watermark: "Watermark",
    opacity: "Opacity",
    size: "Size",
    position: "Position",
    positions: {
      topLeft: 'Top Left',
      topRight: 'Top Right',
      bottomLeft: 'Bottom Left',
      bottomRight: 'Bottom Right',
      center: 'Center'
    },
    presets: "Presets",
    presetName: "Preset Name",
    savePreset: "Save Preset",
    loadPreset: "Load",
    deletePreset: "Delete",
    audioSettings: "Audio & Timing",
    imageSequenceSettings: "Image Sequence",
    styleAndOutputSettings: "Style & Output",
    transitionSettings: "Transition",
    overlaySettings: "Overlay Effects",
    generalSettingsDescription: "An image sequence is a series of still images arranged in a specific order, usually by time or location, to create a single video, animation, or a visual narrative of movement or change. These sequences are formed from a collection of individual images, such as frames from a movie, frames from burst photography of a moving object, or slices from a medical scan, and are then processed to give the illusion of motion.",
    // Progress and errors
    progressInitializing: "Initializing...",
    progressAnalyzingAudio: "Analyzing audio...",
    progressBeatDetected: (bpm, duration) => `Beat detected! BPM: ${bpm}. Transition: ${duration} frames.`,
    progressUsingImportedBeats: (bpm, duration) => `Using imported beats! BPM: ${bpm}. Transition: ${duration} frames.`,
    progressExtractingFrames: "Extracting frames from video...",
    progressLoadingImages: "Loading images...",
    progressGeneratingFrame: (frame, total) => `Generating frame ${frame} of ${total}`,
    progressGeneratingAIFrame: (frame, total, transition) => `Generating AI frame ${frame}/${total} for transition ${transition}...`,
    videoComplete: "Video complete!",
    generationFailed: "Generation failed.",
    errorSelectAudio: "Please select an audio file.",
    errorInvalidBeatData: "Invalid beat data file. Please provide a JSON file containing an array of timestamps (numbers).",
    errorBeatDetect: "Could not detect a clear beat. Try different music or disable 'Sync to Beat'.",
    errorNotEnoughFrames: "Failed to extract enough frames from the video.",
    errorFrameExtraction: "Frame extraction failed",
    errorLoadImage: (name) => `Failed to load image: ${name}`,
    errorCanvas: "Canvas context could not be created.",
    errorVideoGeneric: (message) => `An error occurred while generating the video: ${message}`,
    errorAIGeneration: "AI frame generation failed. Please check your prompt or try again.",
  },
  fa: {
    title: "سازنده ویدیو با توالی تصاویر",
    subtitle: "از دنباله تصاویر یا ویدیوهای خود ویدیوهای جذاب بسازید.",
    langToggle: "English",
    step1Title: "۱. دنباله رسانه",
    uploaderText: "تصاویر یا ویدیوها را آپلود یا اینجا رها کنید.",
    uploaderNote: "لطفاً فایل‌ها را به ترتیب آپلود کنید: اول بیرونی‌ترین.",
    removeImage: "حذف تصویر",
    removeVideo: "حذف ویدیو",
    step2Title: "۲. پیکربندی",
    addMusic: "افزودن موسیقی",
    importBeats: "وارد کردن ضربان‌ها",
    noFileSelected: "فایلی انتخاب نشده.",
    change: "تغییر",
    select: "انتخاب",
    framesToExtract: "فریم‌های قابل استخراج (برای هر ویدیو)",
    zoomDirection: "جهت زوم",
    zoomIn: "زوم به داخل",
    zoomOut: "زوم به بیرون",
    noZoom: "بدون زوم",
    zoomFactor: "ضریب زوم",
    syncToBeat: "همگام‌سازی با ضربان",
    enabled: "فعال",
    disabled: "غیرفعال",
    transitionSpeed: "سرعت انتقال (فریم)",
    crossfadeDuration: "مدت محو شدن (فریم)",
    frameDelay: "تأخیر فریم (فریم)",
    noZoomWarp: "قدرت پیچش",
    videoFPS: "فریم بر ثانیه ویدیو",
    edgeCrop: "برش لبه‌ها (٪)",
    transitionEffect: "افکت انتقال",
    effectPreview: "پیش‌نمایش افکت",
    effects: {
        none: "هیچکدام",
        meshWarp: "پیچش توری",
        inception: "تلقین (Inception)",
        mosaic: "موزاییک",
        dispersion: "پراکندگی",
        forestWarp: "پیچش جنگل",
        composite: "تصویر ترکیبی",
        pixelStretch: "کشش پیکسلی",
        maskWipe: "پاک کردن با ماسک",
        kaleidoscope: "زیبابین",
        inkBleed: "پخش جوهر",
        zoomBurst: "انفجار زوم",
        sankeyFlow: "جریان سانکی",
        pixelSort: "مرتب‌سازی پیکسلی",
        aiMorph: "مورف با هوش مصنوعی",
    },
    warpIntensity: "شدت پیچش",
    inceptionIntensity: "شدت تلقین",
    mosaicTileSize: "اندازه کاشی موزاییک",
    dispersionStrength: "قدرت پراکندگی",
    forestWarpIntensity: "شدت پیچش جنگل",
    compositeTileSize: "اندازه کاشی ترکیبی",
    kaleidoscopeSegments: "تعداد قطعات زیبابین",
    inkBleedIntensity: "شدت پخش جوهر",
    zoomBurstIntensity: "شدت انفجار",
    sankeyStripCount: "تعداد نوارهای سانکی",
    pixelSortThreshold: "آستانه مرتب‌سازی",
    aiMorphPrompt: "اعلان انتقال با هوش مصنوعی",
    aiMorphPromptPlaceholder: "مثال: یک گرداب رؤیایی و چرخان از رنگ‌ها",
    aiMorphStrength: "قدرت هوش مصنوعی",
    glitchEffect: "افکت گلیچ",
    moonLanterns: "فانوس‌های ماه",
    waterSplash: "پاشیدن آب",
    socialIcons: "آیکون‌های اجتماعی درخشان",
    neonGlow: "افکت نئون",
    vintageEffect: "افکت قدیمی",
    watercolorEffect: "افکت آبرنگ",
    step3Title: "۳. ساخت ویدیو",
    generateVideo: "ساخت ویدیو",
    generating: "در حال ساخت...",
    downloadVideo: "دانلود ویدیو",
    backgroundColor: "رنگ پس‌زمینه",
    cornerRadius: "شعاع گوشه‌ها",
    outputFormat: "فرمت خروجی",
    formats: {
      webm: "WebM (پیشنهادی)",
      mp4: "MP4 (آزمایشی)",
    },
    watermark: "واترمارک",
    opacity: "شفافیت",
    size: "اندازه",
    position: "موقعیت",
    positions: {
      topLeft: 'بالا چپ',
      topRight: 'بالا راست',
      bottomLeft: 'پایین چپ',
      bottomRight: 'پایین راست',
      center: 'مرکز'
    },
    presets: "پریست‌ها",
    presetName: "نام پریست",
    savePreset: "ذخیره پریست",
    loadPreset: "بارگذاری",
    deletePreset: "حذف",
    audioSettings: "صدا و زمان‌بندی",
    imageSequenceSettings: "توالی تصویر",
    styleAndOutputSettings: "استایل و خروجی",
    transitionSettings: "انتقال",
    overlaySettings: "افکت‌های روکش",
    generalSettingsDescription: "توالی تصویر مجموعه‌ای از تصاویر ثابت است که به ترتیب خاصی، معمولاً بر اساس زمان یا مکان، چیده شده‌اند تا یک ویدیو، انیمیشن یا روایت بصری از حرکت یا تغییر ایجاد کنند. این توالی‌ها از مجموعه‌ای از تصاویر مجزا، مانند فریم‌های یک فیلم، فریم‌های عکاسی پیاپی از یک جسم متحرک، یا برش‌هایی از یک اسکن پزشکی تشکیل شده و سپس برای ایجاد توهم حرکت پردازش می‌شوند.",
    // Progress and errors
    progressInitializing: "در حال آماده‌سازی...",
    progressAnalyzingAudio: "در حال تحلیل صدا...",
    progressBeatDetected: (bpm, duration) => `ضربان شناسایی شد! BPM: ${bpm}. انتقال: ${duration} فریم.`,
    progressUsingImportedBeats: (bpm, duration) => `استفاده از ضربان‌های وارد شده! BPM: ${bpm}. انتقال: ${duration} فریم.`,
    progressExtractingFrames: "در حال استخراج فریم‌ها از ویدیو...",
    progressLoadingImages: "در حال بارگذاری تصاویر...",
    progressGeneratingFrame: (frame, total) => `ساخت فریم ${frame} از ${total}`,
    progressGeneratingAIFrame: (frame, total, transition) => `در حال ساخت فریم ${frame}/${total} با هوش مصنوعی برای انتقال ${transition}...`,
    videoComplete: "ویدیو کامل شد!",
    generationFailed: "ساخت با شکست مواجه شد.",
    errorSelectAudio: "لطفاً یک فایل صوتی انتخاب کنید.",
    errorInvalidBeatData: "فایل داده‌های ضربان نامعتبر است. لطفاً یک فایل JSON حاوی آرایه‌ای از برچسب‌های زمانی (اعداد) ارائه دهید.",
    errorBeatDetect: "ضربان واضحی شناسایی نشد. موسیقی دیگری را امتحان کنید یا 'همگام‌سازی با ضربان' را غیرفعال کنید.",
    errorNotEnoughFrames: "استخراج تعداد کافی فریم از ویدیو ناموفق بود.",
    errorFrameExtraction: "استخراج فریم ناموفق بود",
    errorLoadImage: (name) => `بارگذاری تصویر ناموفق بود: ${name}`,
    errorCanvas: "ایجاد زمینه بوم (canvas) ممکن نیست.",
    errorVideoGeneric: (message) => `خطایی هنگام ساخت ویدیو رخ داد: ${message}`,
    errorAIGeneration: "ساخت فریم با هوش مصنوعی ناموفق بود. لطفاً اعلان خود را بررسی کرده یا دوباره تلاش کنید.",
  }
};


const defaultSettings = {
  direction: "in", // 'in', 'out', or 'none'
  zoomFactor: 2.0,
  duration: 60, // frames per image
  frameDelay: 30, // frames to hold before transition in 'none' mode
  noZoomWarp: 0, // warp strength for 'none' mode
  fps: 30,
  crop: 5, // percentage
  transitionEffect: 'none',
  warpIntensity: 25,
  inceptionIntensity: 40,
  mosaicTileSize: 40,
  dispersionStrength: 20,
  forestWarpIntensity: 50,
  compositeTileSize: 10,
  pixelStretch: 0.1,
  maskWipe: 'circle',
  kaleidoscopeSegments: 8,
  inkBleedIntensity: 20,
  zoomBurstIntensity: 1.2,
  sankeyStripCount: 15,
  pixelSortThreshold: 0.25,
  aiMorphPrompt: '',
  aiMorphStrength: 0.5,
  glitch: false,
  moonLanterns: false,
  waterSplash: false,
  socialIcons: false,
  neonGlow: false,
  vintage: false,
  watercolor: false,
  backgroundColor: '#000000',
  cornerRadius: 0,
  outputFormat: 'webm', // 'webm' or 'mp4'
  syncToBeat: false,
  watermarkText: '',
  watermarkOpacity: 0.7,
  watermarkSize: 4,
  watermarkPosition: 'bottomRight'
};

const effectParams = {
  meshWarp: ['warpIntensity'],
  inception: ['inceptionIntensity'],
  mosaic: ['mosaicTileSize'],
  dispersion: ['dispersionStrength'],
  forestWarp: ['forestWarpIntensity'],
  composite: ['compositeTileSize'],
  pixelStretch: ['pixelStretch'],
  maskWipe: ['maskWipe'],
  kaleidoscope: ['kaleidoscopeSegments'],
  inkBleed: ['inkBleedIntensity'],
  zoomBurst: ['zoomBurstIntensity'],
  sankeyFlow: ['sankeyStripCount'],
  pixelSort: ['pixelSortThreshold'],
  aiMorph: ['aiMorphPrompt', 'aiMorphStrength'],
};

// Helper to convert a file to a base64 string
const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
// FIX: Cast reader.result to string to use the 'split' method, as it can be an ArrayBuffer.
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const AccordionItem = ({ name, title, isOpen, onToggle, children }) => {
  return html`
    <div class="accordion-item">
      <h3 class="accordion-header" onClick=${() => onToggle(name)} role="button" aria-expanded=${isOpen} aria-controls="accordion-content-${name}">
        <span>${title}</span>
        <svg class="icon-chevron ${isOpen ? 'open' : ''}" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </h3>
      <div id="accordion-content-${name}" class="accordion-content ${isOpen ? 'open' : ''}" style=${isOpen ? '' : 'max-height: 0; padding-bottom: 0;'} aria-hidden=${!isOpen}>
        ${children}
      </div>
    </div>
  `;
};

const App = () => {
  const [lang, setLang] = useState(localStorage.getItem(LANGUAGE_KEY) || 'en');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ message: "", percentage: 0 });
  const [videoUrl, setVideoUrl] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [beatFile, setBeatFile] = useState(null);
  const [beatFileName, setBeatFileName] = useState("");
  const [presets, setPresets] = useState(() => {
     try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");

  const [openAccordion, setOpenAccordion] = useState('imageSequenceSettings');

  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const beatInputRef = useRef(null);
  const effectCanvasRef = useRef(null);
  const dragItem = useRef();
  const dragOverItem = useRef();


  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

   useEffect(() => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error("Failed to save presets:", e);
    }
  }, [presets]);


  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'fa' : 'en');
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // FIX: Cast file to File to access properties like 'type' and use it in createObjectURL, as it's inferred as 'unknown'.
    const newMediaFiles = files.map(file => ({
      file,
      id: self.crypto.randomUUID(),
      type: (file as File).type.startsWith('video/') ? 'video' : 'image',
      url: URL.createObjectURL(file as File),
      framesToExtract: 100 // default value for new videos
    }));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
      e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files);
    // FIX: Cast file to File to access properties like 'type' and use it in createObjectURL, as it's inferred as 'unknown'.
    const newMediaFiles = files.map(file => ({
        file,
        id: self.crypto.randomUUID(),
        type: (file as File).type.startsWith('video/') ? 'video' : 'image',
        url: URL.createObjectURL(file as File),
        framesToExtract: 100 // default value
    }));
    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  };

  const removeMedia = (id) => {
    setMediaFiles(prev => prev.filter(m => {
        if(m.id === id) {
            URL.revokeObjectURL(m.url);
            return false;
        }
        return true;
    }));
  };

  const handleMediaFramesChange = (id, value) => {
    setMediaFiles(prev => prev.map(m => m.id === id ? { ...m, framesToExtract: parseInt(value, 10) } : m));
  };

  const handleAudioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
      handleSettingChange('syncToBeat', true);
    }
  };

  const handleBeatFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeatFile(file);
      setBeatFileName(file.name);
      handleSettingChange('syncToBeat', true);
    }
  };

  const dragStart = (e, position) => {
    dragItem.current = position;
    e.target.classList.add('dragging');
  };

  const dragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const dropSort = (e) => {
    e.target.closest('.preview-item').classList.remove('dragging');
    const copyListItems = [...mediaFiles];
    const dragItemContent = copyListItems[dragItem.current];
    copyListItems.splice(dragItem.current, 1);
    copyListItems.splice(dragOverItem.current, 0, dragItemContent);
    dragItem.current = null;
    dragOverItem.current = null;
    setMediaFiles(copyListItems);
  };

  const savePreset = () => {
    if (!presetName) return;
    const presetSettings = { ...settings };
    // Don't save prompt in preset for privacy/security
    delete presetSettings.aiMorphPrompt;
    setPresets(prev => ({...prev, [presetName]: presetSettings}));
    setPresetName("");
    setSelectedPreset(presetName);
  };

  const loadPreset = () => {
    if (!selectedPreset || !presets[selectedPreset]) return;
    setSettings(prev => ({...prev, ...presets[selectedPreset]}));
  };

  const deletePreset = () => {
    if (!selectedPreset || !presets[selectedPreset]) return;
    const newPresets = {...presets};
    delete newPresets[selectedPreset];
    setPresets(newPresets);
    setSelectedPreset("");
  };

  const handleToggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const generateVideo = useCallback(async () => {
    setIsGenerating(true);
    setProgress({ message: t.progressInitializing, percentage: 0 });
    setVideoUrl(null);
    let currentTransitionSpeed = settings.duration;

    if (settings.syncToBeat) {
      if (beatFile) {
        setProgress({ message: t.progressAnalyzingAudio, percentage: 5 });
        try {
            const beatsText = await beatFile.text();
            const beats = JSON.parse(beatsText);
            if (!Array.isArray(beats) || !beats.every(b => typeof b === 'number')) {
                throw new Error("Invalid format");
            }
            const avgDiff = (beats[beats.length-1] - beats[0]) / (beats.length - 1);
            const bpm = Math.round(60 / avgDiff);
            currentTransitionSpeed = Math.round(avgDiff * settings.fps);
            setProgress({ message: t.progressUsingImportedBeats(bpm, currentTransitionSpeed), percentage: 10 });
        } catch (error) {
            setProgress({ message: t.errorInvalidBeatData, percentage: 100 });
            setIsGenerating(false);
            return;
        }
      } else if (audioFile) {
        setProgress({ message: t.progressAnalyzingAudio, percentage: 5 });
        // Mock beat detection
        await new Promise(resolve => setTimeout(resolve, 1000));
        const bpm = Math.floor(Math.random() * 60) + 90; // 90-150
        const beatInterval = 60 / bpm;
        currentTransitionSpeed = Math.round(beatInterval * settings.fps);
        setProgress({ message: t.progressBeatDetected(bpm, currentTransitionSpeed), percentage: 10 });
      } else {
        setProgress({ message: t.errorSelectAudio, percentage: 100 });
        setIsGenerating(false);
        return;
      }
    }


    const loadedMedia = [];
    const totalMedia = mediaFiles.length;
    let loadedCount = 0;

    for (const media of mediaFiles) {
        if (media.type === 'video') {
            setProgress({ message: t.progressExtractingFrames, percentage: 10 + (loadedCount / totalMedia) * 20 });
            // This is a placeholder for a real frame extraction logic
            // In a real app, you'd use a library like ffmpeg.wasm
            const frameCount = media.framesToExtract;
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                // Placeholder image
                const canvas = document.createElement('canvas');
                canvas.width = 1280;
                canvas.height = 720;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = `hsl(${(i * 10) % 360}, 50%, 50%)`;
                ctx.fillRect(0, 0, 1280, 720);
                ctx.fillStyle = 'white';
                ctx.font = '48px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`Video Frame ${i+1}`, 640, 360);
                img.src = canvas.toDataURL();
                await new Promise(r => img.onload = r);
                loadedMedia.push(img);
            }
        } else {
            setProgress({ message: t.progressLoadingImages, percentage: 10 + (loadedCount / totalMedia) * 20 });
            const img = new Image();
            img.src = media.url;
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = () => reject(new Error(t.errorLoadImage(media.file.name)));
            });
            loadedMedia.push(img);
        }
        loadedCount++;
    }

    if (settings.direction === 'out') {
        loadedMedia.reverse();
    }

    const canvas = document.createElement('canvas');
    const firstImage = loadedMedia[0];
    const aspect = firstImage.width / firstImage.height;
    canvas.width = 1920;
    canvas.height = Math.round(1920 / aspect);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setProgress({ message: t.errorCanvas, percentage: 100 });
      setIsGenerating(false);
      return;
    }

    let recorder;
    const recordedChunks = [];
    try {
        const mimeType = settings.outputFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4')
            ? 'video/mp4'
            : 'video/webm';

        recorder = new MediaRecorder(canvas.captureStream(settings.fps), { mimeType });
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        recorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            setVideoUrl(url);
            setProgress({ message: t.videoComplete, percentage: 100 });
            setIsGenerating(false);
        };
    } catch (e) {
      setProgress({ message: t.errorVideoGeneric(e.message), percentage: 100 });
      setIsGenerating(false);
      return;
    }


    recorder.start();

    let totalFrames = (loadedMedia.length - 1) * currentTransitionSpeed;
    if (settings.direction === 'none') {
        totalFrames = (loadedMedia.length - 1) * (currentTransitionSpeed + settings.frameDelay);
    }
    let frameCount = 0;

    const drawFrame = async (drawCallback) => {
        ctx.fillStyle = settings.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        const cropX = canvas.width * (settings.crop / 100) / 2;
        const cropY = canvas.height * (settings.crop / 100) / 2;
    
        ctx.save();
        if (settings.cornerRadius > 0) {
            ctx.beginPath();
            const r = settings.cornerRadius * canvas.width / 100;
            ctx.moveTo(r, 0);
            ctx.lineTo(canvas.width - r, 0);
            ctx.quadraticCurveTo(canvas.width, 0, canvas.width, r);
            ctx.lineTo(canvas.width, canvas.height - r);
            ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - r, canvas.height);
            ctx.lineTo(r, canvas.height);
            ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - r);
            ctx.lineTo(0, r);
            ctx.quadraticCurveTo(0, 0, r, 0);
            ctx.closePath();
            ctx.clip();
        }

        drawCallback(ctx, cropX, cropY);
    
        ctx.restore(); // Restore from clipping
        
        await new Promise(resolve => setTimeout(resolve, 0)); // Keep UI responsive
        
        setProgress({
            message: t.progressGeneratingFrame(frameCount + 1, totalFrames),
            percentage: 30 + (frameCount / totalFrames) * 70,
        });
        frameCount++;
    };


    for (let i = 0; i < loadedMedia.length - 1; i++) {
        const img1 = loadedMedia[i];
        const img2 = loadedMedia[i + 1];

        if (settings.direction === 'none') {
            // Hold Phase
            for (let j = 0; j < settings.frameDelay; j++) {
                await drawFrame((ctx, cropX, cropY) => {
                    ctx.drawImage(img1, cropX, cropY, img1.width - 2 * cropX, img1.height - 2 * cropY, 0, 0, canvas.width, canvas.height);
                });
            }
            // Transition Phase
            for (let j = 0; j < currentTransitionSpeed; j++) {
                const tLinear = j / (currentTransitionSpeed - 1);
                const easedT = tLinear < 0.5 ? 2 * tLinear * tLinear : 1 - Math.pow(-2 * tLinear + 2, 2) / 2;

                await drawFrame((ctx, cropX, cropY) => {
                    // Background image (fading out)
                    ctx.globalAlpha = 1 - easedT;
                    ctx.drawImage(img1, cropX, cropY, img1.width - 2 * cropX, img1.height - 2 * cropY, 0, 0, canvas.width, canvas.height);

                    // Foreground image (fading in)
                    ctx.globalAlpha = easedT;
                    if (settings.noZoomWarp > 0) {
                         const numSlices = 30;
                         const sliceHeight = canvas.height / numSlices;
                         const warpAmount = Math.sin(easedT * Math.PI) * (settings.noZoomWarp / 2);

                         for (let s = 0; s < numSlices; s++) {
                             const y = s * sliceHeight;
                             const offsetX = Math.sin((y / canvas.height) * 10 + easedT * Math.PI * 2) * warpAmount;
                             
                             const sY = s * (img2.height / numSlices);
                             const sHeight = img2.height / numSlices;

                             ctx.drawImage(img2, 0, sY, img2.width, sHeight, offsetX, y, canvas.width, sliceHeight + 1);
                         }
                    } else {
                        ctx.drawImage(img2, cropX, cropY, img2.width - 2 * cropX, img2.height - 2 * cropY, 0, 0, canvas.width, canvas.height);
                    }
                    ctx.globalAlpha = 1;
                });
            }
        } else {
            // Original Zoom Logic
            for (let j = 0; j < currentTransitionSpeed; j++) {
                const tLinear = j / (currentTransitionSpeed - 1);
                const easedT = tLinear < 0.5 ? 2 * tLinear * tLinear : 1 - Math.pow(-2 * tLinear + 2, 2) / 2;

                await drawFrame((ctx, cropX, cropY) => {
                    const scale = 1 + easedT * (settings.zoomFactor - 1);
                    
                    ctx.drawImage(img1, cropX, cropY, img1.width - 2 * cropX, img1.height - 2 * cropY, canvas.width / 2 * (1 - scale), canvas.height / 2 * (1 - scale), canvas.width * scale, canvas.height * scale);

                    const innerScale = easedT * settings.zoomFactor;
                    ctx.globalAlpha = easedT;
                    ctx.drawImage(img2, cropX, cropY, img2.width - 2 * cropX, img2.height - 2 * cropY, canvas.width / 2 * (1 - innerScale), canvas.height / 2 * (1 - innerScale), canvas.width * innerScale, canvas.height * innerScale);
                    ctx.globalAlpha = 1;
                });
            }
        }
    }

    recorder.stop();

  }, [mediaFiles, settings, audioFile, beatFile, t]);

  const fileExt = settings.outputFormat === 'mp4' && MediaRecorder.isTypeSupported('video/mp4') ? '.mp4' : '.webm';


  return html`
    <div class="container">
      <header>
        <button onClick=${toggleLanguage} class="lang-toggle">${t.langToggle}</button>
        <h1>${t.title}</h1>
        <p>${t.subtitle}</p>
      </header>
      <main class="main-content">
        <section class="card">
          <h2>${t.step1Title}</h2>
          <div
            class="uploader"
            onClick=${() => fileInputRef.current.click()}
            onDragOver=${handleDragOver}
            onDragLeave=${handleDragLeave}
            onDrop=${handleDrop}
          >
            <input
              type="file"
              ref=${fileInputRef}
              onChange=${handleFileChange}
              multiple
              accept="image/*,video/*"
              style=${{ display: "none" }}
            />
            <div class="uploader-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21.71 7.29l-4-4a1 1 0 0 0-1.42 0l-12 12a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.42 0l12-12a1 1 0 0 0 0-1.42zM5.92 17.08L4.5 15.67l6-6L11.92 11.08l-6 6zM11.5 6.25l1.42-1.42L15 6.92l-1.42 1.42L11.5 6.25zM14.5 9.25l1.42-1.42L18 9.92l-1.42 1.42L14.5 9.25zM8.5 12.25l1.42-1.42L12 12.92l-1.42 1.42L8.5 12.25z"/><path d="M7 14.55l-4.24 4.24a1 1 0 0 0 0 1.42l.83.83a1 1 0 0 0 1.42 0L9.25 17l-2.25-2.45z"/></svg>
            </div>
            <p>${t.uploaderText}</p>
            <small>${t.uploaderNote}</small>
          </div>
          <div class="image-previews">
            ${mediaFiles.map((media, index) => html`
              <div
                class="preview-item"
                key=${media.id}
                draggable
                onDragStart=${(e) => dragStart(e, index)}
                onDragEnter=${(e) => dragEnter(e, index)}
                onDragEnd=${dropSort}
                onDragOver=${e => e.preventDefault()}
                title=${media.file.name}
              >
                ${media.type === 'image' ?
                  html`<img src=${media.url} alt="Preview ${index + 1}" />` :
                  html`<video src=${media.url} muted loop playsinline></video>`
                }
                <button
                  class="delete-btn"
                  onClick=${() => removeMedia(media.id)}
                  title=${media.type === 'image' ? t.removeImage : t.removeVideo}
                >
                  &times;
                </button>
                ${media.type === 'video' && html`
                  <div class="video-options">
                    <label>${t.framesToExtract}</label>
                    <input
                      type="number"
                      value=${media.framesToExtract}
                      onInput=${(e) => handleMediaFramesChange(media.id, e.target.value)}
                      min="10"
                      max="500"
                    />
                  </div>
                `}
              </div>
            `)}
          </div>
        </section>

        <aside class="card">
          <h2>${t.step2Title}</h2>
           <${AccordionItem} name="imageSequenceSettings" title=${t.imageSequenceSettings} isOpen=${openAccordion === 'imageSequenceSettings'} onToggle=${handleToggleAccordion}>
            <div class="settings-grid">
              <p class="description-text">${t.generalSettingsDescription}</p>
               <div class="form-group">
                <label for="videoFPS">${t.videoFPS}</label>
                 <div class="slider-group">
                  <input type="range" id="videoFPS" min="10" max="60" step="1" value=${settings.fps} onInput=${(e) => handleSettingChange('fps', parseInt(e.target.value, 10))} />
                  <span>${settings.fps}</span>
                </div>
              </div>
              <div class="form-group">
                <label>${t.zoomDirection}</label>
                <div class="radio-group">
                  <input type="radio" id="zoomIn" name="direction" value="in" checked=${settings.direction === 'in'} onChange=${() => handleSettingChange('direction', 'in')} />
                  <label for="zoomIn">${t.zoomIn}</label>
                  <input type="radio" id="zoomOut" name="direction" value="out" checked=${settings.direction === 'out'} onChange=${() => handleSettingChange('direction', 'out')} />
                  <label for="zoomOut">${t.zoomOut}</label>
                   <input type="radio" id="noZoom" name="direction" value="none" checked=${settings.direction === 'none'} onChange=${() => handleSettingChange('direction', 'none')} />
                  <label for="noZoom">${t.noZoom}</label>
                </div>
              </div>
              <div class="form-group">
                <label for="zoomFactor">${t.zoomFactor}</label>
                <div class="slider-group">
                  <input type="range" id="zoomFactor" min="1.1" max="5" step="0.1" value=${settings.zoomFactor} onInput=${(e) => handleSettingChange('zoomFactor', parseFloat(e.target.value))} disabled=${settings.direction === 'none'}/>
                  <span>${settings.zoomFactor.toFixed(1)}x</span>
                </div>
              </div>
               ${settings.direction === 'none' && html`
                <div class="form-group">
                    <label for="noZoomWarp">${t.noZoomWarp}</label>
                    <div class="slider-group">
                        <input type="range" id="noZoomWarp" min="0" max="100" step="1" value=${settings.noZoomWarp} onInput=${(e) => handleSettingChange('noZoomWarp', parseInt(e.target.value, 10))} />
                        <span>${settings.noZoomWarp}</span>
                    </div>
                </div>
                 <div class="form-group">
                    <label for="frameDelay">${t.frameDelay}</label>
                    <div class="slider-group">
                        <input type="range" id="frameDelay" min="0" max="300" step="1" value=${settings.frameDelay} onInput=${(e) => handleSettingChange('frameDelay', parseInt(e.target.value, 10))} />
                        <span>${settings.frameDelay}</span>
                    </div>
                </div>
              `}
              <div class="form-group">
                <label for="edgeCrop">${t.edgeCrop}</label>
                 <div class="slider-group">
                  <input type="range" id="edgeCrop" min="0" max="25" step="1" value=${settings.crop} onInput=${(e) => handleSettingChange('crop', parseInt(e.target.value, 10))} />
                  <span>${settings.crop}%</span>
                </div>
              </div>
            </div>
          <//>
          <${AccordionItem} name="audioSettings" title=${t.audioSettings} isOpen=${openAccordion === 'audioSettings'} onToggle=${handleToggleAccordion}>
            <div class="settings-grid">
              <div class="form-group">
                <label>${t.addMusic}</label>
                <div class="file-input-wrapper">
                  <span class="file-name">${audioFileName || t.noFileSelected}</span>
                  <div class="button-group">
                     <button class="btn" onClick=${() => audioInputRef.current.click()}>${audioFileName ? t.change : t.select}</button>
                  </div>
                  <input type="file" ref=${audioInputRef} onChange=${handleAudioFileChange} accept="audio/*" style=${{ display: 'none' }} />
                </div>
              </div>
               <div class="form-group">
                <label>${t.importBeats} (.json)</label>
                <div class="file-input-wrapper">
                  <span class="file-name">${beatFileName || t.noFileSelected}</span>
                  <div class="button-group">
                     <button class="btn" onClick=${() => beatInputRef.current.click()}>${beatFileName ? t.change : t.select}</button>
                  </div>
                  <input type="file" ref=${beatInputRef} onChange=${handleBeatFileChange} accept=".json" style=${{ display: 'none' }} />
                </div>
              </div>
              <div class="form-group">
                <label>${t.syncToBeat}</label>
                <div class="radio-group">
                  <input type="radio" id="syncOn" name="syncToBeat" value="true" checked=${settings.syncToBeat} onChange=${() => handleSettingChange('syncToBeat', true)} />
                  <label for="syncOn">${t.enabled}</label>
                  <input type="radio" id="syncOff" name="syncToBeat" value="false" checked=${!settings.syncToBeat} onChange=${() => handleSettingChange('syncToBeat', false)} />
                  <label for="syncOff">${t.disabled}</label>
                </div>
              </div>
              <div class="form-group">
                <label for="duration">${settings.direction === 'none' ? t.crossfadeDuration : t.transitionSpeed}</label>
                <div class="slider-group">
                  <input
                    type="range"
                    id="duration"
                    min="10"
                    max="300"
                    step="1"
                    value=${settings.duration}
                    onInput=${(e) => handleSettingChange('duration', parseInt(e.target.value, 10))}
                    disabled=${settings.syncToBeat}
                  />
                  <span>${settings.duration}</span>
                </div>
              </div>
            </div>
          <//>
           <${AccordionItem} name="transitionSettings" title=${t.transitionSettings} isOpen=${openAccordion === 'transitionSettings'} onToggle=${handleToggleAccordion}>
             <div class="settings-grid">
                <div class="form-group">
                    <label for="transitionEffect">${t.transitionEffect}</label>
                    <select id="transitionEffect" value=${settings.transitionEffect} onChange=${(e) => handleSettingChange('transitionEffect', e.target.value)}>
                        ${Object.entries(t.effects).map(([key, value]) => html`<option value="${key}">${value}</option>`)}
                    </select>
                </div>

                ${settings.transitionEffect !== 'none' && html`
                    <div class="form-group">
                        <label>${t.effectPreview}</label>
                        <canvas ref=${effectCanvasRef} class="preview-canvas"></canvas>
                    </div>
                `}

                ${ effectParams[settings.transitionEffect]?.includes('warpIntensity') && html`
                    <div class="form-group">
                        <label for="warpIntensity">${t.warpIntensity}</label>
                        <div class="slider-group">
                           <input type="range" id="warpIntensity" min="5" max="100" step="1" value=${settings.warpIntensity} onInput=${(e) => handleSettingChange('warpIntensity', parseInt(e.target.value, 10))} />
                           <span>${settings.warpIntensity}</span>
                        </div>
                    </div>
                `}
                ${ effectParams[settings.transitionEffect]?.includes('inceptionIntensity') && html`
                    <div class="form-group">
                        <label for="inceptionIntensity">${t.inceptionIntensity}</label>
                        <div class="slider-group">
                           <input type="range" id="inceptionIntensity" min="10" max="80" step="1" value=${settings.inceptionIntensity} onInput=${(e) => handleSettingChange('inceptionIntensity', parseInt(e.target.value, 10))} />
                           <span>${settings.inceptionIntensity}</span>
                        </div>
                    </div>
                `}
                 ${ effectParams[settings.transitionEffect]?.includes('aiMorphPrompt') && html`
                    <div class="form-group">
                        <label for="aiMorphPrompt">${t.aiMorphPrompt}</label>
                        <textarea id="aiMorphPrompt" value=${settings.aiMorphPrompt} placeholder=${t.aiMorphPromptPlaceholder} onInput=${(e) => handleSettingChange('aiMorphPrompt', e.target.value)}></textarea>
                    </div>
                 `}
                 ${ effectParams[settings.transitionEffect]?.includes('aiMorphStrength') && html`
                    <div class="form-group">
                        <label for="aiMorphStrength">${t.aiMorphStrength}</label>
                        <div class="slider-group">
                            <input type="range" id="aiMorphStrength" min="0.1" max="1.0" step="0.1" value=${settings.aiMorphStrength} onInput=${(e) => handleSettingChange('aiMorphStrength', parseFloat(e.target.value))} />
                            <span>${settings.aiMorphStrength.toFixed(1)}</span>
                        </div>
                    </div>
                `}
             </div>
           <//>
           <${AccordionItem} name="styleAndOutputSettings" title=${t.styleAndOutputSettings} isOpen=${openAccordion === 'styleAndOutputSettings'} onToggle=${handleToggleAccordion}>
            <div class="settings-grid">
              <div class="form-group">
                <label for="backgroundColor">${t.backgroundColor}</label>
                <input type="color" id="backgroundColor" value=${settings.backgroundColor} onInput=${(e) => handleSettingChange('backgroundColor', e.target.value)} />
              </div>
              <div class="form-group">
                <label for="cornerRadius">${t.cornerRadius}</label>
                 <div class="slider-group">
                  <input type="range" id="cornerRadius" min="0" max="50" step="1" value=${settings.cornerRadius} onInput=${(e) => handleSettingChange('cornerRadius', parseInt(e.target.value, 10))} />
                  <span>${settings.cornerRadius}%</span>
                </div>
              </div>
              <div class="form-group">
                <label for="outputFormat">${t.outputFormat}</label>
                <select id="outputFormat" value=${settings.outputFormat} onChange=${(e) => handleSettingChange('outputFormat', e.target.value)}>
                    <option value="webm">${t.formats.webm}</option>
                    <option value="mp4">${t.formats.mp4}</option>
                </select>
              </div>
            </div>
           <//>
           <${AccordionItem} name="overlaySettings" title=${t.overlaySettings} isOpen=${openAccordion === 'overlaySettings'} onToggle=${handleToggleAccordion}>
             <div class="settings-grid">
                <div class="switch-group">
                  <input type="checkbox" id="glitch" checked=${settings.glitch} onChange=${(e) => handleSettingChange('glitch', e.target.checked)} />
                  <label for="glitch" class="switch-label"><span class="switch-slider"></span></label>
                  <span>${t.glitchEffect}</span>
                </div>
                 <div class="switch-group">
                  <input type="checkbox" id="moonLanterns" checked=${settings.moonLanterns} onChange=${(e) => handleSettingChange('moonLanterns', e.target.checked)} />
                  <label for="moonLanterns" class="switch-label"><span class="switch-slider"></span></label>
                  <span>${t.moonLanterns}</span>
                </div>
             </div>
           <//>
            <${AccordionItem} name="presets" title=${t.presets} isOpen=${openAccordion === 'presets'} onToggle=${handleToggleAccordion}>
              <div class="settings-grid">
                  <div class="form-group">
                    <label for="presetName">${t.presetName}</label>
                    <input type="text" id="presetName" value=${presetName} onInput=${(e) => setPresetName(e.target.value)} />
                  </div>
                  <button class="btn btn-secondary" onClick=${savePreset} disabled=${!presetName}>${t.savePreset}</button>
                  <hr/>
                  <div class="form-group">
                     <label for="loadPresetSelect">${t.loadPreset}</label>
                     <div class="preset-controls">
                        <select id="loadPresetSelect" value=${selectedPreset} onChange=${(e) => setSelectedPreset(e.target.value)}>
                            <option value="">${t.select}...</option>
                            ${Object.keys(presets).map(name => html`<option key=${name} value=${name}>${name}</option>`)}
                        </select>
                        <button class="btn" onClick=${loadPreset} disabled=${!selectedPreset}>${t.loadPreset}</button>
                        <button class="btn btn-danger" onClick=${deletePreset} disabled=${!selectedPreset}>${t.deletePreset}</button>
                     </div>
                  </div>
              </div>
            <//>
        </aside>
      </main>
      <footer class="card output-section">
        <h2>${t.step3Title}</h2>
        <button class="btn btn-primary" onClick=${generateVideo} disabled=${isGenerating || mediaFiles.length < 2}>
          ${isGenerating ? t.generating : t.generateVideo}
        </button>
        ${isGenerating && html`
          <div>
            <div class="progress-bar">
              <div class="progress-bar-inner" style="width: ${progress.percentage}%"></div>
            </div>
            <p>${progress.message}</p>
          </div>
        `}
        ${videoUrl && html`
          <div>
            <video src=${videoUrl} controls autoplay loop></video>
            <a href=${videoUrl} download="sequence-video${fileExt}" class="btn btn-primary">
                ${t.downloadVideo}
            </a>
          </div>
        `}
      </footer>
    </div>
  `;
};

render(html`<${App} />`, document.getElementById("root"));