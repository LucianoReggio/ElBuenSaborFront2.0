// src/hooks/useCatalogoProductos.ts
import { useState, useEffect, useCallback } from "react";

import { productoService, insumoService } from "../services/apiInstance";




import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";
import type { ArticuloInsumoResponseDTO } from "../types/insumos/ArticuloInsumoResponseDTO";

// Tipo unificado para productos del catálogo 
export interface ProductoCatalogo {
  id: number;
  denominacion: string;
  descripcion?: string;
  precioVenta: number;
  imagenes: Array<{ idImagen?: number; denominacion: string; url: string }>;
  categoria: {
    idCategoria: number;
    denominacion: string;
    denominacionCategoriaPadre?: string;
  };
  tipo: 'manufacturado' | 'insumo';
  tiempoEstimadoEnMinutos?: number;
  stockSuficiente: boolean;
  cantidadVendida: number;
  costoTotal?: number;
  margenGanancia?: number;
  cantidadMaximaPreparable?: number;
  stockActual?: number;
  stockMaximo?: number;
  estadoStock?: string;
}



export const useCatalogoProductos = () => {
  const [productos, setProductos] = useState<ProductoCatalogo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapearManufacturado = useCallback((producto: ArticuloManufacturadoResponseDTO): ProductoCatalogo => ({
    id: producto.idArticulo,
    denominacion: producto.denominacion,
    descripcion: producto.descripcion,
    precioVenta: producto.precioVenta,
    imagenes: producto.imagenes || [],
    categoria: producto.categoria,
    tipo: 'manufacturado',
    tiempoEstimadoEnMinutos: producto.tiempoEstimadoEnMinutos,
    stockSuficiente: producto.stockSuficiente,
    cantidadVendida: producto.cantidadVendida || 0,
    costoTotal: producto.costoTotal,
    margenGanancia: producto.margenGanancia,
    cantidadMaximaPreparable: producto.cantidadMaximaPreparable,
  }), []);

  const mapearInsumo = useCallback((insumo: ArticuloInsumoResponseDTO): ProductoCatalogo => ({
    id: insumo.idArticulo,
    denominacion: insumo.denominacion,
    descripcion: `${insumo.denominacion} - Producto de calidad premium`,
    precioVenta: insumo.precioVenta,
    imagenes: insumo.imagenes || [],
    categoria: {
      idCategoria: insumo.idCategoria,
      denominacion: insumo.denominacionCategoria,
      denominacionCategoriaPadre: insumo.denominacionCategoriaPadre,
    },
    tipo: 'insumo',
    stockSuficiente: insumo.stockActual > 0,
    cantidadVendida: 0,
    stockActual: insumo.stockActual,
    stockMaximo: insumo.stockMaximo,
    estadoStock: insumo.estadoStock,
  }), []);

  const fetchProductosCatalogo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch productos manufacturados
      const productosManufacturados = await productoService.getAll();
      const productosManufacturadosActivos = productosManufacturados.filter(p => !p.eliminado);

      // Fetch insumos para venta (no para elaborar)
      const todosInsumos = await insumoService.getAll();
      // ✅ SE CORRIGE LA SINTAXIS DEL FILTER
      const insumosParaVenta = todosInsumos.filter((insumo) => !insumo.esParaElaborar);

      // Mapear y combinar
      const productosMap = productosManufacturadosActivos.map(mapearManufacturado);
      const insumosMap = insumosParaVenta.map(mapearInsumo);

      const productosCombinados = [...productosMap, ...insumosMap].sort((a, b) => {
        if (a.categoria.denominacion !== b.categoria.denominacion) {
          return a.categoria.denominacion.localeCompare(b.categoria.denominacion);
        }
        return a.denominacion.localeCompare(b.denominacion);
      });

      setProductos(productosCombinados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [mapearManufacturado, mapearInsumo]);

  const getProductosPorCategoria = useCallback((idCategoria: number): ProductoCatalogo[] => {
    return productos.filter(producto => producto.categoria.idCategoria === idCategoria);
  }, [productos]);

  const getProductosDestacados = useCallback((limite: number = 6): ProductoCatalogo[] => {
    return productos
      .filter(producto => producto.stockSuficiente)
      .sort((a, b) => {
        if (a.tipo === 'manufacturado' && b.tipo === 'manufacturado') {
          return b.cantidadVendida - a.cantidadVendida;
        }
        if (a.tipo === 'insumo' && b.tipo === 'insumo') {
          return (b.stockActual || 0) - (a.stockActual || 0);
        }
        return a.tipo === 'manufacturado' ? -1 : 1;
      })
      .slice(0, limite);
  }, [productos]);

  const getCategorias = useCallback(() => {
    const categoriasMap = new Map();
    
    productos.forEach(producto => {
      const cat = producto.categoria;
      if (!categoriasMap.has(cat.idCategoria)) {
        categoriasMap.set(cat.idCategoria, {
          idCategoria: cat.idCategoria,
          denominacion: cat.denominacion,
          denominacionCategoriaPadre: cat.denominacionCategoriaPadre,
          cantidadProductos: 0,
        });
      }
      categoriasMap.get(cat.idCategoria).cantidadProductos++;
    });

    return Array.from(categoriasMap.values()).sort((a, b) => 
      a.denominacion.localeCompare(b.denominacion)
    );
  }, [productos]);

  const buscarProductos = useCallback((termino: string): ProductoCatalogo[] => {
    if (!termino.trim()) return productos;
    
    const terminoLower = termino.toLowerCase();
    return productos.filter(producto =>
      producto.denominacion.toLowerCase().includes(terminoLower) ||
      producto.descripcion?.toLowerCase().includes(terminoLower) ||
      producto.categoria.denominacion.toLowerCase().includes(terminoLower)
    );
  }, [productos]);

  useEffect(() => {
    fetchProductosCatalogo();
  }, [fetchProductosCatalogo]);

  return {
    productos,
    loading,
    error,
    getProductosPorCategoria,
    getProductosDestacados,
    getCategorias,
    buscarProductos,
    refresh: fetchProductosCatalogo,
  };
};