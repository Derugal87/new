import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional, IsString, Length, IsInt } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {

  // @IsOptional()
  // @IsBoolean()
  // readonly two_factor_auth_enabled?: boolean;

  // @IsString()
  // @IsOptional()
  // readonly two_factor_auth_secret?: string;

  // @IsString()
  // @IsOptional()
  // readonly two_factor_auth_url?: string;

  @IsOptional()
  @IsString()
  readonly id_42?: string;

  @IsOptional()
  @IsString()
  @Length(1, 15)
  readonly nickname?: string;

  @IsOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsOptional()
  @IsInt()
  readonly points?: number;

}
