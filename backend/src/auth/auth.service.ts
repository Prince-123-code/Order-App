import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

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
        message: 'User created',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        const field = e?.meta?.target?.includes('email') ? 'Email' : 'Name';
        throw new ConflictException(`${field} already exists`);
      }
      throw e;
    }
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ name: data.name }, { email: data.name }],
      },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const access_token = this.jwtService.sign({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return { message: 'Login success', access_token };
  }
}
