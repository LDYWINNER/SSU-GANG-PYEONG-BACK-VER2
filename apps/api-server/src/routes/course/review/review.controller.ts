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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { ReviewService } from './review.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../../common/decorators/user-info.decorator';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { ReactCourseReviewDto } from './dto/react-course-review.dto';

@Controller('course/review')
@ApiTags('Course Review')
@UseGuards(ThrottlerBehindProxyGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiBearerAuth('access-token')
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

  @Post('reaction')
  @ApiBearerAuth('access-token')
  async createReviewReaction(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: ReactCourseReviewDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.createCourseReviewReaction(
        userId,
        data,
      );
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create review like for review id ${data.courseReviewId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('reaction/:id')
  @ApiBearerAuth('access-token')
  async getReviewReaction(@Param('id') id: string) {
    try {
      const result = await this.reviewService.getCourseReviewReaction(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to get reactions for course review id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('reaction')
  @ApiBearerAuth('access-token')
  async deleteReviewReaction(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: ReactCourseReviewDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.removeCourseReviewReaction(
        userId,
        data,
      );
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete like for course review id ${data.courseReviewId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('my-scrapped')
  @ApiBearerAuth('access-token')
  async getMyScrappedReviews(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const result = await this.reviewService.getMyScrappedCourseReview(userId);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to get scrapped reviews for user id ${userId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
