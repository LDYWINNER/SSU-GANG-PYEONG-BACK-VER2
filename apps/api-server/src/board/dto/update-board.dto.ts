import { IsOptional } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  contents?: string;
}
