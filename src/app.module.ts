import { Module } from '@nestjs/common';
// import { EventsGateway } from './events.gateway';
import { EventsModule } from './events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
