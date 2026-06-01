import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Film,
  Compass,
  History,
  RotateCcw,
  Copy,
  Check,
  Download,
  Camera,
  Palette,
  Music,
  BookOpen,
  Clock,
  AlertTriangle,
  Play,
  Sliders,
  Layers,
  ChevronRight,
  HelpCircle,
  Eye,
  FileText,
  Trash2,
  Home,
  Heart,
  Skull,
  Award,
  Clapperboard,
  CheckSquare,
  Square,
  MessageSquare
} from "lucide-react";
import { CINEMATIC_PRESETS, CinematicPreset } from "./presets";
import { FilmProductionGuide } from "./types";

// Helper component to render the isolated CineAgent HTML snippet with local style scope and theme-matching sandboxing
function SafeIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState("500px");
  
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  const handleLoad = () => {
    if (iframeRef.current) {
      try {
        const heightVal = iframeRef.current.contentWindow?.document.body.scrollHeight;
        if (heightVal) {
          setHeight(`${Math.max(heightVal + 40, 500)}px`);
        }
      } catch (e) {
        // Fallback if cross-origin rules prevent reading body height safely
      }
    }
  };

  return (
    <iframe
      ref={iframeRef}
      onLoad={handleLoad}
      className="w-full border border-gray-250 rounded-xl bg-white shadow-inner transition-all duration-300"
      style={{ height, minHeight: "500px" }}
      title="CineAgent Atölye Önizleme"
      sandbox="allow-scripts allow-same-origin"
    />
  );
}

const LOADING_PHRASES = [
  "Sinematik kameralar için lensler seçiliyor ve açılış sahneleri kadrajlanıyor...",
  "Anlatı yayları Aşk, Vatan ve Ölüm temalarının zengin iplikleriyle dokunuyor...",
  "Chiaroscuro gölgeleri ve ana ışık koordinatları hesaplanıyor...",
  "Karakter psikolojileri ve trajik çatışmalar yapılandırılıyor...",
  "Hüzünlü viyolonsel tonları ve atmosferik ses manzaraları akort ediliyor...",
  "Ekip için adım adım yönetmen yol haritası hazırlanıyor...",
  "Kumaş dokuları ve dönem kostümleri tasarlanıyor...",
  "Kullanıma hazır, web tabanlı sinematik HTML raporu kodlanıyor..."
];

export default function App() {
  // Local storage management for guides history
  const [history, setHistory] = useState<FilmProductionGuide[]>(() => {
    try {
      const saved = localStorage.getItem("cineagent_guides");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem("cineagent_active_id");
      return saved || null;
    } catch {
      return null;
    }
  });

  // Main UI form state
  const [idea, setIdea] = useState("");
  const [themes, setThemes] = useState<string[]>(["Aşk", "Ölüm"]);
  const [genre, setGenre] = useState("Romantik Trajik Realizm / Neo-Noir");
  const [referenceStyle, setReferenceStyle] = useState("Roger Deakins chiaroscuro gölgeleri, Tarkovski uzun planları");

  // Loading states
  const [loading, setLoading] = useState(false);
  const [loadingPhraseIndex, setLoadingPhraseIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Interactive workshop states
  const [isWorkshopActive, setIsWorkshopActive] = useState(false);
  const [workshopPhase, setWorkshopPhase] = useState<number>(1);
  const [workshopLoading, setWorkshopLoading] = useState(false);
  const [workshopResponse, setWorkshopResponse] = useState("");
  const [workshopHistory, setWorkshopHistory] = useState<any[]>([]);
  const [workshopCurrentData, setWorkshopCurrentData] = useState<any>(null);
  const [workshopError, setWorkshopError] = useState<string | null>(null);

  // Active workspace tab
  const [activeTab, setActiveTab] = useState<"narrative" | "visuals" | "art" | "auditory" | "roadmap" | "export">("narrative");

  // Track copy status
  const [copiedColorIndex, setCopiedColorIndex] = useState<number | null>(null);
  const [copiedHtml, setCopiedHtml] = useState(false);

  // Roadmap task checklist states saved in localStorage
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem("cineagent_completed_steps");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Reference to current active guide object
  const activeGuide = history.find((g) => g.id === activeId) || null;

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem("cineagent_guides", JSON.stringify(history));
    if (history.length === 0) {
      localStorage.removeItem("cineagent_active_id");
      setActiveId(null);
    }
  }, [history]);

  useEffect(() => {
    if (activeId) {
      localStorage.setItem("cineagent_active_id", activeId);
    } else {
      localStorage.removeItem("cineagent_active_id");
    }
  }, [activeId]);

  useEffect(() => {
    localStorage.setItem("cineagent_completed_steps", JSON.stringify(completedSteps));
  }, [completedSteps]);

  // Loading phrase rotation loop
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
      }, 2500);
    } else {
      setLoadingPhraseIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Quick preset loader
  const handleApplyPreset = (preset: CinematicPreset) => {
    setIdea(preset.idea);
    setGenre(preset.genre);
    setThemes(preset.themes);
    setReferenceStyle(preset.style);
    setError(null);
  };

  const handleToggleThemeSelection = (theme: string) => {
    if (themes.includes(theme)) {
      if (themes.length > 1) {
        setThemes(themes.filter((t) => t !== theme));
      }
    } else {
      setThemes([...themes, theme]);
    }
  };

  // Interactive workshop initialization
  const handleStartWorkshop = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!idea.trim()) {
      setError("Lütfen interaktif söyleşiye başlamak için bir ham vizyon fikri girin ya da hazır ilham noktalarından seçin.");
      return;
    }
    setError(null);
    setWorkshopError(null);
    setIsWorkshopActive(true);
    setWorkshopPhase(1);
    setWorkshopLoading(true);
    setWorkshopHistory([]);
    setWorkshopCurrentData(null);
    setWorkshopResponse("");
    setActiveId(null);

    try {
      const response = await fetch("/api/interact-phase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: idea.trim(),
          themes: themes,
          genre: genre.trim(),
          referenceStyle: referenceStyle.trim(),
          phase: 1,
          userResponse: "",
          chatHistory: [],
        }),
      });

      if (!response.ok) {
        throw new Error("İnteraktif atölye başlatılamadı. Uzak sunucu yanıt vermiyor.");
      }

      const data = await response.json();
      setWorkshopCurrentData(data);
      setWorkshopHistory([
        {
          role: "assistant",
          text: data.praiseAndAnalysis,
          htmlSnippet: data.htmlSnippet,
          questions: data.questions,
          nextSteps: data.nextSteps,
          phase: 1,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setWorkshopError(err.message || "Atölye başlatılamadı.");
    } finally {
      setWorkshopLoading(false);
    }
  };

  // Move onto the next phase inside the Q&A session
  const handleNextPhase = async () => {
    if (!workshopResponse.trim()) {
      setWorkshopError("Lütfen bir sonraki aşamaya geçebilmek için soruları kendi cümlelerinizle yanıtlayın.");
      return;
    }
    setWorkshopError(null);
    setWorkshopLoading(true);

    const nextPhaseNumber = workshopPhase + 1;
    const chatHistoryPayload = workshopHistory.map((item) => ({
      role: item.role,
      text: item.role === "user" ? item.text : `${item.text}\nSorular:\n${(item.questions || []).join("\n")}`,
    }));

    try {
      const response = await fetch("/api/interact-phase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: idea.trim(),
          themes: themes,
          genre: genre.trim(),
          referenceStyle: referenceStyle.trim(),
          phase: nextPhaseNumber,
          userResponse: workshopResponse.trim(),
          chatHistory: chatHistoryPayload,
        }),
      });

      if (!response.ok) {
        throw new Error("Bir sonraki aşama yüklenirken hata oluştu.");
      }

      const data = await response.json();
      setWorkshopPhase(nextPhaseNumber);
      setWorkshopCurrentData(data);
      
      setWorkshopHistory((prev) => [
        ...prev,
        {
          role: "user",
          text: workshopResponse.trim(),
          phase: workshopPhase,
        },
        {
          role: "assistant",
          text: data.praiseAndAnalysis,
          htmlSnippet: data.htmlSnippet,
          questions: data.questions,
          nextSteps: data.nextSteps,
          phase: nextPhaseNumber,
        }
      ]);
      setWorkshopResponse("");
    } catch (err: any) {
      console.error(err);
      setWorkshopError(err.message || "Aşama ilerletilemedi.");
    } finally {
      setWorkshopLoading(false);
    }
  };

  // Compile full detailed guide using all user entries throughout the Q&A
  const handleCompileFullGuideFromWorkshop = async () => {
    setLoading(true);
    setWorkshopLoading(true);
    setError(null);
    setWorkshopError(null);

    const finalPrompter = `Bu interaktif atölye söyleşisini ve verilen yanıtları temel alarak efsanevi, 5 aşamalı tam bir yapım kılavuzu derle. 
Atölye Geçmişi ve Alınan Yanıtlar:
${workshopHistory.map((item) => `${item.role === 'user' ? 'YÖNETMEN' : 'CINEAGENT'}: ${item.text}`).join("\n\n")}

Lütfen bu girdilere ve saptanan sanatsal çizgiye sadık kalarak, tüm modülleri içeren (Kimlik, Senaryo & Karakterler, Görsel Dil & Renk Paleti, Sanat Yönetimi, İşitsel Dünya, Yapım Yol Haritası) eksiksiz, Oscar adayı bir "FilmProductionGuide" oluştur.`;

    try {
      const response = await fetch("/api/generate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: finalPrompter,
          themes: themes,
          genre: genre.trim(),
          referenceStyle: referenceStyle.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Tam yapım kılavuzu oluşturulamadı.");
      }

      const rawResult = await response.json();
      const compiledGuide: FilmProductionGuide = {
        id: "guide_" + Date.now(),
        idea: idea.trim(),
        title: rawResult.title || "Başlıksız Auteur Film",
        createdAt: new Date().toLocaleDateString("tr-TR", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        focusTheme: themes.join(" & "),
        identity: rawResult.identity,
        script: rawResult.script,
        visuals: rawResult.visuals,
        art: rawResult.art,
        auditory: rawResult.auditory,
        roadmap: rawResult.roadmap,
        htmlReport: rawResult.htmlReport,
      };

      setHistory((prev) => [compiledGuide, ...prev]);
      setActiveId(compiledGuide.id);
      setIsWorkshopActive(false);
      setActiveTab("narrative");
    } catch (err: any) {
      console.error(err);
      setWorkshopError("Kılavuz derleme sırasında hata oluştu: " + err.message);
    } finally {
      setLoading(false);
      setWorkshopLoading(false);
    }
  };

  // Generate guide request to server
  const handleGenerateGuide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError("Lütfen ham bir sinematik fikir belirtin ya da aşağıdaki hazır yönetmen ilham noktalarından birini seçin.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: idea.trim(),
          themes: themes,
          genre: genre.trim(),
          referenceStyle: referenceStyle.trim(),
        }),
      });

      if (!response.ok) {
        const errDetails = await response.json();
        throw new Error(errDetails.error || "Uzak modelde rehber oluşturma işlemi başarısız oldu.");
      }

      const rawResult = await response.json();

      // Formulate complete production guide record
      const compiledGuide: FilmProductionGuide = {
        id: "guide_" + Date.now(),
        idea: idea.trim(),
        title: rawResult.title || "Başlıksız Auteur Film",
        createdAt: new Date().toLocaleDateString("tr-TR", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        focusTheme: themes.join(" & "),
        identity: rawResult.identity,
        script: rawResult.script,
        visuals: rawResult.visuals,
        art: rawResult.art,
        auditory: rawResult.auditory,
        roadmap: rawResult.roadmap,
        htmlReport: rawResult.htmlReport,
      };

      setHistory((prev) => [compiledGuide, ...prev]);
      setActiveId(compiledGuide.id);
      setActiveTab("narrative");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "İşlem sırasında beklenmedik bir hata oluştu. Lütfen Settings > Secrets bölümünden GEMINI_API_KEY anahtarınızın doğru girildiğinden emin olun.");
    } finally {
      setLoading(false);
    }
  };

  // Delete project from workspace history
  const handleDeleteGuide = (idToDelete: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const remains = history.filter((g) => g.id !== idToDelete);
    setHistory(remains);
    if (activeId === idToDelete) {
      if (remains.length > 0) {
        setActiveId(remains[0].id);
      } else {
        setActiveId(null);
      }
    }
  };

  // Copy HEX code to clipboard helper
  const copyColorToClipboard = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedColorIndex(index);
    setTimeout(() => setCopiedColorIndex(null), 1500);
  };

  // Copy compiled standalone HTML report
  const copyHtmlReportToClipboard = () => {
    if (!activeGuide) return;
    navigator.clipboard.writeText(activeGuide.htmlReport);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  // Direct download standalone file trigger
  const downloadHtmlReport = () => {
    if (!activeGuide) return;
    const blob = new Blob([activeGuide.htmlReport], { type: "text/html" });
    const fileUrl = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = fileUrl;
    downloadAnchor.download = `cineagent-${activeGuide.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-blueprint.html`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(fileUrl);
  };

  // Toggle checklist tasks
  const handleToggleRoadmapStep = (guideId: string, planIndex: number) => {
    const key = `${guideId}_step_${planIndex}`;
    setCompletedSteps((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-gray-800 flex flex-col justify-between selection:bg-[#C5A059]/20 selection:text-[#1A1A1A]">
      
      {/* HEADER SECTION */}
      <header className="border-b border-gray-200/80 bg-white/95 sticky top-0 z-50 px-4 py-3 sm:px-6 md:px-8 no-print shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#C5A059] p-2.5 rounded-lg text-white shadow-md shadow-[#C5A059]/10">
              <Film className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold tracking-wider text-xl uppercase bg-gradient-to-r from-[#C5A059] to-[#4A5568] bg-clip-text text-transparent">CINEAGENT</span>
                <span className="text-[10px] bg-gray-100 text-[#C5A059] border border-[#C5A059]/20 px-1.5 py-0.5 rounded font-mono font-medium tracking-widest uppercase">AUTEUR 3.5</span>
              </div>
              <p className="text-xs text-gray-500 tracking-wide font-sans">Profesyonel Sinematografi, Senaryo ve Film Yapım Rehberi Tasarlayıcı</p>
            </div>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="bg-gray-50 rounded-md px-3 py-1.5 border border-gray-200 text-gray-600">
              <span className="text-[#C5A059] mr-1.5">●</span> Odak Temalar:
              <span className="text-gray-800 font-sans ml-1 bg-[#C5A059]/10 border border-[#C5A059]/20 px-1 py-0.2 rounded text-[11px]">Aşk</span>
              <span className="text-gray-800 font-sans ml-1 bg-red-500/10 border border-red-500/20 px-1 py-0.2 rounded text-[11px]">Vatan</span>
              <span className="text-gray-800 font-sans ml-1 bg-slate-500/10 border border-slate-500/20 px-1 py-0.2 rounded text-[11px]">Ölüm</span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE GRID */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* INPUT AND HISTORY PANEL (LEFT COLUMN) */}
        <section className="col-span-1 lg:col-span-4 flex flex-col gap-6 no-print">
          
          {/* SCRIPT DEVELOPMENT STATION - CARD */}
          <div className="bg-white border border-gray-200/85 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Clapperboard className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-display font-medium text-[#C5A059] tracking-wide uppercase text-sm font-semibold">FİLM FİKRİ GELİŞTİR</h2>
            </div>

            <form onSubmit={handleGenerateGuide} className="space-y-4">
              
              {/* RAW CLIPS INPUT */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label id="concept-label" className="text-xs font-semibold text-gray-700 uppercase tracking-widest">Ham Sinematik Vizyon</label>
                  <span className="text-[10px] text-gray-400 font-mono">10 - 500 karakter</span>
                </div>
                <textarea
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  placeholder="Örn: Yaşlı bir saat ustası, zamanı tam 3 saniye geriye alabilen bir cep saati yapar. Ölen eşinin son nefesini yakalamak için zaman döngüsünü tekrarlarken her dönüşün kendi ömründen çaldığını fark eder..."
                  rows={4}
                  className="w-full text-sm bg-gray-50/50 border border-gray-200 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 rounded-lg p-3 text-gray-800 outline-none transition placeholder-gray-400 resize-none font-sans"
                />
              </div>

              {/* THREE CORE FOCUS THEMES */}
              <div className="space-y-2">
                <label id="themes-label" className="text-xs font-semibold text-gray-700 uppercase tracking-widest block font-medium">Tematik Odak (Kesişen Temalar)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Aşk", symbol: "💖", desc: "Kavuşamama / Tutku" },
                    { label: "Vatan", symbol: "🏡", desc: "Toprak / Aidiyet" },
                    { label: "Ölüm", symbol: "💀", desc: "Fânilik / Son" }
                  ].map((t) => {
                    const isSelected = themes.includes(t.label);
                    return (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => handleToggleThemeSelection(t.label)}
                        className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                          isSelected
                            ? "bg-[#C5A059]/10 border-[#C5A059] text-gray-800"
                            : "bg-gray-50/50 border-gray-200 hover:border-gray-300 text-gray-400"
                        }`}
                      >
                        <span className="text-base">{t.symbol}</span>
                        <div>
                          <div className={`font-semibold text-xs transition ${isSelected ? "text-[#C5A059]" : "text-gray-500"}`}>{t.label}</div>
                          <span className="text-[9px] text-gray-400 block leading-tight">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DETAILED EXTRA SPECIFICATIONS */}
              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <label id="genre-label" className="text-xs font-semibold text-gray-700 uppercase tracking-widest block">Tür Tercihi / Tarz</label>
                  <input
                    type="text"
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Örn: Psikolojik Dram, Neo-Noir, Epik Dönem Filmi"
                    className="w-full text-xs bg-gray-50/50 border border-gray-100 focus:border-[#C5A059] rounded-md py-2 px-3 text-gray-800 outline-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label id="style-label" className="text-xs font-semibold text-gray-700 uppercase tracking-widest block">Sinematografi Etkileri / Görsel Akış</label>
                  <input
                    type="text"
                    value={referenceStyle}
                    onChange={(e) => setReferenceStyle(e.target.value)}
                    placeholder="Örn: Roger Deakins chiaroscuro gölgeleri, Tarkovski uzun planları"
                    className="w-full text-xs bg-gray-50/50 border border-gray-100 focus:border-[#C5A059] rounded-md py-2 px-3 text-gray-800 outline-none transition"
                  />
                </div>
              </div>

              {/* COMPILE INSTRUCTIONS AND WORKSHOP BUTTONS */}
              <div className="flex flex-col gap-2.5 pt-2">
                {/* Single Compile Submit Button */}
                <button
                  type="submit"
                  disabled={loading || workshopLoading}
                  className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B48F48] text-white hover:shadow-md text-xs tracking-wider font-bold rounded-lg transition-all duration-300 uppercase shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>REHBER DERLENİYOR...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Tam Yapım Kılavuzu Derle</span>
                    </>
                  )}
                </button>

                {/* Step-by-Step Interactive Workshop Button */}
                <button
                  type="button"
                  onClick={handleStartWorkshop}
                  disabled={loading || workshopLoading}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white hover:shadow-md text-xs tracking-wider font-bold rounded-lg transition-all duration-300 uppercase shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-sans border border-gray-850"
                >
                  {workshopLoading && workshopPhase === 1 ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>ATÖLYE AÇILIYOR...</span>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 text-[#C5A059]" />
                      <span>Adım Adım Atölyeye Gir</span>
                    </>
                  )}
                </button>
              </div>

            </form>

            {/* DIRECT DISPLAY ERROR MESSAGE */}
            {error && (
              <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs leading-relaxed flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold mb-0.5">Yapım Hatası</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* CURATED PRE-MADE PROMPTS */}
          <div className="bg-white border border-gray-200/85 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4.5 h-4.5 text-[#C5A059]" />
              <h3 className="font-display font-medium text-gray-700 uppercase tracking-wider text-xs font-semibold">Yönetmen İlham Noktaları</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 font-sans leading-relaxed">Efsanevi bir sinematik konsept seçin. CineAgent'ın bunu anında eksiksiz, size özel profesyonel bir yapım rehberine dönüştürmesini izleyin:</p>
            <div className="space-y-3">
              {CINEMATIC_PRESETS.map((preset, index) => (
                <div
                  key={index}
                  onClick={() => handleApplyPreset(preset)}
                  className="group bg-gray-50/50 hover:bg-gray-50 border border-gray-200 hover:border-[#C5A059]/50 p-3 rounded-lg text-left cursor-pointer transition duration-300"
                >
                  <div className="flex items-center justify-between mb-1.5 font-sans">
                    <span className="text-xs font-serif font-semibold italic text-[#C5A059] group-hover:text-[#B48F48]">{preset.title}</span>
                    <div className="flex gap-1">
                      {preset.themes.map((th) => (
                        <span key={th} className="text-[8px] px-1.5 py-0.2 bg-gray-100 border border-gray-250 text-gray-600 rounded font-sans tracking-tight uppercase">
                          {th}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-sans">{preset.idea}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-400">
                    <span className="font-mono text-[9px] uppercase tracking-wider">{preset.genre}</span>
                    <span className="text-[#C5A059]/0 group-hover:text-[#C5A059]/100 transition-all duration-300 font-mono text-[10px] flex items-center gap-0.5 font-medium">
                      Fikri Uygula <ChevronRight className="w-3.5 h-3.5 mt-0.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRODUCTION HISTORY LIST */}
          <div className="bg-white border border-gray-200/85 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <History className="w-4.5 h-4.5 text-[#C5A059]" />
                <h3 className="font-display font-medium text-gray-750 uppercase tracking-wider text-xs font-semibold">Yönetmen Klasörü ({history.length})</h3>
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => {
                    setHistory([]);
                    setActiveId(null);
                  }}
                  className="text-[10px] text-gray-450 hover:text-red-500 uppercase tracking-widest font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  Hepsini Temizle
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-gray-200 rounded-lg">
                <p className="text-xs font-mono text-gray-450 uppercase tracking-wider">Aktif Proje Bulunmuyor</p>
                <p className="text-[11px] text-gray-400 mt-1">Ürettiğiniz tüm yapım rehberi kılavuzları hızlı geçiş için burada birikecektir.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {history.map((guide) => (
                  <div
                    key={guide.id}
                    onClick={() => {
                      setActiveId(guide.id);
                      setIsWorkshopActive(false);
                      setActiveTab("narrative");
                    }}
                    className={`group relative p-3 rounded-lg border text-left cursor-pointer transition ${
                      activeId === guide.id
                        ? "bg-[#C5A059]/5 border-[#C5A059]/60"
                        : "bg-gray-50/50 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-serif italic text-gray-800 line-clamp-1 font-medium">{guide.title}</span>
                      <button
                        onClick={(e) => handleDeleteGuide(guide.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition absolute right-2 top-2"
                        title="Projeyi sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-mono mt-2">
                      <Clock className="w-3 h-3 text-gray-450" />
                      <span>{guide.createdAt}</span>
                      <span className="text-gray-250">•</span>
                      <span className="text-[#C5A059] font-semibold uppercase">({guide.focusTheme})</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </section>

        {/* CINEMATIC GENERATIVE VIEW (RIGHT COLUMN) */}
        <section className="col-span-1 lg:col-span-8">
          
          {/* WAITING LOADING SCREEN */}
          {loading && (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px] shadow-sm no-print">
              <div className="relative mb-8">
                {/* Visual camera lens rotating animation */}
                <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#C5A059]/30 animate-spin flex items-center justify-center">
                  <div className="w-18 h-18 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#C5A059] animate-pulse" />
                  </div>
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full" />
              </div>

              <span className="text-[11px] font-mono tracking-[0.25em] text-[#C5A059] uppercase font-bold">CINEAGENT ÇEKİRDEĞİ ÇALIŞIYOR</span>
              <h3 className="font-serif font-medium text-2xl italic text-gray-800 mt-2 mb-3">Görsel Yol Haritası Hazırlanıyor</h3>
              
              {/* Dynamic advice statement changes along the interval */}
              <div className="h-10">
                <p className="text-sm font-sans text-gray-500 font-light max-w-md mx-auto transition-all duration-500 italic">
                  "{LOADING_PHRASES[loadingPhraseIndex]}"
                </p>
              </div>

              <div className="w-full max-w-sm bg-gray-100 border border-gray-200 h-1.5 rounded-full overflow-hidden mt-8">
                <div 
                  className="bg-gradient-to-r from-[#C5A059] to-[#4A5568] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${((loadingPhraseIndex + 1) / LOADING_PHRASES.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] font-mono text-gray-400 mt-3 uppercase tracking-widest">Auteur Engine Analizi Devam Ediyor...</p>
            </div>
          )}

          {/* INTERACTIVE WORKSHOP WORKSPACE */}
          {!loading && isWorkshopActive && (
            <div className="space-y-6">
              {/* WORKSHOP STEPPER HEADER */}
              <div className="bg-white border border-gray-200/85 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-900 p-2 rounded-lg text-white">
                      <MessageSquare className="w-5 h-5 text-[#C5A059]" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-base text-gray-900">CineAgent İnteraktif Atölye</h2>
                      <p className="text-xs text-gray-500 font-sans">
                        Aşama {workshopPhase} / 5: {
                          workshopPhase === 1 ? "Çekirdek Vizyon ve Format" :
                          workshopPhase === 2 ? "Anlatı ve Karakter Psikolojisi" :
                          workshopPhase === 3 ? "Görsel Dil, Kamera ve Kostüm" :
                          workshopPhase === 4 ? "İşitsel Dünya ve Soundscape" :
                          "Yol Haritası ve Eylem Planı"
                        }
                      </p>
                    </div>
                  </div>

                  {/* Horizontal Phase Stepper */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center">
                    {[1, 2, 3, 4, 5].map((ph) => {
                      const isActive = workshopPhase === ph;
                      const isCompleted = workshopPhase > ph;
                      return (
                        <div key={ph} className="flex items-center">
                          <div 
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold border transition duration-300 ${
                              isActive
                                ? "bg-[#C5A059] border-[#C5A059] text-white shadow-md shadow-[#C5A059]/10"
                                : isCompleted
                                ? "bg-gray-900 border-gray-900 text-[#C5A059]"
                                : "bg-gray-50 border-gray-200 text-gray-400"
                            }`}
                          >
                            {ph}
                          </div>
                          {ph < 5 && (
                            <div className={`w-3.5 h-0.5 ${isCompleted ? 'bg-gray-900' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {workshopError && (
                  <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-start gap-2 animate-feed-in">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                    <span>{workshopError}</span>
                  </div>
                )}

                {/* Main Sandboxed Iframe Preview */}
                {workshopCurrentData && (
                  <div className="space-y-4">
                    <SafeIframe html={workshopCurrentData.htmlSnippet} />
                    
                    {/* DIRECTOR WORKSPACE ANSWER INPUT BLOCK */}
                    <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4.5 h-4.5 text-[#C5A059]" />
                        <label className="text-xs font-semibold text-gray-750 uppercase tracking-widest block font-sans">
                          Aşama {workshopPhase} İçin Yönetmen Yanıtı ve Kararları
                        </label>
                      </div>
                      <p className="text-[11px] text-gray-500 mb-3 font-sans leading-relaxed">
                        Yukarıdaki soruları ve CineAgent önerilerini dilediğiniz derinlikte yanıtlayın. Yazacağınız her vizyon kuralı tamamlanacak olan ana rehbere eklenecektir.
                      </p>
                      <textarea
                        value={workshopResponse}
                        onChange={(e) => setWorkshopResponse(e.target.value)}
                        placeholder="Sorulara vereceğiniz yanıtlar... Örn: 'Aşk temasını canlandırmak için karakterler arasındaki uzaklığı dar kamera açılarıyla simgeleyeceğiz. Ölüm temasını ise solgun yeşil ve sisli foley tonlarıyla işlemek istiyorum.'"
                        rows={5}
                        disabled={workshopLoading}
                        className="w-full text-xs bg-white border border-gray-250 focus:border-[#C5A059] focus:ring-1 focus:ring-[#C5A059]/30 rounded-lg p-3 text-gray-800 outline-none transition placeholder-gray-400 font-sans leading-relaxed"
                      />
                      
                      <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4 items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setIsWorkshopActive(false);
                            setActiveId(null);
                          }}
                          className="text-xs text-gray-500 hover:text-gray-800 transition font-sans order-2 sm:order-1 cursor-pointer"
                        >
                          Atölyeden Çık (Veriler Silinmez)
                        </button>

                        <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                          {workshopPhase < 5 ? (
                            <button
                              type="button"
                              onClick={handleNextPhase}
                              disabled={workshopLoading || !workshopResponse.trim()}
                              className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer border border-gray-850"
                            >
                              {workshopLoading ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Yükleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <span>Yanıtı Gönder & Aşama {workshopPhase + 1}'e Geç</span>
                                  <ChevronRight className="w-4 h-4" />
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleCompileFullGuideFromWorkshop}
                              disabled={workshopLoading || !workshopResponse.trim()}
                              className="w-full sm:w-auto px-5 py-2.5 bg-[#C5A059] hover:bg-[#B48F48] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              {workshopLoading ? (
                                <>
                                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <span>Kılavuz Derleniyor...</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                                  <span>Söyleşiyi Tamamla & Kılavuzu Derle!</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* INTERACTIVE CHAT WORKBOOK PROCESS HISTORY */}
              {workshopHistory.length > 1 && (
                <div className="bg-white border border-gray-200/85 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2.5">
                    <History className="w-4 h-4 text-[#C5A059]" />
                    <h3 className="font-display font-medium text-gray-800 uppercase tracking-widest text-xs font-semibold">Atölye Miltaşları & Söyleşi Özeti</h3>
                  </div>
                  
                  <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
                    {workshopHistory.slice(0, -1).map((item, index) => {
                      const isUser = item.role === "user";
                      return (
                        <div 
                          key={index} 
                          className={`p-4 rounded-xl border leading-relaxed text-xs transition duration-300 ${
                            isUser 
                              ? "bg-gray-50 border-gray-200 max-w-xl ml-auto text-right" 
                              : "bg-[#C5A059]/5 border-[#C5A059]/15 max-w-2xl text-left"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5 text-[9px] font-mono tracking-wider text-gray-400">
                            <span className={isUser ? "text-gray-550" : "text-[#C5A564] font-bold"}>
                              {isUser ? "YÖNETMEN YANITI" : `CINEAGENT DANIŞMANLIĞI — AŞAMA ${item.phase || 1}`}
                            </span>
                          </div>
                          <p className="text-gray-700 font-sans leading-relaxed">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ACTIVE GUIDE DISPLAY WORKSPACE */}
          {!loading && !isWorkshopActive && activeGuide && (
            <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-md relative">
              
              {/* BRANDED POSTER BANNER HEADER */}
              <div className="relative p-6 sm:p-8 bg-gradient-to-b from-gray-50/70 via-gray-50/20 to-white border-b border-gray-250/20 shadow-inner">
                {/* Artistic background grain overlays */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C5A059] font-bold">
                       <Award className="w-3.5 h-3.5" />
                       <span>SİNEMATİK YAPIM REHBERİ</span>
                    </div>
                    {/* Visual film title */}
                    <h1 className="font-serif font-semibold text-3xl sm:text-4xl italic text-gray-900 tracking-wide leading-tight">
                      {activeGuide.title}
                    </h1>
                    <p className="text-xs text-gray-600 mt-1 sm:mt-2 max-w-2xl leading-relaxed">
                      <span className="font-semibold text-gray-700">Esinlenilen Ham Fikir:</span> "{activeGuide.idea}"
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col gap-2 shrink-0 items-end w-full md:w-auto mt-2 md:mt-0 justify-between md:justify-center border-t border-gray-150 md:border-t-0 pt-3 md:pt-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block order-2 md:order-1">
                      {activeGuide.createdAt}
                    </span>
                    <div className="flex gap-2 order-1 md:order-2 font-sans">
                      <span className="bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] text-xs px-2.5 py-0.5 rounded font-sans tracking-wide">
                        🎭 {activeGuide.identity.genre}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-gray-150 text-xs text-gray-600 font-sans">
                  <span className="font-semibold text-gray-700 uppercase tracking-widest text-[10px] mr-1 inline-flex items-center">Tematik Örgü:</span>
                  {activeGuide.focusTheme.split("&").map((themeSegment, index) => {
                    const cleanSec = themeSegment.trim();
                    let icon = "🎬";
                    let bg = "bg-gray-100 text-gray-600 border-gray-200";
                    if (cleanSec === "Love" || cleanSec === "Aşk") { icon = "💖"; bg = "bg-rose-50 border-rose-200 text-rose-700"; }
                    if (cleanSec === "Homeland" || cleanSec === "Vatan") { icon = "🏡"; bg = "bg-amber-50 border-amber-200 text-amber-700"; }
                    if (cleanSec === "Death" || cleanSec === "Ölüm") { icon = "💀"; bg = "bg-slate-100 border-slate-200 text-slate-700"; }
                    return (
                      <span key={index} className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium flex items-center gap-1 shrink-0 ${bg}`}>
                        <span>{icon}</span> {cleanSec}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* INTERACTIVE COMPONENT TAB MATRIX */}
              <div className="tabs border-b border-gray-200 bg-gray-50/80 no-print">
                {[
                  { id: "narrative", label: "Senaryo Dosyası", icon: <BookOpen className="w-3.5 h-3.5 shrink-0" /> },
                  { id: "visuals", label: "Sinematografi", icon: <Camera className="w-3.5 h-3.5 shrink-0" /> },
                  { id: "art", label: "Sanat Yönetimi", icon: <Palette className="w-3.5 h-3.5 shrink-0" /> },
                  { id: "auditory", label: "İşitsel Dünya", icon: <Music className="w-3.5 h-3.5 shrink-0" /> },
                  { id: "roadmap", label: "Yol Haritası", icon: <Sliders className="w-3.5 h-3.5 shrink-0" /> },
                  { id: "export", label: "Raporu Al", icon: <Download className="w-3.5 h-3.5 shrink-0" /> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border rounded-lg transition duration-300 cursor-pointer ${
                      activeTab === tab.id
                        ? "border-[#C5A059] text-white bg-[#C5A059] shadow-sm"
                        : "border-gray-205 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100/50"
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* CARD CONTAINER CONTENT PORT */}
              <div className="p-6 md:p-8 min-h-[400px]">
                
                {/* SCRIPT AND NARRATIVE CARD */}
                {activeTab === "narrative" && (
                  <div className="space-y-6">
                    {/* Genre Description Block */}
                    <div className="bg-gray-50/50 border border-gray-200/80 rounded-xl p-5 block">
                      <span className="text-[10px] font-mono text-[#C5A059] block uppercase tracking-widest mb-1 font-bold">SANATSAL STİL PROFİLİ</span>
                      <h4 className="font-serif italic font-bold text-lg text-gray-950">{activeGuide.identity.title || activeGuide.title}</h4>
                      <p className="text-xs text-gray-600 font-sans mt-2 leading-relaxed">
                        <span className="font-semibold text-gray-700">Sinematik Tarz:</span> {activeGuide.identity.style}
                      </p>
                      <p className="text-xs text-gray-600 font-sans mt-2.5 leading-relaxed">
                        <span className="font-semibold text-gray-700">Tematik Kesişim:</span> {activeGuide.identity.thematicIntersection}
                      </p>
                      <p className="text-xs text-gray-600 font-sans mt-2.5 leading-relaxed">
                        <span className="font-semibold text-gray-700">Duygusal Etki & Alt Metin:</span> {activeGuide.identity.impactAndHumor}
                      </p>
                    </div>

                    {/* Three act visual grid */}
                    <div>
                      <h3 className="font-display font-medium text-gray-800 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5 font-semibold">
                        <Layers className="w-4 h-4 text-[#C5A059]" /> Üç Perdeli Anlatı Yapısı
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { title: "I. PERDE (Giriş / Kurulum)", text: activeGuide.script.act1, border: "border-l-amber-500" },
                          { title: "II. PERDE (Gelişme / Çatışma)", text: activeGuide.script.act2, border: "border-l-rose-500" },
                          { title: "III. PERDE (Sonuç / Zirve Noktası)", text: activeGuide.script.act3, border: "border-l-slate-400" }
                        ].map((act, i) => (
                          <div key={i} className={`bg-gray-150/10 border border-gray-200 border-l-4 ${act.border} rounded-r-xl p-4 flex flex-col justify-between`}>
                            <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-2 font-bold">{act.title}</div>
                            <p className="text-xs text-gray-700 leading-relaxed font-sans mt-1">
                              {act.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Character psychological writing & conflicts */}
                    <div>
                      <h3 className="font-display font-medium text-gray-800 uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5 font-semibold">
                        <Film className="w-4 h-4 text-[#C5A059]" /> Karakter Mimarisi ve Dramatik Kesişim
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeGuide.script.characters?.map((character, i) => (
                          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-[#C5A059]/40 transition duration-300 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-semibold text-[#C5A059] font-serif">{character.name}</span>
                              <span className="text-[10px] bg-[#C5A059]/10 border border-[#C5A059]/20 text-[#C5A059] px-2 py-0.5 rounded font-mono font-medium uppercase tracking-wider">
                                {character.role}
                              </span>
                            </div>
                            <div className="space-y-2 mt-3 text-xs leading-relaxed font-sans">
                              <p className="text-gray-700">
                                <span className="font-semibold text-[#C5A059] font-mono text-[10px] mr-1 block uppercase tracking-wider">Karakter Psikolojisi ve Güdüleyici Motivasyon:</span>
                                {character.psychology}
                              </p>
                              <p className="text-gray-600 pt-1.5 border-t border-gray-150">
                                <span className="font-semibold text-red-650 font-mono text-[10px] mr-1 block uppercase tracking-wider">Ana Dramatik Çatışma:</span>
                                {character.conflict}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 3 Rehearsal questions card */}
                    <div className="bg-red-50/50 border border-red-150 rounded-xl p-5">
                      <span className="text-[10px] font-mono text-red-700 block uppercase tracking-wider mb-2.5 font-bold">OYUNCU KADROSU İÇİN ÇALIŞMA SORULARI</span>
                      <h4 className="font-serif italic text-sm text-gray-900 mb-3 block">Yönetmenin çekim öncesi provalarda oyuncularla birlikte sorgulaması gereken üç psikolojik çekirdek soru:</h4>
                      <ul className="space-y-3 font-sans text-xs text-gray-700 list-decimal pl-4.5">
                        {activeGuide.script.creationQuestions?.map((q, i) => (
                          <li key={i} className="leading-relaxed hover:text-[#C5A059] transition">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>

                  </div>
                )}

                {/* VISUAL COMPONENT DETAILS CARD */}
                {activeTab === "visuals" && (
                  <div className="space-y-6">
                    
                    {/* Palette block Swatches */}
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <h3 className="font-display font-medium text-slate-300 uppercase tracking-widest text-xs flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-amber-500" /> Özel Üretilmiş Renk Paletleri
                        </h3>
                        <span className="text-[10px] text-slate-500 font-mono block">HEX kodunu kopyalamak için dilediğiniz renk kutusuna tıklayın</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {activeGuide.visuals.colors?.map((paletteColor, index) => (
                          <div
                            key={index}
                            onClick={() => copyColorToClipboard(paletteColor.hex, index)}
                            className="group bg-[#06060a] border border-[#1b1b24] rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/50 transition duration-300"
                          >
                            <div
                              className="h-28 w-full relative transition duration-300 group-hover:opacity-90 flex items-center justify-center border-b border-[#1b1b24]"
                              style={{ backgroundColor: paletteColor.hex }}
                            >
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition duration-300" />
                              <div className="z-10 bg-black/60 backdrop-blur-sm p-1.5 rounded-md border border-white/10 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center gap-1">
                                {copiedColorIndex === index ? (
                                  <>
                                    <Check className="w-3 h-3 text-[#C5A059]" />
                                    <span className="text-[9px] font-mono text-[#C5A059] font-bold uppercase tracking-wider">Kopyalandı</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-white" />
                                    <span className="text-[9px] font-mono text-white tracking-wider">HEX Kopyala</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="p-3 text-xs">
                              <div className="flex justify-between items-center mb-1.5">
                                <span className="font-mono text-xs font-semibold text-gray-800">{paletteColor.hex}</span>
                                <span className="text-[9px] text-gray-400 italic">Palet {index + 1}</span>
                              </div>
                              <p className="text-[11px] text-gray-700 font-medium leading-normal mb-1">
                                <span className="text-[#C5A059]">Renk Duygusu: </span> {paletteColor.emotion}
                              </p>
                              <p className="text-[10px] text-gray-500 leading-normal font-sans italic">
                                <span className="text-gray-600 not-italic">Uygulanan Sahne: </span> 
                                "{paletteColor.scene}"
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 mt-4 leading-relaxed font-sans bg-gray-50/50 p-3 rounded-lg border border-gray-150">
                        <span className="font-semibold text-gray-800">Görsel Atmosfer Taslağı:</span> {activeGuide.visuals.colorPaletteDescription}
                      </p>
                    </div>

                    {/* Camera lens & gear layout specifications */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-3.5 border-b border-gray-150 pb-2.5">
                          <Camera className="w-4.5 h-4.5 text-[#C5A059]" />
                          <h4 className="font-display font-medium text-gray-850 uppercase tracking-wider text-xs font-semibold">Lens Tercihleri ve Kamera Ayarları</h4>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">
                          {activeGuide.visuals.cameraAngles}
                        </p>
                      </div>

                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <div className="flex items-center gap-2 mb-3.5 border-b border-gray-150 pb-2.5">
                          <Film className="w-4.5 h-4.5 text-[#C5A059]" />
                          <h4 className="font-display font-medium text-gray-850 uppercase tracking-wider text-xs font-semibold">Işık Atmosferi ve Doku</h4>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">
                          {activeGuide.visuals.shootingFeel}
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* ART DIRECTION COMPONENT DETAILS CARD */}
                {activeTab === "art" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Location/Set Design */}
                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl hover:border-[#C5A059]/20 transition duration-300">
                      <div className="flex items-center gap-2 mb-4 border-b border-gray-150 pb-3">
                        <Home className="w-4.5 h-4.5 text-[#C5A059] pointer-events-none" />
                        <h4 className="font-display font-medium text-[#C5A059] uppercase tracking-widest text-xs font-semibold">Mekân Tasarımı ve Sembolizm</h4>
                      </div>
                      <div className="space-y-4 text-xs font-sans leading-relaxed">
                        <div>
                          <span className="font-mono text-[10px] text-gray-500 block uppercase tracking-wider mb-1 font-semibold">Sahne Çevresi ve Atmosfer:</span>
                          <p className="text-gray-700">{activeGuide.art.locations.atmosphere}</p>
                        </div>
                        <div className="pt-3 border-t border-gray-150">
                          <span className="font-mono text-[10px] text-red-650 block uppercase tracking-wider mb-1 font-semibold">Sembolik Nesneler ve Yerleşimleri:</span>
                          <p className="text-gray-700">{activeGuide.art.locations.symbolicObjects}</p>
                        </div>
                      </div>
                    </div>

                    {/* Costume Wardrobe Layout */}
                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl hover:border-[#C5A059]/20 transition duration-300">
                      <div className="flex items-center gap-2 mb-4 border-b border-gray-150 pb-3">
                        <Palette className="w-4.5 h-4.5 text-red-650 pointer-events-none" />
                        <h4 className="font-display font-medium text-red-650 uppercase tracking-widest text-xs font-semibold">Kostüm Dokusu ve Kumaş Kesimleri</h4>
                      </div>
                      <div className="space-y-4 text-xs font-sans leading-relaxed">
                        <div>
                          <span className="font-mono text-[10px] text-gray-500 block uppercase tracking-wider mb-1 font-semibold">Malzemeler, Siluetler ve Kesimler:</span>
                          <p className="text-gray-700">{activeGuide.art.costumes.fabricAndCuts}</p>
                        </div>
                        <div className="pt-3 border-t border-gray-150">
                          <span className="font-mono text-[10px] text-amber-600 block uppercase tracking-wider mb-1 font-semibold">Tarihsel Referanslar ve Dönem Detayları:</span>
                          <p className="text-gray-700">{activeGuide.art.costumes.periodReferences}</p>
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* THE AUDIO WORLD CARD COMPONENT */}
                {activeTab === "auditory" && (
                  <div className="space-y-6">
                    
                    {/* General design audio introduction card */}
                    <div className="bg-gray-50/50 border border-gray-200 p-5 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="bg-[#C5A059]/10 border border-[#C5A059]/20 p-3 rounded-lg text-[#C5A059] shrink-0">
                        <Music className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-mono text-[#C5A059] uppercase tracking-wider font-bold">Akustik Müzik Felsefesi</h4>
                        <p className="text-xs text-gray-600 mt-1.5 leading-relaxed font-sans">
                          "Ses, sinematik deneyimin yarısıdır." CineAgent, sürükleyici ve duyusal bir dünya inşa etmek için enstrümanları ve kamera hareketlerini senkronize eden profesyonel yönergeler üretir.
                        </p>
                      </div>
                    </div>

                    {/* Music Usage Styles, synchronization and sound design split columns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      
                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <span className="text-[9px] font-mono tracking-widest text-[#C5A059] block uppercase mb-2 font-bold">MÜZİK VE ENSTRÜMAN DETAYLARI</span>
                        <h5 className="font-serif italic text-xs text-gray-800 mb-2 font-semibold">Armonik Müzik Dokuları</h5>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{activeGuide.auditory.musicUsage}</p>
                      </div>

                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <span className="text-[9px] font-mono tracking-widest text-red-650 block uppercase mb-2 font-bold select-none">HAREKET SENKRONİZASYON METODU</span>
                        <h5 className="font-serif italic text-xs text-gray-800 mb-2 font-semibold">Ritim ve Kamera Yörüngesi</h5>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{activeGuide.auditory.musicMovementSync}</p>
                      </div>

                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <span className="text-[9px] font-mono tracking-widest text-gray-500 block uppercase mb-2 font-bold select-none">ORTAM AKUSTİK ETKİLERİ</span>
                        <h5 className="font-serif italic text-xs text-gray-800 mb-2 font-semibold">Foley ve Kutsal Sessizlik</h5>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{activeGuide.auditory.soundDesign}</p>
                      </div>

                    </div>

                  </div>
                )}

                {/* THE STEP BY STEP DIRECTORS PLAYBOOK ROADMAP CARD */}
                {activeTab === "roadmap" && (
                  <div className="space-y-6">
                    
                    {/* Actor direction and editing guidelines columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest block mb-2 font-bold select-none">Alt Metin ve Oyuncu Koçluğu</span>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{activeGuide.roadmap.actorDirection}</p>
                      </div>

                      <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                        <span className="text-[10px] font-mono text-red-650 uppercase tracking-widest block mb-2 font-bold select-none">Kurgu ve Renk Derecelendirme İpuçları</span>
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">{activeGuide.roadmap.editingRecommendations}</p>
                      </div>
                    </div>

                    {/* Master technical skills card */}
                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl">
                      <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-widest block mb-3 font-bold text-center select-none">Geliştirilmesi Gereken Yönetmenlik Becerileri</span>
                      <h4 className="font-serif text-sm font-semibold italic text-center mb-4 text-gray-800 max-w-lg mx-auto">Yönetmenin bu filmi çekebilmek için çekim öncesinde hızla uzmanlaşması gereken üç ileri düzey teknik uzmanlık alanı:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {activeGuide.roadmap.technicalDevelopment?.map((skill, index) => (
                          <div key={index} className="bg-gray-50/50 border border-gray-200/80 rounded-lg p-4 relative">
                            <span className="absolute -top-3.5 -left-1 text-[28px] font-serif font-black text-[#C5A059]/20 italic select-none">0{index + 1}</span>
                            <p className="text-xs text-gray-700 leading-relaxed mt-2 relative z-10 font-sans">
                              {skill}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive 5 steps roadmap checklist progress */}
                    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3.5 border-b border-gray-150 pb-2.5">
                        <span className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider font-semibold select-none">YAPIM YOL HARİTASI İLERLEMESİ</span>
                        <span className="text-[10px] text-gray-400 font-mono select-none">Bölümleri tamamladıkça kutuları işaretleyin</span>
                      </div>

                      <div className="space-y-3">
                        {activeGuide.roadmap.actionPlan?.map((stepMessage, planIndex) => {
                          const taskId = `${activeGuide.id}_step_${planIndex}`;
                          const isDone = !!completedSteps[taskId];
                          return (
                            <div
                              key={planIndex}
                              onClick={() => handleToggleRoadmapStep(activeGuide.id, planIndex)}
                              className={`group border rounded-lg p-3.5 flex items-start gap-3.5 cursor-pointer transition ${
                                isDone
                                  ? "bg-gray-50/70 border-gray-200 text-gray-400"
                                  : "bg-white border-gray-200 hover:border-[#C5A059]/40 text-gray-700"
                              }`}
                            >
                              <div className="shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110">
                                {isDone ? (
                                  <CheckSquare className="w-5 h-5 text-[#C5A059]" />
                                ) : (
                                  <Square className="w-5 h-5 text-gray-300 group-hover:text-[#C5A059]" />
                                )}
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-wider block mb-0.5 text-gray-400 select-none">
                                  AŞAMA 0{planIndex + 1}
                                </span>
                                <p className={`text-xs select-none leading-relaxed font-sans ${isDone ? "line-through text-gray-400 font-light" : ""}`}>
                                  {stepMessage}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                )}

                {/* THE RAW HTML EXPORTS TAB CHANGER */}
                {activeTab === "export" && (
                  <div className="space-y-6">
                    
                    {/* Exporter presentation panel */}
                    <div className="bg-white border border-gray-200 shadow-sm p-5 rounded-xl block text-center max-w-xl mx-auto">
                      <FileText className="w-8 h-8 text-[#C5A059] mx-auto mb-3" />
                      <h4 className="font-serif italic text-lg text-gray-950 mb-1 font-semibold">Bağımsız Web Sürümü HTML Raporunu İndir</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-sans max-w-sm mx-auto mb-4">
                        CineAgent, içinde tüm şablon ve görsel rehber kodlarının gömülü olduğu, responsive (duyarlı) harika bir HTML yapım kılavuzu derler. Ekibinize veya oyuncularınıza dağıtmak üzere kaydedebilirsiniz.
                      </p>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={downloadHtmlReport}
                          className="py-2.5 px-6 bg-[#C5A059] hover:bg-[#B48F48] transition text-white text-xs font-bold font-mono tracking-widest rounded-lg flex items-center justify-center gap-2 cursor-pointer uppercase shadow-sm"
                        >
                          <Download className="w-4 h-4" /> .HTML Dosyasını İndir
                        </button>
                        <button
                          onClick={copyHtmlReportToClipboard}
                          className="py-2.5 px-6 bg-white hover:bg-gray-50 border border-gray-200 text-gray-750 text-xs font-bold font-mono tracking-widest rounded-lg transition flex items-center justify-center gap-2 cursor-pointer uppercase shadow-sm"
                        >
                          {copiedHtml ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" /> HTML Kopyalandı!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Ham HTML Kodunu Kopyala
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Preview of HTML code area in high-contrast monospaced box */}
                    <div>
                      <h3 className="font-display font-medium text-gray-800 font-semibold uppercase tracking-widest text-xs mb-3 flex items-center gap-1.5">
                        <Eye className="w-4 h-4 text-[#C5A059]" /> HTML Kod Ön İzleme Alanı
                      </h3>
                      <div className="relative">
                        <pre className="p-4 bg-gray-50 border border-gray-200 text-gray-600 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72 rounded-xl text-left select-all">
                          {activeGuide.htmlReport}
                        </pre>
                      </div>
                    </div>

                  </div>
                )}

              </div>

            </div>
          )}

          {/* EMPTY LANDING BOARD VISUAL (NO GUIDE CHOSEN YET) */}
          {!loading && !isWorkshopActive && !activeGuide && (
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
              
              <div className="w-18 h-18 bg-gray-50 border border-gray-150 rounded-full flex items-center justify-center mb-6 text-[#C5A059]">
                <Film className="w-8 h-8 animate-pulse" />
              </div>

              <span className="text-[10px] font-mono tracking-[0.3em] text-[#C5A059] uppercase font-bold select-none animate-pulse">CineAgent Çalışma Alanı</span>
              <h2 className="font-serif font-medium text-3xl italic text-gray-900 mt-2 mb-3 font-bold">Yönetmenlik Konsültasyonuna Başlayın</h2>
              <p className="text-gray-600 font-sans text-xs max-w-sm mx-auto leading-relaxed mb-8">
                Sürükleyici bir görsel ve anlatısal sinema yapım rehberi kılavuzu edinmek için soldaki panelden projenizin ham fikrini girin veya hazır Yönetmen İlham Noktalarından birini seçerek temalarınızı ve sinematografi tercihlerinizi belirleyin.
              </p>

              {/* Decorative visual tips block */}
              <div className="w-full max-w-md grid grid-cols-3 gap-3 border-t border-gray-150 pt-6 font-sans text-left text-gray-500">
                <div>
                  <h4 className="text-[10px] font-mono text-[#C5A059] uppercase tracking-wider mb-1 font-bold">💖 Aşk</h4>
                  <p className="text-[10px] leading-relaxed text-gray-650">Karakterlerinizin kaderine derin trajik arzular, kavuşamama sancıları, saplantılı tutkular ve güçlü duygusal kırılganlıklar aşılayın.</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-red-650 uppercase tracking-wider mb-1 font-bold">🏡 Vatan</h4>
                  <p className="text-[10px] leading-relaxed text-gray-650">Kuşakların geçmişiyle bağ kuran ham kökler, nostaljik aidiyetler, coğrafi aidiyet hissi veya derin bir yersiz yurtsuzluk inşa edin.</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-wider mb-1 font-bold">💀 Ölüm</h4>
                  <p className="text-[10px] leading-relaxed text-gray-650">Hikayeyi her şeyin geçici olduğu hissiyle, kaçınılmaz trajik sonlarla, ölümcül sırlar ve fâniliğe meydan okuyan sahnelerle sarmalayın.</p>
                </div>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 py-6 px-4 text-center text-gray-400 text-xs font-mono no-print">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 CineAgent. Sürükleyici Senaryo ve Görsel Yapım Rehberi Geliştirici.</p>
          <div className="flex gap-4">
            <span className="hover:text-[#C5A059] transition cursor-help flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Yüksek Performanslı Auteur Modeli
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
