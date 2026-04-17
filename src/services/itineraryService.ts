import api from "./api";

export interface ItineraryActivity {
  time: string;
  placeName: string;
  description: string;
  address: string;
  category: string;
}

export interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface Itinerary {
  _id?: string;
  title: string;
  description?: string;
  days: ItineraryDay[];
  createdAt?: string;
}

class ItineraryService {
  async saveItinerary(itinerary: Itinerary): Promise<Itinerary> {
    try {
      const response = await api.post<Itinerary>("/api/itineraries", itinerary);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al guardar el itinerario");
    }
  }

  async getMyItineraries(): Promise<Itinerary[]> {
    try {
      const response = await api.get<Itinerary[]>("/api/itineraries");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al obtener tus itinerarios");
    }
  }

  async deleteItinerary(id: string): Promise<void> {
    try {
      await api.delete(`/api/itineraries/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Error al eliminar el itinerario");
    }
  }
}

export default new ItineraryService();
