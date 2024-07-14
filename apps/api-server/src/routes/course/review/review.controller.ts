import {
  Body,
  Controller,
  InternalServerErrorException,
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
}
