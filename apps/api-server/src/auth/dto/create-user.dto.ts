import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateUserDto {
  @MaxLength(20)
  @IsNotEmpty()
  @ApiProperty({
    description: '유저 이름',
    required: true,
    example: 'admin',
  })
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '이메일',
    required: true,
    example: 'admin@stonybrook.edu',
  })
  email: string;

  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'Password1234*',
  })
  password: string;

  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  @ApiProperty({
    description: '비밀번호 확인',
    example: 'Password1234*',
  })
  passwordConfirm?: string;
}
