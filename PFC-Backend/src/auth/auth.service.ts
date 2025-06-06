import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import  * as bcryptjs  from 'bcryptjs'

import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload';

import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

import { RegisterDto } from './dto/register.dto';
import { LoginResponse } from './interfaces/login-response';
import { LoginDto } from './dto/login.dto';
import { User, UserDocument } from 'src/users/entities/user.entity';

@Injectable()
export class AuthService {

  constructor( 
    @InjectModel(User.name) private userModel: Model<UserDocument>,

    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    
    try {
      const { password, ...userData } = createUserDto

      const newUser = new this.userModel({
        password: bcryptjs.hashSync( password, 10 ),
        ...userData
      });

      await newUser.save()  
      const { password:_, ...user } = newUser.toJSON()
      return user
    } 
    catch (error) {

      if ( error.code ===  11000) {
        throw new BadRequestException(`${createUserDto.email} already exists!`)
      }
      throw new InternalServerErrorException('Something terrible happen!!!')
    }
  }

  //TODO ¿Debe existir?
  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById( id )
    const { password, ...rest } = user!.toJSON();
    return rest;
  }

  async register( registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.create( registerDto )

    return {
      user: user,
      token: this.getJwtToken({ id: user._id! })
    }
  }

  async login( loginDto: LoginDto): Promise<LoginResponse> {
    await this.admin() 
   

    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email });
    if ( !user ) {
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if (!bcryptjs.compareSync( password, user.password! ) ) {
      throw new UnauthorizedException('Not valid credentials - password')
    }

    if ( this.isUserBanned( user ) ){
      throw new UnauthorizedException('User banned')
    }

    const { password:_, ...rest } = user.toJSON()

    return {
      user: rest,
      token: this.getJwtToken( {id: user.id} )
    }
  }

  getJwtToken( payload: JwtPayload ) {
    const token = this.jwtService.sign( payload );
    return token;
  }

  async admin() {
    const adminUser = await this.userModel.findOne({ email: 'admin@moderator.mod' });
    if ( adminUser ) return
    await this.userModel.create({
      username: 'Administrador',
      email: 'admin@moderator.mod',
      password: bcryptjs.hashSync( process.env.ADMIN_PASS!, 10 ),
      roles:['User', 'Admin']
    })
  }

  isUserBanned(user: User): boolean {
    if (!user.bannedUntil) return false;
    return user.bannedUntil.getTime() > Date.now(); 
  }

}
