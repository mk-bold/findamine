// A tiny controller so we can confirm the server responds.
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { ok: true, ts: new Date().toISOString() };
  }
}