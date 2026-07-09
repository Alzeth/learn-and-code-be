import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { LessonDto, LessonsResponseDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<LessonsResponseDto> {
    const lessons = await this.prisma.lesson.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return {
      lessons: lessons.map((lesson): LessonDto => this.toDto(lesson)),
    };
  }

  async findOne(id: string): Promise<LessonDto | null> {
    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return null;
    return this.toDto(lesson);
  }

  async findTheory(id: string): Promise<string | null> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select: { theoryMd: true },
    });
    return lesson?.theoryMd ?? null;
  }

  private toDto(lesson: {
    id: string;
    title: string;
    description: string | null;
    icon: string | null;
    date: Date | null;
  }): LessonDto {
    return {
      id: lesson.id,
      title: lesson.title,
      href: `/lessons/${lesson.id}`,
      description: lesson.description ?? '',
      date:
        lesson.date?.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) ?? '',
      datetime: lesson.date?.toISOString().split('T')[0] ?? '',
      icon: lesson.icon ?? 'code',
    };
  }
}
