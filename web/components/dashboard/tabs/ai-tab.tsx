'use client';

import * as React from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Volume2,
  RotateCcw,
  BookOpen,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  romaji?: string;
  translationUz?: string;
  timestamp: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: 'こんにちは！私はMinnaUz AI先生です。今日は何を勉強しますか？何でも質問してください。',
    romaji: 'Konnichiwa! Watashi wa MinnaUz AI-sensei desu. Kyou wa nani o benkyou shimasu ka? Nan demo shitsumon shite kudasai.',
    translationUz: 'Salom! Men MinnaUz AI ustoziman. Bugun nima oʻrganamiz? Istalgan savolingizni bering.',
    timestamp: 'Hozir',
  },
];

export function AiTab() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputMessage, setInputMessage] = React.useState('');
  const [isTyping, setIsTyping] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: 'Hozir',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiText = '素晴らしいですね！日本語の勉強を一緒に続けましょう。';
      let romaji = 'Subarashii desu ne! Nihongo no benkyou o issho ni tsuzukemashou.';
      let trans = 'Ajoyib! Yapon tilini birgalikda oʻrganishda davom etamiz.';

      if (text.includes('wa') || text.includes('desu') || text.includes('grammatika')) {
        aiText = '「〜は〜です」は日本語の最も基本的な文法構造です。例えば：「私は学生です」。';
        romaji = '「~ wa ~ desu」wa nihongo no mottomo kihontekina bunpou kouzou desu.';
        trans = '"~ wa ~ desu" yapon tilining eng asosiy grammatik qoidasidir. Masalan: "Men talabaman".';
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        romaji,
        translationUz: trans,
        timestamp: 'Hozir',
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800);
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-amber-500/10 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>MinnaUz AI Ustoz (Kaiwa Sensei)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Shaxsiy AI Yapon tili repetitori
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Grammatika tushunmagan joyingizni soʻrang, suhbatlashing yoki xatolaringizni tekshirib
              toʻgʻirlating. 24/7 yoningizdagi yapon ustozingiz.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="rounded-3xl border border-border bg-card shadow-xs overflow-hidden flex flex-col h-[560px]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isAi = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
              >
                {isAi && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 text-xs sm:text-sm ${
                    isAi
                      ? 'border border-border bg-secondary/30 text-foreground space-y-2'
                      : 'bg-primary text-primary-foreground font-medium'
                  }`}
                >
                  <div>{msg.text}</div>
                  {isAi && msg.romaji && (
                    <div className="text-[11px] font-mono text-muted-foreground">{msg.romaji}</div>
                  )}
                  {isAi && msg.translationUz && (
                    <div className="text-xs text-muted-foreground/90 pt-1 border-t border-border/40">
                      {msg.translationUz}
                    </div>
                  )}
                  {isAi && (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => playAudio(msg.text)}
                        className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
                      >
                        <Volume2 className="h-3 w-3" /> Eshitish
                      </button>
                    </div>
                  )}
                </div>

                {!isAi && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-500">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce" />
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]" />
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts */}
        <div className="p-2 sm:px-6 bg-secondary/20 border-t border-border flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            '~ wa ~ desu grammatikasini tushuntirib bering',
            'Konnichiwa va Konbanwa farqi nima?',
            'JLPT N5 uchun qaysi soʻzlar muhim?',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="shrink-0 px-3 py-1 rounded-full border border-border/80 bg-card text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
            >
              <Lightbulb className="inline h-3 w-3 mr-1 text-amber-500" />
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-border bg-card flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="AI ustozga savol bering (oʻzbekcha yoki yaponcha)..."
            className="flex-1 h-11 rounded-2xl border border-border bg-secondary/30 px-4 text-xs sm:text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/10"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim()}
            className="h-11 w-11 grid place-items-center rounded-2xl bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
