import { Module } from '@nestjs/common';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UsersModule } from '../users/users.module';
import { OrgsService } from './orgs.service';
import { OrgsController } from './orgs.controller';

@Module({
  imports: [AuditLogModule, UsersModule],
  controllers: [OrgsController],
  providers: [OrgsService],
  exports: [OrgsService],
})
export class OrgsModule {}
