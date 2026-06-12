import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.course.findMany({
      include: {
        lessons: {
          include: {
            lesson: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          include: {
            lesson: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }
}
