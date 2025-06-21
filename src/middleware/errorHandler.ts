import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export const errorHandler = (error: AppError, req: Request, res: Response, next: NextFunction): void => {
  let { statusCode = 500, message } = error

  // Log error
  logger.error("Error occurred:", {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  })

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400
    message = "Validation failed"
  } else if (error.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  } else if (error.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  } else if (error.message.includes("duplicate key")) {
    statusCode = 409
    message = "Resource already exists"
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === "production" && statusCode === 500) {
    message = "Internal server error"
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
  })
}

export const createError = (message: string, statusCode = 500): AppError => {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
