import type { CourseLessonEntity } from './courses.entity';

export interface LessonEntity {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  date: Date | null;
  theoryMd: string;
  starterCode: string;
  courses?: CourseLessonEntity[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SubmissionEntity {
  id: number;
  lessonId: string;
  code: string;
  output: string | null;
  status: string;
  passed: boolean;
  createdAt: Date;
}
