import { Global, Module } from '@nestjs/common';
import { SchemaValidatorService } from './schema-validator.service.js';

@Global()
@Module({
  providers: [SchemaValidatorService],
  exports: [SchemaValidatorService],
})
export class ValidationModule {}
