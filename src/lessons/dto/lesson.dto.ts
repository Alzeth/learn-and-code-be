export class LessonDto {
  id: string;
  title: string;
  href: string;
  description: string;
  date: string;
  datetime: string;
  icon: string;
}

export class LessonsResponseDto {
  lessons: LessonDto[];
}
