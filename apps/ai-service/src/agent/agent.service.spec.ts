import { Test, TestingModule } from '@nestjs/testing';
import { AgentService } from './agent.service';
import { GeminiClient } from '../gemini/gemini.client';
import { ToolRegistry } from './tools/tool.registry';
import { GeminiApiException } from '../gemini/gemini.exception';

describe('AgentService', () => {
  let service: AgentService;
  let geminiClientMock: any;
  let toolRegistryMock: any;

  beforeEach(async () => {
    geminiClientMock = {
      getModelWithTools: jest.fn(),
    };

    toolRegistryMock = {
      getDeclarations: jest.fn().mockReturnValue([]),
      executeTool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentService,
        { provide: GeminiClient, useValue: geminiClientMock },
        { provide: ToolRegistry, useValue: toolRegistryMock },
      ],
    }).compile();

    service = module.get<AgentService>(AgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('chat', () => {
    it('should return plain text response without tool calls', async () => {
      const mockChatSession = {
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            functionCalls: () => [],
            text: () => 'Hello from Gemini',
          },
        }),
      };

      geminiClientMock.getModelWithTools.mockReturnValue({
        startChat: jest.fn().mockReturnValue(mockChatSession),
      });

      const result = await service.chat('Hi there');

      expect(result.message).toBe('Hello from Gemini');
      expect(result.toolCalls).toHaveLength(0);
      expect(mockChatSession.sendMessage).toHaveBeenCalledWith('Hi there');
    });

    it('should execute tool and loop back to Gemini', async () => {
      const mockChatSession = {
        sendMessage: jest.fn(),
      };

      // First call returns a function call
      mockChatSession.sendMessage.mockResolvedValueOnce({
        response: {
          functionCalls: () => [{ name: 'test_tool', args: { foo: 'bar' } }],
          text: () => '',
        },
      });

      // Second call returns final text
      mockChatSession.sendMessage.mockResolvedValueOnce({
        response: {
          functionCalls: () => [],
          text: () => 'Tool executed successfully.',
        },
      });

      geminiClientMock.getModelWithTools.mockReturnValue({
        startChat: jest.fn().mockReturnValue(mockChatSession),
      });

      toolRegistryMock.executeTool.mockResolvedValue({ success: true });

      const result = await service.chat('Please use test_tool');

      expect(result.message).toBe('Tool executed successfully.');
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls[0].tool).toBe('test_tool');
      expect(result.toolCalls[0].result).toEqual({ success: true });
      expect(toolRegistryMock.executeTool).toHaveBeenCalledWith('test_tool', { foo: 'bar' });
      expect(mockChatSession.sendMessage).toHaveBeenCalledTimes(2);
    });

    it('should throw GeminiApiException on error', async () => {
      geminiClientMock.getModelWithTools.mockImplementation(() => {
        throw new Error('API Error');
      });

      await expect(service.chat('Hi')).rejects.toThrow(GeminiApiException);
    });
  });
});
