import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(AuthGuard('jwt'))
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get('export')
  async export(@Query('projectId') projectId: string, @Res() res: Response) {
    const csv = await this.tasks.exportProjectCsv(projectId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tasks-export.csv"');
    res.send(csv);
  }

  @Get()
  getAll(@Query('projectId') projectId: string, @Query() filters: any) {
    return this.tasks.getTasks(projectId, filters);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.tasks.getTask(id);
  }

  @Post()
  create(@Body() body, @Req() req) {
    return this.tasks.createTask(body, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body, @Req() req) {
    return this.tasks.updateTask(id, body, req.user.sub);
  }

  @Post(':id/move')
  move(@Param('id') id: string, @Body() body: { columnId: string; position: number }, @Req() req) {
    return this.tasks.moveTask(id, body.columnId, body.position, req.user.sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @Req() req) {
    return this.tasks.deleteTask(id, req.user.sub);
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body('userId') userId: string, @Req() req) {
    return this.tasks.assignTask(id, userId, req.user.sub);
  }

  @Delete(':id/assign/:userId')
  unassign(@Param('id') id: string, @Param('userId') userId: string, @Req() req) {
    return this.tasks.unassignTask(id, userId, req.user.sub);
  }

  @Post(':id/labels')
  addLabel(@Param('id') id: string, @Body('labelId') labelId: string) {
    return this.tasks.addLabel(id, labelId);
  }

  @Delete(':id/labels/:labelId')
  removeLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
    return this.tasks.removeLabel(id, labelId);
  }

  @Post(':id/checklist')
  addChecklist(@Param('id') id: string, @Body('text') text: string) {
    return this.tasks.addChecklistItem(id, text);
  }

  @Patch('checklist/:itemId/toggle')
  toggleChecklist(@Param('itemId') itemId: string) {
    return this.tasks.toggleChecklistItem(itemId);
  }

  @Delete('checklist/:itemId')
  deleteChecklist(@Param('itemId') itemId: string) {
    return this.tasks.deleteChecklistItem(itemId);
  }

  @Post(':id/dependencies')
  addDependency(@Param('id') id: string, @Body() body: { dependsOnId: string; type?: 'BLOCKS' | 'RELATES_TO' }) {
    return this.tasks.addDependency(id, body.dependsOnId, body.type);
  }

  @Delete('dependencies/:dependencyId')
  removeDependency(@Param('dependencyId') dependencyId: string) {
    return this.tasks.removeDependency(dependencyId);
  }
}
