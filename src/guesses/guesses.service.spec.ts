import { Test, TestingModule } from '@nestjs/testing';
import { GuessesService } from './guesses.service';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '@nestjs/config';
import { GuessDirection } from './entities/guess-direction.enum';
import { Guess } from './entities/guess.entity';

describe('GuessesService', () => {
  let service: GuessesService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    put: jest.fn(),
    get: jest.fn(),
    scan: jest.fn(),
    update: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'dynamodb.guessesTable') return 'guesses';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuessesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<GuessesService>(GuessesService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new guess', async () => {
      const createGuessDto = {
        priceSnapshotId: 'snapshot-123',
        direction: GuessDirection.UP,
      };
      const userId = 'user-123';

      mockDatabaseService.put.mockResolvedValue(undefined);

      const result = await service.create(createGuessDto, userId);

      expect(result).toMatchObject({
        userId: 'user-123',
        priceSnapshotId: 'snapshot-123',
        direction: GuessDirection.UP,
        isCorrect: null,
      });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(mockDatabaseService.put).toHaveBeenCalledWith(
        'guesses',
        expect.objectContaining({
          userId: 'user-123',
          priceSnapshotId: 'snapshot-123',
          direction: GuessDirection.UP,
          isCorrect: null,
        }),
      );
    });
  });

  describe('findUnresolved', () => {
    it('should return all unresolved guesses', async () => {
      const unresolvedGuesses: Guess[] = [
        {
          id: 'guess-1',
          userId: 'user-1',
          priceSnapshotId: 'snapshot-1',
          direction: GuessDirection.UP,
          isCorrect: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'guess-2',
          userId: 'user-2',
          priceSnapshotId: 'snapshot-2',
          direction: GuessDirection.DOWN,
          isCorrect: null,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDatabaseService.scan.mockResolvedValue(unresolvedGuesses);

      const result = await service.findUnresolved();

      expect(result).toEqual(unresolvedGuesses);
      expect(mockDatabaseService.scan).toHaveBeenCalledWith(
        'guesses',
        'attribute_not_exists(isCorrect) OR isCorrect = :null',
        undefined,
        { ':null': null },
      );
    });

    it('should return empty array when no unresolved guesses exist', async () => {
      mockDatabaseService.scan.mockResolvedValue([]);

      const result = await service.findUnresolved();

      expect(result).toEqual([]);
    });
  });

  describe('resolveGuess', () => {
    it('should resolve a guess as correct', async () => {
      const guessId = 'guess-123';
      const resolvedGuess: Guess = {
        id: guessId,
        userId: 'user-1',
        priceSnapshotId: 'snapshot-1',
        direction: GuessDirection.UP,
        isCorrect: true,
        createdAt: new Date().toISOString(),
      };

      mockDatabaseService.update.mockResolvedValue(resolvedGuess);

      const result = await service.resolveGuess(guessId, true);

      expect(result.isCorrect).toBe(true);
      expect(mockDatabaseService.update).toHaveBeenCalledWith(
        'guesses',
        { id: guessId },
        'SET isCorrect = :isCorrect',
        {},
        { ':isCorrect': true },
      );
    });

    it('should resolve a guess as incorrect', async () => {
      const guessId = 'guess-456';
      const resolvedGuess: Guess = {
        id: guessId,
        userId: 'user-2',
        priceSnapshotId: 'snapshot-2',
        direction: GuessDirection.DOWN,
        isCorrect: false,
        createdAt: new Date().toISOString(),
      };

      mockDatabaseService.update.mockResolvedValue(resolvedGuess);

      const result = await service.resolveGuess(guessId, false);

      expect(result.isCorrect).toBe(false);
      expect(mockDatabaseService.update).toHaveBeenCalledWith(
        'guesses',
        { id: guessId },
        'SET isCorrect = :isCorrect',
        {},
        { ':isCorrect': false },
      );
    });
  });

  describe('findByUserId', () => {
    it('should return all guesses for a specific user', async () => {
      const userId = 'user-123';
      const userGuesses: Guess[] = [
        {
          id: 'guess-1',
          userId,
          priceSnapshotId: 'snapshot-1',
          direction: GuessDirection.UP,
          isCorrect: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'guess-2',
          userId,
          priceSnapshotId: 'snapshot-2',
          direction: GuessDirection.DOWN,
          isCorrect: false,
          createdAt: new Date().toISOString(),
        },
      ];

      mockDatabaseService.scan.mockResolvedValue(userGuesses);

      const result = await service.findByUserId(userId);

      expect(result).toEqual(userGuesses);
      expect(mockDatabaseService.scan).toHaveBeenCalledWith(
        'guesses',
        'userId = :userId',
        undefined,
        { ':userId': userId },
      );
    });
  });
});
