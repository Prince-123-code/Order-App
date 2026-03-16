import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {

  constructor(private authService: AuthService){}

  @Public()
  @Post("register")
  @ApiOperation({ summary: 'Register a new user', description: 'Creates a new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request / Validation error' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  register(@Body() body:RegisterDto){
    return this.authService.register(body);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: 'Login user', description: 'Authenticates a user and returns a JWT token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful, returns JWT token' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() body:LoginDto){
    return this.authService.login(body);
  }

}