import React, { useState } from 'react';
import { useRanking } from '../../hooks/useRanking';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import * as XLSX from 'xlsx';

// AQUÍ ESTÁ LA CORRECCIÓN: Se usa "export const" en lugar de solo "const"
export const RankingView: React.FC = () => {
  const { rankingData, loading, error, fetchRanking } = useRanking();
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  const handleBuscar = () => {
    if (fechaDesde && fechaHasta) {
      fetchRanking(fechaDesde, fechaHasta);
    } else {
      alert('Por favor, seleccione ambas fechas.');
    }
  };

  const handleExportar = () => {
    if (rankingData.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rankingData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "RankingProductos");
    XLSX.writeFile(workbook, `Ranking_Productos_${fechaDesde}_a_${fechaHasta}.xlsx`);
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-2xl font-bold mb-4">Ranking de Productos Vendidos</h3>

      {/* --- Filtros --- */}
      <div className="flex items-center space-x-4 mb-4 bg-white p-3 rounded-md shadow-sm">
        <div className="flex-1">
          <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700">Fecha Desde</label>
          <input type="date" id="fechaDesde" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="flex-1">
          <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700">Fecha Hasta</label>
          <input type="date" id="fechaHasta" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div className="self-end">
          <Button onClick={handleBuscar} disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar Ranking'}
          </Button>
        </div>
        <div className="self-end">
          <Button onClick={handleExportar} disabled={rankingData.length === 0} variant="secondary">
            Exportar a Excel
          </Button>
        </div>
      </div>

      {/* --- Tabla de Resultados --- */}
      {loading && <LoadingSpinner />}
      {error && <Alert message={error} type="error" />}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-red-500 text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Producto</th>
                <th className="py-3 px-4 text-left">Cantidad Vendida</th>
              </tr>
            </thead>
            <tbody>
              {rankingData.length > 0 ? (
                rankingData.map((item, index) => (
                  <tr key={item.idArticulo} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold">{index + 1}</td>
                    <td className="py-3 px-4">{item.denominacionArticulo}</td>
                    <td className="py-3 px-4">{item.cantidadVendida}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-gray-500">
                    No hay datos para el rango de fechas seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};