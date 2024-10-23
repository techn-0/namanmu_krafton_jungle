import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema : UserSchema}]),
    PassportModule.register({ defaultStrategy: 'jwt'}),
    JwtModule.register({
      secret: 'My trainer hides his identity',
      signOptions:{
        expiresIn: 3600
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtStrategy, PassportModule, MongooseModule]
})
export class AuthModule {}
