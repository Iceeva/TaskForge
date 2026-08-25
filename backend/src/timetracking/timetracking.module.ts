import { Module } from '@nestjs/common';
import { TimeTrackingService } from './timetracking.service';
import { TimeTrackingController } from './timetracking.controller';

@Module({
  providers: [TimeTrackingService],
  controllers: [TimeTrackingController],
})
export class TimeTrackingModule {}
