import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MilestonesService } from './milestones.service';

@Controller('milestones')
@UseGuards(AuthGuard('jwt'))
export class MilestonesController {
  constructor(private milestones: MilestonesService) {}

  @Get()
  list(@Query('projectId') projectId: string) {
    return this.milestones.list(projectId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.milestones.get(id);
  }

  @Post()
  create(@Body() body: { projectId: string; name: string; description?: string; dueDate?: string; color?: string }) {
    const { projectId, ...data } = body;
    return this.milestones.create(projectId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.milestones.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.milestones.delete(id);
  }
}
