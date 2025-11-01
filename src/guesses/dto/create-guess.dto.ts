import { IsEnum, IsUUID } from 'class-validator';
import { GuessDirection } from '../entities/guess-direction.enum';

export class CreateGuessDto {
  @IsUUID()
  priceSnapshotId: string;

  @IsEnum(GuessDirection)
  direction: GuessDirection;
}
