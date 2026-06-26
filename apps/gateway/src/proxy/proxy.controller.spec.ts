import { Test, TestingModule } from '@nestjs/testing';
import { ProxyController } from './proxy.controller';
import { Request, Response } from 'express';
import * as httpProxy from 'http-proxy-middleware';

// Mock http-proxy-middleware
jest.mock('http-proxy-middleware', () => {
  const mockProxyFn = jest.fn();
  return {
    createProxyMiddleware: jest.fn(() => mockProxyFn),
  };
});

describe('ProxyController', () => {
  let controller: ProxyController;

  beforeEach(async () => {
    // Clear mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProxyController],
    }).compile();

    controller = module.get<ProxyController>(ProxyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('proxy', () => {
    it('should proxy request to correct service', () => {
      const req = {
        url: '/api/v1/auth/login',
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      
      const next = jest.fn();

      controller.proxy(req, res, next);
      
      // createProxyMiddleware returns a mock function which we expect to be called
      const mockProxyFn = httpProxy.createProxyMiddleware({} as any);
      expect(mockProxyFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should return 404 for unknown service', () => {
      const req = {
        url: '/api/v1/unknown-service/test',
      } as Request;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as Response;
      
      const next = jest.fn();

      controller.proxy(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service not found', path: '/api/v1/unknown-service/test' });
    });
  });

  describe('health', () => {
    it('should return ok', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.gateway).toBe(true);
    });
  });
});
