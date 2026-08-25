import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SprintsService } from './sprints.service';

@Controller('sprints')
@UseGuards(AuthGuard('jwt'))
export class SprintsController {
  constructor(private sprints: SprintsService) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.sprints.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.sprints.get(id);
  }

  @Get(':id/burndown')
  burndown(@Param('id') id: string) {
    return this.sprints.burndown(id);
  }

  @Post()
  create(@Body() body: { projectId: string; name: string; goal?: string; startDate: string; endDate: string }) {
    const { projectId, ...data } = body;
    return this.sprints.create(projectId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.sprints.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.sprints.delete(id);
  }
}
