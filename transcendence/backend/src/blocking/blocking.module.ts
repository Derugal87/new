import { Module } from '@nestjs/common';
import { BlockingController } from './blocking.controller';
import { BlockingService } from './blocking.service';
import { UserService } from '../user/user.service';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { BlockingGateway } from './blocking.gateway';

@Module({
    imports: [UserModule, AuthModule],
    controllers: [BlockingController],
    providers: [BlockingService, BlockingGateway],
})
export class BlockingModule {}
