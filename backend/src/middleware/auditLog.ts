import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database';

export const auditLog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Middleware a műveleteket naplózza (önálló kérés után)
  res.on('finish', async () => {
    try {
      if (req.userId) {
        const action = `${req.method} ${req.path}`;
        const ipAddress = req.ip;
        const userAgent = req.get('user-agent');

        await query(
          `INSERT INTO audit_logs (user_id, action, ip_address, user_agent)
           VALUES ($1, $2, $3, $4)`,
          [req.userId, action, ipAddress, userAgent]
        );
      }
    } catch (error) {
      console.error('Audit log error:', error);
    }
  });

  next();
};
