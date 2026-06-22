import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { responseMapping } from 'src/utils/response-map.util';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async findAll() {
    return responseMapping(await this.lessonsService.findAll(), null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lesson = responseMapping(await this.lessonsService.findOne(id), null);
    if (!lesson)
      throw new NotFoundException(
        responseMapping(null, { message: `Lesson ${id} not found` }),
      );
    return lesson;
  }
}
