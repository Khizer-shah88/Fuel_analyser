import { Controller, Get, Post, Body, Query, Req, All } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Catch-all route for the patched ESP-01 binary
  @All('esp')
  async handleEspData(@Req() req: any, @Body() body: any, @Query() query: any) {
    console.log('--- DIRECT ESP BINARY DATA RECEIVED ---');
    console.log('Method:', req.method);
    console.log('Query:', query);
    console.log('Body:', body);
    console.log('---------------------------------------');
    
    // We return OK to keep the ESP happy
    return "OK";
  }
}

