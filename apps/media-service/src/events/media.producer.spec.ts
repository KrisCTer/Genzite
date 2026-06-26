import { Test, TestingModule } from '@nestjs/testing';
import { MediaProducer } from './media.producer';
import { KafkaProducerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('MediaProducer', () => {
  let producer: MediaProducer;
  let kafkaProducer: KafkaProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MediaProducer,
        {
          provide: KafkaProducerService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    producer = module.get<MediaProducer>(MediaProducer);
    kafkaProducer = module.get<KafkaProducerService>(KafkaProducerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emitMediaUploaded', () => {
    it('should emit MEDIA_UPLOADED event', async () => {
      const payload = {
        mediaId: 'media-1',
        s3Key: 'key-1',
        filename: 'file.jpg',
        mimeType: 'image/jpeg',
        ownerId: 'user-1',
      };

      await producer.emitMediaUploaded(payload);

      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.MEDIA_UPLOADED, payload);
    });
  });

  describe('emitMediaDeleted', () => {
    it('should emit MEDIA_DELETED event', async () => {
      const payload = {
        mediaId: 'media-1',
        s3Key: 'key-1',
        ownerId: 'user-1',
      };

      await producer.emitMediaDeleted(payload);

      expect(kafkaProducer.emit).toHaveBeenCalledWith(KAFKA_TOPICS.MEDIA_DELETED, payload);
    });
  });
});
