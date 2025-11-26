import { create } from 'zustand';

export interface Route {
  id: string;
  legs: any[];
  totalDuration: number;
  totalDistance: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
}

export interface RouteState {
  routes: Route[];
  selectedRoute: Route | null;
  isLoading: boolean;
  error: string | null;

  setRoutes: (routes: Route[]) => void;
  setSelectedRoute: (route: Route | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearRoutes: () => void;
}

export const useRouteStore = create<RouteState>((set) => ({
  routes: [],
  selectedRoute: null,
  isLoading: false,
  error: null,

  setRoutes: (routes) => set({ routes }),
  setSelectedRoute: (route) => set({ selectedRoute: route }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearRoutes: () => set({ routes: [], selectedRoute: null }),
}));
