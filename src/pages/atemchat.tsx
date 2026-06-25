import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Wind,
  Sparkles,
  Send,
  ShieldAlert,
  X,
  Waves,
  Leaf,
  Info,
  Mic,
  ArrowLeft,
  Moon,
  Sun
} from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { PRODUCTS } from "../data/store";

// Hilfsfunktion: Spielt einen sanften Gong/Klangschalen-Ton
const playPhaseSound = (phase: "ein" | "halten" | "aus") => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Leicht unterschiedliche Töne je nach Phase:
    // Einatmen: A3 (220 Hz)
    // Halten: Schwebt auf gleichem Ton, aber etwas leiser (220 Hz)
    // Ausatmen: G3 (196 Hz) - ein tieferer, loslassender Ton
    const fundamental = phase === "aus" ? 196.00 : 220.00;
    const baseAmp = phase === "halten" ? 0.15 : 0.25;

    const createHarmonic = (freq: number, amplitude: number, decayDuration: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(amplitude, ctx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decayDuration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + decayDuration);
    };

    createHarmonic(fundamental, baseAmp, 4);
    createHarmonic(fundamental * 2.1, baseAmp * 0.4, 3);
    createHarmonic(fundamental * 3.14, baseAmp * 0.2, 2);

  } catch (err) {
    console.error("Audio playback failed", err);
  }
};

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  hasPremiumOffer?: boolean;
}

export default function AtemChat() {
  const { user } = useAuth();
  const { addToCart } = useCart();

  // Track daily usage
  const today = new Date().toISOString().split('T')[0];
  const usageKey = `chat_usage_${user?.id}_${today}`;
  const [dailyUsageCount, setDailyUsageCount] = useState(() => {
    const saved = localStorage.getItem(usageKey);
    return saved ? parseInt(saved, 10) : 0;
  });

  const isPremium = user?.purchased_products?.includes('premium_chat') || false;
  const reachedLimit = user && !isPremium && dailyUsageCount >= 3;

  // Conversational State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "assistant",
      text: "Seien Sie willkommen im Flow der Stille. Ich bin Ihr empathischer Begleiter in Momenten der Überforderung, des Stresses oder der Unruhe. Dieser Ort ist ganz für Sie da – frei von Erwartungen und Bewertungen. 🌱\n\nWie empfinden Sie den gegenwärtigen Moment? Erzählen Sie es mir oder wählen Sie eine der folgenden Empfindungen aus.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Grounding (Breathing) Cycle States
  const [breathingIsActive, setBreathingIsActive] = useState(false);
  const [breathingMode, setBreathingMode] = useState<"deep" | "classic" | "calm">("deep");
  const [breathingPhase, setBreathingPhase] = useState<"ein" | "halten" | "aus">("ein");
  const [breathingTimer, setBreathingTimer] = useState(4); // seconds left in current phase

  // Crisis / Helpline Modal
  const [showHelpline, setShowHelpline] = useState(false);

  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Start or stop speech recognition
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSpeechError("Ihr Browser unterstützt leider keine Spracherkennung. Verwenden Sie Chrome, Safari oder Edge.");
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "de-DE";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setSpeechError("Mikrofon-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browsereinstellungen.");
        } else {
          setSpeechError("Spracherkennung nicht möglich. Versuchen Sie es bitte erneut.");
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript;
        if (transcript) {
          setInputValue((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setSpeechError("Fehler bei der Initialisierung der Spracherkennung.");
      setIsListening(false);
    }
  };

  // Element Refs for Auto-Scroll
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Starter Feelings / Prompt templates
  const starterFeelings = [
    { label: "Überfordert von Aufgaben 💼", prompt: "Ich fühle mich gerade von meinen Aufgaben und Terminen völlig erdrückt und überfordert. Mein Kopf ist so voll." },
    { label: "Gedankenkreisen im Kopf 🌀", prompt: "Ich stecke in einem Gedankenkarussell fest und brauche etwas Hilfe, um meine kreisenden Gedanken zu beruhigen." },
    { label: "Innere Unruhe & Angst 🤍", prompt: "Ich spüre eine unbestimmte innere Unruhe und leichte Angst in meinem Körper. Kannst du mir helfen, mich zu erden?" },
    { label: "Einfach nur erschöpft 🔋", prompt: "Der Tag heute hat mich all meine Energie gekostet. Ich bin einfach nur leer und erschöpft." },
  ];

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Breathing ground timer logic
  useEffect(() => {
    let interval: any = null;
    if (breathingIsActive) {
      interval = setInterval(() => {
        setBreathingTimer((prev) => {
          if (prev <= 1) {
            // Transition to corresponding next phase based on breathingMode
            let nextPhase: "ein" | "halten" | "aus" = "ein";
            let nextDuration = 4;

            if (breathingMode === "deep") {
              // 4-7-8 Breathing Technique
              if (breathingPhase === "ein") {
                nextPhase = "halten";
                nextDuration = 7;
              } else if (breathingPhase === "halten") {
                nextPhase = "aus";
                nextDuration = 8;
              } else {
                nextPhase = "ein";
                nextDuration = 4;
              }
            } else if (breathingMode === "classic") {
              // 4-4-4 Box Breathing
              if (breathingPhase === "ein") {
                nextPhase = "halten";
                nextDuration = 4;
              } else if (breathingPhase === "halten") {
                nextPhase = "aus";
                nextDuration = 4;
              } else {
                nextPhase = "ein";
                nextDuration = 4;
              }
            } else {
              // 5-5 Calm Wave Breathing
              if (breathingPhase === "ein") {
                nextPhase = "aus";
                nextDuration = 5;
              } else {
                nextPhase = "ein";
                nextDuration = 5;
              }
            }

            playPhaseSound(nextPhase);
            setBreathingPhase(nextPhase);
            return nextDuration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingPhase("ein");
      setBreathingTimer(breathingMode === "deep" ? 4 : breathingMode === "classic" ? 4 : 5);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [breathingIsActive, breathingPhase, breathingMode]);

  const toggleBreathing = () => {
    const nextState = !breathingIsActive;
    setBreathingIsActive(nextState);
    if (nextState) {
      setBreathingPhase("ein");
      setBreathingTimer(breathingMode === "deep" ? 4 : breathingMode === "classic" ? 4 : 5);
      playPhaseSound("ein");
    }
  };

  const changeBreathingMode = (mode: "deep" | "classic" | "calm") => {
    setBreathingMode(mode);
    setBreathingPhase("ein");
    setBreathingTimer(mode === "deep" ? 4 : mode === "classic" ? 4 : 5);
  };

  // Submit chat message to Backend Express
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    if (!user || reachedLimit) return;

    if (!isPremium) {
      const newCount = dailyUsageCount + 1;
      setDailyUsageCount(newCount);
      localStorage.setItem(usageKey, newCount.toString());
    }

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    const recentMessages = [...messages, userMessage].slice(-10);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: recentMessages,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Abrufen der Antwort.");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        hasPremiumOffer: data.hasPremiumOffer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        sender: "assistant",
        text: "Ich bin im Moment eine Sekunde still – vielleicht liegt es an der Verbindung. Lassen Sie uns einen Moment gemeinsam durchatmen, bevor wir es gleich noch einmal versuchen. 🌱",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getBreathingScale = () => {
    if (!breathingIsActive) return 1.0;
    
    const currentMaxScale = 1.35;
    const currentBaseScale = 1.0;
    
    let duration = 4;
    if (breathingMode === "deep") {
      duration = breathingPhase === "ein" ? 4 : breathingPhase === "halten" ? 7 : 8;
    } else if (breathingMode === "classic") {
      duration = 4;
    } else {
      duration = 5;
    }

    const elapsedRatio = (duration - breathingTimer) / duration;

    if (breathingPhase === "ein") {
      return currentBaseScale + (currentMaxScale - currentBaseScale) * elapsedRatio;
    } else if (breathingPhase === "halten") {
      return currentMaxScale;
    } else { // "aus"
      return currentMaxScale - (currentMaxScale - currentBaseScale) * elapsedRatio;
    }
  };

  const getPhaseText = () => {
    if (!breathingIsActive) return "Bereit zum Durchatmen";
    if (breathingPhase === "ein") return "Einatmen...";
    if (breathingPhase === "halten") return "Atem anhalten...";
    return "Sanft ausatmen...";
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-alt)] text-[var(--color-text-main)] flex flex-col antialiased">
      <SEO title="Geführte Atemübungen" description="Beruhigen Sie Ihr Nervensystem durch sanfte Atemführung." />
      {/* Top Quiet Navbar */}
      <header id="quiet-header" className="sticky top-0 bg-[var(--color-bg-alt)]/90 backdrop-blur-md border-b border-[var(--color-border-main)] z-30 py-4 px-6 md:px-10 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 rounded-full hover:bg-[var(--color-bg-card)] text-[#808a82] hover:text-[var(--color-text-main)] transition-colors mr-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent-primary)] flex items-center justify-center text-white float-slow">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif italic text-xl md:text-2xl font-medium tracking-wide text-[var(--color-text-main)]">
                Flow der Stille
              </h1>
              <p className="text-[10px] tracking-widest text-[var(--color-accent-primary)] uppercase font-semibold">
                Anker für Ihre Gegenwart
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            <button
              id="btn-helpline"
              onClick={() => setShowHelpline(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#fae1de] hover:bg-[#edd6d4] text-[#cc4c3d] text-xs font-medium cursor-pointer transition-colors"
              title="Notfall- und Beratungsnummern"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Sofortige Hilfe</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Area: Full Width Chat Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col items-stretch">
        
        {/* Right Side: Conversation Chat Container */}
        <section id="chat-room" className="flex flex-col bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-3xl overflow-hidden shadow-sm transition-all hover:shadow-md">
          {/* Header of Chat */}
          <div className="p-5 border-b border-[var(--color-border-main)] bg-[var(--color-bg-card)]/85 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <span className="flex h-3 w-3 absolute -top-0.5 -right-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-primary)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-accent-primary)]"></span>
                </span>
                <div className="w-10 h-10 rounded-full bg-[var(--color-bg-alt)] flex items-center justify-center text-[var(--color-accent-primary)] font-serif font-semibold border border-[var(--color-border-main)]">
                  S
                </div>
              </div>
              <div>
                <div className="font-serif text-base font-semibold text-[var(--color-text-main)] flex items-center gap-1.5">
                  Empathische KI-Begleitung
                  <span className="text-[10px] uppercase tracking-wider bg-[var(--color-bg-alt)] text-[var(--color-accent-primary)] px-2 py-0.5 rounded font-semibold font-sans border border-[var(--color-border-main)]">
                    KI-Assistent
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="text-[10px] text-[#A09E94] uppercase tracking-widest font-semibold">Ganzheitlich begleitend • Ohne Urteile</div>
                  {user && !isPremium && (
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--color-text-muted)] bg-stone-200/50 px-2 py-0.5 rounded-full border border-stone-200">
                      {Math.max(0, 3 - dailyUsageCount)} Nachrichten übrig
                    </span>
                  )}
                </div>
              </div>
            </div>

            <span className="text-[10px] text-[var(--color-accent-primary)] uppercase tracking-wider font-semibold hidden sm:block flex items-center gap-1">
              🔒 Ihre Privatsphäre ist geschützt
            </span>
          </div>

          {/* Scrollable Conversation Panel */}
          <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 max-h-[500px] sm:max-h-[600px] md:max-h-[640px] lg:max-h-[700px] bg-[var(--color-bg-alt)]/30">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] md:max-w-[75%] ${
                  msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
                }`}
              >
                {msg.sender === "assistant" && (
                  <span className="text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] font-semibold ml-4 mb-2">
                    Begleiter
                  </span>
                )}
                {/* Bubble */}
                <div
                  className={`p-5 md:p-6 text-[15px] leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${
                    msg.sender === "user"
                      ? "bg-[var(--color-accent-primary)] text-white rounded-[2rem] rounded-tr-lg border-none"
                      : "bg-[var(--color-bg-card)] text-[var(--color-text-main)] rounded-[2rem] rounded-tl-lg border border-[var(--color-border-main)]"
                  }`}
                >
                  {msg.text}
                  {msg.hasPremiumOffer && (
                    <div className="mt-4 pt-4 border-t border-[var(--color-border-main)] flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-[var(--color-bg-alt)] rounded-lg text-[var(--color-accent-primary)] shrink-0">
                          <Leaf className="w-4 h-4" />
                        </span>
                        <h4 className="font-serif text-sm font-medium text-[var(--color-text-main)]">Geführte Premium-Meditation</h4>
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        Mit dieser speziell entwickelten Meditation können Sie tiefere innere Ruhe finden und die angesprochenen Themen auflösen. 
                      </p>
                      <button className="self-start mt-2 px-4 py-2 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-xs font-semibold rounded-full transition-all shadow-sm">
                        Meditation freischalten (4,99 €)
                      </button>
                    </div>
                  )}
                </div>
                {/* Time Indicator */}
                <span className="text-[10px] text-[#A09E94] mt-1.5 px-3 font-mono">{msg.timestamp}</span>
              </div>
            ))}

            {/* AI Generation State Loader */}
            {isLoading && (
              <div className="flex flex-col mr-auto items-start max-w-[85%] md:max-w-[75%]">
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] font-semibold ml-4 mb-2">
                  Begleiter
                </span>
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-main)] rounded-[2rem] rounded-tl-lg p-5 flex items-center space-x-1.5 shadow-sm">
                  <span className="text-xs text-[var(--color-accent-primary)] font-sans mr-1 tracking-wide font-medium">Begleiter atmet nach...</span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce duration-1000"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce duration-1000 delay-150"></span>
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent-primary)] rounded-full animate-bounce duration-1000 delay-300"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Presets / Selection chips */}
          {!reachedLimit && user && (
            <div className="px-5 py-4 bg-[var(--color-bg-alt)]/70 border-t border-b border-[var(--color-border-main)]">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-accent-primary)] mb-3.5 flex items-center gap-1.5 font-bold font-sans">
                <Sparkles className="w-3.5 h-3.5" /> Welches Empfinden beschreibt Ihren Zustand?
              </p>
              <div className="flex flex-wrap gap-2">
                {starterFeelings.map((feel) => (
                  <button
                    key={feel.label}
                    onClick={() => handleSendMessage(feel.prompt)}
                    disabled={isLoading}
                    className="text-xs text-[var(--color-text-main)] bg-[var(--color-bg-card)] border border-[var(--color-border-main)] py-2 px-3.5 rounded-full hover:bg-[var(--color-bg-alt)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-all cursor-pointer disabled:opacity-50 inline-flex items-center shadow-sm"
                  >
                    {feel.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* User Limits Info Banner */}
          {!user && (
            <div className="bg-amber-50 border-t border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium">Melden Sie sich kostenlos an, um 3 Freinachrichten pro Tag im Entspannungsassistenten zu nutzen.</p>
              <Link to="/register" className="mt-2 inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-full hover:bg-amber-700 transition">
                Kostenlos registrieren
              </Link>
            </div>
          )}

          {user && !isPremium && reachedLimit && (
            <div className="bg-amber-50 border-t border-amber-200 p-4 text-center">
              <p className="text-sm text-amber-800 font-medium mb-2">Tägliches Limit von 3 Nachrichten erreicht.</p>
              <p className="text-xs text-amber-700 mb-3">Schalten Sie Premium frei, um unbegrenzt zu chatten (4,99 € / Monat).</p>
              <button onClick={() => {
                const feature = PRODUCTS.find(p => p.id === 'premium_chat');
                if (feature) addToCart(feature);
              }} className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-full hover:bg-amber-700 transition">
                Premium freischalten
              </button>
            </div>
          )}

          {/* Speech Status Banner */}
          {isListening && !reachedLimit && user && (
            <div className="px-5 py-2.5 bg-[#EBF1EB] text-[#4A574A] border-b border-[var(--color-border-main)] text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#cc7a6d] animate-pulse" />
                <span className="font-sans italic">Ich höre Ihnen zu... Sprechen Sie ganz gelassen. 🌱</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                }}
                className="text-[10px] uppercase font-bold text-[#cc7a6d] hover:underline cursor-pointer"
              >
                Stoppen
              </button>
            </div>
          )}

          {speechError && (
            <div className="px-5 py-2.5 bg-[#fcedeb] text-[#cc4c3d] border-b border-[var(--color-border-main)] text-xs flex items-center justify-between">
              <span>{speechError}</span>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-[#cc4c3d] cursor-pointer hover:opacity-80"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Input Form Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
            className="p-5 bg-[var(--color-bg-card)] flex items-center space-x-3.5"
          >
            <div className="flex-1 relative">
              <input
                id="inp-chat-message"
                type="text"
                placeholder={!user ? "Bitte melden Sie sich an, um zu chatten" : reachedLimit ? "Tägliches Limit erreicht..." : "Erzählen Sie Ihre Gedanken oder sprechen Sie sie aus..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading || !user || reachedLimit}
                className="w-full py-4 pl-6 pr-14 rounded-full bg-[var(--color-bg-card)] border border-[var(--color-border-main)] text-sm text-[var(--color-text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)]/30 focus:border-[var(--color-accent-primary)] placeholder-[#C0BEB4] transition-all disabled:opacity-60 shadow-inner"
              />
              <span className="absolute right-4.5 top-4 text-[10px] text-[#A09E94] font-mono tracking-widest uppercase hidden sm:inline select-none">
                Send ↵
              </span>
            </div>

            {/* Dictation triggers speech-to-text (STT) */}
            <button
              id="btn-voice-dictation"
              type="button"
              disabled={!user || reachedLimit}
              onClick={toggleSpeechRecognition}
              className={`p-4 rounded-full transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                isListening
                  ? "bg-[#cc7a6d] text-white animate-pulse"
                  : "bg-[var(--color-bg-alt)] hover:bg-[var(--color-border-main)] text-[var(--color-accent-primary)]"
              }`}
              title={isListening ? "Spracheingabe stoppen" : "Gedanken aussprechen"}
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              id="btn-send-message"
              type="submit"
              disabled={!inputValue.trim() || isLoading || !user || reachedLimit}
              className="p-4 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white rounded-full transition-all shadow-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Nachricht senden"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Embedded quiet metadata info */}
          <div className="px-5 py-3 bg-[var(--color-bg-card)] border-t border-[var(--color-border-main)] text-[10px] text-[#A09E94] uppercase tracking-widest font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" /> Keine Daten werden dauerhaft gespeichert.
            </span>
            <span>v1.2 • Sicherer &amp; freier raum</span>
          </div>
        </section>

      </main>

      {/* Distress/Crisis Hotline Modal Info Drawer */}
      <AnimatePresence>
        {showHelpline && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#fcfbf9] border border-[#e2dfd7] rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative"
            >
              <button
                id="btn-close-helpline"
                onClick={() => setShowHelpline(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#f1efea] text-[#747a75] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 text-[#cc4c3d] mb-4">
                <ShieldAlert className="w-7 h-7" />
                <h3 className="font-serif text-xl font-bold">Sie sind nicht allein.</h3>
              </div>

              <div className="text-sm text-[#4f5651] space-y-4 leading-relaxed font-sans">
                <p>
                  Bitte beachten Sie: Unser automatisierter Begleiter dient ausschließlich zur Entspannung und Stressbewältigung im Alltag. Er kann und darf <strong>keine professionelle psychologische Hilfe, Therapie oder ärztliche Diagnose</strong> ersetzen.
                </p>
                <p>
                  Sollten Sie sich in einer ernsten Lebenskrise befinden, an Selbstverletzung oder tiefen Traumata leiden, oder jemanden in Ihrem Umfeld wissen, der unmittelbare Unterstützung benötigt, wenden Sie sich bitte an eine der folgenden Anlaufstellen:
                </p>

                <div className="bg-[#fcf7f6] rounded-2xl p-4 border border-[#f5dedb] space-y-3.5 my-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">TelefonSeelsorge (Deutschland)</h4>
                      <p className="text-xs text-gray-500">24 Stunden am Tag, anonym, kostenfrei aus Fest- & Mobilnetz</p>
                    </div>
                    <span className="font-mono text-xs font-semibold bg-[#fadcd6]/70 text-[#b52d20] px-2.5 py-1 rounded">
                      0800 111 0 111
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">TelefonSeelsorge (Alternative)</h4>
                      <p className="text-xs text-gray-500">Alternativer bundesweiter Rufkontakt</p>
                    </div>
                    <span className="font-mono text-xs font-semibold bg-[#fadcd6]/70 text-[#b52d20] px-2.5 py-1 rounded">
                      0800 111 0 222
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm font-sans">Nummer gegen Kummer (Für Kinder/Jugendliche)</h4>
                      <p className="text-xs text-gray-500">Mo – Sa von 14:00 Uhr bis 20:00 Uhr</p>
                    </div>
                    <span className="font-mono text-xs font-semibold bg-[#fadcd6]/70 text-[#b52d20] px-2.5 py-1 rounded">
                      116 111
                    </span>
                  </div>

                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm font-sans">Infotelefon Depression</h4>
                      <p className="text-xs text-gray-500">Kostenfreie professionelle Erst-Hilfehilfe</p>
                    </div>
                    <span className="font-mono text-xs font-semibold bg-[#fadcd6]/70 text-[#b52d20] px-2.5 py-1 rounded">
                      0800 33 44 533
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#737c76]">
                  In akuten, lebensbedrohlichen Notfällen zögern Sie bitte nicht, direkt den Rettungsdienst unter der Notrufnummer <strong>112</strong> anzurufen.
                </p>
              </div>

              <button
                id="btn-helpline-acknowledged"
                onClick={() => setShowHelpline(false)}
                className="w-full mt-6 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-hover)] text-white text-sm font-medium rounded-2xl transition-colors cursor-pointer"
              >
                Ich verstehe, danke
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Little warm footer */}
      <footer className="py-6 px-6 border-t border-[var(--color-border-main)] bg-transparent text-center text-xs text-[#808a82]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center justify-center gap-1">
            Gestaltet für die App <span className="font-serif italic font-medium">Flow der Stille</span> • In Achtsamkeit gefertigt 🌱
          </p>
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowHelpline(true)} className="hover:underline hover:text-[var(--color-accent-primary)] cursor-pointer">
              Therapeutischer Hinweis
            </button>
            <span>•</span>
            <span className="font-mono text-[var(--color-accent-primary)]">100% Sicher &amp; Privat</span>
          </div>
        </div>
      </footer>
    </div>
  );
}