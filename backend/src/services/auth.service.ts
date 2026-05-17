import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UserRepository } from '../repositories';
import { JwtPayload, Role } from '../types';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors';
import type { LoginInput, RegisterInput } from '../validators';

const userRepository = new UserRepository();

export class AuthService {
  async login(data: LoginInput) {
    const user = await userRepository.findByUniversityId(data.universityId);

    if (!user) {
      throw new UnauthorizedError('Código universitario o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Tu cuenta ha sido desactivada. Contacta al administrador');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Código universitario o contraseña incorrectos');
    }

    const token = this.generateToken({
      userId: user.id,
      role: user.role as Role,
    });

    return {
      user: {
        id: user.id,
        universityId: user.universityId,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  async register(data: RegisterInput) {
    const existingByUniId = await userRepository.findByUniversityId(
      data.universityId
    );
    if (existingByUniId) {
      throw new ConflictError('El código universitario ya está registrado');
    }

    const existingByEmail = await userRepository.findByEmail(data.email);
    if (existingByEmail) {
      throw new ConflictError('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await userRepository.create({
      universityId: data.universityId,
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    const token = this.generateToken({
      userId: user.id,
      role: user.role as Role,
    });

    return { user, token };
  }

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('Usuario');
    }

    return user;
  }

  private generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }
}
