import { Controller, Get, Patch, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private ws: WorkspacesService) {}

  @Get()
  getAll(@Req() req) {
    return this.ws.getUserWorkspaces(req.user.sub);
  }

  @Get(':id')
  getOne(@Param('id') id: string, @Req() req) {
    return this.ws.getWorkspace(id, req.user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() body) {
    return this.ws.updateWorkspace(id, req.user.sub, body);
  }

  @Post(':id/invite')
  invite(@Param('id') id: string, @Req() req, @Body() body: { email: string; role: string }) {
    return this.ws.inviteMember(id, req.user.sub, body.email, body.role);
  }

  @Delete(':id/members/:memberId')
  removeMember(@Param('id') id: string, @Param('memberId') mid: string, @Req() req) {
    return this.ws.removeMember(id, req.user.sub, mid);
  }

  @Patch(':id/members/:memberId')
  updateRole(@Param('id') id: string, @Param('memberId') mid: string, @Req() req, @Body('role') role: string) {
    return this.ws.updateMemberRole(id, req.user.sub, mid, role);
  }
}
