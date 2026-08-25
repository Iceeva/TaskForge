import { Module } from '@nestjs/common';
import { SavedFiltersService } from './saved-filters.service';
import { SavedFiltersController } from './saved-filters.controller';

@Module({
  providers: [SavedFiltersService],
  controllers: [SavedFiltersController],
})
export class SavedFiltersModule {}
