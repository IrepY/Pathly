import { Request, Response } from 'express';
import { query } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, firstName, lastName } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    // Check if user exists
    const existingUser = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser && Array.isArray(existingUser) && existingUser.length > 0) {
      throw new AppError(409, 'User already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name)
       VALUES (?, ?, ?, ?)`,
      [email, passwordHash, firstName || fullName || null, lastName || null]
    );

    // Get the created user
    const userResult = await query(
      `SELECT id, email, first_name, last_name, created_at FROM users WHERE email = ?`,
      [email]
    );

    const users = Array.isArray(userResult) ? userResult : (userResult?.rows || []);
    const user = users[0];

    // Create user preferences
    await query(
      `INSERT INTO user_preferences (user_id)
       VALUES (?)`,
      [user.id]
    );

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Registration failed', details: (error as Error).message });
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
    const result = await query('SELECT * FROM users WHERE email = ?', [email]);
    const users = Array.isArray(result) ? result : (result?.rows || []);
    if (users.length === 0) {
      throw new AppError(401, 'Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Update last login
    await query('UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Login failed', details: (error as Error).message });
  }
};

export const logout = (req: Request, res: Response) => {
  // JWT-alapú autentikáció esetén az logout csak az ügyfél oldalon történik
  // A token törlődik a kliens oldali storage-ból
  res.json({ message: 'Logout successful' });
};
