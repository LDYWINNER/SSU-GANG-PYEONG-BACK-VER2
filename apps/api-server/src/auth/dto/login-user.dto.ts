import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    description: '이메일',
    required: true,
    example: 'admin@stonybrook.edu',
  })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: '비밀번호',
    required: true,
    example: 'Password1234*',
  })
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{10,30}$/)
  password: string;
}
