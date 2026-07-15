import { Test, TestingModule } from '@nestjs/testing';
import { SiteGeneratorService } from './site-generator.service';
import { AiClient } from '../gemini/ai.client';
import { RagService } from './rag.service';
import { GuardrailService } from './guardrail.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ToolRegistry } from '../agent/tools/tool.registry';

describe('SiteGeneratorService', () => {
  let service: SiteGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteGeneratorService,
        {
          provide: AiClient,
          useValue: {
            generateContent: jest.fn(),
            generateJson: jest.fn(),
          },
        },
        {
          provide: RagService,
          useValue: {
            retrieveContext: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: GuardrailService,
          useValue: {
            validateAndSanitize: jest.fn().mockImplementation((html) => Promise.resolve(html)),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ToolRegistry,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {
            aiTaskLog: {
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SiteGeneratorService>(SiteGeneratorService);
  });

  describe('deriveProjectNameFromPrompt', () => {
    it('should use aiName when available and not generic', () => {
      const name = (service as any).deriveProjectNameFromPrompt('Create a coffee store', 'Nova Coffee Shop');
      expect(name).toBe('Nova Coffee Shop');
    });

    it('should ignore generic aiNames like "Home" or "Website" and derive from prompt', () => {
      const name = (service as any).deriveProjectNameFromPrompt('Create a green space coffee shop website', 'Home');
      expect(name).toBe('A Green Space Coffee Shop Website');
    });

    it('should clean tags and action prefixes when deriving from prompt', () => {
      const name = (service as any).deriveProjectNameFromPrompt('[TARGET_PAGE:page-123] [PLATFORM:DESKTOP] Please create a modern portfolio for a freelance designer');
      expect(name).toBe('Modern Portfolio For A Freelance Designer');
    });
  });
});
