import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { ReviewService } from './review.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';

@Controller('course/review')
@ApiTags('Course Review')
@UseGuards(ThrottlerBehindProxyGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async createCourseReview(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: CreateCourseReviewDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.createCourseReview(userId, data);
      if (!result) {
        throw new InternalServerErrorException(
          'Failed to create course review',
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Post('like/:id')
  async createReviewLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.likeCourseReview(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create review like for review id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('like/:id')
  async countReviewLike(@Param('id') id: string) {
    try {
      const result = await this.reviewService.countLikes(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to count likes for review id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('like/:id')
  async deleteReviewLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.unlikeCourseReview(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete like for review id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
