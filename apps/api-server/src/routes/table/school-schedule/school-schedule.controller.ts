import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { SchoolScheduleService } from './school-schedule.service';
import { CreateSchoolScheduleDto } from './dto/create-school-schedule.dto';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('school-schedule')
@ApiTags('School Schedule')
@UseGuards(ThrottlerBehindProxyGuard)
export class SchoolScheduleController {
  constructor(private readonly schoolScheduleService: SchoolScheduleService) {}

  @Post()
  @ApiBearerAuth('access-token')
  async create(@Body() createSchoolScheduleDto: CreateSchoolScheduleDto) {
    try {
      const result = this.schoolScheduleService.createSchoolSchedule(
        createSchoolScheduleDto,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'Failed to create school schedule',
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async delete(@Param('id') id: string) {
    try {
      const deletedSchoolSchedule =
        await this.schoolScheduleService.deleteSchoolSchedule(id);
      if (!deletedSchoolSchedule) {
        throw new InternalServerErrorException(
          'Failed to delete school schedule',
        );
      }
      return deletedSchoolSchedule;
    } catch (error) {
      throw error;
    }
  }

  @Delete('/all/:id')
  @ApiBearerAuth('access-token')
  async deleteAll(@Param('id') id: string) {
    try {
      const result =
        await this.schoolScheduleService.deleteAllSchoolSchedule(id);
      if (!result) {
        throw new InternalServerErrorException(
          'Failed to delete school schedules',
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
