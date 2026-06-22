import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { responseMapping } from 'src/utils/response-map.util';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll() {
    return responseMapping(await this.coursesService.findAll(), null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const course = await this.coursesService.findOne(id);
    if (!course)
      throw new NotFoundException(
        responseMapping(null, { message: `Course ${id} not found` }),
      );
    return responseMapping(course, null);
  }
}
