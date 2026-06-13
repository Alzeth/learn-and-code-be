import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'fs';
import * as path from 'path';

interface LessonEntry {
  id: number;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  icon: string;
}

interface CourseTocEntry {
  id: string;
  title: string;
  description: string;
  prevLesson?: string;
  nextLesson?: string;
}

interface CourseEntry {
  id: string;
  title: string;
  description: string;
  tableOfContents: CourseTocEntry[];
}

interface CoursesJson {
  courses: CourseEntry[];
}

interface LessonsJson {
  lessons: LessonEntry[];
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const coursesJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'),
) as CoursesJson;

const lessonsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'lessons.json'), 'utf-8'),
) as LessonsJson;

async function main() {
  // Build a set of known lesson IDs (hrefs) for quick lookup
  const knownLessonIds = new Set(lessonsJson.lessons.map((l) => l.href));

  // 1. Seed lessons
  for (const lesson of lessonsJson.lessons) {
    const theoryPath = path.join(__dirname, 'theory', `${lesson.href}.md`);
    const theoryMd = fs.existsSync(theoryPath)
      ? fs.readFileSync(theoryPath, 'utf-8')
      : '';

    await prisma.lesson.upsert({
      where: { id: lesson.href },
      update: {},
      create: {
        id: lesson.href,
        title: lesson.title,
        description: lesson.description,
        icon: lesson.icon,
        date: new Date(lesson.datetime),
        theoryMd,
      },
    });
    console.log(`✓ Lesson: ${lesson.href}`);
  }

  // 2. Seed courses and CourseLesson join entries
  for (const course of coursesJson.courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        title: course.title,
        description: course.description,
      },
    });
    console.log(`✓ Course: ${course.id}`);

    let position = 0;
    for (const entry of course.tableOfContents) {
      if (!knownLessonIds.has(entry.id)) {
        console.warn(`  ⚠ Skipping ${entry.id} — not in lessons.json`);
        continue;
      }

      // Only store prev/next if they point to real lessons
      const prevLessonId =
        entry.prevLesson && knownLessonIds.has(entry.prevLesson)
          ? entry.prevLesson
          : null;

      const nextLessonId =
        entry.nextLesson && knownLessonIds.has(entry.nextLesson)
          ? entry.nextLesson
          : null;

      await prisma.courseLesson.upsert({
        where: {
          courseId_lessonId: { courseId: course.id, lessonId: entry.id },
        },
        update: {},
        create: {
          courseId: course.id,
          lessonId: entry.id,
          position: position++,
          prevLessonId,
          nextLessonId,
        },
      });
      console.log(`  ✓ CourseLesson: ${course.id} → ${entry.id}`);
    }
  }

  console.log('\nSeed complete ✅');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
