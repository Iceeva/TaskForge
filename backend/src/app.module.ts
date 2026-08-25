import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { CommentsModule } from './comments/comments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { RealtimeModule } from './realtime/realtime.module';
import { SprintsModule } from './sprints/sprints.module';
import { MilestonesModule } from './milestones/milestones.module';
import { TimeTrackingModule } from './timetracking/timetracking.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { SavedFiltersModule } from './saved-filters/saved-filters.module';
import { ApiKeysModule } from './api-keys/api-keys.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ProjectsModule,
    TasksModule,
    CommentsModule,
    NotificationsModule,
    RealtimeModule,
    SprintsModule,
    MilestonesModule,
    TimeTrackingModule,
    AnalyticsModule,
    SearchModule,
    SavedFiltersModule,
    ApiKeysModule,
  ],
})
export class AppModule {}
