// import { IsString, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

// export class TwoFactorAuthDto {
//     @IsBoolean()
//     @IsNotEmpty()
//     readonly two_factor_auth_enabled: boolean;

//     @IsString()
//     readonly two_factor_auth_secret: string;

//     @IsString()
//     readonly two_factor_auth_url: string;

//     @IsNumber()
//     readonly id: number;

//     @IsString()
//     readonly nickname: string;
// }

import { IsString, IsBoolean, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class TwoFactorAuthDto {
    @IsBoolean()
    @IsNotEmpty()
    @IsOptional()
    readonly two_factor_auth_enabled?: boolean;

    @IsString()
    @IsOptional()
    readonly two_factor_auth_secret?: string;

    @IsString()
    @IsOptional()
    readonly two_factor_auth_url?: string;

    @IsNumber()
    readonly id: number;

    @IsString()
    readonly nickname: string;
}
