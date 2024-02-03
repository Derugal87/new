import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { UserGateway } from './user.gateway';
import { ChannelMembership } from '../channel-membership/channel-membership.entity';
// import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { MatchModule } from '../match/match.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, ChannelMembership]),
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MatchModule),
],
    controllers: [UserController],
    providers: [UserService, UserGateway],
    exports: [UserService, UserGateway],
})
export class UserModule {}
