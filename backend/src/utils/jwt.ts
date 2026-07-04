import jwt, { type SignOptions } from 'jsonwebtoken'
import { env } from '../config/env.js'

export interface JwtPayload {
  sub: string
}

export function signToken(userId: string): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'] }
  return jwt.sign({ sub: userId } satisfies JwtPayload, env.jwtSecret, options)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.jwtSecret) as JwtPayload
}
