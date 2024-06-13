import { ApiProperty } from '@nestjs/swagger';
import { FindUserResDto } from '../../user/dto/res.dto';

export class FindBoardResDto {
  @ApiProperty({ required: true })
  id: string;

  @ApiProperty({ required: true })
  contents: string;

  @ApiProperty({ required: true })
  user: FindUserResDto;
}
