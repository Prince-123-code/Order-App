import { IsEmail, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {

  @ApiProperty({ example: 'johndoe', description: 'User name' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  password: string;

}