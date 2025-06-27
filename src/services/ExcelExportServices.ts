import * as XLSX from 'xlsx';

// Esta función genérica puede exportar cualquier array de objetos a un archivo Excel.
export const exportToExcel = (data: any[], fileName: string) => {
  // 1. Crear una nueva hoja de cálculo a partir de tus datos
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // 2. Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();
  
  // 3. Añadir la hoja de cálculo al libro, dándole un nombre (ej. "Datos")
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  
  // 4. Generar el archivo y gatillar la descarga en el navegador
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().slice(0,10)}.xlsx`);
};