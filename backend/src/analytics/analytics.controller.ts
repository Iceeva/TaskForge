import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private analytics: AnalyticsService) {}

  @Get('project')
  projectOverview(@Query('projectId') projectId: string) {
    return this.analytics.projectOverview(projectId);
  }

  @Get('workspace')
  workspaceOverview(@Query('workspaceId') workspaceId: string) {
    return this.analytics.workspaceOverview(workspaceId);
  }
}
