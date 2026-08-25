import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommentsService } from './comments.service';

@Controller('comments')
@UseGuards(AuthGuard('jwt'))
export class CommentsController {
  constructor(private comments: CommentsService) {}

  @Get()
  getAll(@Query('taskId') taskId: string) {
    return this.comments.getComments(taskId);
  }

  @Post()
  create(@Body() body: { taskId: string; body: string; parentId?: string }, @Req() req) {
    return this.comments.createComment(body.taskId, req.user.sub, body.body, body.parentId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('body') body: string) {
    return this.comments.updateComment(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.comments.deleteComment(id);
  }
}
