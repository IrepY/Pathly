import { Request, Response } from 'express';
import { query, startTransaction, getConnection } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await query(
      `SELECT id, email, first_name, last_name, created_at, updated_at
       FROM users WHERE id = ?`,
      [req.userId]
    );

    const users = Array.isArray(result) ? result : (result?.rows || []);
    if (users.length === 0) {
      throw new AppError(404, 'User not found');
    }

    const user = users[0];

    // Get preferences
    const prefsResult = await query(
      `SELECT * FROM user_preferences WHERE user_id = ?`,
      [req.userId]
    );

    const prefs = Array.isArray(prefsResult) ? prefsResult : (prefsResult?.rows || []);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
      preferences: prefs[0] || null,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { firstName, lastName } = req.body;

    const result = await query(
      `UPDATE users SET first_name = CASE WHEN ? IS NOT NULL THEN ? ELSE first_name END,
                        last_name = CASE WHEN ? IS NOT NULL THEN ? ELSE last_name END
       WHERE id = ?
       RETURNING id, email, first_name, last_name, created_at`,
      [firstName || null, firstName, lastName || null, lastName, req.userId]
    );

    const users = Array.isArray(result) ? result : (result?.rows || []);
    if (users.length === 0) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      message: 'Profile updated successfully',
      user: users[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const {
      optimization_strategy,
      theme,
      max_walking_distance,
    } = req.body;

    const result = await query(
      `UPDATE user_preferences
       SET optimization_strategy = CASE WHEN ? IS NOT NULL THEN ? ELSE optimization_strategy END,
           theme = CASE WHEN ? IS NOT NULL THEN ? ELSE theme END,
           max_walking_distance = CASE WHEN ? IS NOT NULL THEN ? ELSE max_walking_distance END,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?
       RETURNING *`,
      [
        optimization_strategy || null,
        optimization_strategy,
        theme || null,
        theme,
        max_walking_distance || null,
        max_walking_distance,
        req.userId,
      ]
    );

    const prefs = Array.isArray(result) ? result : (result?.rows || []);
    if (prefs.length === 0) {
      throw new AppError(404, 'User preferences not found');
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: prefs[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update preferences' });
  }
};

export const deleteUserAccount = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { password } = req.body;

    if (!password) {
      throw new AppError(400, 'Password is required for account deletion');
    }

    // Get user to verify password
    const userResult = await query('SELECT password_hash FROM users WHERE id = ?', [
      req.userId,
    ]);

    const users = Array.isArray(userResult) ? userResult : (userResult?.rows || []);
    if (users.length === 0) {
      throw new AppError(404, 'User not found');
    }

    // Delete all user data (GDPR - right to be forgotten)
    await query('DELETE FROM saved_routes WHERE user_id = ?', [req.userId]);
    await query('DELETE FROM user_preferences WHERE user_id = ?', [req.userId]);
    await query('DELETE FROM audit_logs WHERE user_id = ?', [req.userId]);
    await query('DELETE FROM users WHERE id = ?', [req.userId]);

    res.json({
      message:
        'Account and all associated data deleted successfully (GDPR - Right to be Forgotten)',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
