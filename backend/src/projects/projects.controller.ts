import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private projects: ProjectsService) {}

  @Get()
  getAll(@Query('workspaceId') workspaceId: string, @Req() req) {
    return this.projects.getProjects(workspaceId, req.user.sub);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req) {
    return this.projects.getProject(id, req.user.sub);
  }

  @Post()
  create(
    @Body() body: { workspaceId: string; name: string; description?: string; icon?: string; color?: string },
    @Req() req,
  ) {
    const { workspaceId, ...data } = body;
    return this.projects.createProject(workspaceId, data, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body, @Req() req) {
    return this.projects.updateProject(id, body, req.user.sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.projects.deleteProject(id, req.user.sub);
  }

  @Post(':id/columns')
  createColumn(@Param('id') id: string, @Body() body: { name: string; color?: string }, @Req() req) {
    return this.projects.createColumn(id, body, req.user.sub);
  }

  // Routes "columns/:id" déclarées avant ":id/..." n'est pas nécessaire ici (segments différents),
  // mais on garde l'ordre d'origine.
  @Patch('columns/:id')
  updateColumn(@Param('id') id: string, @Body() body, @Req() req) {
    return this.projects.updateColumn(id, body, req.user.sub);
  }

  @Delete('columns/:id')
  deleteColumn(@Param('id') id: string, @Req() req) {
    return this.projects.deleteColumn(id, req.user.sub);
  }

  @Post(':id/columns/reorder')
  reorderColumns(@Param('id') id: string, @Body('columnIds') columnIds: string[], @Req() req) {
    return this.projects.reorderColumns(id, columnIds, req.user.sub);
  }
}
