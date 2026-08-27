import type { Lang } from './i18n'

/**
 * Lesson catalogue. `youtubeId` points at the real upload — swap these for the
 * minna.uz channel IDs once the videos are published. Cue times are seconds
 * from the start; the transcript panel seeks the player with them.
 */
export type Cue = { t: number; ja: string; uz: string; ru: string; en: string }

export type Video = {
  id: string
  youtubeId: string
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'
  kana: string
  minutes: number
  views: number
  title: Record<Lang, string>
  sub: Record<Lang, string>
  cues: Cue[]
}

export const levels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

export const videos: Video[] = [
  {
    id: 'hiragana-1',
    youtubeId: '6p9Il_j0zjc',
    level: 'N5',
    kana: 'あ',
    minutes: 14,
    views: 128400,
    title: {
      uz: 'Hiragana: あ qatoridan さ qatorigacha',
      ru: 'Хирагана: от ряда あ до ряда さ',
      en: 'Hiragana: from the あ row to the さ row',
    },
    sub: {
      uz: 'Birinchi 15 belgini yozish tartibi bilan oʻrganamiz.',
      ru: 'Первые 15 знаков вместе с порядком черт.',
      en: 'The first 15 characters, stroke order included.',
    },
    cues: [
      {
        t: 0,
        ja: 'こんにちは、みんなさん。',
        uz: 'Assalomu alaykum, hammaga salom.',
        ru: 'Здравствуйте, всем привет.',
        en: 'Hello everyone.',
      },
      {
        t: 7,
        ja: '今日はひらがなを勉強します。',
        uz: 'Bugun hiragana oʻrganamiz.',
        ru: 'Сегодня мы изучаем хирагану.',
        en: 'Today we study hiragana.',
      },
      {
        t: 15,
        ja: 'ひらがなは四十六文字あります。',
        uz: 'Hiraganada qirq olti belgi bor.',
        ru: 'В хирагане сорок шесть знаков.',
        en: 'Hiragana has forty-six characters.',
      },
      {
        t: 26,
        ja: 'まず「あ・い・う・え・お」から始めましょう。',
        uz: 'Avval «a-i-u-e-o» dan boshlaymiz.',
        ru: 'Начнём с «а-и-у-э-о».',
        en: 'Let us start with "a-i-u-e-o".',
      },
      {
        t: 38,
        ja: '書く順番がとても大切です。',
        uz: 'Yozish tartibi juda muhim.',
        ru: 'Порядок написания очень важен.',
        en: 'The stroke order matters a great deal.',
      },
      {
        t: 52,
        ja: '「か」は「あ」の音にkがつきます。',
        uz: '«Ka» — «a» tovushiga k qoʻshiladi.',
        ru: '«Ка» — это звук «а» с добавлением k.',
        en: '"Ka" is the "a" sound with a k in front.',
      },
      {
        t: 66,
        ja: '一緒に読んでみてください。',
        uz: 'Keling, birga oʻqib koʻraylik.',
        ru: 'Давайте прочитаем вместе.',
        en: 'Please read along with me.',
      },
      {
        t: 80,
        ja: '毎日十分でも練習しましょう。',
        uz: 'Har kuni oʻn daqiqa boʻlsa ham mashq qiling.',
        ru: 'Занимайтесь хотя бы десять минут в день.',
        en: 'Practise every day, even if only ten minutes.',
      },
    ],
  },
  {
    id: 'greetings',
    youtubeId: 'rGrBHiuPlT0',
    level: 'N5',
    kana: '挨拶',
    minutes: 9,
    views: 86200,
    title: {
      uz: 'Kundalik salomlashish: 20 ta ibora',
      ru: 'Повседневные приветствия: 20 фраз',
      en: 'Everyday greetings: 20 phrases',
    },
    sub: {
      uz: 'Ertalabdan kechgacha ishlatiladigan iboralar.',
      ru: 'Фразы с утра до вечера.',
      en: 'Phrases for morning through night.',
    },
    cues: [
      {
        t: 0,
        ja: 'おはようございます。',
        uz: 'Xayrli tong.',
        ru: 'Доброе утро.',
        en: 'Good morning.',
      },
      {
        t: 9,
        ja: '朝は「おはよう」を使います。',
        uz: 'Ertalab «ohayo» ishlatiladi.',
        ru: 'Утром используют «охаё».',
        en: 'In the morning we use "ohayou".',
      },
      {
        t: 19,
        ja: '友達には短く「おはよう」でいいです。',
        uz: 'Doʻstlarga qisqacha «ohayo» yetarli.',
        ru: 'Друзьям достаточно короткого «охаё».',
        en: 'With friends the short "ohayou" is enough.',
      },
      {
        t: 31,
        ja: '昼は「こんにちは」と言います。',
        uz: 'Kunduzi «konnichiwa» deyiladi.',
        ru: 'Днём говорят «коннитива».',
        en: 'During the day we say "konnichiwa".',
      },
      {
        t: 44,
        ja: '夜は「こんばんは」です。',
        uz: 'Kechqurun «konbanva» boʻladi.',
        ru: 'Вечером — «конбанва».',
        en: 'In the evening it is "konbanwa".',
      },
      {
        t: 58,
        ja: '別れるときは「またね」。',
        uz: 'Xayrlashayotganda «mata ne».',
        ru: 'При прощании — «мата нэ».',
        en: 'When parting, "mata ne".',
      },
      {
        t: 70,
        ja: '寝る前に「おやすみなさい」。',
        uz: 'Uxlashdan oldin «oyasuminasay».',
        ru: 'Перед сном — «оясуминасай».',
        en: 'Before sleeping, "oyasuminasai".',
      },
    ],
  },
  {
    id: 'te-form',
    youtubeId: 'z8fJEA4KHrE',
    level: 'N4',
    kana: 'て形',
    minutes: 18,
    views: 54100,
    title: {
      uz: 'て-shakl: barcha qoidalar bir darsda',
      ru: 'Форма て: все правила за один урок',
      en: 'The て-form: every rule in one lesson',
    },
    sub: {
      uz: 'Uch guruh fe’l va ularning istisnolari.',
      ru: 'Три группы глаголов и исключения.',
      en: 'Three verb groups and their exceptions.',
    },
    cues: [
      {
        t: 0,
        ja: '今日はて形の作り方を説明します。',
        uz: 'Bugun て-shakl yasashni tushuntiraman.',
        ru: 'Сегодня объясню, как образуется форма て.',
        en: 'Today I will explain how the て-form is made.',
      },
      {
        t: 12,
        ja: '動詞は三つのグループに分かれます。',
        uz: 'Fe’llar uch guruhga boʻlinadi.',
        ru: 'Глаголы делятся на три группы.',
        en: 'Verbs are divided into three groups.',
      },
      {
        t: 25,
        ja: '第二グループは簡単です。「る」を取って「て」。',
        uz: 'Ikkinchi guruh oson: «ru» olib tashlanadi va «te» qoʻshiladi.',
        ru: 'Вторая группа простая: убираем «ру» и добавляем «тэ».',
        en: 'Group two is simple: drop "ru" and add "te".',
      },
      {
        t: 42,
        ja: '第一グループには規則があります。',
        uz: 'Birinchi guruhda qoidalar bor.',
        ru: 'У первой группы есть правила.',
        en: 'Group one has its own rules.',
      },
      {
        t: 58,
        ja: '「く」は「いて」になります。書く、書いて。',
        uz: '«Ku» — «ite» boʻladi: kaku → kaite.',
        ru: '«Ку» превращается в «итэ»: каку → кайтэ.',
        en: '"ku" becomes "ite": kaku, kaite.',
      },
      {
        t: 76,
        ja: '「行く」だけは例外で「行って」です。',
        uz: 'Faqat «iku» istisno: «itte» boʻladi.',
        ru: 'Только «ику» — исключение: «иттэ».',
        en: 'Only "iku" is an exception: "itte".',
      },
      {
        t: 95,
        ja: 'て形が分かると、文がぐっと長くなります。',
        uz: 'て-shaklni bilsangiz, gaplaringiz ancha uzayadi.',
        ru: 'Освоив форму て, вы строите куда длиннее фразы.',
        en: 'Once you know the て-form your sentences get much longer.',
      },
    ],
  },
  {
    id: 'kanji-numbers',
    youtubeId: 'Zop5-lLBFvA',
    level: 'N5',
    kana: '数字',
    minutes: 11,
    views: 71800,
    title: {
      uz: 'Kanji sonlar va sanoq soʻzlari',
      ru: 'Кандзи-числа и счётные суффиксы',
      en: 'Number kanji and counters',
    },
    sub: {
      uz: 'Bir dan oʻn minggacha va eng kerakli sanoqlar.',
      ru: 'От одного до десяти тысяч и нужные счётчики.',
      en: 'One to ten thousand, plus the counters you need.',
    },
    cues: [
      {
        t: 0,
        ja: '数字の漢字を覚えましょう。',
        uz: 'Son kanjilarini yodlaymiz.',
        ru: 'Запомним кандзи чисел.',
        en: 'Let us memorise the number kanji.',
      },
      {
        t: 10,
        ja: '一、二、三は線の数で覚えます。',
        uz: 'Bir, ikki, uch — chiziqlar soni bilan yodlanadi.',
        ru: 'Один, два, три запоминаются по числу черт.',
        en: 'One, two and three are remembered by their stroke count.',
      },
      {
        t: 24,
        ja: '十は「じゅう」と読みます。',
        uz: 'Oʻn — «jyu» deb oʻqiladi.',
        ru: 'Десять читается как «дзю».',
        en: 'Ten is read "juu".',
      },
      {
        t: 38,
        ja: '百は「ひゃく」、千は「せん」です。',
        uz: 'Yuz — «hyaku», ming — «sen».',
        ru: 'Сто — «хяку», тысяча — «сэн».',
        en: 'A hundred is "hyaku", a thousand is "sen".',
      },
      {
        t: 55,
        ja: '物を数えるときは助数詞を使います。',
        uz: 'Narsalarni sanashda sanoq soʻzlari ishlatiladi.',
        ru: 'При счёте предметов используются счётные слова.',
        en: 'When counting things we use counters.',
      },
      {
        t: 72,
        ja: '人は「にん」、本は「ほん」です。',
        uz: 'Odamlar uchun «nin», uzun narsalar uchun «hon».',
        ru: 'Для людей — «нин», для длинных предметов — «хон».',
        en: 'People take "nin", long objects take "hon".',
      },
    ],
  },
  {
    id: 'keigo',
    youtubeId: 'YQHsXMglC9A',
    level: 'N3',
    kana: '敬語',
    minutes: 22,
    views: 33900,
    title: {
      uz: 'Keigo: hurmat tilidan qoʻrqmang',
      ru: 'Кэйго: не бойтесь вежливой речи',
      en: 'Keigo: stop being afraid of polite speech',
    },
    sub: {
      uz: 'Sonkeigo, kenjougo va teineigo farqi.',
      ru: 'Разница между сонкэйго, кэндзёго и тэйнэйго.',
      en: 'Sonkeigo, kenjougo and teineigo, told apart.',
    },
    cues: [
      {
        t: 0,
        ja: '敬語は三種類あります。',
        uz: 'Keigoning uch turi bor.',
        ru: 'Кэйго бывает трёх видов.',
        en: 'There are three kinds of keigo.',
      },
      {
        t: 14,
        ja: '相手を高くするのが尊敬語です。',
        uz: 'Suhbatdoshni ulugʻlaydigani — sonkeigo.',
        ru: 'Возвышающий собеседника — сонкэйго.',
        en: 'The one that raises the listener is sonkeigo.',
      },
      {
        t: 30,
        ja: '自分を低くするのが謙譲語です。',
        uz: 'Oʻzini pastroq qoʻyadigani — kenjougo.',
        ru: 'Принижающий себя — кэндзёго.',
        en: 'The one that lowers yourself is kenjougo.',
      },
      {
        t: 48,
        ja: '「です・ます」は丁寧語と言います。',
        uz: '«Desu/masu» esa teineigo deyiladi.',
        ru: '«Дэсу/масу» называется тэйнэйго.',
        en: '"desu/masu" is called teineigo.',
      },
      {
        t: 66,
        ja: '面接では謙譲語をよく使います。',
        uz: 'Suhbatlarda kenjougo koʻp ishlatiladi.',
        ru: 'На собеседовании часто нужен кэндзёго.',
        en: 'In interviews kenjougo comes up constantly.',
      },
      {
        t: 88,
        ja: '間違えても大丈夫、練習が一番です。',
        uz: 'Xato qilsangiz ham hechqisi yoʻq — mashq eng muhimi.',
        ru: 'Ошибаться нормально — важнее всего практика.',
        en: 'Mistakes are fine; practice is what matters.',
      },
    ],
  },
  {
    id: 'listening-n2',
    youtubeId: 'lTRiuFIWV54',
    level: 'N2',
    kana: '聴解',
    minutes: 26,
    views: 21500,
    title: {
      uz: 'N2 tinglash: tezlikka koʻnikish',
      ru: 'Аудирование N2: привыкаем к темпу',
      en: 'N2 listening: getting used to the speed',
    },
    sub: {
      uz: 'Tabiiy sur’atdagi suhbatlar va shadowing.',
      ru: 'Диалоги в естественном темпе и шэдоуинг.',
      en: 'Natural-pace dialogue plus shadowing.',
    },
    cues: [
      {
        t: 0,
        ja: 'N2の聴解はスピードが速いです。',
        uz: 'N2 tinglash boʻlimi tez sur’atda boʻladi.',
        ru: 'Аудирование N2 идёт в быстром темпе.',
        en: 'N2 listening moves quickly.',
      },
      {
        t: 16,
        ja: '全部聞き取ろうとしないでください。',
        uz: 'Hammasini tushunishga urinmang.',
        ru: 'Не пытайтесь разобрать каждое слово.',
        en: 'Do not try to catch every single word.',
      },
      {
        t: 34,
        ja: '大切なのは話の目的です。',
        uz: 'Muhimi — suhbatning maqsadi.',
        ru: 'Главное — цель разговора.',
        en: 'What matters is the purpose of the conversation.',
      },
      {
        t: 55,
        ja: 'メモは短い記号で取りましょう。',
        uz: 'Qaydlarni qisqa belgilar bilan oling.',
        ru: 'Записывайте короткими значками.',
        en: 'Take notes with short symbols.',
      },
      {
        t: 78,
        ja: 'シャドーイングを毎日続けてください。',
        uz: 'Shadowingni har kuni davom ettiring.',
        ru: 'Занимайтесь шэдоуингом каждый день.',
        en: 'Keep up shadowing every day.',
      },
      {
        t: 102,
        ja: '一か月で耳が変わります。',
        uz: 'Bir oyda qulogʻingiz oʻzgaradi.',
        ru: 'За месяц слух заметно меняется.',
        en: 'In a month your ear will change.',
      },
    ],
  },
]

export const findVideo = (id: string) => videos.find((v) => v.id === id)
