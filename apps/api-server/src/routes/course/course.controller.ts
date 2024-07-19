import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../common/guard/throttler-behind-proxy.guard';
import { CourseService } from './course.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  UserAfterAuth,
  UserInfo,
} from '../../common/decorators/user-info.decorator';

@Controller('course')
@ApiTags('Course')
@UseGuards(ThrottlerBehindProxyGuard)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/query')
  @Public()
  async getWithQuery(
    @Query('subject') subject?: string,
    @Query('keyword') keyword?: string,
  ) {
    try {
      console.log(subject, keyword);
      const courses = await this.courseService.getQueryCourses({
        subject,
        keyword,
      });
      if (!courses) {
        return {
          count: 0,
          items: [],
        };
      }

      return courses;
    } catch (error) {
      throw error;
    }
  }

  @Get('table')
  @Public()
  async getForTableSelect(
    @Query('subject') subject?: string,
    @Query('keyword') keyword?: string,
  ) {
    try {
      const courses = await this.courseService.getTableCourses({
        subject,
        keyword,
      });
      if (!courses) {
        return {
          count: 0,
          items: [],
        };
      }

      return courses;
    } catch (error) {
      throw error;
    }
  }

  @Get('table/:id')
  @Public()
  async getForTableSchoolItem(@Param('id') id: string) {
    try {
      const courses = await this.courseService.formatTableCourses(id);
      if (!courses) {
        return {
          count: 0,
          items: [],
        };
      }

      return courses;
    } catch (error) {
      throw error;
    }
  }

  @Get('/all')
  @Public()
  async getAll() {
    try {
      const courses = await this.courseService.getAllCourses();
      if (!courses) {
        return {
          count: 0,
          items: [],
        };
      }

      return courses;
    } catch (error) {
      throw error;
    }
  }

  @Get('/my-like')
  async getMyLikes(@UserInfo() userInfo: UserAfterAuth) {
    try {
      const userId = userInfo.id;
      const result = await this.courseService.getMyLikeCourse(userId);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to get liked courses for user id ${userId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get(':id')
  @Public()
  async getById(@Param('id') id: string) {
    try {
      const course = await this.courseService.getSingleCourse(id);

      return course;
    } catch (error) {
      throw error;
    }
  }

  @Post('like/:id')
  async createCourseLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.courseService.likeCourse(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create like for course id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('like/:id')
  async countCourseLike(@Param('id') id: string) {
    try {
      const result = await this.courseService.countLikes(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to count likes for course id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('like/:id')
  async deleteCourseLike(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('id') id: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.courseService.unlikeCourse(userId, id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete like for course id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
