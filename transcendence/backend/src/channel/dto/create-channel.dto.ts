import { IsNotEmpty, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateChannelDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsBoolean()
  is_public: boolean;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  joinToken?: string;

  @IsNotEmpty()
  owner_id: number;
}
