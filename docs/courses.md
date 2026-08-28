# MinnaUz 2.0 — Courses & Learning Methodology

This document outlines the JLPT course structure, 5-part lesson pedagogy, media delivery, and progress completion mechanics.

---

## 1. Course Hierarchy & JLPT Levels

MinnaUz organizes its curriculum into standardized JLPT tiers:

```text
MinnaUz Curriculum
├── Alphabets (Hiragana & Katakana Foundations)
├── JLPT N5 (Beginner I & II — Minna no Nihongo 1-25)
├── JLPT N4 (Elementary I & II — Minna no Nihongo 26-50)
├── JLPT N3 (Intermediate — Grammar, Reading, Listening)
├── JLPT N2 (Upper Intermediate — Business & Academic Japanese)
└── JLPT N1 (Advanced — Native Mastery & Fluency)
```

Each course contains multiple **Course Modules** (e.g. "1-5 darslar", "6-10 darslar"), which in turn house sequenced **Lessons**.

---

## 2. 5-Section Lesson Methodology

Every lesson in MinnaUz is broken down into 5 pedagogical tabs:

```text
Lesson Overview & Video
  ├── 1. Kotoba (Lug'at / Vocabulary)
  ├── 2. Bunpou (Grammatika / Grammar Patterns)
  ├── 3. Kanji (Iyerogliflar / Characters & Radicals)
  ├── 4. Renshuu (Mashqlar / Interactive Drills & Quizzes)
  └── 5. Kaiwa (Suhbat / AI Conversational Practice)
```

### 2.1 Kotoba (Vocabulary)
- Japanese text with furigana annotations and romaji.
- Translations in Uzbek (primary), Russian, and English.
- Part of speech tags (`Ot`, `Fe'l`, `Sifat`, `Yuklama`).
- Native audio pronunciation player.
- Contextual sample sentence with audio and Uzbek translation.

### 2.2 Bunpou (Grammar)
- Grammar title and formulaic structure (e.g. `N1 wa N2 desu`).
- Clear, pedagogical explanation in Uzbek (and Russian).
- Contextual example sentences illustrating polite and plain forms.

### 2.3 Kanji (Characters)
- Kanji character with radical breakdown.
- Stroke count and stroke-order visual guide.
- Onyomi (Chinese) and Kunyomi (Japanese) readings in Katakana/Hiragana.
- Uzbek definitions and high-frequency compound words (`examples`).

### 2.4 Renshuu (Practice Exercises)
- Multiple interactive drill formats:
  - `QUIZ`: Multiple-choice conceptual and vocabulary questions.
  - `AUDIO_LISTENING`: Listening comprehension with native audio tracks.
  - `FILL_BLANK`: Sentence completion drills.
  - `MATCHING`: Japanese-to-Uzbek pair matching drills.
- Real-time scoring, instant answer feedback, and explanations.

### 2.5 Kaiwa (AI Dialogue)
- Immersive interactive speaking practice using real-life dialogue scenarios.

---

## 3. Video Lessons & Media Delivery

- **Self-Hosted Uploads**: High-definition video lectures uploaded through the Admin CMS stored under `/uploads/videos/` and streamed directly.
- **YouTube Embeddings**: Seamless support for YouTube playlists or lectures with responsive embedding.

---

## 4. Progress Tracking & Completion Criteria

A lesson is marked as **Completed** (`isCompleted = true`) when:
1. The student interacts with and completes the required learning tabs (`completedSections`).
2. The student passes the Renshuu practice test with a minimum threshold (e.g. $\ge 70\%$).
3. Overall course progress is calculated as:
   $$\text{Progress \%} = \left( \frac{\text{Completed Lessons}}{\text{Total Published Lessons}} \right) \times 100$$
