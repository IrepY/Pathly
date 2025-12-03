import { Request, Response } from 'express';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { findRoutes, searchStopsByName } from '../services/routeSearchService';

export const searchRoutes = async (req: Request, res: Response) => {
  try {
    const {
      originName,
      destinationName,
      maxTransfers = 3,
      preferredTypes,
    } = req.body;

    // Validate input
    if (!originName || !destinationName) {
      throw new AppError(400, 'Origin and destination stop names are required');
    }

    // Search routes using the route search service
    const result = await findRoutes(
      originName.trim(),
      destinationName.trim(),
      {
        preferredTypes: preferredTypes || ['metro', 'tram', 'bus'],
        allowTransfers: maxTransfers > 0,
        maxTransfers: maxTransfers,
      }
    );

    res.json({
      success: result.success,
      routes: result.routes,
      count: result.routes.length,
      fromLocation: result.fromLocation,
      toLocation: result.toLocation,
      dataSource: result.dataSource,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Route search error:', error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    res.status(500).json({ error: 'Route search failed', details: (error as Error).message });
  }
};

export const getStopSuggestions = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
      return res.json({ stops: [] });
    }

    const stops = await searchStopsByName(search);
    res.json({ stops });
  } catch (error) {
    console.error('Stop search error:', error);
    res.status(500).json({ error: 'Stop search failed' });
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
      notes,
      routeData,
    } = req.body;

    // Insert the route
    await query(
      `INSERT INTO saved_routes
       (user_id, origin_name, origin_lat, origin_lon, destination_name, destination_lat, destination_lon, notes, route_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        originName,
        originLat,
        originLon,
        destinationName,
        destinationLat,
        destinationLon,
        notes,
        JSON.stringify(routeData),
      ]
    );

    // Get the created route
    const result = await query(
      `SELECT * FROM saved_routes WHERE user_id = ? ORDER BY saved_at DESC LIMIT 1`,
      [req.userId]
    );

    const routes = Array.isArray(result) ? result : (result?.rows || []);
    res.status(201).json({
      message: 'Route saved successfully',
      route: routes[0],
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
      `SELECT * FROM saved_routes WHERE user_id = ? ORDER BY saved_at DESC`,
      [req.userId]
    );

    const routes = Array.isArray(result) ? result : (result?.rows || []);
    res.json({
      routes,
      count: routes.length,
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
    const { notes } = req.body;

    const result = await query(
      `UPDATE saved_routes
       SET notes = CASE WHEN ? IS NOT NULL THEN ? ELSE notes END
       WHERE id = ? AND user_id = ?
       RETURNING *`,
      [notes || null, notes, id, req.userId]
    );

    const routes = Array.isArray(result) ? result : (result?.rows || []);
    if (routes.length === 0) {
      throw new AppError(404, 'Route not found');
    }

    res.json({
      message: 'Route updated successfully',
      route: routes[0],
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
      `DELETE FROM saved_routes WHERE id = ? AND user_id = ? RETURNING id`,
      [id, req.userId]
    );

    const deleted = Array.isArray(result) ? result : (result?.rows || []);
    if (deleted.length === 0) {
      throw new AppError(404, 'Route not found');
    }

    res.json({ message: 'Route deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete route' });
  }
};
