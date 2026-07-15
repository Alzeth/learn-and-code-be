import { Controller, Get, Header, NotFoundException, Param } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { SUPPORTED_LOCALES, type SupportedLocale } from '../i18n/locale.constants';
import { Locale } from '../i18n/locale.decorator';
import { ResponseEntity } from '../interfaces/response.entity';
import { responseMapping } from '../utils/response-map.util';
import { LessonDto, LessonsResponseDto } from './dto/lesson.dto';
import { LessonsService } from './lessons.service';

@ApiTags('lessons')
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  async findAll(@Locale() locale: SupportedLocale): Promise<ResponseEntity<LessonsResponseDto>> {
    return responseMapping(await this.lessonsService.findAll(locale), null);
  }

  @Get(':id')
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  async findOne(
    @Param('id') id: string,
    @Locale() locale: SupportedLocale,
  ): Promise<ResponseEntity<LessonDto>> {
    const lesson = await this.lessonsService.findOne(id, locale);
    if (!lesson)
      throw new NotFoundException(responseMapping(null, { message: `Lesson ${id} not found` }));
    return responseMapping(lesson, null);
  }

  @Get(':id/theory')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiQuery({ name: 'lang', required: false, enum: SUPPORTED_LOCALES })
  async findTheory(
    @Param('id') id: string,
    @Locale() locale: SupportedLocale,
  ): Promise<ResponseEntity<string>> {
    const theory = await this.lessonsService.findTheory(id, locale);
    if (theory === null)
      throw new NotFoundException(responseMapping(null, { message: `Lesson ${id} not found` }));
    return responseMapping(theory, null);
  }
}
