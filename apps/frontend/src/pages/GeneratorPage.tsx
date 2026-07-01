import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetRenderer } from '@genzite/shared-ui';
import { LucideSparkles, LucideLoader2 } from 'lucide-react';

export const GeneratorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [generatedWidgets, setGeneratedWidgets] = useState<any[] | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setProgress(5);
    setStatusText('Initializing...');
    setGeneratedWidgets(null);

    try {
      // 1. Call Backend API (Remember to proxy in vite.config.ts for local dev)
      const res = await fetch('http://localhost:3000/ai/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error('Cannot connect to AI Service');
      }

      const { jobId } = await res.json();

      // 2. Open SSE Streaming connection
      const eventSource = new EventSource(`http://localhost:3000/ai/stream/${jobId}`);

      eventSource.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.percent) setProgress(data.percent);
        if (data.step) setStatusText(data.step);

        if (data.done) {
          eventSource.close();
          
          if (!data.error) {
            setStatusText('Rendering UI...');
            
            if (data.subdomain) {
              let attempts = 0;
              const maxAttempts = 5;
              const pollSiteData = async () => {
                attempts++;
                try {
                  const siteRes = await fetch(`http://localhost:3000/sites/by-subdomain/${data.subdomain}`);
                  if (siteRes.ok) {
                    const siteData = await siteRes.json();
                    if (siteData.pages && siteData.pages.length > 0) {
                      const firstPage = siteData.pages[0];
                      setGeneratedWidgets(firstPage.widgets || []);
                      setIsGenerating(false);
                      return;
                    }
                  }
                } catch (e) {
                  // ignore network errors on retry
                }

                if (attempts < maxAttempts) {
                  setTimeout(pollSiteData, 1000);
                } else {
                  setStatusText('Timeout waiting for site data. Please check back later.');
                  setIsGenerating(false);
                }
              };
              pollSiteData();
            } else {
              setStatusText('Warning: No subdomain returned from AI.');
              setIsGenerating(false);
            }
          } else {
            setStatusText(`Error: ${data.error}`);
            setIsGenerating(false);
          }
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setStatusText('Connection to server lost.');
        setIsGenerating(false);
      };

    } catch (error: any) {
      setStatusText(error.message);
      setIsGenerating(false);
    }
  };

  if (generatedWidgets) {
    return (
      <div className="relative bg-zinc-950 min-h-screen">
        <div className="fixed top-4 left-4 z-50">
          <button 
            onClick={() => setGeneratedWidgets(null)}
            className="px-4 py-2 bg-zinc-800 text-white rounded-full text-sm hover:bg-zinc-700 shadow-xl"
          >
            ← Create another site
          </button>
        </div>
        {/* JSON to UI render engine */}
        <WidgetRenderer widgets={generatedWidgets} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            Genzite AI
          </h1>
          <p className="text-zinc-400 text-lg">Describe the website you want, AI will do the rest.</p>
        </div>

        <form onSubmit={handleGenerate} className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isGenerating}
            placeholder="Example: Create a sneaker landing page with a dynamic color tone..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-5 pl-6 pr-32 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all shadow-2xl"
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white px-6 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            {isGenerating ? <LucideLoader2 className="animate-spin w-5 h-5" /> : <LucideSparkles className="w-5 h-5" />}
            {isGenerating ? 'Generating...' : 'Generate Now'}
          </button>
        </form>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <div className="flex justify-between text-sm mb-3 font-medium">
                  <span className="text-blue-400">{statusText}</span>
                  <span className="text-zinc-400">{progress}%</span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
