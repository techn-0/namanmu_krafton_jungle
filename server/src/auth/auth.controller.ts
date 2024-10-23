import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { UserCredentialDto } from './dto/auth-credential.dto';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signup')
  signUp(
    @Body() userCredentialDto: UserCredentialDto,
  ): Promise<{ message: string }> {
    return this.authService.signUp(userCredentialDto);
  }
  
  @Post('/signin')
  signIn(
    @Body() userCredentialDto: UserCredentialDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.signIn(userCredentialDto);
  }

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@Req() req) {
    console.log('user', req.user);
  }
}
