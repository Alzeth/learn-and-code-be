import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CourseDto, CoursesDto } from './dto/course.dto';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(locale: string): Promise<CoursesDto> {
    const courses = await this.prisma.course.findMany({
      include: {
        translations: { where: { locale } },
        lessons: {
          include: {
            lesson: { include: { translations: { where: { locale } } } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    return {
      courses: courses.map((course): CourseDto => {
        const ct = course.translations[0];
        return {
          id: course.id,
          title: ct?.title ?? course.title,
          description: ct?.description ?? course.description,
          tableOfContents: course.lessons.map((cl) => {
            const lt = cl.lesson.translations[0];
            return {
              id: cl.lesson.id,
              title: lt?.title ?? cl.lesson.title,
              description: lt?.description ?? cl.lesson.description,
              prevLesson: cl.prevLessonId,
              nextLesson: cl.nextLessonId,
            };
          }),
        };
      }),
    };
  }

  async findOne(id: string, locale: string): Promise<CourseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        translations: { where: { locale } },
        lessons: {
          include: {
            lesson: { include: { translations: { where: { locale } } } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!course) return null;

    const ct = course.translations[0];
    return {
      id: course.id,
      title: ct?.title ?? course.title,
      description: ct?.description ?? course.description,
      tableOfContents: course.lessons.map((cl) => {
        const lt = cl.lesson.translations[0];
        return {
          id: cl.lesson.id,
          title: lt?.title ?? cl.lesson.title,
          description: lt?.description ?? cl.lesson.description,
          prevLesson: cl.prevLessonId,
          nextLesson: cl.nextLessonId,
        };
      }),
    };
  }
}
