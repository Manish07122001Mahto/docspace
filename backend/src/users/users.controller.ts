import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Post('login')
  login(@Body() dto: { email: string; name?: string }) {
    return this.usersService.findOrCreate(dto.email, dto.name);
  }
}
