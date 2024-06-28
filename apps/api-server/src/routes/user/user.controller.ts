import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetItemsResponse } from '../../common/decorators/swagger.decorator';
import { FindUserResDto } from './dto/res.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { Role } from '../../common/enum/user.enum';
import { PageReqDto } from '../../common/dto/page-request.dto';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetItemsResponse(FindUserResDto)
  @Roles(Role.Admin)
  @Get()
  async getUsers(
    @Query() { page, size }: PageReqDto,
  ): Promise<FindUserResDto[]> {
    const users = await this.userService.getUsers(page, size);
    return users.map(({ id, email, username, createdAt, postCount }) => {
      return {
        id,
        email,
        username,
        createdAt: createdAt.toISOString(),
        postCount,
      };
    });
  }
}
