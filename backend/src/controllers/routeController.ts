import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { calculateRoutes } from '../services/routeCalculator';

export const searchRoutes = async (req: Request, res: Response) => {
  try {
    const {
      originLat,
      originLon,
      destinationLat,
      destinationLon,
      departureTime,
      arrivalTime,
      optimization = 'fastest',
      maxTransfers = 3,
    } = req.body;

    // Validate input
    if (!originLat || !originLon || !destinationLat || !destinationLon) {
      throw new AppError(400, 'Origin and destination coordinates are required');
    }

    // Calculate routes
    const routes = await calculateRoutes(
      {
        lat: parseFloat(originLat),
        lon: parseFloat(originLon),
      },
      {
        lat: parseFloat(destinationLat),
        lon: parseFloat(destinationLon),
      },
      {
        departureTime: departureTime ? new Date(departureTime) : new Date(),
        arrivalTime: arrivalTime ? new Date(arrivalTime) : undefined,
        optimization,
        maxTransfers,
      }
    );

    res.json({
      routes,
      count: routes.length,
      optimization,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Route search failed' });
  }
};

export const saveRoute = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const {
      originName,
      originLat,
      originLon,
      destinationName,
      destinationLat,
      destinationLon,
      label,
      routeData,
      isFavorite = false,
    } = req.body;

    const result = await query(
      `INSERT INTO saved_routes
       (user_id, origin_name, origin_lat, origin_lon, destination_name, destination_lat, destination_lon, label, route_data, is_favorite)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        req.userId,
        originName,
        originLat,
        originLon,
        destinationName,
        destinationLat,
        destinationLon,
        label,
        JSON.stringify(routeData),
        isFavorite,
      ]
    );

    res.status(201).json({
      message: 'Route saved successfully',
      route: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to save route' });
  }
};

export const getSavedRoutes = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const result = await query(
      `SELECT * FROM saved_routes WHERE user_id = $1 ORDER BY updated_at DESC`,
      [req.userId]
    );

    res.json({
      routes: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get saved routes' });
  }
};

export const updateSavedRoute = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;
    const { label, isFavorite } = req.body;

    const result = await query(
      `UPDATE saved_routes
       SET label = COALESCE($1, label),
           is_favorite = COALESCE($2, is_favorite)
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [label, isFavorite, id, req.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Route not found');
    }

    res.json({
      message: 'Route updated successfully',
      route: result.rows[0],
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update route' });
  }
};

export const deleteSavedRoute = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { id } = req.params;

    const result = await query(
      `DELETE FROM saved_routes WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, 'Route not found');
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
};
