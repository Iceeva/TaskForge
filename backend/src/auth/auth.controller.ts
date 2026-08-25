import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

class RegisterDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() name?: string;
}

class LoginDto {
  @IsEmail() email!: string;
  @IsString() password!: string;
  @IsOptional() @IsString() code?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password, dto.code);
  }

  @Post('refresh')
  refresh(@Body('refreshToken') token: string) {
    return this.auth.refreshToken(token);
  }

  @Post('2fa/setup')
  @UseGuards(AuthGuard('jwt'))
  setup2FA(@Req() req) {
    return this.auth.setup2FA(req.user.sub);
  }

  @Post('2fa/verify')
  @UseGuards(AuthGuard('jwt'))
  verify2FA(@Req() req, @Body('code') code: string) {
    return this.auth.verify2FA(req.user.sub, code);
  }
}
