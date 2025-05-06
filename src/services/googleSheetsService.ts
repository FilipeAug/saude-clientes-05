
import { Client } from './clientData';

const SPREADSHEET_ID = '1Grn9FetjKwuZ4M3TBuNPNbGyBm0TTnrBZDe5YTZfiKU';
const SHEET_ID = 'Sheet1'; // Assuming Sheet1 is the name of the sheet

export async function fetchSheetsData(): Promise<Client[]> {
  try {
    // Construct the URL to fetch CSV data using the Google Sheets API
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_ID}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }
    
    const csvText = await response.text();
    const clients = parseCSVToClients(csvText);
    
    return clients;
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

function parseCSVToClients(csv: string): Client[] {
  const lines = csv.split('\n');
  const headers = parseCSVLine(lines[0]);
  
  // Create an array to store clients
  const clients: Client[] = [];
  
  // Start from index 1 to skip the header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = parseCSVLine(line);
    
    // Map CSV columns to client properties
    // Assuming columns are in order: id, name, squad, fee, lt, status
    const client: Client = {
      id: parseInt(values[0], 10) || i, // Use index if ID parsing fails
      name: values[1] || `Cliente ${i}`,
      squad: values[2] || 'Outros',
      fee: parseFloat(values[3]) || 0,
      lt: parseInt(values[4], 10) || 0,
      status: mapStatus(values[5])
    };
    
    clients.push(client);
  }
  
  return clients;
}

// Helper function to correctly parse CSV lines (handles quoted values)
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue.trim().replace(/^"|"$/g, ''));
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  
  // Push the last value
  values.push(currentValue.trim().replace(/^"|"$/g, ''));
  
  return values;
}

// Map status values to allowed status types
function mapStatus(status: string): 'Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação' {
  const normalizedStatus = status?.trim().toLowerCase();
  
  switch (normalizedStatus) {
    case 'safe':
      return 'Safe';
    case 'care':
      return 'Care';
    case 'danger':
      return 'Danger';
    case 'aviso prévio':
    case 'aviso previo':
      return 'Aviso Prévio';
    case 'implementação':
    case 'implementacao':
      return 'Implementação';
    default:
      return 'Safe'; // Default status
  }
}
