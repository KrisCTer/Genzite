import { Test, TestingModule } from '@nestjs/testing';
import { SchemaValidatorService } from './schema-validator.service';

describe('SchemaValidatorService', () => {
  let service: SchemaValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SchemaValidatorService],
    }).compile();

    service = module.get<SchemaValidatorService>(SchemaValidatorService);
  });

  describe('validate', () => {
    it('should not throw for valid schema and data', () => {
      const schema: any = { properties: { title: { type: 'string' } } };
      const data = { title: 'Test' };
      
      expect(() => service.validate(schema, data)).not.toThrow();
    });

    it('should throw BadRequestException for invalid data', () => {
      const schema: any = { properties: { title: { type: 'number' } } };
      const data = { title: 'Test' }; // string instead of number
      
      expect(() => service.validate(schema, data)).toThrow();
    });
  });
});
