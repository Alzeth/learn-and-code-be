import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ResponseEntity } from 'src/interfaces/response.entity';
import { responseMapping } from 'src/utils/response-map.util';

import { LessonDto, LessonsResponseDto } from './dto/lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll(): Promise<ResponseEntity<LessonsResponseDto>> {
    return responseMapping(await this.lessonsService.findAll(), null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseEntity<LessonDto>> {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson)
      throw new NotFoundException(responseMapping(null, { message: `Lesson ${id} not found` }));
    return responseMapping(lesson, null);
  }

  @Get(':id/theory')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  async findTheory(@Param('id') id: string): Promise<ResponseEntity<string>> {
    const theory = await this.lessonsService.findTheory(id);
    if (theory === null)
      throw new NotFoundException(responseMapping(null, { message: `Lesson ${id} not found` }));
    return responseMapping(theory, null);
  }
}
