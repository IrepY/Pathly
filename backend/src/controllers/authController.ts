import { Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, full_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, full_name, created_at`,
      [email, passwordHash, fullName || null]
    );

    const user = result.rows[0];

    // Create user preferences
    await query(
      `INSERT INTO user_preferences (user_id)
       VALUES ($1)`,
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Find user
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      throw new AppError(401, 'Invalid email or password');
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
      token,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed' });
  }
};

export const logout = (req: Request, res: Response) => {
  // JWT-alapú autentikáció esetén az logout csak az ügyfél oldalon történik
  // A token törlődik a kliens oldali storage-ból
  res.json({ message: 'Logout successful' });
};
