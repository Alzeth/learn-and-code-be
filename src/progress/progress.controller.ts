import { Controller, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { ResponseEntity } from 'src/interfaces/response.entity';
import { responseMapping } from 'src/utils/response-map.util';

import type { CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { LessonProgressDto, UserProgressDto } from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiBearerAuth()
@ApiTags('progress')
@UseGuards(JwtAuthGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get()
  async getUserProgress(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<ResponseEntity<UserProgressDto>> {
    return responseMapping(await this.progressService.getUserProgress(user.id), null);
  }

  @Get('lessons/:lessonId')
  async getLessonProgress(
    @CurrentUser() user: CurrentUserPayload,
    @Param('lessonId') lessonId: string,
  ): Promise<ResponseEntity<LessonProgressDto>> {
    const progress = await this.progressService.getLessonProgress(user.id, lessonId);
    if (!progress)
      throw new NotFoundException(
        responseMapping(null, { message: `Lesson ${lessonId} not found` }),
      );
    return responseMapping(progress, null);
  }

  @Post('lessons/:lessonId/complete')
  async markLessonCompleted(
    @CurrentUser() user: CurrentUserPayload,
    @Param('lessonId') lessonId: string,
  ): Promise<ResponseEntity<LessonProgressDto>> {
    return responseMapping(await this.progressService.markLessonCompleted(user.id, lessonId), null);
  }
}
