import type { Request, Response, NextFunction } from "express"

export class UserError extends Error {
  status: number
  constructor(
    message: string = "",
    status: number = 400,
    options?: ErrorOptions
  ) {
    super(message, options)
    this.status = status
  }
}

export default (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof UserError) {
    return res.status(err.status).json({ error: err.message })
  }

  console.error(err.stack)
  console.error(err.name,err.message)
  res.status(500).json({ error: "Internal server error" })
}
