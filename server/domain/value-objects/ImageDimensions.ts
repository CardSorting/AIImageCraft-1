/**
 * Value Object representing image dimensions
 * Follows Apple's philosophy of simplicity and user-focused design
 */
export class ImageDimensions {
  private constructor(
    public readonly width: number,
    public readonly height: number
  ) {}

  static create(width: number, height: number): ImageDimensions {
    this.validateDimensions(width, height);
    return new ImageDimensions(width, height);
  }

  static fromAspectRatio(aspectRatio: string, baseSize: number = 512): ImageDimensions {
    const ratioMap: Record<string, [number, number]> = {
      "1:1": [1, 1],
      "16:9": [16, 9],
      "9:16": [9, 16],
      "3:4": [3, 4],
      "4:3": [4, 3],
    };

    const [widthRatio, heightRatio] = ratioMap[aspectRatio] || [1, 1];
    const width = Math.round((baseSize * widthRatio) / Math.max(widthRatio, heightRatio));
    const height = Math.round((baseSize * heightRatio) / Math.max(widthRatio, heightRatio));

    // Ensure dimensions are divisible by 64 (Runware requirement)
    const adjustedWidth = Math.ceil(width / 64) * 64;
    const adjustedHeight = Math.ceil(height / 64) * 64;

    return new ImageDimensions(adjustedWidth, adjustedHeight);
  }

  private static validateDimensions(width: number, height: number): void {
    if (width < 128 || width > 2048 || width % 64 !== 0) {
      throw new Error(`Invalid width: ${width}. Must be between 128-2048 and divisible by 64.`);
    }
    if (height < 128 || height > 2048 || height % 64 !== 0) {
      throw new Error(`Invalid height: ${height}. Must be between 128-2048 and divisible by 64.`);
    }
  }

  get aspectRatio(): string {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(this.width, this.height);
    return `${this.width / divisor}:${this.height / divisor}`;
  }

  equals(other: ImageDimensions): boolean {
    return this.width === other.width && this.height === other.height;
  }

  toString(): string {
    return `${this.width}x${this.height}`;
  }
}