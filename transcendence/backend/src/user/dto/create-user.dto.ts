import { IsString, IsOptional, Length, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly id_42: string;

  @IsOptional()
  @IsString()
  oauthToken?: string;

  @IsOptional()
  @IsString()
  refreshToken?: string;
  
  @IsOptional()
  @IsString()
  stateParameter?: string;

  @IsString()
  @IsOptional()
  @Length(1, 15)
  readonly nickname: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  readonly two_factor_auth_enabled?: boolean;

  @IsString()
  @IsOptional()
  readonly two_factor_auth_secret?: string;

  @IsString()
  @IsOptional()
  readonly two_factor_auth_url?: string;

  @IsString()
  @IsOptional()
  status: 'online' | 'offline';
}
