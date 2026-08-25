import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  getAll(@Query('workspaceId') workspaceId: string) {
    return this.projects.getProjects(workspaceId);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.projects.getProject(id);
  }

  @Post()
  create(@Body() body: { workspaceId: string; name: string; description?: string; icon?: string; color?: string }) {
    const { workspaceId, ...data } = body;
    return this.projects.createProject(workspaceId, data);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.projects.updateProject(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projects.deleteProject(id);
  }

  @Post(':id/columns')
  createColumn(@Param('id') id: string, @Body() body: { name: string; color?: string }) {
    return this.projects.createColumn(id, body);
  }

  @Patch('columns/:id')
  updateColumn(@Param('id') id: string, @Body() body) {
    return this.projects.updateColumn(id, body);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string) {
    return this.projects.deleteColumn(id);
  }

  @Post(':id/columns/reorder')
  reorderColumns(@Param('id') id: string, @Body('columnIds') columnIds: string[]) {
    return this.projects.reorderColumns(id, columnIds);
  }
}
