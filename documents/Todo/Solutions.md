# Circular Dependency

Use relative path in the import ('../friendship/friendship.module'; )
not ('src/friendship/friendship.module')

import the necessary services or entities or modules in the modules file

Issues

turned off async refreshOAuthToken(id: number) in user.service.ts
turned off authservice and http service in user.service.ts
turned off async createUser(createUserDto: CreateUserDto): Promise<UserEntity> in user.service.ts
turned off private readonly channelService: ChannelService, in channelMembership.service.ts
turned off some parts of async createMembership(createMembershipDto: CreateChannelMembershipDto): Promise<ChannelMembershipEntity> in channelMembership.service.ts
