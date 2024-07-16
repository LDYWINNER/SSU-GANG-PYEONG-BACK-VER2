import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ThrottlerBehindProxyGuard } from '../../common/guard/throttler-behind-proxy.guard';
import { CourseService } from './course.service';
import { Public } from '../../common/decorators/public.decorator';

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
}
