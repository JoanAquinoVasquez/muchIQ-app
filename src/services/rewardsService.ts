import api from './api';

export interface Partner {
  _id: string;
  name: string;
  category: string;
  address: string;
  longitude: number;
  latitude: number;
}

export interface Reward {
  _id: string;
  name: string;
  description: string;
  pointsCost: number;
  partnerId: string;
  stock: number;
  imageUrl?: string;
  partner?: Partner;
  discount?: string;
  validUntil?: string;
}

class RewardsService {
  async getRewards(): Promise<Reward[]> {
    try {
      const response = await api.get<Reward[]>('/api/rewards');
      
      // Enriquecer las recompensas con información adicional
      const enrichedRewards = response.data.map(reward => ({
        ...reward,
        discount: this.calculateDiscount(reward.pointsCost),
        validUntil: '31 Dic 2025',
        imageUrl: reward.imageUrl || this.getDefaultImage(reward.name),
      }));

      return enrichedRewards;
    } catch (error: any) {
      console.error('Error al obtener recompensas:', error);
      throw new Error(error.response?.data?.message || 'Error al obtener recompensas');
    }
  }

  async getPartners(): Promise<Partner[]> {
    try {
      const response = await api.get<Partner[]>('/api/partners');
      return response.data;
    } catch (error: any) {
      console.error('Error al obtener partners:', error);
      return [];
    }
  }

  async redeemReward(rewardId: string): Promise<{ success: boolean; qrCode: string }> {
    try {
      const response = await api.post(`/api/rewards/${rewardId}/redeem`);
      
      // Generar código QR único
      const qrData = `REWARD-${rewardId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        qrCode: qrData,
      };
    } catch (error: any) {
      console.error('Error al canjear recompensa:', error);
      throw new Error(error.response?.data?.message || 'Error al canjear recompensa');
    }
  }

  private calculateDiscount(pointsCost: number): string {
    // Calcular descuento basado en los puntos
    if (pointsCost >= 200) return '50%';
    if (pointsCost >= 150) return '40%';
    if (pointsCost >= 100) return '30%';
    if (pointsCost >= 50) return '20%';
    return '10%';
  }

  private getDefaultImage(rewardName: string): string {
    // Asignar imágenes por defecto según el nombre
    const name = rewardName.toLowerCase();
    
    if (name.includes('ceviche') || name.includes('comida') || name.includes('plato')) {
      return 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800';
    }
    if (name.includes('museo') || name.includes('cultura')) {
      return 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800';
    }
    if (name.includes('tour') || name.includes('turismo')) {
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800';
    }
    if (name.includes('café') || name.includes('cafeteria')) {
      return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800';
    }
    if (name.includes('artesanía') || name.includes('tienda')) {
      return 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=800';
    }
    
    // Imagen por defecto
    return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800';
  }
}

export default new RewardsService();