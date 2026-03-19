import { IsEmail, IsNotEmpty, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'user@gmail.com',
    description: 'User email address (must be @gmail.com)',
  })
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@gmail\.com$/, {
    message: 'Email must be a @gmail.com address',
  })
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @Length(5, 200, { message: 'Password must be more than 5 characters long' })
  password: string;
}
