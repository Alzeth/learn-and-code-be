import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CourseProgressDto,
  LessonProgressDto,
  UserProgressDto,
} from './dto/progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async getUserProgress(userId: string): Promise<UserProgressDto> {
    const [progressRows, courses] = await Promise.all([
      this.prisma.userProgress.findMany({ where: { userId } }),
      this.prisma.course.findMany({
        include: { lessons: { select: { lessonId: true } } },
      }),
    ]);

    const completedSet = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const lessons: LessonProgressDto[] = progressRows.map(this.toDto);

    const courseProgress: CourseProgressDto[] = courses.map((course) => {
      const total = course.lessons.length;
      const completed = course.lessons.filter((cl) =>
        completedSet.has(cl.lessonId),
      ).length;
      return {
        courseId: course.id,
        totalLessons: total,
        completedLessons: completed,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
      };
    });

    return { lessons, courses: courseProgress };
  }

  async getLessonProgress(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgressDto> {
    const row = await this.prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (!row) {
      const lessonExists = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        select: { id: true },
      });
      if (!lessonExists)
        throw new NotFoundException(`Lesson ${lessonId} not found`);
      return { lessonId, completed: false, completedAt: null };
    }

    return this.toDto(row);
  }

  async markLessonCompleted(
    userId: string,
    lessonId: string,
  ): Promise<LessonProgressDto> {
    const lessonExists = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true },
    });
    if (!lessonExists)
      throw new NotFoundException(`Lesson ${lessonId} not found`);

    const row = await this.prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { userId, lessonId, completed: true, completedAt: new Date() },
    });

    return this.toDto(row);
  }

  private toDto(row: {
    lessonId: string;
    completed: boolean;
    completedAt: Date | null;
  }): LessonProgressDto {
    return {
      lessonId: row.lessonId,
      completed: row.completed,
      completedAt: row.completedAt?.toISOString() ?? null,
    };
  }
}
