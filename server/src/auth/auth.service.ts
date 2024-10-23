import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { UserCredentialDto } from './dto/auth-credential.dto';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}


    async signUp(userCredentialDto: UserCredentialDto): Promise<{message: string}>{
        const { id, password, email } = userCredentialDto;
        try{
            await this.userModel.create({
                username : id,
                password,
                email,
            });
            return { message: '회원가입 성공!'};
        } catch (error){
            console.log(error);
            if(error.code === 11000){
                throw new ConflictException('존재하는 ID입니다!');
            } else{
                throw new InternalServerErrorException();
            }
        }

    }

  async signIn(userCredentialDto: UserCredentialDto): Promise<{ accessToken : string}>{
      const { id, password } = userCredentialDto;
      const user = await this.userModel.findOne({username : id});


  if (user && user.password === password) {
    const payload = { id };
    const accessToken = await this.jwtService.sign(payload);
    return { accessToken };
  } else {
    throw new UnauthorizedException('로그인 실패');
  }
  }
  }



