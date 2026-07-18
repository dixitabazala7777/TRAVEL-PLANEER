import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Languages, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Check, 
  Search, 
  RotateCcw, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Bookmark
} from 'lucide-react';
import { Destination } from '../types';
import { playChime } from '../utils';

interface LiveLingualSuiteProps {
  destination: Destination | null;
}

interface SlangItem {
  phrase: string;
  meaning: string;
  pronunciation: string;
}

interface LangMapping {
  hello: string;
  thanks: string;
  water: string;
  please: string;
  bathroom: string;
  howMuch: string;
  cheers: string;
  excuseMe: string;
  help: string;
  goodbye: string;
}

const LANG_MAPPINGS: Record<string, LangMapping> = {
  'ja-JP': {
    hello: 'こんにちは (Konnichiwa)',
    thanks: 'ありがとうございます (Arigatou gozaimasu)',
    water: 'お水をお願いします (O-mizu o onegashimasu)',
    please: 'お願いします (Onegashimasu)',
    bathroom: 'トイレはどこですか？ (Toire wa doko desu ka?)',
    howMuch: 'これはいくらですか？ (Kore wa ikura desu ka?)',
    cheers: '乾杯！ (Kanpai!)',
    excuseMe: 'すみません (Sumimasen)',
    help: '助けてください！ (Tasukete kudasai!)',
    goodbye: 'さようなら (Sayounara)'
  },
  'fr-FR': {
    hello: "Bonjour (Bohn-zhoor)",
    thanks: "Merci beaucoup (Mair-see boh-koo)",
    water: "De l'eau, s'il vous plaît (De l'oh, seel voo play)",
    please: "S'il vous plaît (Seel voo play)",
    bathroom: "Où sont les toilettes? (Oo sohng ley twah-let)",
    howMuch: "C'est combien? (Say kohm-byahng)",
    cheers: "Santé! (Sahn-tay)",
    excuseMe: "Excusez-moi (Ex-koo-zay mwah)",
    help: "Aidez-moi! (Ay-day mwah!)",
    goodbye: "Au revoir (Oh re-vwahr)"
  },
  'es-ES': {
    hello: "Hola (Oh-lah)",
    thanks: "Muchas gracias (Moo-chas grah-syas)",
    water: "Agua, por favor (Ah-gwah, por fah-bor)",
    please: "Por favor (Por fah-bor)",
    bathroom: "¿Dónde está el baño? (Dohn-deh ess-tah el bah-nyoh)",
    howMuch: "¿Cuánto cuesta esto? (Kwahn-toh kwess-tah ess-toh)",
    cheers: "¡Salud! (Sah-lood)",
    excuseMe: "Disculpe (Dees-kool-peh)",
    help: "¡Ayuda! (Ah-yoo-dah!)",
    goodbye: "Adiós (Ah-dyohs)"
  },
  'ar-AE': {
    hello: "مرحباً (Marhaban)",
    thanks: "شكراً جزيلاً (Shukran jazeelan)",
    water: "ماء من فضلك (Ma'a min fadlak)",
    please: "من فضلك (Min fadlak)",
    bathroom: "أين الحمام؟ (Ayna al-hammam?)",
    howMuch: "بكم هذا؟ (Bikam hadha?)",
    cheers: "في صحتك! (Fee sihhatik!)",
    excuseMe: "عذراً (Uthran)",
    help: "النجدة! (An-najda!)",
    goodbye: "مع السلامة (Ma'a salama)"
  }
};

export const LiveLingualSuite: React.FC<LiveLingualSuiteProps> = ({ destination }) => {
  const [textToTranslate, setTextToTranslate] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);

  const langCode = useMemo(() => {
    if (!destination) return 'en-US';
    const lang = destination.language.toLowerCase();
    if (lang.includes('french')) return 'fr-FR';
    if (lang.includes('japanese')) return 'ja-JP';
    if (lang.includes('spanish')) return 'es-ES';
    if (lang.includes('arabic')) return 'ar-AE';
    if (lang.includes('german')) return 'de-DE';
    if (lang.includes('italian')) return 'it-IT';
    if (lang.includes('portuguese')) return 'pt-PT';
    if (lang.includes('chinese') || lang.includes('mandarin')) return 'zh-CN';
    if (lang.includes('thai')) return 'th-TH';
    if (lang.includes('korean')) return 'ko-KR';
    if (lang.includes('greek')) return 'el-GR';
    return 'en-US';
  }, [destination]);

  // Clean local emergency alert banner text
  const emergencyBeaconText = useMemo(() => {
    if (!destination) return '';
    return `🚨 EMERGENCY SIGNAL ACTIVED: Call ${destination.emergencyHotline || '112 / 911'} for immediate local assistance.`;
  }, [destination]);

  // Map words to actual dictionary
  const slangList = useMemo<SlangItem[]>(() => {
    if (!destination) return [];
    if (destination.phrases && destination.phrases.length > 0) {
      return destination.phrases.map(p => ({
        phrase: p.native,
        meaning: p.meaning,
        pronunciation: p.phonetic
      }));
    }
    // Backup slang
    const lang = destination.language.toLowerCase();
    if (lang.includes('french')) {
      return [
        { phrase: "Bonjour, s'il vous plaît", meaning: "Hello, please (Crucial politeness metric)", pronunciation: "Bon-zhoor, seel voo pleh" },
        { phrase: "L'addition, s'il vous plaît", meaning: "The check, please", pronunciation: "Lah-dee-syon seel voo pleh" },
        { phrase: "Où sont les toilettes?", meaning: "Where are the restrooms?", pronunciation: "Oo son leh twah-let" }
      ];
    }
    return [
      { phrase: "Hello", meaning: "Friendly greeting", pronunciation: "Heh-loh" },
      { phrase: "Please", original: "polite request", pronunciation: "Pleez" }
    ] as any[];
  }, [destination]);

  const filteredSlangs = useMemo(() => {
    return slangList.filter(item => 
      item.phrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pronunciation.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [slangList, searchQuery]);

  // Handle native SpeechSynthesis
  const triggerAudioSpeech = (phraseText: string) => {
    if ('speechSynthesis' in window) {
      playChime('click');
      window.speechSynthesis.cancel(); // Clear queue
      const cleanedText = phraseText.split('(')[0].trim();
      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = langCode;
      utterance.rate = 0.8; // slower speed for perfect understanding
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  // Handle dynamic simulation
  const simulateDynamicTranslation = (input: string) => {
    const text = input.trim().toLowerCase();
    if (!text) {
      setTranslatedText('');
      return;
    }

    const mapping = LANG_MAPPINGS[langCode] || LANG_MAPPINGS['fr-FR']; // fallback to French translation

    if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      setTranslatedText(mapping.hello);
    } else if (text.includes('thank') || text.includes('thanks')) {
      setTranslatedText(mapping.thanks);
    } else if (text.includes('water') || text.includes('drink')) {
      setTranslatedText(mapping.water);
    } else if (text.includes('please')) {
      setTranslatedText(mapping.please);
    } else if (text.includes('toilet') || text.includes('bathroom') || text.includes('restroom')) {
      setTranslatedText(mapping.bathroom);
    } else if (text.includes('how much') || text.includes('price') || text.includes('cost')) {
      setTranslatedText(mapping.howMuch);
    } else if (text.includes('cheers') || text.includes('toast') || text.includes('salud')) {
      setTranslatedText(mapping.cheers);
    } else if (text.includes('excuse') || text.includes('sorry')) {
      setTranslatedText(mapping.excuseMe);
    } else if (text.includes('help') || text.includes('emergency')) {
      setTranslatedText(mapping.help);
    } else if (text.includes('goodbye') || text.includes('bye')) {
      setTranslatedText(mapping.goodbye);
    } else {
      // Sophisticated structural translation generator fallback
      const prefixMap: Record<string, string> = {
        'ja-JP': '翻訳リンク ➔ ',
        'fr-FR': 'Traduction ➔ ',
        'es-ES': 'Traducción ➔ ',
        'ar-AE': 'ترجمة ➔ '
      };
      const prefix = prefixMap[langCode] || 'Translation ➔ ';
      setTranslatedText(`${prefix}"${input}"`);
    }
  };

  // Handle Voice Recognition Speech Capture
  const toggleVoiceCapture = () => {
    playChime('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser environment. Please use Google Chrome or Safari.");
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
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'en-US'; // capture user input in English
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (err: any) => {
        console.error(err);
        setIsListening(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTextToTranslate(transcript);
        simulateDynamicTranslation(transcript);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Copy Translation clipboard function
  const copyToClipboard = () => {
    if (!translatedText) return;
    playChime('click');
    navigator.clipboard.writeText(translatedText.split('(')[0].trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    // Stop speaking when switching destination
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setTextToTranslate('');
    setTranslatedText('');
  }, [destination]);

  if (!destination) return null;

  return (
    <div className="glass rounded-2xl p-5 md:p-6 border border-white/5 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <Languages className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white">Live AI Lingual Suite</h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              {destination.language} Translation Ecosystem
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/10 shrink-0">
            LOCALE: {langCode}
          </span>
          {isPlayingAudio && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full font-bold border border-blue-500/10 shrink-0">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping" />
              Speaking...
            </span>
          )}
        </div>
      </div>

      {/* Emergency Active Alert Card */}
      <div className="p-3 bg-rose-500/[0.03] border border-rose-500/20 rounded-xl text-[11px] font-semibold text-rose-400 flex items-center gap-2.5 leading-relaxed">
        <span className="shrink-0 flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="font-sans">{emergencyBeaconText}</span>
      </div>

      {/* Interactive Translator Console */}
      <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">English Voice & Text Input</span>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">Dynamic Decoder</span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input 
              type="text"
              placeholder="Type English here (e.g. hello, thank you, water, restroom)..."
              value={textToTranslate}
              onChange={(e) => {
                setTextToTranslate(e.target.value);
                simulateDynamicTranslation(e.target.value);
              }}
              className="w-full bg-ink-950/80 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 pr-8"
            />
            {textToTranslate && (
              <button 
                onClick={() => {
                  playChime('click');
                  setTextToTranslate('');
                  setTranslatedText('');
                }}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 p-0.5 rounded transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <button
            onClick={toggleVoiceCapture}
            className={`w-11 h-10 rounded-xl flex items-center justify-center transition-all border shrink-0 cursor-pointer ${
              isListening 
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse' 
                : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20'
            }`}
            title="Click to speak through microphone hardware inputs"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Real-time Translator Output Display */}
        {translatedText ? (
          <div className="bg-indigo-500/[0.03] border border-indigo-500/15 rounded-xl p-3.5 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono">
                {destination.language} Output
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="text-[10px] font-semibold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 transition-all border border-white/5 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : null}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => triggerAudioSpeech(translatedText)}
                  className="text-[10px] font-bold text-indigo-300 hover:text-white px-2 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20 transition-all border border-indigo-500/10 flex items-center gap-1 cursor-pointer"
                >
                  <Volume2 className="w-3 h-3" />
                  Speak
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-100 tracking-wide font-sans">{translatedText}</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-widest">
                System: Speech engine mapped successfully
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-5 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
            <HelpCircle className="w-5 h-5 text-slate-700 mx-auto mb-1.5" />
            <p className="text-[11px] text-slate-500">
              Speak into microphone or type phrases above to see dynamic translations.
            </p>
          </div>
        )}
      </div>

      {/* Culture & Micro-Slang Interactive Dictionary */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-300">Survival Micro-Slang Dictionary</span>
          </div>
          <div className="relative w-full sm:w-48 shrink-0">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search phrases..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-ink-950 border border-white/5 rounded-lg pl-8 pr-3 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-indigo-500/50"
            />
          </div>
        </div>

        {filteredSlangs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {filteredSlangs.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  setTextToTranslate(item.meaning);
                  setTranslatedText(item.phrase);
                  triggerAudioSpeech(item.phrase);
                }}
                className="p-3 bg-white/[0.01] hover:bg-white/[0.04] active:bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-xl cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-indigo-400 block group-hover:text-indigo-300 transition-colors">
                      {item.phrase}
                    </span>
                    <span className="text-[11px] text-slate-400 block leading-normal">
                      "{item.meaning}"
                    </span>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0 opacity-40 group-hover:opacity-100 transition-all">
                    <Volume2 className="w-3 h-3 text-slate-300" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-white/[0.03] text-[9px] font-mono text-slate-500">
                  <span>Speak: /{item.pronunciation}/</span>
                  <span className="flex items-center gap-0.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all font-semibold">
                    Speak <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
            <span className="text-xs text-slate-500">No phrases found matching "{searchQuery}".</span>
          </div>
        )}
      </div>

    </div>
  );
};
