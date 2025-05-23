export class GetImagesQuery {
  constructor(
    public readonly limit: number = 50
  ) {
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }
}