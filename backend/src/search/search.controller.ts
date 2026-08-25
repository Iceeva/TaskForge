import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(AuthGuard('jwt'))
export class SearchController {
  constructor(private searchService: SearchService) {}

  @Get()
  search(@Query('workspaceId') workspaceId: string, @Query('q') q: string) {
    return this.searchService.search(workspaceId, q);
  }
}
