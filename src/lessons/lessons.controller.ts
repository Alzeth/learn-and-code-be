import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const lesson = await this.lessonsService.findOne(id);
    if (!lesson) throw new NotFoundException(`Lesson ${id} not found`);
    return lesson;
  }
}
