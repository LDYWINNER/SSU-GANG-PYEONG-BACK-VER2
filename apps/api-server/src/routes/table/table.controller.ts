import {
  Body,
  Controller,
  Delete,
  InternalServerErrorException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerBehindProxyGuard } from '../../common/guard/throttler-behind-proxy.guard';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { UpdateTableDto } from './dto/update-table.dto';
import { TableService } from './table.service';
import {
  UserAfterAuth,
  UserInfo,
} from '../../common/decorators/user-info.decorator';
import { CreateTableDto } from './dto/create-table.dto';

@Controller('table')
@ApiTags('Table')
@ApiExtraModels(UpdateTableDto)
@UseGuards(ThrottlerBehindProxyGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  @ApiBearerAuth('access-token')
  async createTable(
    @UserInfo() userInfo: UserAfterAuth,
    @Body() data: CreateTableDto,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.tableService.createTable(userId, data);
      if (!result) {
        throw new InternalServerErrorException('Failed to create table');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  async updateTable(@Param('id') id: string, @Body() data: UpdateTableDto) {
    try {
      const result = await this.tableService.updateTable(id, data);
      if (!result) {
        throw new InternalServerErrorException('Failed to update table');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  async deleteTable(@Param('id') id: string) {
    try {
      const result = await this.tableService.deleteTable(id);
      if (!result) {
        throw new InternalServerErrorException('Failed to delete table');
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
