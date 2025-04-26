import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, description: 'Returns all settings' })
  async getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get(':section/:key')
  @ApiOperation({ summary: 'Get setting by section and key' })
  @ApiResponse({ status: 200, description: 'Returns specific setting' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async getSetting(@Param('section') section: string, @Param('key') key: string) {
    return this.settingsService.getSetting(section, key);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiResponse({ status: 201, description: 'Setting created successfully' })
  async createSetting(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.createSetting(createSettingDto);
  }

  @Put(':section/:key')
  @ApiOperation({ summary: 'Update a setting' })
  @ApiResponse({ status: 200, description: 'Setting updated successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async updateSetting(
    @Param('section') section: string,
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    return this.settingsService.updateSetting(section, key, updateSettingDto);
  }

  @Delete(':section/:key')
  @ApiOperation({ summary: 'Delete a setting' })
  @ApiResponse({ status: 200, description: 'Setting deleted successfully' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async deleteSetting(@Param('section') section: string, @Param('key') key: string) {
    return this.settingsService.deleteSetting(section, key);
  }
}
