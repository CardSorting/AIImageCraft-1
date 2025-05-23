/**
 * Value Object representing text prompts
 * Encapsulates prompt validation and transformation logic
 */
export class Prompt {
  private constructor(public readonly value: string) {}

  static create(prompt: string): Prompt {
    this.validatePrompt(prompt);
    return new Prompt(prompt.trim());
  }

  static createBlank(): Prompt {
    return new Prompt("__BLANK__");
  }

  private static validatePrompt(prompt: string): void {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Prompt must be a non-empty string');
    }

    const trimmed = prompt.trim();
    if (trimmed.length < 2 || trimmed.length > 3000) {
      throw new Error('Prompt must be between 2 and 3000 characters');
    }
  }

  get isBlank(): boolean {
    return this.value === "__BLANK__";
  }

  get length(): number {
    return this.value.length;
  }

  equals(other: Prompt): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}