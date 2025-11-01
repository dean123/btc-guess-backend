import { GuessDirection } from './guess-direction.enum';

export class Guess {
  id: string;
  userId: string;
  priceSnapshotId: string;
  direction: GuessDirection;
  isCorrect: boolean | null;
  createdAt: string;
}
