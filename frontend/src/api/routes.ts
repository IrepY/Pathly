import apiClient from './client';

export interface Coordinate {
  lat: number;
  lon: number;
}

export interface RouteSearchRequest {
  originLat: number;
  originLon: number;
  destinationLat: number;
  destinationLon: number;
  departureTime?: string;
  arrivalTime?: string;
  optimization?: 'fastest' | 'least_transfers' | 'earliest_departure';
  maxTransfers?: number;
}

export interface SavedRoute {
  id: string;
  originName: string;
  originLat: number;
  originLon: number;
  destinationName: string;
  destinationLat: number;
  destinationLon: number;
  label?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const routeApi = {
  search: (data: RouteSearchRequest): Promise<any> =>
    apiClient.post('/routes/search', data).then((res) => res.data),

  saveRoute: (data: any): Promise<any> =>
    apiClient.post('/routes/save', data).then((res) => res.data),

  getSavedRoutes: (): Promise<{ routes: SavedRoute[]; count: number }> =>
    apiClient.get('/routes/saved').then((res) => res.data),

  updateSavedRoute: (id: string, data: any): Promise<any> =>
    apiClient.put(`/routes/saved/${id}`, data).then((res) => res.data),

  deleteSavedRoute: (id: string): Promise<any> =>
    apiClient.delete(`/routes/saved/${id}`).then((res) => res.data),
};
