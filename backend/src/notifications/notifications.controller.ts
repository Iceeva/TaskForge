import { Controller, Get, Post, Patch, Delete, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get()
  getAll(@Req() req, @Query('unreadOnly') unreadOnly: string) {
    return this.notifications.getUserNotifications(req.user.sub, unreadOnly === 'true');
  }

  @Get('count')
  getCount(@Req() req) {
    return this.notifications.getUnreadCount(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.notifications.markAsRead(id);
  }

  @Post('read-all')
  markAllRead(@Req() req) {
    return this.notifications.markAllAsRead(req.user.sub);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.notifications.deleteNotification(id);
  }
}
