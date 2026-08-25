import { Controller, Get, Post, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TimeTrackingService } from './timetracking.service';

@Controller('time-entries')
@UseGuards(AuthGuard('jwt'))
export class TimeTrackingController {
  constructor(private timeTracking: TimeTrackingService) {}

  @Get('task/:taskId')
  listForTask(@Param('taskId') taskId: string) {
    return this.timeTracking.listForTask(taskId);
  }

  @Get('task/:taskId/total')
  taskTotal(@Param('taskId') taskId: string) {
    return this.timeTracking.taskTotal(taskId);
  }

  @Get('project/:projectId/summary')
  projectSummary(@Param('projectId') projectId: string) {
    return this.timeTracking.projectSummary(projectId);
  }

  @Post('task/:taskId')
  logTime(@Param('taskId') taskId: string, @Body() body: { minutes: number; note?: string; date?: string }, @Req() req) {
    return this.timeTracking.logTime(taskId, req.user.sub, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.timeTracking.deleteEntry(id);
  }
}
