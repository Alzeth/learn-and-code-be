import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { LessonDto, LessonsResponseDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(locale: string): Promise<LessonsResponseDto> {
    const lessons = await this.prisma.lesson.findMany({
      orderBy: { createdAt: 'asc' },
      include: { translations: { where: { locale } } },
    });

    return {
      lessons: lessons.map((lesson): LessonDto => {
        const t = lesson.translations[0];
        return this.toDto(lesson, t, locale);
      }),
    };
  }

  async findOne(id: string, locale: string): Promise<LessonDto | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { translations: { where: { locale } } },
    });
    if (!lesson) return null;
    return this.toDto(lesson, lesson.translations[0], locale);
  }

  async findTheory(id: string, locale: string): Promise<string | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select: {
        theoryMd: true,
        translations: { where: { locale }, select: { theoryMd: true } },
      },
    });
    if (!lesson) return null;
    return lesson.translations[0]?.theoryMd ?? lesson.theoryMd;
  }

  private toDto(
    lesson: {
      id: string;
      title: string;
      description: string | null;
      icon: string | null;
      date: Date | null;
    },
    translation: { title: string; description: string | null } | undefined,
    locale: string,
  ): LessonDto {
    return {
      id: lesson.id,
      title: translation?.title ?? lesson.title,
      href: `/lessons/${lesson.id}`,
      description: translation?.description ?? lesson.description ?? '',
      date:
        lesson.date?.toLocaleDateString(locale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) ?? '',
      datetime: lesson.date?.toISOString().split('T')[0] ?? '',
      icon: lesson.icon ?? 'code',
    };
  }
}
