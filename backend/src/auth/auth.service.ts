import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phone, password, role, name } = registerDto;

    // Check if user exists by phone
    const existingUser = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      throw new ConflictException('Số điện thoại đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (no email for tenants, optional for landlords)
    const user = await this.prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        role: role as UserRole,
        email: null, // No email, use phone as identifier
      },
    });

    // Create role-specific profile
    if (role === 'LANDLORD') {
      await this.prisma.landlord.create({
        data: {
          userId: user.id,
          name,
          phone,
        },
      });
    } else if (role === 'TENANT') {
      await this.prisma.tenant.create({
        data: {
          userId: user.id,
          name,
          phone,
        },
      });
    }

    const payload = { sub: user.id, phone: user.phone, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { phone, password } = loginDto;

    // Find user by phone
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Số điện thoại hoặc mật khẩu không đúng');
    }

    const payload = { sub: user.id, phone: user.phone, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }
}


