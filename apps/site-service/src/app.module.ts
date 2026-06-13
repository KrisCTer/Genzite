import { Module } from '@nestjs/common';
import { SitesController } from './sites/sites.controller.js';
import { SitesService } from './sites/sites.service.js';
import { PagesController } from './pages/pages.controller.js';
import { PagesService } from './pages/pages.service.js';
import { WidgetsController } from './widgets/widgets.controller.js';
import { WidgetsService } from './widgets/widgets.service.js';

@Module({
  imports: [],
  controllers: [SitesController, PagesController, WidgetsController],
  providers: [SitesService, PagesService, WidgetsService],
})
export class AppModule {}
