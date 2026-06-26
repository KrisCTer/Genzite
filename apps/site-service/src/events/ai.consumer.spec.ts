import { Test, TestingModule } from '@nestjs/testing';
import { AiConsumer } from './ai.consumer';
import { SitesService } from '../sites/sites.service';
import { PagesService } from '../pages/pages.service';
import { WidgetsService } from '../widgets/widgets.service';
import { KafkaConsumerService } from '@genzite/kafka';
import { KAFKA_TOPICS } from '@genzite/shared-types';

describe('AiConsumer', () => {
  let consumer: AiConsumer;
  let sitesService: SitesService;
  let pagesService: PagesService;
  let widgetsService: WidgetsService;
  
  const topicHandlers: Record<string, Function> = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiConsumer,
        {
          provide: SitesService,
          useValue: { create: jest.fn() },
        },
        {
          provide: PagesService,
          useValue: { create: jest.fn() },
        },
        {
          provide: WidgetsService,
          useValue: { replaceWidgets: jest.fn() },
        },
        {
          provide: KafkaConsumerService,
          useValue: {
            subscribe: jest.fn().mockImplementation((topic: string, callback: Function) => {
              topicHandlers[topic] = callback;
            }),
          },
        },
      ],
    }).compile();

    consumer = module.get<AiConsumer>(AiConsumer);
    sitesService = module.get<SitesService>(SitesService);
    pagesService = module.get<PagesService>(PagesService);
    widgetsService = module.get<WidgetsService>(WidgetsService);
    
    await consumer.onModuleInit();
  });

  describe('SITE_GENERATED', () => {
    it('should parse siteData and create pages and widgets', async () => {
      const payload = {
        ownerId: 'user-1',
        siteId: 'site-1',
        siteData: {
          site: {
            name: 'Test Site',
            subdomain: 'test-site',
          },
          pages: [
            {
              title: 'Home',
              slug: 'home',
              path: '/',
              widgets: [
                { type: 'HERO', data: { title: 'Hello' } }
              ]
            }
          ]
        }
      };

      const handler = topicHandlers[KAFKA_TOPICS.SITE_GENERATED];
      expect(handler).toBeDefined();

      jest.spyOn(sitesService, 'create').mockResolvedValue({ id: 'site-1', subdomain: 'test' } as any);
      jest.spyOn(pagesService, 'create').mockResolvedValue({ id: 'page-1' } as any);
      jest.spyOn(widgetsService, 'replaceWidgets').mockResolvedValue(null as any);

      await handler({ payload });

      expect(sitesService.create).toHaveBeenCalled();
      expect(pagesService.create).toHaveBeenCalled();
      expect(widgetsService.replaceWidgets).toHaveBeenCalled();
    });
  });
});
