import { ApiProperty } from '@nestjs/swagger';
import { FindUserResDto } from '../../../user/dto/res.dto';

export class FindPostResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  contents: string;

  @ApiProperty({ required: true })
  user: FindUserResDto;
}
