export class ApplicationError extends Error {
  status: number;
  properties: Record<string, unknown> | null;

  constructor(
    message?: string,
    status?: number,
    properties?: Record<string, unknown>
  ) {
    super(message || 'Something went wrong');
    this.name = 'ApplicationError';
    this.status = status || 500;
    this.properties = properties || null;
  }

  toJSON() {
    return {
      message: this.message,
      properties: this.properties,
      status: this.status,
    };
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message?: string, properties?: Record<string, unknown>) {
    super(message || 'The requested resource is not found', 404, properties);
    this.name = 'NotFoundError';
  }
}
