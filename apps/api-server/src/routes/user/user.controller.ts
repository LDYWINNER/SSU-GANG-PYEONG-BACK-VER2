import {
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetItemsResponse } from '../../common/decorators/swagger.decorator';
import { FindUserResDto } from './dto/res.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { UserType } from '../../common/enum/user.enum';
import { PageReqDto } from '../../common/dto/page-request.dto';
import {
  UserAfterAuth,
  UserInfo,
} from '../../common/decorators/user-info.decorator';

@Controller('user')
@ApiTags('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiGetItemsResponse(FindUserResDto)
  @Roles(UserType.Admin)
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

  @Post('follow/:followerId')
  async createFollow(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('followerId') followerId: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.userService.createFollow(userId, followerId);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to create follow for leader id: ${userId} & follower id: ${followerId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Get('follow/:id')
  async getFollower(@Param('id') id: string) {
    try {
      const result = await this.userService.getFollower(id);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to get follower with id ${id}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  @Delete('follow/:followerId')
  async deleteFollow(
    @UserInfo() userInfo: UserAfterAuth,
    @Param('followerId') followerId: string,
  ) {
    try {
      const userId = userInfo.id;
      const result = await this.userService.removeFollow(userId, followerId);
      if (!result) {
        throw new InternalServerErrorException(
          `Failed to delete follow for leader id: ${userId} & follower id: ${followerId}`,
        );
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
