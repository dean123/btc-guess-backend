import { Exclude, Expose } from 'class-transformer';
import { GuessDirection } from '../entities/guess-direction.enum';

@Exclude()
export class GuessResponseDto {
  @Expose()
  id: string;

  @Expose()
  userId: string;

  @Expose()
  priceSnapshotId: string;

  @Expose()
  direction: GuessDirection;

  @Expose()
  isCorrect: boolean | null;

  @Expose()
  createdAt: string;
}
