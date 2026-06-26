import { Test, TestingModule } from '@nestjs/testing';
import { AiProducer } from './ai.producer';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('AiProducer', () => {
  let producer: AiProducer;
  let kafkaProducer: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProducer,
        {
          provide: KafkaProducerService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    producer = module.get<AiProducer>(AiProducer);
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emitSiteGenerated', () => {
    it('should emit SITE_GENERATED event', async () => {
      const payload = { siteId: 'site-1', prompt: 'test', ownerId: 'user-1' };
      await producer.emitSiteGenerated(payload);
      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.SITE_GENERATED, payload);
    });
  });

  describe('emitCmsGenerated', () => {
    it('should emit CMS_GENERATED event', async () => {
      const payload = { siteId: 'site-1', prompt: 'test', ownerId: 'user-1' };
      await producer.emitCmsGenerated(payload);
      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.CMS_GENERATED, payload);
    });
  });

  describe('emitResumeAnalyzed', () => {
    it('should emit RESUME_ANALYZED event', async () => {
      const payload = { resumeId: 'res-1', ownerId: 'user-1', atsScore: 90 };
      await producer.emitResumeAnalyzed(payload);
      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.RESUME_ANALYZED, payload);
    });
  });

  describe('emitInterviewCompleted', () => {
    it('should emit INTERVIEW_COMPLETED event', async () => {
      const payload = { sessionId: 'sess-1', resumeId: 'res-1', ownerId: 'user-1', overallScore: 85 };
      await producer.emitInterviewCompleted(payload);
      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.INTERVIEW_COMPLETED, payload);
    });
  });
});
