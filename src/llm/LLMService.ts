/**
 * LLMService - Web-LLM integration with local caching
 *
 * Uses @mlc-ai/web-llm for local inference + response caching
 * for repeated tasks.
 *
 * Fallback to CPU-only if WebGPU not available (slower but works)
 */

console.log('[LLMService.ts] File loading...');

import * as webllm from '@mlc-ai/web-llm';

// Temporarily disable cache to debug mobile issue
// import { responseCache as responseCacheImport } from './ResponseCache';

console.log('[LLMService] LLM Service loaded (cache disabled)');

interface LLMConfig {
  model: string;
  nCtx: number;
  temperature: number;
}

export class LLMService {
  private static instance: LLMService;
  private engine: webllm.MLCEngine | null = null;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private config: LLMConfig = {
    model: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', // ~900MB quantized model - smaller cache footprint
    nCtx: 2048,
    temperature: 0.7,
  };
  private webGPUSupported: boolean = false;

  private constructor() {
    console.log('[LLMService] Constructor called - mode: Web-LLM');
    this.checkWebGPU();
  }

  static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Check if WebGPU is available
   */
  private checkWebGPU(): void {
    if (typeof navigator !== 'undefined') {
      // @ts-ignore - WebGPU is in experimental APIs
      this.webGPUSupported = !!navigator.gpu;
      console.log('[LLMService] WebGPU supported:', this.webGPUSupported);

      if (!this.webGPUSupported) {
        console.warn('[LLMService] ⚠️ WebGPU not available - will use CPU fallback (slower)');
        console.warn('[LLMService] For better performance, use Chrome/Edge with WebGPU enabled');
      }
    }
  }

  /**
   * Initialize Web-LLM engine
   */
  async initialize(): Promise<{ success: boolean; message: string }> {
    if (this.isLoading) {
      console.log('[LLMService] Already loading, please wait...');
      return { success: false, message: 'Already loading...' };
    }

    if (this.isLoaded) {
      console.log('[LLMService] Already initialized');
      return { success: true, message: 'Already initialized' };
    }

    try {
      this.isLoading = true;
      console.log('[LLMService] Initializing Web-LLM...');

      // Cache disabled for debugging
      // getCache();

      const selectedModel = this.config.model;

      console.log('[LLMService] About to create MLCEngine...');

      // Create MLCEngine with configuration
      this.engine = new webllm.MLCEngine({
        initProgressCallback: (report) => {
          console.log(`[LLMService] Loading: ${report.progress.toFixed(1)}% - ${report.text}`);
        },
        logLevel: 'INFO',
      });

      console.log('[LLMService] MLCEngine created, loading model:', selectedModel);

      // Try to load - will fail gracefully if WebGPU not available
      try {
        await this.engine.reload(this.config.model);
      } catch (error: any) {
        console.error('[LLMService] WebGPU load failed:', error);
        console.error('[LLMService] Error name:', error?.name);
        console.error('[LLMService] Error message:', error?.message);

        // Handle cache errors specifically
        if (error?.message?.includes('cache') || error?.message?.includes('Cache')) {
          console.warn('[LLMService] Cache API error - web-llm caching failed, but model may still load');
          return {
            success: false,
            message: `Cache error: ${error?.message}. Try using Chrome/Edge directly or check browser console for more details.`,
          };
        }

        if (error?.message?.includes('WebGPUNotAvailableError')) {
          return {
            success: false,
            message: 'WebGPU not available in your browser. Please use Chrome/Edge with WebGPU enabled, or enable it at chrome://flags/#enable-unsafe-webgpu',
          };
        }

        return {
          success: false,
          message: error?.message || 'Failed to load model',
        };
      }

        if (error?.message?.includes('WebGPUNotAvailableError')) {
          return {
            success: false,
            message: 'WebGPU not available in your browser. Please use Chrome/Edge with WebGPU enabled, or enable it at chrome://flags/#enable-unsafe-webgpu',
          };
        }

        return {
          success: false,
          message: error?.message || 'Failed to load model',
        };
      }

      this.isLoaded = true;
      this.isLoading = false;
      console.log('[LLMService] Web-LLM initialized successfully!');

      return {
        success: true,
        message: 'Model loaded successfully',
      };
    } catch (error: any) {
      console.error('[LLMService] Failed to initialize Web-LLM:', error);
      console.error('[LLMService] Error name:', error?.name);
      console.error('[LLMService] Error message:', error?.message);
      console.error('[LLMService] Error stack:', error?.stack);
      this.isLoading = false;
      return {
        success: false,
        message: error?.message || 'Unknown error',
      };
    }
  }

  /**
   * Generate a task breakdown (caching disabled for debugging)
   */
  async breakdownTask(task: string): Promise<{ response: string; fromCache: boolean; inferenceTime: number }> {
    // Cache disabled for debugging
    // Check cache first (with safety check for mobile)
    /*
    let cached = null;
    try {
      const cache = getCache();
      cached = cache?.get(task);
    } catch (e) {
      console.error('[LLMService] Cache get error:', e);
    }

    if (cached) {
      console.log('[LLMService] Using cached response');
      return {
        response: cached.response,
        fromCache: true,
        inferenceTime: cached.inferenceTime,
      };
    }
    */

    // If not loaded, try to initialize
    if (!this.isLoaded) {
      console.log('[LLMService] Not loaded, initializing...');
      const result = await this.initialize();
      if (!result.success) {
        throw new Error(result.message);
      }
    }

    console.log('[LLMService] Generating breakdown for:', task);

    const prompt = this.buildPrompt(task);
    const startTime = performance.now();

    try {
      // Generate with Web-LLM
      const messages = [
        {
          role: 'user' as const,
          content: prompt,
        },
      ];

      const reply = await this.engine!.chat.completions.create({
        messages: messages as any,
        temperature: this.config.temperature,
        max_tokens: 2000, // Increased to allow longer breakdowns
      });

      const response = reply.choices[0].message.content || 'No response generated';
      const endTime = performance.now();
      const inferenceTime = endTime - startTime;

      console.log(`[LLMService] Generated response in ${inferenceTime.toFixed(0)}ms`);

      // Cache disabled for debugging
      /*
      try {
        const cache = getCache();
        cache?.set(task, response, inferenceTime);
      } catch (e) {
        console.error('[LLMService] Cache set error:', e);
      }
      */

      return {
        response,
        fromCache: false,
        inferenceTime,
      };
    } catch (error) {
      console.error('[LLMService] Generation failed:', error);
      throw new Error('Failed to generate breakdown');
    }
  }

  /**
   * Get current memory usage (estimated)
   */
  async getMemoryUsage(): Promise<string> {
    if (!this.isLoaded) {
      return 'Not loaded';
    }

    // Web-LLM doesn't expose memory directly, use estimate based on model
    const modelSizes: Record<string, string> = {
      'Phi-3-mini-4k-instruct-q4f16_1-MLC': '~1.5GB',
      'Qwen2-1.5B-Instruct-q4f16_1-MLC': '~900MB',
      'Llama-3-8B-Instruct-q4f16_1-MLC': '~4.2GB',
    };

    const sizeStr = modelSizes[this.config.model] || '~1.5GB (estimated)';
    return this.webGPUSupported ? `${sizeStr} (GPU accel)` : `${sizeStr} (CPU only)`;
  }

  /**
   * Get LLM status
   */
  getStatus(): string {
    if (this.isLoading) {
      return 'Loading model... (first load takes 1-3 minutes)';
    }
    if (!this.isLoaded) {
      return `Not initialized • WebGPU: ${this.webGPUSupported ? '✓' : '✗'} - Click "Initialize LLM" button`;
    }
    // Cache disabled for debugging
    /*
    const cache = getCache();
    const cacheStats = cache?.getStats() || { size: 0, sizeBytes: 0 };
    */
    const cacheStats = { size: 0, sizeBytes: 0 };
    const accel = this.webGPUSupported ? 'GPU' : 'CPU (slower)';
    return `Ready (${accel}) • ${this.config.model} • ${cacheStats.size} cached responses`;
  }

  /**
   * Check if WebGPU is available
   */
  isWebGPUSupported(): boolean {
    return this.webGPUSupported;
  }

  /**
   * Check if loaded
   */
  isLoadedStatus(): boolean {
    return this.isLoaded;
  }

  /**
   * Check if loading in progress
   */
  isLoadingStatus(): boolean {
    return this.isLoading;
  }

  /**
   * Get cache stats for display (cache disabled for debugging)
   */
  getCacheStats(): { size: number; sizeBytes: number } {
    // Cache disabled for debugging
    return { size: 0, sizeBytes: 0 };
    /*
    try {
      const cache = getCache();
      return cache?.getStats() || { size: 0, sizeBytes: 0 };
    } catch (e) {
      console.error('[LLMService] getCacheStats error:', e);
      return { size: 0, sizeBytes: 0 };
    }
    */
  }

  /**
   * Clear cache (cache disabled for debugging)
   */
  clearCache(): void {
    // Cache disabled for debugging
    /*
    try {
      const cache = getCache();
      cache?.clear();
    } catch (e) {
      console.error('[LLMService] clearCache error:', e);
    }
    */
  }

  /**
   * Reset the LLM (free memory)
   */
  async reset(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.unload();
      } catch (e) {
        console.error('[LLMService] Error unloading:', e);
      }
      this.engine = null;
    }
    this.isLoaded = false;
  }

  /**
   * Build the task breakdown prompt
   */
  private buildPrompt(task: string): string {
    return `You are an AI assistant designed to help people with ADHD break down overwhelming tasks into concrete, actionable steps.

Your job: Take a vague task and break it down into 3-6 specific, doable steps.

Rules:
1. Use numbered format: "1. [Action] (X min)"
2. Keep each step under 2 sentences
3. Use simple, clear language
4. Estimate realistic time per step in minutes
5. Make each step feel like a "quick win"
6. DO NOT use sub-bullets, nested lists, or placeholder text like "[Clear action]"
7. Each step must have (X min) with an actual number

Example format:
1. Gather all necessary tools and supplies (5 min)
2. Remove debris from the yard (20 min)
3. Sweep the entire area (15 min)
4. Mow the lawn at desired height (45 min)

Task: ${task}

Breakdown:`;
  }
}

// Export singleton instance
export const llmService = LLMService.getInstance();
console.log('[LLMService] Exported llmService singleton');