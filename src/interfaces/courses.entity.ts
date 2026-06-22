export interface CourseLessonEntity {
  courseId: string;
  lessonId: string;
  position: number;
  prevLessonId: string | null;
  nextLessonId: string | null;
}

export interface CourseEntity {
  id: string;
  title: string;
  description: string | null;
  lessons: CourseLessonEntity[];
  createdAt: Date;
  updatedAt: Date;
}
