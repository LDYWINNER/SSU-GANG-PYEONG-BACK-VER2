import { ApiProperty } from '@nestjs/swagger';

export class SignupResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;

  @ApiProperty({ required: true })
  boardCount: string;
}

export class SigninResDto {
  @ApiProperty({ required: true })
  accessToken: string;
}

export class FindUserResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  email: string;

  @ApiProperty({ required: true })
  boardCount: number;

  @ApiProperty({ required: true })
  createdAt: string;
}
