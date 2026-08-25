import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
@UseGuards(AuthGuard('jwt'))
export class ApiKeysController {
  constructor(private apiKeys: ApiKeysService) {}

  @Get()
  list(@Query('workspaceId') workspaceId: string) {
    return this.apiKeys.list(workspaceId);
  }

  @Post()
  create(@Body() body: { workspaceId: string; name: string }) {
    return this.apiKeys.create(body.workspaceId, body.name);
  }

  @Delete(':id')
  revoke(@Param('id') id: string) {
    return this.apiKeys.revoke(id);
  }
}
