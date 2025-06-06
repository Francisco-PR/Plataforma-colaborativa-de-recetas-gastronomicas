import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { BanUserDto } from './dto/ban-user.dto';
import { GetUser } from 'src/decorators/user.decorator';
import { IsAdmin } from 'src/decorators/isAdmin.decorator';

@Controller('users')
export class UsersController {
  constructor( private readonly usersService: UsersService ) {}

  @UseGuards( AuthGuard, AdminGuard )
  @Get()
  findAll(
    @Query() query: {
      username?: string;
      isbanned?: string;
      page?: number;
    }
  ) {
    return this.usersService.findAll( query );
  }

  @UseGuards( AuthGuard, AdminGuard )
  @Patch(':id/ban')
  banUser(
    @Param('id') userId: string,
    @Body() dto: BanUserDto
  ) {
    return this.usersService.banUser( userId, dto );
  }

  @UseGuards( AuthGuard, AdminGuard )
  @Patch(':id/unban')
  unBanUser(
    @Param('id') userId: string,
  ) {
    return this.usersService.unBanUser( userId );
  }

  //Metodo del admin
  @UseGuards( AuthGuard, AdminGuard )
  @Delete(':id')
  remove2(
    @Param('id') paramId: string,
    @IsAdmin() { isAdmin }: { isAdmin: boolean },
  ) {
    return this.usersService.remove( paramId, isAdmin );
  }

  //Metodo del usuario
  @UseGuards( AuthGuard )
  @Delete()
  remove(
    @GetUser('_id') userId: string,
  ) {
    return this.usersService.remove( userId );
  }
  
  
}
