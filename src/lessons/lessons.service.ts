import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.lesson.findMany({
      orderBy: { createdAt: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.lesson.findUnique({
      where: { id },
      include: {
        courses: {
          include: {
            course: true,
          },
        },
      },
    });
  }
}
