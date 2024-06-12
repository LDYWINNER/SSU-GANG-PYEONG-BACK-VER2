import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 이름',
    required: true,
    example: 'admin',
  })
  username: string;

  @MinLength(8)
  @IsNotEmpty()
  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'Password1234*',
  })
  password: string;

  @IsEmail()
  @ApiProperty({
    description: '이메일',
    required: true,
    example: 'admin@stonybrook.edu',
  })
  email: string;
}
