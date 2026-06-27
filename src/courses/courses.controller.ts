import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CourseDto, CoursesDto } from './dto/course.dto';
import { responseMapping } from 'src/utils/response-map.util';
import { ResponseEntity } from 'src/interfaces/response.entity';

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
      throw new NotFoundException(
        responseMapping(null, { message: `Course ${id} not found` }),
      );
    return responseMapping(course, null);
  }
}
