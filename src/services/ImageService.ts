// src/services/ImageService.ts

const API_BASE_URL = 'http://localhost:8080/api/imagenes';

export interface ImageUploadResult {
  success: boolean;
  filename?: string;
  url?: string;
  originalName?: string;
  size?: number;
  contentType?: string;
  error?: string;
}

export interface ImageValidationResult {
  exists: boolean;
  url?: string;
  filename?: string;
}

export class ImageService {
  
  /**
   * Sube una imagen al servidor
   */
  static async uploadImage(file: File): Promise<ImageUploadResult> {
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

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

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
    }
  }

  /**
   * Elimina una imagen del servidor
   */
  static async deleteImage(filename: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/delete/${filename}`, {
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
  }

  /**
   * Valida si una imagen existe en el servidor
   */
  static async validateImage(filename: string): Promise<ImageValidationResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/validate/${filename}`);
      
      if (!response.ok) {
        return { exists: false };
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error validating image:', error);
      return { exists: false };
    }
  }

  /**
   * Extrae el nombre del archivo de una URL
   */
  static extractFilenameFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      return parts[parts.length - 1] || null;
    } catch (error) {
      console.error('Error extracting filename from URL:', error);
      return null;
    }
  }

  /**
   * Verifica si una URL es una imagen válida
   */
  static isValidImageUrl(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.endsWith(ext));
  }

  /**
   * Genera una URL de placeholder para imágenes
   */
  static getPlaceholderUrl(width: number = 300, height: number = 200): string {
    return `https://via.placeholder.com/${width}x${height}/f3f4f6/6b7280?text=Sin+Imagen`;
  }
}