// src/hooks/useRanking.ts
import { useState } from 'react';
import type { RankingProductoDTO } from '../types/estadisticas/RankingProductoDTO';
import { EstadisticasService } from '../services/EstadisticasService';

// AQUÍ ESTÁ LA CORRECCIÓN: Se usa "export const" para que la función pueda ser importada por otros archivos.
export const useRanking = () => {
  const [rankingData, setRankingData] = useState<RankingProductoDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async (fechaDesde: string, fechaHasta: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await EstadisticasService.getRankingProductos(fechaDesde, fechaHasta, 10); // Top 10 por defecto
      setRankingData(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener el ranking');
    } finally {
      setLoading(false);
    }
  };

  return { rankingData, loading, error, fetchRanking };
};