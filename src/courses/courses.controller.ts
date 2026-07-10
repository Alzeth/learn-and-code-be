import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { ResponseEntity } from '../interfaces/response.entity';
import { responseMapping } from '../utils/response-map.util';
import { CoursesService } from './courses.service';
import { CourseDto, CoursesDto } from './dto/course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(): Promise<ResponseEntity<CoursesDto>> {
    return responseMapping(await this.coursesService.findAll(), null);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseEntity<CourseDto>> {
    const course = await this.coursesService.findOne(id);
    if (!course)
      throw new NotFoundException(responseMapping(null, { message: `Course ${id} not found` }));
    return responseMapping(course, null);
  }
}
