/**
 * Value Object representing advanced image generation options
 * Follows the comprehensive Runware API specification
 */
export interface AcceleratorOptions {
  readonly teaCache?: boolean;
  readonly teaCacheDistance?: number;
  readonly deepCache?: boolean;
  readonly deepCacheInterval?: number;
  readonly deepCacheBranchId?: number;
}

export interface RefinerOptions {
  readonly model: string;
  readonly startStep?: number;
  readonly startStepPercentage?: number;
}

export interface PuLIDOptions {
  readonly inputImages: string[];
  readonly idWeight?: number;
  readonly trueCFGScale?: number;
  readonly CFGStartStep?: number;
  readonly CFGStartStepPercentage?: number;
}

export class ImageGenerationOptions {
  private constructor(
    public readonly steps: number,
    public readonly cfgScale: number,
    public readonly seed?: number,
    public readonly scheduler?: string,
    public readonly clipSkip?: number,
    public readonly promptWeighting?: string,
    public readonly numberResults: number = 1,
    public readonly outputType: 'URL' | 'base64Data' | 'dataURI' = 'URL',
    public readonly outputFormat: 'JPG' | 'PNG' | 'WEBP' = 'PNG',
    public readonly outputQuality?: number,
    public readonly checkNSFW: boolean = true,
    public readonly acceleratorOptions?: AcceleratorOptions,
    public readonly refiner?: RefinerOptions,
    public readonly puLID?: PuLIDOptions
  ) {}

  static create(options: {
    steps?: number;
    cfgScale?: number;
    seed?: number;
    scheduler?: string;
    clipSkip?: number;
    promptWeighting?: string;
    numberResults?: number;
    outputType?: 'URL' | 'base64Data' | 'dataURI';
    outputFormat?: 'JPG' | 'PNG' | 'WEBP';
    outputQuality?: number;
    checkNSFW?: boolean;
    acceleratorOptions?: AcceleratorOptions;
    refiner?: RefinerOptions;
    puLID?: PuLIDOptions;
  } = {}): ImageGenerationOptions {
    const {
      steps = 20,
      cfgScale = 7,
      numberResults = 1,
      outputType = 'URL',
      outputFormat = 'PNG',
      checkNSFW = true,
      ...rest
    } = options;

    this.validateOptions(steps, cfgScale, numberResults, options.outputQuality);

    return new ImageGenerationOptions(
      steps,
      cfgScale,
      rest.seed,
      rest.scheduler,
      rest.clipSkip,
      rest.promptWeighting,
      numberResults,
      outputType,
      outputFormat,
      rest.outputQuality,
      checkNSFW,
      rest.acceleratorOptions,
      rest.refiner,
      rest.puLID
    );
  }

  private static validateOptions(
    steps: number,
    cfgScale: number,
    numberResults: number,
    outputQuality?: number
  ): void {
    if (steps < 1 || steps > 100) {
      throw new Error('Steps must be between 1 and 100');
    }
    if (cfgScale < 0 || cfgScale > 50) {
      throw new Error('CFG Scale must be between 0 and 50');
    }
    if (numberResults < 1 || numberResults > 20) {
      throw new Error('Number of results must be between 1 and 20');
    }
    if (outputQuality !== undefined && (outputQuality < 20 || outputQuality > 99)) {
      throw new Error('Output quality must be between 20 and 99');
    }
  }

  withSteps(steps: number): ImageGenerationOptions {
    return new ImageGenerationOptions(
      steps,
      this.cfgScale,
      this.seed,
      this.scheduler,
      this.clipSkip,
      this.promptWeighting,
      this.numberResults,
      this.outputType,
      this.outputFormat,
      this.outputQuality,
      this.checkNSFW,
      this.acceleratorOptions,
      this.refiner,
      this.puLID
    );
  }

  withSeed(seed: number): ImageGenerationOptions {
    return new ImageGenerationOptions(
      this.steps,
      this.cfgScale,
      seed,
      this.scheduler,
      this.clipSkip,
      this.promptWeighting,
      this.numberResults,
      this.outputType,
      this.outputFormat,
      this.outputQuality,
      this.checkNSFW,
      this.acceleratorOptions,
      this.refiner,
      this.puLID
    );
  }

  equals(other: ImageGenerationOptions): boolean {
    return JSON.stringify(this) === JSON.stringify(other);
  }
}