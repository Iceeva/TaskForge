import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SavedFiltersService } from './saved-filters.service';

@Controller('saved-filters')
@UseGuards(AuthGuard('jwt'))
export class SavedFiltersController {
  constructor(private savedFilters: SavedFiltersService) {}

  @Get()
  list(@Query('workspaceId') workspaceId: string, @Req() req) {
    return this.savedFilters.list(workspaceId, req.user.sub);
  }

  @Post()
  create(@Body() body: { workspaceId: string; name: string; query: any; isShared?: boolean; projectId?: string }, @Req() req) {
    const { workspaceId, ...data } = body;
    return this.savedFilters.create(workspaceId, req.user.sub, data);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.savedFilters.delete(id);
  }
}
