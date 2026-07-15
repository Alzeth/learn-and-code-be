import 'dotenv/config';

import { ConsoleLogger } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const logger = new ConsoleLogger('Seed');

interface LessonEntry {
  id: number;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  icon: string;
}

interface LessonTranslationEntry {
  href: string;
  title: string;
  description: string;
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

interface CourseTranslationEntry {
  id: string;
  title: string;
  description: string;
}

interface CoursesJson {
  courses: CourseEntry[];
}

interface LessonsJson {
  lessons: LessonEntry[];
}

interface LessonsI18nJson {
  lessons: LessonTranslationEntry[];
}

interface CoursesI18nJson {
  courses: CourseTranslationEntry[];
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const coursesJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'),
) as CoursesJson;

const lessonsJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'lessons.json'), 'utf-8'),
) as LessonsJson;

const i18nDir = path.join(__dirname, 'i18n');
const theoryDir = path.join(__dirname, 'theory');

function loadI18nLessons(locale: string): LessonTranslationEntry[] {
  const filePath = path.join(i18nDir, `lessons.${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  return (JSON.parse(fs.readFileSync(filePath, 'utf-8')) as LessonsI18nJson).lessons;
}

function loadI18nCourses(locale: string): CourseTranslationEntry[] {
  const filePath = path.join(i18nDir, `courses.${locale}.json`);
  if (!fs.existsSync(filePath)) return [];
  return (JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CoursesI18nJson).courses;
}

function discoverLocales(): string[] {
  if (!fs.existsSync(i18nDir)) return [];
  const locales = new Set<string>();
  for (const file of fs.readdirSync(i18nDir)) {
    const match = /^(?:lessons|courses)\.([a-z]{2})\.json$/.exec(file);
    if (match) locales.add(match[1]);
  }
  return [...locales];
}

async function main() {
  const knownLessonIds = new Set(lessonsJson.lessons.map((l) => l.href));
  const locales = discoverLocales();

  for (const lesson of lessonsJson.lessons) {
    const legacyTheoryPath = path.join(theoryDir, `${lesson.href}.md`);
    const theoryMd = fs.existsSync(legacyTheoryPath)
      ? fs.readFileSync(legacyTheoryPath, 'utf-8')
      : '';

    await prisma.lesson.upsert({
      where: { id: lesson.href },
      update: { title: lesson.title, description: lesson.description, theoryMd },
      create: {
        id: lesson.href,
        title: lesson.title,
        description: lesson.description,
        icon: lesson.icon,
        date: new Date(lesson.datetime),
        theoryMd,
      },
    });
    logger.log(`✓ Lesson: ${lesson.href}`);
  }

  for (const locale of locales) {
    const entries = loadI18nLessons(locale);
    for (const entry of entries) {
      const theoryPath = path.join(theoryDir, `${locale}`, `${entry.href}.md`);
      const legacyTheoryPath = path.join(theoryDir, `${entry.href}.md`);
      const theoryMd = fs.existsSync(theoryPath)
        ? fs.readFileSync(theoryPath, 'utf-8')
        : fs.existsSync(legacyTheoryPath)
          ? fs.readFileSync(legacyTheoryPath, 'utf-8')
          : null;

      await prisma.lessonTranslation.upsert({
        where: { lessonId_locale: { lessonId: entry.href, locale } },
        update: { title: entry.title, description: entry.description, theoryMd },
        create: {
          lessonId: entry.href,
          locale,
          title: entry.title,
          description: entry.description,
          theoryMd,
        },
      });
      logger.log(`  ✓ LessonTranslation [${locale}]: ${entry.href}`);
    }
  }

  for (const course of coursesJson.courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: { title: course.title, description: course.description },
      create: {
        id: course.id,
        title: course.title,
        description: course.description,
      },
    });
    logger.log(`✓ Course: ${course.id}`);

    let position = 0;
    for (const entry of course.tableOfContents) {
      if (!knownLessonIds.has(entry.id)) {
        logger.warn(`  ⚠ Skipping ${entry.id} — not in lessons.json`);
        continue;
      }

      const prevLessonId =
        entry.prevLesson && knownLessonIds.has(entry.prevLesson) ? entry.prevLesson : null;
      const nextLessonId =
        entry.nextLesson && knownLessonIds.has(entry.nextLesson) ? entry.nextLesson : null;

      await prisma.courseLesson.upsert({
        where: { courseId_lessonId: { courseId: course.id, lessonId: entry.id } },
        update: { position, prevLessonId, nextLessonId },
        create: { courseId: course.id, lessonId: entry.id, position, prevLessonId, nextLessonId },
      });
      position++;
      logger.log(`  ✓ CourseLesson: ${course.id} → ${entry.id}`);
    }
  }

  for (const locale of locales) {
    const entries = loadI18nCourses(locale);
    for (const entry of entries) {
      await prisma.courseTranslation.upsert({
        where: { courseId_locale: { courseId: entry.id, locale } },
        update: { title: entry.title, description: entry.description },
        create: { courseId: entry.id, locale, title: entry.title, description: entry.description },
      });
      logger.log(`  ✓ CourseTranslation [${locale}]: ${entry.id}`);
    }
  }

  logger.log('Seed complete ✅');
}

main()
  .catch((e: unknown) => logger.error(e))
  .finally(() => prisma.$disconnect());
