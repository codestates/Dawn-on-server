import { Module } from '@nestjs/common';
import { StarsController } from './stars.controller';
import { StarsService } from './stars.service';

@Module({
  controllers: [StarsController],
  providers: [StarsService]
})
export class StarsModule {}
