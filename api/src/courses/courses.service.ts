import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProgressDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async getUserStats(userId?: string) {
    if (!userId) {
      const totalLessons = await this.prisma.lesson.count({ where: { isPublished: true } });
      return {
        streakDays: 0,
        wordsLearned: 0,
        completedLessons: 0,
        totalLessons: totalLessons || 50,
        n5ProgressPercent: 0,
        recentLessons: [],
      };
    }

    const [completedProgress, totalLessons, totalN5Lessons, completedN5Lessons] = await Promise.all([
      this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        include: {
          lesson: {
            include: {
              kotobaItems: { select: { id: true } },
              module: { include: { course: true } },
            },
          },
        },
        orderBy: { lastStudiedAt: 'desc' },
      }),
      this.prisma.lesson.count({ where: { isPublished: true } }),
      this.prisma.lesson.count({
        where: {
          isPublished: true,
          module: { course: { level: 'N5' } },
        },
      }),
      this.prisma.userLessonProgress.count({
        where: {
          userId,
          isCompleted: true,
          lesson: { module: { course: { level: 'N5' } } },
        },
      }),
    ]);

    // Calculate words learned (Kotoba items in completed lessons)
    const wordsLearned = completedProgress.reduce(
      (sum, p) => sum + (p.lesson?.kotobaItems?.length || 0),
      0,
    );

    // Calculate streak days
    const studyDates = completedProgress
      .map((p) => p.lastStudiedAt)
      .filter(Boolean)
      .map((d) => new Date(d!).toISOString().split('T')[0]);
    const uniqueDays = Array.from(new Set(studyDates));
    const streakDays = uniqueDays.length;

    const n5ProgressPercent =
      totalN5Lessons > 0 ? Math.round((completedN5Lessons / totalN5Lessons) * 100) : 0;

    const recentLessons = completedProgress.slice(0, 3).map((p) => ({
      id: p.lesson.id,
      title: p.lesson.title,
      japaneseTitle: p.lesson.japaneseTitle,
      courseTitle: p.lesson.module.course.title,
      courseSlug: p.lesson.module.course.slug,
      isCompleted: p.isCompleted,
      quizScore: p.quizScore,
    }));

    return {
      streakDays: streakDays > 0 ? streakDays : 1,
      wordsLearned: wordsLearned > 0 ? wordsLearned : 0,
      completedLessons: completedProgress.length,
      totalLessons: totalLessons || 50,
      n5ProgressPercent,
      recentLessons,
    };
  }

  async getCourses(userId?: string) {
    const courses = await this.prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { order: 'asc' },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        modules: {
          include: {
            lessons: {
              where: { isPublished: true },
              select: { id: true },
            },
          },
        },
      },
    });

    // If user is authenticated, compute progress for each course
    let userProgressMap: Record<string, number> = {};
    if (userId) {
      const completedProgress = await this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          isCompleted: true,
        },
        select: { lessonId: true },
      });
      const completedLessonIds = new Set(completedProgress.map((p) => p.lessonId));

      for (const course of courses) {
        const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
        const total = allLessonIds.length;
        if (total === 0) {
          userProgressMap[course.id] = 0;
        } else {
          const completedCount = allLessonIds.filter((id) => completedLessonIds.has(id)).length;
          userProgressMap[course.id] = Math.round((completedCount / total) * 100);
        }
      }
    }

    return courses.map((course) => {
      const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
      const totalModules = course.modules.length;
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        level: course.level,
        coverImage: course.coverImage,
        author: course.author,
        totalLessons,
        totalModules,
        progress: userProgressMap[course.id] || 0,
      };
    });
  }

  async getCourseDetails(courseIdOrSlug: string, userId?: string) {
    const course = await this.prisma.course.findFirst({
      where: {
        OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }],
        isPublished: true,
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                japaneseTitle: true,
                slug: true,
                order: true,
                summary: true,
                _count: {
                  select: {
                    kotobaItems: true,
                    bunpouItems: true,
                    kanjiItems: true,
                    renshuuItems: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Kurs topilmadi');
    }

    // Get user progress for all lessons in this course
    let progressMap: Record<string, { isCompleted: boolean; quizScore?: number; completedSections?: string[] }> = {};
    if (userId) {
      const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
      const userProgress = await this.prisma.userLessonProgress.findMany({
        where: {
          userId,
          lessonId: { in: allLessonIds },
        },
      });
      userProgress.forEach((p) => {
        progressMap[p.lessonId] = {
          isCompleted: p.isCompleted,
          quizScore: p.quizScore ?? undefined,
          completedSections: (p.completedSections as string[]) || [],
        };
      });
    }

    // Determine lock state: first lesson is always unlocked; subsequent lessons unlock if previous is completed
    let previousLessonCompleted = true;
    const modulesWithState = course.modules.map((mod) => {
      const lessonsWithState = mod.lessons.map((lesson) => {
        const prog = progressMap[lesson.id];
        const isCompleted = prog?.isCompleted || false;
        const isCurrent = !isCompleted && previousLessonCompleted;
        const isLocked = !previousLessonCompleted && !isCompleted;

        // update flag for next lesson
        previousLessonCompleted = isCompleted;

        return {
          ...lesson,
          status: isCompleted ? 'COMPLETED' : isCurrent ? 'CURRENT' : isLocked ? 'LOCKED' : 'AVAILABLE',
          isCompleted,
          isLocked,
          quizScore: prog?.quizScore || null,
          completedSections: prog?.completedSections || [],
          counts: lesson._count,
        };
      });

      return {
        ...mod,
        lessons: lessonsWithState,
      };
    });

    const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
    const completedLessons = Object.values(progressMap).filter((p) => p.isCompleted).length;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      level: course.level,
      coverImage: course.coverImage,
      author: course.author,
      totalLessons,
      completedLessons,
      progressPercent: overallProgress,
      modules: modulesWithState,
    };
  }

  async getLesson(lessonId: string, userId?: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: {
              include: {
                modules: {
                  orderBy: { order: 'asc' },
                  include: {
                    lessons: {
                      where: { isPublished: true },
                      orderBy: { order: 'asc' },
                      select: { id: true, title: true, order: true },
                    },
                  },
                },
              },
            },
            lessons: {
              where: { isPublished: true },
              orderBy: { order: 'asc' },
              select: { id: true, title: true, order: true },
            },
          },
        },
        kotobaItems: { orderBy: { order: 'asc' } },
        bunpouItems: { orderBy: { order: 'asc' } },
        kanjiItems: { orderBy: { order: 'asc' } },
        renshuuItems: { orderBy: { order: 'asc' } },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Dars topilmadi');
    }

    // Flatten all course lessons in chronological order
    const allCourseLessons = lesson.module.course.modules.flatMap((m) => m.lessons);
    const currentIndex = allCourseLessons.findIndex((l) => l.id === lesson.id);
    const prevLesson = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allCourseLessons.length - 1 ? allCourseLessons[currentIndex + 1] : null;

    let userProgress: any = null;
    let isLocked = false;

    if (userId) {
      userProgress = await this.prisma.userLessonProgress.findUnique({
        where: {
          userId_lessonId: {
            userId,
            lessonId,
          },
        },
      });

      // Check if previous lesson is completed (if this is not the 1st lesson)
      if (prevLesson && !userProgress?.isCompleted) {
        const prevProgress = await this.prisma.userLessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId,
              lessonId: prevLesson.id,
            },
          },
        });
        if (!prevProgress || !prevProgress.isCompleted) {
          isLocked = true;
        }
      }
    } else if (currentIndex > 0) {
      // Unauthenticated users can only preview Lesson 1 for free
      isLocked = false;
    }

    return {
      id: lesson.id,
      title: lesson.title,
      japaneseTitle: lesson.japaneseTitle,
      slug: lesson.slug,
      order: lesson.order,
      videoUrl: lesson.videoUrl,
      summary: lesson.summary,
      kaiwaScenario: lesson.kaiwaScenario,
      isLocked,
      module: {
        id: lesson.module.id,
        title: lesson.module.title,
        courseId: lesson.module.course.id,
        courseTitle: lesson.module.course.title,
        courseSlug: lesson.module.course.slug,
      },
      navigation: {
        prevLesson,
        nextLesson,
      },
      content: {
        kotoba: lesson.kotobaItems,
        bunpou: lesson.bunpouItems,
        kanji: lesson.kanjiItems,
        renshuu: lesson.renshuuItems,
      },
      userProgress: userProgress
        ? {
            completedSections: (userProgress.completedSections as string[]) || [],
            quizScore: userProgress.quizScore,
            isCompleted: userProgress.isCompleted,
            lastStudiedAt: userProgress.lastStudiedAt,
          }
        : {
            completedSections: [],
            quizScore: null,
            isCompleted: false,
          },
    };
  }

  async updateProgress(userId: string, lessonId: string, dto: UpdateProgressDto) {
    const existing = await this.prisma.userLessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    let currentSections: string[] = (existing?.completedSections as string[]) || [];
    if (dto.completedSections && Array.isArray(dto.completedSections)) {
      const merged = new Set([...currentSections, ...dto.completedSections]);
      currentSections = Array.from(merged);
    }

    const isCompleted =
      dto.isCompleted !== undefined
        ? dto.isCompleted
        : (dto.quizScore !== undefined && dto.quizScore >= 70) || existing?.isCompleted || false;

    const progress = await this.prisma.userLessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completedSections: currentSections,
        quizScore: dto.quizScore !== undefined ? dto.quizScore : existing?.quizScore,
        isCompleted,
        lastStudiedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completedSections: currentSections,
        quizScore: dto.quizScore ?? null,
        isCompleted,
        lastStudiedAt: new Date(),
      },
    });

    return {
      success: true,
      progress: {
        completedSections: progress.completedSections,
        quizScore: progress.quizScore,
        isCompleted: progress.isCompleted,
      },
    };
  }
}
