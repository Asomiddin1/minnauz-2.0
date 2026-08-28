# MinnaUz 2.0 — AI Speaking (Kaiwa) Engine

This document details the real-time AI Speaking practice pipeline, speech processing, and feedback loop.

---

## 1. End-to-End Request Flow

The complete request and audio processing cycle operates as follows:

```text
User Speaks into Microphone
            ↓
Browser Audio Recording (Web Audio API / MediaRecorder)
            ↓
Frontend (Compresses audio chunk to WebM / WAV)
            ↓
Backend API (/api/ai/speaking)
            ↓
Speech-to-Text (STT) Service (Whisper / Azure STT)
            ↓
Transcribed Japanese Text
            ↓
AI Dialogue Engine (Evaluates against Lesson Kaiwa Scenario & History)
            ↓
AI Japanese Response + Feedback (Corrections, Nuances, Furigana)
            ↓
Neural Text-to-Speech (TTS) Service (Azure Japanese Voice / OpenAI TTS)
            ↓
Synthesized Audio Stream + JSON Payload
            ↓
Frontend (Plays audio response & updates interactive transcript)
```

---

## 2. Interactive Speaking Interface Capabilities

Inside `web/app/[locale]/dashboard/courses/[courseId]/lessons/[lessonId]`:
1. **Interactive Transcript**: Displays speaker turns with Japanese kanji, clickable furigana rubies, romaji transliteration, and Uzbek translations.
2. **Audio Playback**: Instant replay of the AI character's spoken audio with speed adjustment controls (0.8x, 1.0x, 1.2x).
3. **Pronunciation & Grammar Scoring**: Displays visual feedback badges (e.g. "A'lo!", "Yaxshi", "Takrorlang") along with specific correction hints.
4. **Hint & Suggested Response**: Provides learners with scaffolded phrase suggestions if they hesitate.

---

## 3. Error Handling & Latency Optimizations

- **Streaming Support**: Audio generation begins concurrently with LLM token streaming to minimize roundtrip latency (<1.5s target).
- **Network Resilience**: Automatic retry on transient network drops with local audio caching.
- **Microphone Permission Handling**: Clear visual prompts and fallback text-input mode if microphone access is denied by browser permissions.
