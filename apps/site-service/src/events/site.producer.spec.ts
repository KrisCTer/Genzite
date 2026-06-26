import { Test, TestingModule } from '@nestjs/testing';
import { SiteProducer } from './site.producer';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('SiteProducer', () => {
  let producer: SiteProducer;
  let kafkaService: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteProducer,
        {
          provide: KafkaProducerService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    producer = module.get<SiteProducer>(SiteProducer);
    kafkaService = module.get<KafkaProducerService>(KafkaProducerService);
  });

  describe('emitSiteCreated', () => {
    it('should emit SITE_CREATED event', async () => {
      const payload = { ownerId: 'user-1', siteId: 'site-1', name: 'My Site', subdomain: 'my-site' };
      
      await producer.emitSiteCreated(payload);
      
      expect(kafkaService.emit).toHaveBeenCalledWith(KAFKA_TOPICS.SITE_CREATED, payload);
    });
  });
});
