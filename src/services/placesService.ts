import api from "./api";

export interface Place {
  _id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  location?: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  tags: string[];
  photos: string[];
  rating?: number;
  numReviews?: number;
  distance?: number;
}

export interface Dish {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  likes?: number;
  recommendedPlaces: any[];
}

class PlacesService {
  async getPopularPlaces(lat?: number, lng?: number): Promise<Place[]> {
    try {
      const url = lat && lng ? `/api/feed/popular-places?lat=${lat}&lng=${lng}` : "/api/feed/popular-places";
      const response = await api.get(url); // ✅ CORREGIDO
      // La API puede devolver { data: [...] } o directamente [...]
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (error: any) {
      console.error(
        "Error en getPopularPlaces:",
        error.response?.data || error.message,
      );
      // En caso de error, devolver array vacío en lugar de lanzar error
      return [];
    }
  }

  async getPopularDishes(): Promise<Dish[]> {
    try {
      const response = await api.get("/api/feed/popular-dishes"); // ✅ Agregado /
      // La API puede devolver { data: [...] } o directamente [...]
      return Array.isArray(response.data)
        ? response.data
        : response.data.data || [];
    } catch (error: any) {
      console.error(
        "Error en getPopularDishes:",
        error.response?.data || error.message,
      );
      // En caso de error, devolver array vacío en lugar de lanzar error
      return [];
    }
  }

  async getPlaceById(id: string): Promise<Place | null> {
    try {
      const response = await api.get(`/api/places/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(
        "Error en getPlaceById:",
        error.response?.data || error.message,
      );
      return null;
    }
  }

  async getDishById(id: string): Promise<Dish | null> {
    try {
      const response = await api.get(`/api/dishes/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(
        "Error en getDishById:",
        error.response?.data || error.message,
      );
      return null;
    }
  }

  async getDishesByPlaceId(placeId: string): Promise<Dish[]> {
    try {
      const response = await api.get(`/api/places/${placeId}/dishes`);
      return response.data;
    } catch (error: any) {
      console.error(
        "Error en getDishesByPlaceId:",
        error.response?.data || error.message,
      );
      return [];
    }
  }

  async likeDish(dishId: string): Promise<void> {
    try {
      await api.post(`/api/dishes/${dishId}/like`);
    } catch (error: any) {
      console.error(
        "Error al dar like:",
        error.response?.data || error.message,
      );
      throw new Error(error.response?.data?.message || "Error al dar like");
    }
  }

  // En placesService.ts - actualizar el método addReview

  async addReview(
    placeId: string,
    rating: number,
    comment: string,
  ): Promise<{ message: string; newPoints: number }> {
    try {
      const response = await api.post(`/api/places/${placeId}/reviews`, {
        rating,
        comment,
      });
      return response.data;
    } catch (error: any) {
      console.error(
        "Error al agregar reseña:",
        error.response?.data || error.message,
      );
      throw new Error(
        error.response?.data?.message || "Error al agregar reseña",
      );
    }
  }

  // Agregar estos métodos al servicio existente

  async getNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 5,
  ): Promise<Place[]> {
    try {
      const response = await api.get(
        `/api/places?lat=${lat}&lng=${lng}&radius=${radius}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby places:", error);
      throw error;
    }
  }

  async getPlacesByCategory(category: string, lat?: number, lng?: number): Promise<Place[]> {
    try {
      const url = lat && lng 
        ? `/api/places?category=${category}&lat=${lat}&lng=${lng}` 
        : `/api/places?category=${category}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching places by category:", error);
      throw error;
    }
  }
}

export default new PlacesService();
