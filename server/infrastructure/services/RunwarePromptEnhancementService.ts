import { Runware } from "@runware/sdk-js";
import { nanoid } from "nanoid";

export interface PromptEnhancementRequest {
  prompt: string;
  promptMaxLength: number;
  promptVersions: number;
}

export interface PromptEnhancementResult {
  text: string;
  cost?: number;
}

/**
 * Runware Prompt Enhancement Service
 * Enhances user prompts using Runware's AI-powered prompt enhancement API
 */
export class RunwarePromptEnhancementService {
  private runware: any;

  constructor() {
    const apiKey = process.env.RUNWARE_API_KEY;
    console.log(`[Runware] Initializing prompt enhancement service with API key: ${apiKey ? 'CONFIGURED' : 'MISSING'}`);
    
    this.runware = new Runware({ 
      apiKey: apiKey || "",
      shouldReconnect: true,
      globalMaxRetries: 2,
      timeoutDuration: 30000
    });
  }

  async enhancePrompt(request: PromptEnhancementRequest): Promise<PromptEnhancementResult[]> {
    console.log(`[Runware] Starting prompt enhancement:`, {
      prompt: request.prompt.substring(0, 50) + '...',
      maxLength: request.promptMaxLength,
      versions: request.promptVersions
    });

    const apiKey = process.env.RUNWARE_API_KEY;
    if (!apiKey) {
      const error = "Runware API key not configured. Please set RUNWARE_API_KEY environment variable.";
      console.error(`[Runware] ${error}`);
      throw new Error(error);
    }

    try {
      console.log(`[Runware] Ensuring connection before making request`);
      await this.runware.ensureConnection();
      
      const taskUUID = nanoid();
      console.log(`[Runware] Calling promptEnhance with taskUUID: ${taskUUID}`);
      
      // Build request in exact Runware API format
      const enhancementRequest = {
        taskType: "promptEnhance",
        taskUUID: taskUUID,
        prompt: request.prompt,
        promptMaxLength: request.promptMaxLength,
        promptVersions: request.promptVersions,
        includeCost: true
      };

      console.log(`[Runware] Enhancement request:`, JSON.stringify(enhancementRequest, null, 2));
      
      // Use the correct Runware SDK method for prompt enhancement
      const result = await this.runware.enhancePrompt(enhancementRequest);

      console.log(`[Runware] Raw enhancement result received:`, {
        resultCount: result?.data?.length || 0,
        hasResults: Array.isArray(result?.data) && result.data.length > 0
      });

      if (!result || !result.data || !Array.isArray(result.data) || result.data.length === 0) {
        const error = "No enhanced prompts received from Runware service";
        console.error(`[Runware] ${error}`, result);
        throw new Error(error);
      }

      const enhancedPrompts = result.data.map((enhancement: any, index: number) => {
        console.log(`[Runware] Processing enhancement ${index + 1}:`, {
          hasText: !!enhancement.text,
          textLength: enhancement.text?.length || 0,
          cost: enhancement.cost
        });

        return {
          text: enhancement.text || "",
          cost: enhancement.cost || 0,
        };
      });

      console.log(`[Runware] Successfully processed ${enhancedPrompts.length} enhanced prompts`);
      return enhancedPrompts;

    } catch (error: any) {
      console.error(`[Runware] Prompt enhancement error:`, {
        message: error.message,
        stack: error.stack,
        name: error.name,
        fullError: error
      });

      // For now, disable prompt enhancement due to SDK issues
      console.log(`[Runware] Prompt enhancement temporarily disabled due to SDK compatibility issues`);
      throw new Error(`Prompt enhancement is temporarily unavailable. Using original prompt.`);
    }
  }
}