import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesSeedService implements OnModuleInit {
  private readonly logger = new Logger(CoursesSeedService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedCoursesIfEmpty();
  }

  async seedCoursesIfEmpty() {
    try {
      // Find or create default Super Admin
      let superAdmin = await this.prisma.user.findFirst({
        where: {
          OR: [{ role: 'SUPER_ADMIN' }, { role: 'ADMIN' }, { email: 'admin@minna.uz' }],
        },
      });

      if (!superAdmin) {
        superAdmin = await this.prisma.user.create({
          data: {
            email: 'admin@minna.uz',
            fullName: 'MinnaUz Sensei (Rasmiy)',
            role: 'SUPER_ADMIN',
            isVerified: true,
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          },
        });
      }

      // Check if courses exist without author and update them
      await this.prisma.course.updateMany({
        where: { authorId: null },
        data: { authorId: superAdmin.id },
      });

      const courseCount = await this.prisma.course.count();
      if (courseCount > 0) {
        return;
      }

      this.logger.log('Kurslar mavjud emas. Boshlangʻich N5 va N4 kurslarini generatsiya qilish boshlanmoqda...');

      // 1. Create N5 Course: Minna no Nihongo I
      const n5Course = await this.prisma.course.create({
        data: {
          title: 'Minna no Nihongo I (N5)',
          slug: 'minna-no-nihongo-1',
          description: 'Boshlangʻich yapon tili: Hiragana, Katakana, 100+ Kanji, 25 ta dars va toʻliq audio talaffuzlar.',
          level: 'N5',
          order: 1,
          isPublished: true,
          authorId: superAdmin.id,
          coverImage: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&w=800&q=80',
        },
      });

      // 2. Create N4 Course: Minna no Nihongo II
      await this.prisma.course.create({
        data: {
          title: 'Minna no Nihongo II (N4)',
          slug: 'minna-no-nihongo-2',
          description: 'Oʻrta-boshlangʻich daraja: Kundalik soʻzlashuv, murakkab feʼl shakllari va 300 ta Kanji.',
          level: 'N4',
          order: 2,
          isPublished: true,
          authorId: superAdmin.id,
          coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
        },
      });

      // 3. Create N3 Course
      await this.prisma.course.create({
        data: {
          title: 'JLPT N3 Oʻrta daraja',
          slug: 'jlpt-n3',
          description: 'Gazeta sarlavhalari, Keigo (hurmat shakllari) va tabiiy tezlikdagi suhbatlar.',
          level: 'N3',
          order: 3,
          isPublished: true,
          authorId: superAdmin.id,
          coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        },
      });

      // 4. Create Module 1 for N5 Course
      const module1 = await this.prisma.courseModule.create({
        data: {
          courseId: n5Course.id,
          title: '1-Modul: Tanishtiruv va Asoslar (1–5 darslar)',
          description: 'Oʻzini tanishtirish, buyumlar, joylar, vaqt va harakat feʼllari asoslari.',
          order: 1,
        },
      });

      // Module 2 for N5 Course
      await this.prisma.courseModule.create({
        data: {
          courseId: n5Course.id,
          title: '2-Modul: Kundalik Harakatlar va Sifatlar (6–10 darslar)',
          description: 'Harakat obyektlari, birgalikda harakat qilish, sifatlar va mavjudlik.',
          order: 2,
        },
      });

      // Module 3 for N5 Course
      await this.prisma.courseModule.create({
        data: {
          courseId: n5Course.id,
          title: '3-Modul: Te-shakl va Tuslanishlar (11–15 darslar)',
          description: 'Sanash, qiyoslash, istaklar, va Te-shakl orqali iltimos qilish.',
          order: 3,
        },
      });

      // 5. Create Lesson 1 in Module 1
      const lesson1 = await this.prisma.lesson.create({
        data: {
          moduleId: module1.id,
          title: '1-dars: Oʻzini tanishtirish va salomlashish',
          japaneseTitle: '第1課 (Dai 1 Ka)',
          slug: 'lesson-1',
          order: 1,
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          summary: 'Ushbu darsda oʻzingizni tanishtirish, ism, kasb va millatni aytishni, shuningdek yapon tilidagi asosiy ~wa ~desu strukturasini oʻrganasiz.',
          kaiwaScenario: {
            topic: 'Kompaniyada yoki sinfda yangi tanishuv',
            partnerName: 'Tanaka-san',
            goal: 'Oʻzingizning ismingiz, kasbingiz va qayerdan ekanligingizni aytib tanishing.',
            sampleDialog: [
              { speaker: 'Tanaka', text: '初めまして。田中です。どうぞよろしくお願いします。', uz: 'Tanishganimdan xursandman. Men Tanakaman. Marhamat, yaxshi munosabatda boʻlaylik.' },
              { speaker: 'User', text: '初めまして。アザマトです。ウズベキスタンから来ました。どうぞよろしくお願いします。', uz: 'Tanishganimdan xursandman. Men Azamatman. Oʻzbekistondan keldim. Yaxshi munosabatda boʻlaylik.' }
            ]
          }
        },
      });

      // Seed Kotoba for Lesson 1
      const kotobaData = [
        { word: 'わたし', furigana: 'わたし', romaji: 'watashi', meaningUz: 'men', meaningRu: 'я', meaningEn: 'I, me', partOfSpeech: 'Olmosh', sampleSentence: 'わたしは がくせいです。', sampleSentenceUz: 'Men talabaman.', order: 1 },
        { word: 'あなた', furigana: 'あなた', romaji: 'anata', meaningUz: 'siz', meaningRu: 'вы / ты', meaningEn: 'you', partOfSpeech: 'Olmosh', sampleSentence: 'あなたは せんせいですか。', sampleSentenceUz: 'Siz oʻqituvchimisiz?', order: 2 },
        { word: 'あのひと (あの方)', furigana: 'あのひと (あのかた)', romaji: 'ano hito (ano kata)', meaningUz: 'u kishi / u odam', meaningRu: 'тот человек', meaningEn: 'that person', partOfSpeech: 'Olmosh', sampleSentence: 'あのかたは どなたですか。', sampleSentenceUz: 'U kishi kimlar?', order: 3 },
        { word: 'さん', furigana: 'さん', romaji: 'san', meaningUz: 'janob / xonim (hurmat qoʻshimchasi)', meaningRu: 'г-н / г-жа', meaningEn: 'Mr. / Ms.', partOfSpeech: 'Qoʻshimcha', sampleSentence: 'ミラーさん', sampleSentenceUz: 'Janob Miller', order: 4 },
        { word: 'せんせい', furigana: 'せんせい', romaji: 'sensei', meaningUz: 'oʻqituvchi / ustoz', meaningRu: 'учитель', meaningEn: 'teacher', partOfSpeech: 'Ot', sampleSentence: 'たなかさんは せんせいです。', sampleSentenceUz: 'Tanaka xonim oʻqituvchi.', order: 5 },
        { word: 'がくせい', furigana: 'がくせい', romaji: 'gakusei', meaningUz: 'talaba / oʻquvchi', meaningRu: 'студент', meaningEn: 'student', partOfSpeech: 'Ot', sampleSentence: 'アリさんは がくせいです。', sampleSentenceUz: 'Ali talaba.', order: 6 },
        { word: 'かいしゃいん', furigana: 'かいしゃいん', romaji: 'kaishain', meaningUz: 'kompaniya xodimi', meaningRu: 'служащий компании', meaningEn: 'company employee', partOfSpeech: 'Ot', sampleSentence: 'サントスさんは かいしゃいんです。', sampleSentenceUz: 'Santos janoblari firma xodimi.', order: 7 },
        { word: 'いしゃ', furigana: 'いしゃ', romaji: 'isha', meaningUz: 'shifokor / doʻxtir', meaningRu: 'врач', meaningEn: 'doctor', partOfSpeech: 'Ot', sampleSentence: 'ちちは いしゃです。', sampleSentenceUz: 'Otam shifokor.', order: 8 },
        { word: 'エンジニア', furigana: 'エンジニア', romaji: 'enjinia', meaningUz: 'muhandis / injener', meaningRu: 'инженер', meaningEn: 'engineer', partOfSpeech: 'Ot', sampleSentence: 'わたしは エンジニアです。', sampleSentenceUz: 'Men muhandisman.', order: 9 },
        { word: 'だいがく', furigana: 'だいがく', romaji: 'daigaku', meaningUz: 'universitet', meaningRu: 'университет', meaningEn: 'university', partOfSpeech: 'Ot', sampleSentence: 'とうきょうだいがく', sampleSentenceUz: 'Tokio universiteti', order: 10 },
        { word: 'はじめまして', furigana: 'はじめまして', romaji: 'hajimemashite', meaningUz: 'Tanishganimdan xursandman (birinchi koʻrishganda)', meaningRu: 'Приятно познакомиться', meaningEn: 'Nice to meet you', partOfSpeech: 'Ibora', sampleSentence: 'はじめまして、どうぞよろしく。', sampleSentenceUz: 'Tanishganimdan xursandman, marhamat.', order: 11 },
        { word: 'どうぞ よろしく おねがいします', furigana: 'どうぞ よろしく おねがいします', romaji: 'douzo yoroshiku onegaishimasu', meaningUz: 'Iltimos, menga yaxshi munosabatda boʻling (oʻzini tanishtirish yakuni)', meaningRu: 'Прошу любить и жаловать', meaningEn: 'Pleased to meet you', partOfSpeech: 'Ibora', sampleSentence: 'どうぞ よろしく おねがいします。', sampleSentenceUz: 'Tanishganimdan mamnunman.', order: 12 },
      ];

      for (const item of kotobaData) {
        await this.prisma.kotobaItem.create({
          data: {
            lessonId: lesson1.id,
            ...item,
          },
        });
      }

      // Seed Bunpou for Lesson 1
      const bunpouData = [
        {
          title: '1. N1 は N2 です (N1 N2 dir)',
          structure: 'N1 [Ot] は N2 [Ot] です',
          explanationUz: 'は (wa deb oʻqiladi) — mavzu koʻmakchisi (partikl) boʻlib, gap nima haqida ekanligini bildiradi. です (desu) — kesimlik qoʻshimchasi boʻlib, "dir / hisoblanadi" maʼnosini beradi va muloyimlik ohangini ifodalaydi.',
          explanationRu: 'Частица は выделяет тему предложения. です является связкой вежливого стиля.',
          examples: [
            { japanese: 'わたしは マイク・ミラーです。', romaji: 'Watashi wa Maiku Miraa desu.', uzbek: 'Men Mayk Millerdirman.' },
            { japanese: 'サントスさんは ブラジルじんです。', romaji: 'Santosu-san wa Burajiru-jin desu.', uzbek: 'Janob Santos braziliyalikdir.' },
            { japanese: 'わたしは がくせいです。', romaji: 'Watashi wa gakusei desu.', uzbek: 'Men talabaman.' },
          ],
          order: 1,
        },
        {
          title: '2. N1 は N2 じゃ ありません (N1 N2 emas)',
          structure: 'N1 は N2 じゃ ありません (yoki ではありません)',
          explanationUz: 'です ning inkor shakli じゃ ありません (ogʻzaki) yoki ではありません (rasmiy, yozma) shaklida boʻladi.',
          explanationRu: 'Отрицательная форма связки です: じゃ ありません или ではありません.',
          examples: [
            { japanese: 'サントスさんは がくせいじゃ ありません。', romaji: 'Santosu-san wa gakusei ja arimasen.', uzbek: 'Janob Santos talaba emas.' },
            { japanese: 'わたしは せんせいでは ありません。', romaji: 'Watashi wa sensei dewa arimasen.', uzbek: 'Men oʻqituvchi emasman.' },
          ],
          order: 2,
        },
        {
          title: '3. N1 は N2 ですか (N1 N2 mi?)',
          structure: 'N1 は N2 ですか',
          explanationUz: 'か (ka) — yapon tilida soʻroq yuklamasi boʻlib, gap oxiriga qoʻshiladi. Savol berilganda gap ohangi biroz koʻtariladi va soʻroq belgisi (?) shart emas.',
          explanationRu: 'Частица か в конце предложения образует вопросительное предложение.',
          examples: [
            { japanese: 'ミラーさんは アメリカじんですか。', romaji: 'Miraa-san wa Amerika-jin desu ka.', uzbek: 'Janob Miller amerikalikmi?' },
            { japanese: 'はい、アメリカじんです。', romaji: 'Hai, Amerika-jin desu.', uzbek: 'Ha, amerikalik.' },
            { japanese: 'いいえ、アメリカじんじゃ ありません。', romaji: 'Iie, Amerika-jin ja arimasen.', uzbek: 'Yoʻq, amerikalik emas.' },
          ],
          order: 3,
        },
        {
          title: '4. N も (N ham)',
          structure: 'N1 も ...',
          explanationUz: 'も (mo) — "ham" maʼnosini beruvchi partikl. Oldingi gapdagi holat takrorlanganda は oʻrniga も ishlatiladi.',
          explanationRu: 'Частица も означает «тоже, также».',
          examples: [
            { japanese: 'ミラーさんは かいしゃいんです。グプタさんも かいしゃいんです。', romaji: 'Miraa-san wa kaishain desu. Guputa-san mo kaishain desu.', uzbek: 'Miller kompaniya xodimi. Gupta ham kompaniya xodimi.' },
          ],
          order: 4,
        },
      ];

      for (const item of bunpouData) {
        await this.prisma.bunpouItem.create({
          data: {
            lessonId: lesson1.id,
            ...item,
          },
        });
      }

      // Seed Kanji for Lesson 1
      const kanjiData = [
        {
          character: '一',
          onyomi: 'イチ, イツ (ICHI, ITSU)',
          kunyomi: 'ひと, ひと・つ (hito, hito-tsu)',
          meaningUz: 'Bir (1)',
          meaningRu: 'Один',
          strokeCount: 1,
          radical: '一',
          examples: [
            { word: '一つ', reading: 'ひとつ (hitotsu)', meaning: 'Bitta' },
            { word: '一日', reading: 'ついたち / いちにち (tsuitachi / ichinichi)', meaning: 'Oyning 1-kuni / bir kun' },
            { word: '一人', reading: 'ひとり (hitori)', meaning: 'Bir kishi (yolgʻiz)' },
          ],
          order: 1,
        },
        {
          character: '二',
          onyomi: 'ニ (NI)',
          kunyomi: 'ふた, ふた・つ (futa, futa-tsu)',
          meaningUz: 'Ikki (2)',
          meaningRu: 'Два',
          strokeCount: 2,
          radical: '二',
          examples: [
            { word: '二つ', reading: 'ふたつ (futatsu)', meaning: 'Ikkita' },
            { word: '二月', reading: 'にがつ (nigatsu)', meaning: 'Fevral' },
            { word: '二人', reading: 'ふたり (futari)', meaning: 'Ikki kishi' },
          ],
          order: 2,
        },
        {
          character: '三',
          onyomi: 'サン (SAN)',
          kunyomi: 'み, み・つ, みっ・つ (mi, mi-tsu, mit-tsu)',
          meaningUz: 'Uch (3)',
          meaningRu: 'Три',
          strokeCount: 3,
          radical: '一',
          examples: [
            { word: '三つ', reading: 'みっつ (mittsu)', meaning: 'Uchta' },
            { word: '三月', reading: 'さんがつ (sangatsu)', meaning: 'Mart' },
            { word: '三人', reading: 'さんにん (sannin)', meaning: 'Uch kishi' },
          ],
          order: 3,
        },
        {
          character: '日',
          onyomi: 'ニチ, ジツ (NICHI, JITSU)',
          kunyomi: 'ひ, -び, -か (hi, -bi, -ka)',
          meaningUz: 'Quyosh, kun, Yaponiyaga ishora',
          meaningRu: 'Солнце, день',
          strokeCount: 4,
          radical: '日',
          examples: [
            { word: '日曜日', reading: 'にちようび (nichiyoubi)', meaning: 'Yakshanba' },
            { word: '日本', reading: 'にほん / にっぽん (nihon / nippon)', meaning: 'Yaponiya' },
            { word: '毎日', reading: 'まいにち (mainichi)', meaning: 'Har kuni' },
          ],
          order: 4,
        },
      ];

      for (const item of kanjiData) {
        await this.prisma.kanjiItem.create({
          data: {
            lessonId: lesson1.id,
            ...item,
          },
        });
      }

      // Seed Renshuu / Choukai for Lesson 1
      const renshuuData = [
        {
          type: 'QUIZ' as const,
          question: 'Quyidagi gapdagi boʻsh joyga mos partiklni tanlang:\nわたし ___ がくせいです。',
          options: ['は (wa)', 'が (ga)', 'を (o)', 'に (ni)'],
          correctAnswer: 'は (wa)',
          explanation: 'Mavzu koʻrsatkichi sifatida "は" (wa) partikli ishlatiladi. Men talabaman = わたしは がくせいです。',
          order: 1,
        },
        {
          type: 'QUIZ' as const,
          question: '"Tanaka xonim shifokor emas" jumlasining toʻgʻri yaponcha tarjimasini toping:',
          options: [
            'たなかさんは いしゃじゃ ありません。',
            'たなかさんは いしゃです。',
            'たなかさんは いしゃですか。',
            'たなかさんも いしゃです。',
          ],
          correctAnswer: 'たなかさんは いしゃじゃ ありません。',
          explanation: 'Emas inkor shakli uchun "じゃ ありません" (ja arimasen) qoʻllaniladi.',
          order: 2,
        },
        {
          type: 'QUIZ' as const,
          question: 'Birinchi marotaba uchrashganda salomlashish va tanishish iborasi qaysi?',
          options: [
            'はじめまして (Hajimemashite)',
            'さようなら (Sayounara)',
            'ありがとう ございます (Arigatou gozaimasu)',
            'おやすみなさい (Oyasuminasai)',
          ],
          correctAnswer: 'はじめまして (Hajimemashite)',
          explanation: 'Yangi odam bilan ilk bor uchrashganda "はじめまして" deyiladi.',
          order: 3,
        },
        {
          type: 'FILL_BLANK' as const,
          question: 'A: ミラーさんは アメリカじんですか。\nB: はい、アメリカじん _____。',
          options: ['です', 'じゃ ありません', 'ですか', 'でした'],
          correctAnswer: 'です',
          explanation: '"Ha (Hai)" deb tasdiqlanganda ijobiy shakl "です" ishlatiladi.',
          order: 4,
        },
        {
          type: 'AUDIO_LISTENING' as const,
          question: 'Tinglang va suhbatdosh qaysi kasb egasi ekanligini belgilang:\n(Suhbat: "わたしは エンジニアです。")',
          options: ['Muhandis (Engineer)', 'Shifokor (Doctor)', 'Oʻqituvchi (Teacher)', 'Talaba (Student)'],
          correctAnswer: 'Muhandis (Engineer)',
          explanation: 'エンジニア (enjinia) soʻzi muhandis / injener maʼnosini anglatadi.',
          order: 5,
        },
      ];

      for (const item of renshuuData) {
        await this.prisma.renshuuItem.create({
          data: {
            lessonId: lesson1.id,
            ...item,
          },
        });
      }

      // 6. Create Lesson 2 in Module 1
      const lesson2 = await this.prisma.lesson.create({
        data: {
          moduleId: module1.id,
          title: '2-dars: Buyumlar va koʻrsatish olmoshlari (Kore, Sore, Are)',
          japaneseTitle: '第2課 (Dai 2 Ka)',
          slug: 'lesson-2',
          order: 2,
          summary: 'Bu darsda buyumlarni koʻrsatish (kore/sore/are), kishi egaligi (no partikli) va buyumlar nomlarini oʻrganasiz.',
          kaiwaScenario: {
            topic: 'Yoʻqolgan yoki yangi buyum haqida soʻrash',
            partnerName: 'Yamada-san',
            goal: 'Stol ustidagi buyum kimga tegishli ekanligini soʻrang.',
          }
        },
      });

      // Quick Kotoba for Lesson 2
      const kotobaLesson2 = [
        { word: 'これ', furigana: 'これ', romaji: 'kore', meaningUz: 'bu (gapiruvchiga yaqin)', meaningRu: 'это', meaningEn: 'this', partOfSpeech: 'Olmosh', sampleSentence: 'これは ほんです。', sampleSentenceUz: 'Bu kitob.', order: 1 },
        { word: 'それ', furigana: 'それ', romaji: 'sore', meaningUz: 'shu (tinglovchiga yaqin)', meaningRu: 'то', meaningEn: 'that', partOfSpeech: 'Olmosh', sampleSentence: 'それは なんですか。', sampleSentenceUz: 'Shu nima?', order: 2 },
        { word: 'あれ', furigana: 'あれ', romaji: 'are', meaningUz: 'ana u (ikkalasidan ham uzoq)', meaningRu: 'вон то', meaningEn: 'that over there', partOfSpeech: 'Olmosh', sampleSentence: 'あれは くるまです。', sampleSentenceUz: 'Ana u mashina.', order: 3 },
        { word: 'ほん', furigana: 'ほん', romaji: 'hon', meaningUz: 'kitob', meaningRu: 'книга', meaningEn: 'book', partOfSpeech: 'Ot', sampleSentence: 'にほんごの ほんです。', sampleSentenceUz: 'Yapon tili kitobi.', order: 4 },
        { word: 'じしょ', furigana: 'じしょ', romaji: 'jisho', meaningUz: 'lugʻat', meaningRu: 'словарь', meaningEn: 'dictionary', partOfSpeech: 'Ot', sampleSentence: 'これは じしょです。', sampleSentenceUz: 'Bu lugʻat.', order: 5 },
      ];

      for (const item of kotobaLesson2) {
        await this.prisma.kotobaItem.create({
          data: {
            lessonId: lesson2.id,
            ...item,
          },
        });
      }

      // Quick Bunpou for Lesson 2
      await this.prisma.bunpouItem.create({
        data: {
          lessonId: lesson2.id,
          title: '1. これ / それ / あれ (Ko-So-A-Do tizimi)',
          structure: 'これ / それ / あれ は N です',
          explanationUz: 'これ — gapiruvchiga yaqin boʻlgan buyumlar uchun; それ — tinglovchiga yaqin boʻlgan buyumlar uchun; あれ — ikkala suhbatdoshdan ham uzoqda joylashgan buyumlar uchun ishlatiladi.',
          examples: [
            { japanese: 'これは じしょです。', romaji: 'Kore wa jisho desu.', uzbek: 'Bu lugʻat.' },
            { japanese: 'それは わたしのかばんです。', romaji: 'Sore wa watashi no kaban desu.', uzbek: 'Shu mening sumkam.' },
          ],
          order: 1,
        },
      });

      // Quick Kanji for Lesson 2
      await this.prisma.kanjiItem.create({
        data: {
          lessonId: lesson2.id,
          character: '本',
          onyomi: 'ホン (HON)',
          kunyomi: 'もと (moto)',
          meaningUz: 'Kitob, asos, ildiz',
          strokeCount: 5,
          radical: '木',
          examples: [
            { word: '本', reading: 'ほん (hon)', meaning: 'Kitob' },
            { word: '日本', reading: 'にほん (nihon)', meaning: 'Yaponiya' },
          ],
          order: 1,
        },
      });

      // Lesson 3, 4, 5 placeholders in Module 1
      for (let i = 3; i <= 5; i++) {
        await this.prisma.lesson.create({
          data: {
            moduleId: module1.id,
            title: `${i}-dars: ${i === 3 ? 'Joylar va binolar (Koko, Soko, Asoko)' : i === 4 ? 'Vaqt, soatlar va kunlar' : 'Harakat feʼllari (Ikimasu, Kimasu)'}`,
            japaneseTitle: `第${i}課 (Dai ${i} Ka)`,
            slug: `lesson-${i}`,
            order: i,
            summary: `Minna no Nihongo ${i}-dars materiallari.`,
          },
        });
      }

      this.logger.log('Boshlangʻich kurslar va darslar muvaffaqiyatli seed qilindi! 🎉');
    } catch (err) {
      this.logger.error('Kurslarni seed qilishda xatolik:', err);
    }
  }
}
