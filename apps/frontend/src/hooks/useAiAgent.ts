import { useState, useCallback } from 'react';
import { dispatchUiAgent, getJobStatus } from '../api/ai-agent.api';
import { useWorkspaceStore } from '../stores/useWorkspaceStore';

export const useAiAgent = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');
  const { addScreen, screens } = useWorkspaceStore();

  const generateUI = useCallback(async (prompt: string) => {
    try {
      setIsGenerating(true);
      setProgress('Dispatching to AI Service...');
      
      const jobId = await dispatchUiAgent(prompt);
      
      // Polling mechanism
      const pollInterval = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);
          setProgress(`Agent is thinking... (Status: ${status.state})`);
          
          if (status.state === 'completed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setProgress('');
            
            // Assume the result contains the VDOM node tree
            const generatedNodes = status.result?.nodes || [];
            
            // Create a new screen and add it to the canvas
            addScreen({
              id: `screen-${Date.now()}`,
              name: `Generated: ${prompt.substring(0, 20)}...`,
              x: 100 + (screens.length * 40),
              y: 100 + (screens.length * 40),
              width: 1440,
              height: 900,
              nodes: generatedNodes
            });
          } else if (status.state === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            setProgress(`Failed: ${status.failedReason}`);
          }
        } catch (e) {
          console.error("Polling error", e);
        }
      }, 2000);
      
    } catch (error) {
      setIsGenerating(false);
      setProgress('Failed to connect to AI Service');
    }
  }, [addScreen, screens.length]);

  return { generateUI, isGenerating, progress };
};
