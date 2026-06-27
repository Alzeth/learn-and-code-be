export class LessonProgressDto {
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
}

export class CourseProgressDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  percentage: number;
}

export class UserProgressDto {
  lessons: LessonProgressDto[];
  courses: CourseProgressDto[];
}
