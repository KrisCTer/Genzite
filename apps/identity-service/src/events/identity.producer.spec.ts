import { Test, TestingModule } from '@nestjs/testing';
import { IdentityProducer } from './identity.producer';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('IdentityProducer', () => {
  let producer: IdentityProducer;
  let kafkaService: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityProducer,
        {
          provide: KafkaProducerService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    producer = module.get<IdentityProducer>(IdentityProducer);
    kafkaService = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emitUserRegistered', () => {
    it('should emit KAFKA_TOPICS.USER_REGISTERED with correct payload', async () => {
      const payload = { userId: 'uuid', email: 'test@test.com', name: 'Test' };
      
      await producer.emitUserRegistered(payload);
      
      expect(kafkaService.emit).toHaveBeenCalledWith(KAFKA_TOPICS.USER_REGISTERED, payload);
    });
  });

  describe('emitUserUpdated', () => {
    it('should emit KAFKA_TOPICS.USER_UPDATED with correct payload', async () => {
      const payload = { userId: 'uuid', changes: { name: 'New' } };
      
      await producer.emitUserUpdated(payload);
      
      expect(kafkaService.emit).toHaveBeenCalledWith(KAFKA_TOPICS.USER_UPDATED, payload);
    });
  });

  describe('emitRoleAssigned', () => {
    it('should emit KAFKA_TOPICS.ROLE_ASSIGNED with correct payload', async () => {
      const payload = { userId: 'uuid', roleName: 'ADMIN' };
      
      await producer.emitRoleAssigned(payload);
      
      expect(kafkaService.emit).toHaveBeenCalledWith(KAFKA_TOPICS.ROLE_ASSIGNED, payload);
    });
  });
});
