import { Test, TestingModule } from '@nestjs/testing';
import { BitcoinPriceFetcherService } from './bitcoin-price-fetcher.service';
import { PriceSnapshotsService } from './price-snapshots.service';
import { GuessesService } from '../guesses/guesses.service';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { GuessDirection } from '../guesses/entities/guess-direction.enum';

describe('BitcoinPriceFetcherService - Guess Resolution Logic', () => {
  let service: BitcoinPriceFetcherService;
  let priceSnapshotsService: PriceSnapshotsService;
  let guessesService: GuessesService;
  let usersService: UsersService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockPriceSnapshotsService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockGuessesService = {
    findUnresolved: jest.fn(),
    resolveGuess: jest.fn(),
  };

  const mockUsersService = {
    updateScore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BitcoinPriceFetcherService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: PriceSnapshotsService,
          useValue: mockPriceSnapshotsService,
        },
        {
          provide: GuessesService,
          useValue: mockGuessesService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<BitcoinPriceFetcherService>(
      BitcoinPriceFetcherService,
    );
    priceSnapshotsService = module.get<PriceSnapshotsService>(
      PriceSnapshotsService,
    );
    guessesService = module.get<GuessesService>(GuessesService);
    usersService = module.get<UsersService>(UsersService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  describe('Guess Resolution - Price Goes UP', () => {
    it('should correctly resolve UP guess when price increases', async () => {
      const oldPrice = 50000;
      const newPrice = 51000;

      const mockGuess = {
        id: 'guess-1',
        userId: 'user-1',
        priceSnapshotId: 'snapshot-1',
        direction: GuessDirection.UP,
        isCorrect: null,
        createdAt: new Date().toISOString(),
      };

      const mockSnapshot = {
        id: 'snapshot-1',
        price: oldPrice,
        timestamp: new Date().toISOString(),
      };

      // Mock API response
      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: newPrice } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue([mockGuess]);
      mockPriceSnapshotsService.findOne.mockResolvedValue(mockSnapshot);
      mockGuessesService.resolveGuess.mockResolvedValue({
        ...mockGuess,
        isCorrect: true,
      });
      mockUsersService.updateScore.mockResolvedValue({});

      await service.fetchAndStoreBitcoinPrice();

      // Verify guess was resolved as correct
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-1',
        true,
      );

      // Verify user score was incremented
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-1', 1);
    });

    it('should incorrectly resolve DOWN guess when price increases', async () => {
      const oldPrice = 50000;
      const newPrice = 51000;

      const mockGuess = {
        id: 'guess-2',
        userId: 'user-2',
        priceSnapshotId: 'snapshot-2',
        direction: GuessDirection.DOWN,
        isCorrect: null,
        createdAt: new Date().toISOString(),
      };

      const mockSnapshot = {
        id: 'snapshot-2',
        price: oldPrice,
        timestamp: new Date().toISOString(),
      };

      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: newPrice } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue([mockGuess]);
      mockPriceSnapshotsService.findOne.mockResolvedValue(mockSnapshot);
      mockGuessesService.resolveGuess.mockResolvedValue({
        ...mockGuess,
        isCorrect: false,
      });
      mockUsersService.updateScore.mockResolvedValue({});

      await service.fetchAndStoreBitcoinPrice();

      // Verify guess was resolved as incorrect
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-2',
        false,
      );

      // Verify user score was decremented
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-2', -1);
    });
  });

  describe('Guess Resolution - Price Goes DOWN', () => {
    it('should correctly resolve DOWN guess when price decreases', async () => {
      const oldPrice = 50000;
      const newPrice = 49000;

      const mockGuess = {
        id: 'guess-3',
        userId: 'user-3',
        priceSnapshotId: 'snapshot-3',
        direction: GuessDirection.DOWN,
        isCorrect: null,
        createdAt: new Date().toISOString(),
      };

      const mockSnapshot = {
        id: 'snapshot-3',
        price: oldPrice,
        timestamp: new Date().toISOString(),
      };

      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: newPrice } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue([mockGuess]);
      mockPriceSnapshotsService.findOne.mockResolvedValue(mockSnapshot);
      mockGuessesService.resolveGuess.mockResolvedValue({
        ...mockGuess,
        isCorrect: true,
      });
      mockUsersService.updateScore.mockResolvedValue({});

      await service.fetchAndStoreBitcoinPrice();

      // Verify guess was resolved as correct
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-3',
        true,
      );

      // Verify user score was incremented
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-3', 1);
    });

    it('should incorrectly resolve UP guess when price decreases', async () => {
      const oldPrice = 50000;
      const newPrice = 49000;

      const mockGuess = {
        id: 'guess-4',
        userId: 'user-4',
        priceSnapshotId: 'snapshot-4',
        direction: GuessDirection.UP,
        isCorrect: null,
        createdAt: new Date().toISOString(),
      };

      const mockSnapshot = {
        id: 'snapshot-4',
        price: oldPrice,
        timestamp: new Date().toISOString(),
      };

      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: newPrice } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue([mockGuess]);
      mockPriceSnapshotsService.findOne.mockResolvedValue(mockSnapshot);
      mockGuessesService.resolveGuess.mockResolvedValue({
        ...mockGuess,
        isCorrect: false,
      });
      mockUsersService.updateScore.mockResolvedValue({});

      await service.fetchAndStoreBitcoinPrice();

      // Verify guess was resolved as incorrect
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-4',
        false,
      );

      // Verify user score was decremented
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-4', -1);
    });
  });

  describe('Multiple Guesses Resolution', () => {
    it('should resolve multiple guesses correctly', async () => {
      const oldPrice = 50000;
      const newPrice = 51000; // Price went UP

      const mockGuesses = [
        {
          id: 'guess-1',
          userId: 'user-1',
          priceSnapshotId: 'snapshot-1',
          direction: GuessDirection.UP, // Correct
          isCorrect: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'guess-2',
          userId: 'user-2',
          priceSnapshotId: 'snapshot-1',
          direction: GuessDirection.DOWN, // Incorrect
          isCorrect: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'guess-3',
          userId: 'user-3',
          priceSnapshotId: 'snapshot-1',
          direction: GuessDirection.UP, // Correct
          isCorrect: null,
          createdAt: new Date().toISOString(),
        },
      ];

      const mockSnapshot = {
        id: 'snapshot-1',
        price: oldPrice,
        timestamp: new Date().toISOString(),
      };

      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: newPrice } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue(mockGuesses);
      mockPriceSnapshotsService.findOne.mockResolvedValue(mockSnapshot);
      mockGuessesService.resolveGuess.mockResolvedValue({});
      mockUsersService.updateScore.mockResolvedValue({});

      await service.fetchAndStoreBitcoinPrice();

      // Verify all guesses were resolved
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledTimes(3);

      // Verify correct guesses
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-1',
        true,
      );
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-3',
        true,
      );

      // Verify incorrect guess
      expect(mockGuessesService.resolveGuess).toHaveBeenCalledWith(
        'guess-2',
        false,
      );

      // Verify scores updated correctly
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-1', 1);
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-2', -1);
      expect(mockUsersService.updateScore).toHaveBeenCalledWith('user-3', 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle API fetch errors gracefully', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('API Error')),
      );

      // Should not throw
      await expect(service.fetchAndStoreBitcoinPrice()).resolves.not.toThrow();

      // Verify no guesses were processed
      expect(mockGuessesService.findUnresolved).not.toHaveBeenCalled();
    });

    it('should skip guess if price snapshot not found', async () => {
      const mockGuess = {
        id: 'guess-1',
        userId: 'user-1',
        priceSnapshotId: 'missing-snapshot',
        direction: GuessDirection.UP,
        isCorrect: null,
        createdAt: new Date().toISOString(),
      };

      mockHttpService.get.mockReturnValue(
        of({
          data: { bitcoin: { usd: 50000 } },
        }),
      );

      mockPriceSnapshotsService.create.mockResolvedValue({});
      mockGuessesService.findUnresolved.mockResolvedValue([mockGuess]);
      mockPriceSnapshotsService.findOne.mockResolvedValue(null); // Snapshot not found

      await service.fetchAndStoreBitcoinPrice();

      // Verify guess was not resolved
      expect(mockGuessesService.resolveGuess).not.toHaveBeenCalled();
      expect(mockUsersService.updateScore).not.toHaveBeenCalled();
    });
  });
});
