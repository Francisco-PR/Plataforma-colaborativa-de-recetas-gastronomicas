import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from 'src/users/entities/user.entity';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService
  ],
  imports: [
    ConfigModule.forRoot(),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema }
    ]),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SEED,
      signOptions: { expiresIn: '6h' },
    }),

  ],
  exports:[AuthService],
})
export class AuthModule {}
