import { JwtGuard } from './jwt.guard';
import { Reflector } from '@nestjs/core';

describe('JwtGuard', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    expect(new JwtGuard(reflector)).toBeDefined();
  });
});
