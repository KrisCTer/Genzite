import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SettingsService implements OnModuleInit {
  private readonly logger = new Logger(SettingsService.name);

  // Default settings
  private readonly defaults: Record<string, any> = {
    registrationEnabled: true,
    maintenanceMode: false,
    aiGenerationEnabled: true,
    smtpConfig: {
      host: 'smtp.gmail.com',
      port: 587,
      user: '',
      password: ''
    }
  };

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedDefaults();
  }

  private async seedDefaults() {
    try {
      const p = this.prisma as any;
      if (!p.systemSetting) {
        this.logger.warn('SystemSetting model not found on prisma client. Schema not generated?');
        return;
      }
      for (const [key, value] of Object.entries(this.defaults)) {
        const existing = await p.systemSetting.findUnique({ where: { key } });
        if (!existing) {
          await p.systemSetting.create({
            data: {
              key,
              value,
              description: `System setting for ${key}`
            }
          });
          this.logger.log(`Seeded default setting: ${key}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to seed default settings', error);
    }
  }

  async getAllSettings() {
    try {
      const p = this.prisma as any;
      const settings = await p.systemSetting.findMany();
      return settings;
    } catch (e) {
      return [];
    }
  }

  async getPublicSettings() {
    try {
      const p = this.prisma as any;
      const settings = await p.systemSetting.findMany({
        where: {
          key: {
            in: ['registrationEnabled', 'maintenanceMode', 'aiGenerationEnabled']
          }
        }
      });
      const result: Record<string, any> = {};
      settings.forEach((s: any) => {
        result[s.key] = s.value;
      });
      return result;
    } catch (e) {
      return {
        registrationEnabled: true,
        maintenanceMode: false,
        aiGenerationEnabled: true
      };
    }
  }

  async updateSetting(key: string, value: any) {
    const p = this.prisma as any;
    return p.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: `System setting for ${key}` }
    });
  }
}
