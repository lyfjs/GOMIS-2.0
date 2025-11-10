export interface Printer {
  name: string;
  displayName: string;
  description: string;
  status: string;
}

export interface ElectronAPI {
  saveAndPrintDocx: (data: { buffer: number[]; filename: string }) => Promise<{ success: boolean; filePath?: string; error?: string }>;
  getPrinters: () => Promise<Printer[]>;
  savePrinter: (printerName: string) => Promise<{ success: boolean; error?: string }>;
  getSavedPrinter: () => Promise<{ printer: string | null }>;
  selectDirectory: () => Promise<{ canceled: boolean; path?: string; error?: string }>;
  getDbConfig: () => Promise<{ dbConfig: string | null; error?: string }>;
  saveDbConfig: (dbConfig: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
