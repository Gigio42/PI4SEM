import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAllSettings() {
    const settings = await this.prisma.setting.findMany();
    
    // Transform array to object with sections and keys
    const settingsObject = {};
    
    settings.forEach(setting => {
      if (!settingsObject[setting.section]) {
        settingsObject[setting.section] = {};
      }
      settingsObject[setting.section][setting.key] = setting.value;
    });
    
    return settingsObject;
  }

  async getSetting(section: string, key: string) {
    const setting = await this.prisma.setting.findFirst({
      where: {
        section,
        key
      }
    });

    if (!setting) {
      throw new NotFoundException(`Setting with section ${section} and key ${key} not found`);
    }

    return setting;
  }

  async createSetting(createSettingDto: CreateSettingDto) {
    return this.prisma.setting.create({
      data: createSettingDto
    });
  }

  async updateSetting(section: string, key: string, updateSettingDto: UpdateSettingDto) {
    const existingSetting = await this.prisma.setting.findFirst({
      where: {
        section,
        key
      }
    });

    if (!existingSetting) {
      throw new NotFoundException(`Setting with section ${section} and key ${key} not found`);
    }

    return this.prisma.setting.update({
      where: {
        id: existingSetting.id
      },
      data: updateSettingDto
    });
  }

  async deleteSetting(section: string, key: string) {
    const existingSetting = await this.prisma.setting.findFirst({
      where: {
        section,
        key
      }
    });

    if (!existingSetting) {
      throw new NotFoundException(`Setting with section ${section} and key ${key} not found`);
    }

    return this.prisma.setting.delete({
      where: {
        id: existingSetting.id
      }
    });
  }
}
