import { Request, Response } from 'express';
import { query, startTransaction, getConnection } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await query(
      `SELECT id, email, full_name, created_at, last_login
       FROM users WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    const user = result.rows[0];

    // Get preferences
    const prefsResult = await query(
      `SELECT * FROM user_preferences WHERE user_id = $1`,
      [req.userId]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
      preferences: prefsResult.rows[0] || null,
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

    const { fullName } = req.body;

    const result = await query(
      `UPDATE users SET full_name = COALESCE($1, full_name)
       WHERE id = $2
       RETURNING id, email, full_name, created_at`,
      [fullName || null, req.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
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
      preferredOptimization,
      avoidTransfers,
      maxWalkingDistance,
      maxTransitTime,
      notificationsEnabled,
      theme,
    } = req.body;

    const result = await query(
      `UPDATE user_preferences
       SET preferred_optimization = COALESCE($1, preferred_optimization),
           avoid_transfers = COALESCE($2, avoid_transfers),
           max_walking_distance = COALESCE($3, max_walking_distance),
           max_transit_time = COALESCE($4, max_transit_time),
           notifications_enabled = COALESCE($5, notifications_enabled),
           theme = COALESCE($6, theme)
       WHERE user_id = $7
       RETURNING *`,
      [
        preferredOptimization,
        avoidTransfers,
        maxWalkingDistance,
        maxTransitTime,
        notificationsEnabled,
        theme,
        req.userId,
      ]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'User preferences not found');
    }

    res.json({
      message: 'Preferences updated successfully',
      preferences: result.rows[0],
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
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [
      req.userId,
    ]);

    if (userResult.rows.length === 0) {
      throw new AppError(404, 'User not found');
    }

    // Start transaction for GDPR compliance
    const client = await startTransaction();

    try {
      // Delete all user data (GDPR - right to be forgotten)
      // Delete saved routes
      await client.query('DELETE FROM saved_routes WHERE user_id = $1', [req.userId]);

      // Delete user preferences
      await client.query('DELETE FROM user_preferences WHERE user_id = $1', [
        req.userId,
      ]);

      // Delete audit logs
      await client.query('DELETE FROM audit_logs WHERE user_id = $1', [req.userId]);

      // Delete user account
      await client.query('DELETE FROM users WHERE id = $1', [req.userId]);

      await client.query('COMMIT');
      client.release();

      res.json({
        message:
          'Account and all associated data deleted successfully (GDPR - Right to be Forgotten)',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      throw error;
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
