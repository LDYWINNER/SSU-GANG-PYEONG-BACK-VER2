import {
  Controller,
  Post,
  Body,
  UseGuards,
  Put,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { PersonalScheduleService } from './personal-schedule.service';
import { CreatePersonalScheduleDto } from './dto/create-personal-schedule.dto';
import { ThrottlerBehindProxyGuard } from '../../../common/guard/throttler-behind-proxy.guard';
import { UpdatePersonalScheduleDto } from './dto/update-personal-schedule.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('personal-schedule')
@ApiTags('Personal Schedule')
@UseGuards(ThrottlerBehindProxyGuard)
export class PersonalScheduleController {
  constructor(
    private readonly personalScheduleService: PersonalScheduleService,
  ) {}

  @Post()
  @ApiBearerAuth('access-token')
  async create(@Body() createPersonalScheduleDto: CreatePersonalScheduleDto) {
    try {
      const result = this.personalScheduleService.createPersonalSchedule(
        createPersonalScheduleDto,
      );
      if (!result) {
        throw new InternalServerErrorException(
          'Failed to create personal schedule',
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  async update(
    @Param('id') id: string,
    @Body() updatePersonalScheduleDto: UpdatePersonalScheduleDto,
  ) {
    try {
      const updatedPersonalSchedule =
        await this.personalScheduleService.updatePersonalSchedule(
          id,
          updatePersonalScheduleDto,
        );
      if (!updatedPersonalSchedule) {
        throw new InternalServerErrorException(
          'Failed to update personal schedule',
        );
      }
      return updatedPersonalSchedule;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async delete(@Param('id') id: string) {
    try {
      const deletedPersonalSchedule =
        await this.personalScheduleService.deletePersonalSchedule(id);
      if (!deletedPersonalSchedule) {
        throw new InternalServerErrorException(
          'Failed to delete personal schedule',
        );
      }
      return deletedPersonalSchedule;
    } catch (error) {
      throw error;
    }
  }
}
