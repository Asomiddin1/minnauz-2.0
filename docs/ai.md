# MinnaUz 2.0 — AI System & Prompt Architecture

This document describes the AI architecture, model selection, prompt structures, scenario injection, and token management within MinnaUz.

---

## 1. AI Integration Purpose

The AI subsystem powers the **Kaiwa (Conversational Speaking)** module and intelligent language assistance. It simulates real-life Japanese scenarios (e.g. ordering food in Tokyo, asking for directions in Shinjuku, business greetings) tailored to the exact grammar and vocabulary introduced in each lesson.

---

## 2. Model Providers & Selection

| Task | Primary Provider | Model | Fallback |
|---|---|---|---|
| **Conversational Dialogue (Kaiwa)** | Google Gemini / OpenAI | `gemini-1.5-flash` / `gpt-4o-mini` | `gpt-3.5-turbo` |
| **Speech-to-Text (STT)** | OpenAI Whisper / Web Speech API | `whisper-1` / Browser STT | Azure Speech STT |
| **Text-to-Speech (TTS)** | Azure Cognitive Services / OpenAI | Azure Neural TTS (`ja-JP-NanamiNeural`) | OpenAI TTS (`tts-1`) |

---

## 3. Lesson Scenario Injection Model (`kaiwaScenario`)

Each `Lesson` contains a structured `kaiwaScenario` JSON object in PostgreSQL:

```json
{
  "scenarioId": "lesson-1-kaiwa",
  "title": "Tanaka-san bilan tanishuv",
  "situation": "You meet a Japanese college student named Tanaka at a campus library.",
  "aiCharacter": {
    "name": "Tanaka",
    "role": "University student",
    "tone": "Polite (desu/masu form)",
    "avatar": "/avatars/tanaka.png"
  },
  "learningGoals": [
    "Use '~ wa ~ desu' structure",
    "State your nationality using '~ jin'",
    "Use 'Hajimemashite' and 'Douzo yoroshiku'"
  ],
  "initialMessage": {
    "japanese": "初めまして！田中です。お名前は何ですか？",
    "romaji": "Hajimemashite! Tanaka desu. Onamae wa nan desu ka?",
    "uzbek": "Tanishganimdan xursandman! Men Tanakaman. Ismingiz nima?"
  },
  "requiredVocabulary": ["わたし", "がくせい", "にほんじん"],
  "targetGrammar": ["~ wa ~ desu", "~ ja arimasen"]
}
```

---

## 4. Prompt Engineering Principles

1. **Strict Level Adherence**: The AI strictly bounds its responses to vocabulary and grammar corresponding to the lesson's JLPT level (e.g. N5 learners receive only simple polite sentences).
2. **Instant Feedback Extraction**: In addition to continuing the dialogue in Japanese, the AI provides structured feedback in Uzbek or Russian:
   - Grammatical correctness.
   - Natural phrasing suggestions.
   - Pronunciation notes.
3. **Structured JSON Output**: When requested, LLM outputs adhere to strict JSON schemas for predictable parsing by the frontend.

---

## 5. Token & Rate Limit Management

- **User Token Bucket**: Requests are metered per user account.
- **Circuit Breakers**: Graceful fallbacks if external AI APIs encounter timeouts or rate limits.
- **Cost Optimization**: Dynamic prompt caching and concise system instructions prevent unnecessary token usage.
