import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) { }

  async register(data: RegisterDto) {

    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashedPassword,
        },
      });

      return {
        message: "User created",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
      };
    } catch (e: any) {
      // Prisma error when table does not exist
      if (e?.code === 'P2021') {
        throw new InternalServerErrorException(
          'Database table not found. Did you run your migrations/push?'
        );
      }
      throw e; // rethrow other errors
    }
  }

  async login(data: LoginDto) {

    const user = await this.prisma.user.findUnique({
      where: { name: data.name }
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    return {
      message: "Login success",
      access_token: token
    };
  }

}