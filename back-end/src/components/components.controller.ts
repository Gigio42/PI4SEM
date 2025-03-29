import { Body, Controller, Get, Post } from '@nestjs/common';
import { ComponentsService } from './components.service';

@Controller('components')
export class ComponentsController {
  constructor(private readonly componentsService: ComponentsService) {}

  @Post()
  async createComponent(@Body() body: { name: string; cssContent: string }) {
    const { name, cssContent } = body;
    return this.componentsService.createComponent(name, cssContent);
  }

  @Get()
  async getAllComponents() {
    return this.componentsService.getAllComponents();
  }
}