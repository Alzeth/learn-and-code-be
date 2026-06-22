export class CourseLessonDto {
  id: string;
  title: string;
  description: string | null;
  prevLesson: string | null;
  nextLesson: string | null;
}

export class CourseDto {
  id: string;
  title: string;
  description: string | null;
  tableOfContents: CourseLessonDto[];
}

export class CoursesDto {
  courses: CourseDto[];
}
