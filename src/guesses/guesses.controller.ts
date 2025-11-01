import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { GuessesService } from './guesses.service';
import { CreateGuessDto } from './dto/create-guess.dto';
import { GuessResponseDto } from './dto/guess-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from '../users/dto/user-response.dto';

interface RequestWithUser extends Request {
  user: UserResponseDto;
}

@Controller('guesses')
@UseGuards(JwtAuthGuard)
export class GuessesController {
  constructor(private readonly guessesService: GuessesService) {}

  @Post()
  async create(
    @Body() createGuessDto: CreateGuessDto,
    @Request() req: RequestWithUser,
  ): Promise<GuessResponseDto> {
    const guess = await this.guessesService.create(createGuessDto, req.user.id);
    return plainToInstance(GuessResponseDto, guess);
  }

  @Get()
  async findAll(): Promise<GuessResponseDto[]> {
    const guesses = await this.guessesService.findAll();
    return plainToInstance(GuessResponseDto, guesses);
  }

  @Get('me')
  async findMine(@Request() req: RequestWithUser): Promise<GuessResponseDto[]> {
    const guesses = await this.guessesService.findByUserId(req.user.id);
    return plainToInstance(GuessResponseDto, guesses);
  }
}
