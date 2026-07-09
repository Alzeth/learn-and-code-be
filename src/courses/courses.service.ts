import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CourseDto, CoursesDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CoursesDto> {
    const courses = await this.prisma.course.findMany({
      include: {
        lessons: {
          include: { lesson: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    return {
      courses: courses.map((course): CourseDto => ({
        id: course.id,
        title: course.title,
        description: course.description,
        tableOfContents: course.lessons.map((cl) => ({
          id: cl.lesson.id,
          title: cl.lesson.title,
          description: cl.lesson.description,
          prevLesson: cl.prevLessonId,
          nextLesson: cl.nextLessonId,
        })),
      })),
    };
  }

  async findOne(id: string): Promise<CourseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          include: { lesson: true },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!course) return null;

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      tableOfContents: course.lessons.map((cl) => ({
        id: cl.lesson.id,
        title: cl.lesson.title,
        description: cl.lesson.description,
        prevLesson: cl.prevLessonId,
        nextLesson: cl.nextLessonId,
      })),
    };
  }
}
