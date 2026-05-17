export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'El recurso ya existe') {
    super(message, 409);
  }
}
