import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n/locale.constants';
import { Locale } from '../i18n/locale.decorator';
import { ResponseEntity } from '../interfaces/response.entity';
import { responseMapping } from '../utils/response-map.util';
import { CoursesService } from './courses.service';
import { CourseDto, CoursesDto } from './dto/course.dto';

@ApiTags('courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  async findAll(@Locale() locale: SupportedLocale): Promise<ResponseEntity<CoursesDto>> {
    return responseMapping(await this.coursesService.findAll(locale), null);
  }

  @Get(':id')
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  async findOne(
    @Param('id') id: string,
    @Locale() locale: SupportedLocale,
  ): Promise<ResponseEntity<CourseDto>> {
    const course = await this.coursesService.findOne(id, locale);
    if (!course)
      throw new NotFoundException(responseMapping(null, { message: `Course ${id} not found` }));
    return responseMapping(course, null);
  }
}
