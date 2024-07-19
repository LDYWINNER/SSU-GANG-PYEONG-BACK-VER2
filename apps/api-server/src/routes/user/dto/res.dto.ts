import { ApiProperty } from '@nestjs/swagger';

export class FindUserResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: true })
  courseReviewCount: number;

  @ApiProperty({ required: true })
  createdAt: string;
}
