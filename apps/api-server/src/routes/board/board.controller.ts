import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('board')
@ApiTags('Board')
export class BoardController {}
