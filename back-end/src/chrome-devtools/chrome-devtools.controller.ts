import { Controller, Get } from '@nestjs/common';

@Controller('appspecific')
export class ChromeDevToolsController {
  @Get('com.chrome.devtools.json')
  handleChromeDevTools() {
    // Return an empty object to satisfy Chrome DevTools requests
    return {};
  }
}
