export class GetImageByIdQuery {
  constructor(
    public readonly id: number
  ) {
    if (id <= 0) {
      throw new Error('Image ID must be a positive number');
    }
  }
}