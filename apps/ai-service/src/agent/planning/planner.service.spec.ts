import { Test, TestingModule } from '@nestjs/testing';
import { PlannerService } from './planner.service';
import { GeminiClient } from '../../gemini/gemini.client';
import { ToolRegistry } from '../tools/tool.registry';
import { GeminiApiException } from '../../gemini/gemini.exception';

describe('PlannerService', () => {
  let service: PlannerService;
  let geminiClientMock: any;
  let toolRegistryMock: any;

  beforeEach(async () => {
    geminiClientMock = {
      generateJson: jest.fn(),
    };

    toolRegistryMock = {
      getDeclarations: jest.fn().mockReturnValue([{ name: 'test_action' }]),
      getAll: jest.fn().mockReturnValue([{ declaration: { name: 'test_action', description: 'test' } }]),
      executeTool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlannerService,
        { provide: GeminiClient, useValue: geminiClientMock },
        { provide: ToolRegistry, useValue: toolRegistryMock },
      ],
    }).compile();

    service = module.get<PlannerService>(PlannerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('planAndExecute', () => {
    it('should generate a plan and execute steps successfully', async () => {
      const mockPlan = {
        goal: 'test goal',
        steps: [
          {
            id: 'step_1',
            description: 'do something',
            action: 'test_action',
            params: { key: 'value' },
            dependsOn: [],
          },
        ],
      };

      geminiClientMock.generateJson.mockResolvedValue(mockPlan);
      toolRegistryMock.executeTool.mockResolvedValue({ success: true });

      const result = await service.planAndExecute('test goal');

      expect(result.plan.goal).toBe('test goal');
      expect(result.plan.status).toBe('completed');
      expect(result.plan.steps[0].status).toBe('done');
      expect(result.plan.steps[0].result).toEqual({ success: true });
      expect(toolRegistryMock.executeTool).toHaveBeenCalledWith('test_action', { key: 'value' });
    });

    it('should handle step failure and trigger re-plan', async () => {
      const initialPlan = {
        goal: 'test goal',
        steps: [
          {
            id: 'step_1',
            description: 'failing step',
            action: 'test_action',
            params: {},
            dependsOn: [],
          },
        ],
      };

      const fallbackPlan = {
        goal: 'test goal',
        steps: [
          {
            id: 'step_2',
            description: 'fallback step',
            action: 'test_action',
            params: { fallback: true },
            dependsOn: [],
          },
        ],
      };

      geminiClientMock.generateJson
        .mockResolvedValueOnce(initialPlan) // Initial plan
        .mockResolvedValueOnce(fallbackPlan); // Re-plan

      toolRegistryMock.executeTool
        .mockRejectedValueOnce(new Error('Tool failed')) // Fails first time
        .mockResolvedValueOnce({ success: true }); // Succeeds second time

      const result = await service.planAndExecute('test goal');

      // The final plan should include the failed step and the fallback plan
      expect(result.plan.steps).toHaveLength(2);
      expect(result.plan.steps[0].id).toBe('step_1');
      expect(result.plan.steps[0].status).toBe('failed');
      expect(result.plan.steps[1].id).toBe('step_2');
      expect(result.plan.steps[1].status).toBe('done');
      expect(result.plan.status).toBe('failed');
      expect(geminiClientMock.generateJson).toHaveBeenCalledTimes(2);
    });

    it('should throw GeminiApiException if Gemini generation fails', async () => {
      geminiClientMock.generateJson.mockRejectedValue(new Error('API Down'));

      await expect(service.planAndExecute('goal')).rejects.toThrow();
    });
  });
});
