// src/hooks/useImageUpload.ts
import { useState } from 'react';

interface ImageUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  originalName?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

interface UseImageUploadReturn {
  uploadImage: (file: File) => Promise<ImageUploadResult>;
  deleteImage: (filename: string) => Promise<boolean>;
  validateImage: (filename: string) => Promise<boolean>;
  isUploading: boolean;
  uploadProgress: number;
}

const API_BASE_URL = 'http://localhost:8080/api';

export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadImage = async (file: File): Promise<ImageUploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Validaciones del lado del cliente
      if (!file) {
        throw new Error('No se ha seleccionado ningún archivo');
      }

      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP');
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('El archivo es demasiado grande. Máximo 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch(`${API_BASE_URL}/imagenes/upload`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al subir la imagen');
      }

      return result;
    } catch (error) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al subir la imagen'
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes/delete/${filename}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la imagen');
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  const validateImage = async (filename: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/imagenes/validate/${filename}`);
      
      if (!response.ok) {
        return false;
      }

      const result = await response.json();
      return result.exists;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    deleteImage,
    validateImage,
    isUploading,
    uploadProgress
  };
};