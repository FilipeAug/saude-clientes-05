
/**
 * Busca dados de clientes da API do NocoDB e os transforma para interface Client[].
 */
import type { Client } from "./clientData";

const NOCODB_URL = import.meta.env.VITE_NOCODB_URL;
const NOCODB_API_KEY = import.meta.env.VITE_NOCODB_API_KEY;
const NOCODB_TABLE_ID = import.meta.env.VITE_NOCODB_TABLE_ID;

export async function fetchClients(): Promise<Client[]> {
  if (!NOCODB_URL || !NOCODB_API_KEY || !NOCODB_TABLE_ID) {
    throw new Error("Credenciais do NocoDB não definidas (VITE_NOCODB_URL, VITE_NOCODB_API_KEY, VITE_NOCODB_TABLE_ID)");
  }

  try {
    // URL da API do NocoDB V2 para a tabela de clientes
    const url = `${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE_ID}/records?limit=100`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${NOCODB_API_KEY}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar dados do NocoDB: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Mapear os dados do NocoDB para o formato Client
    return data.list.map((row: any, i: number): Client => {
      // Status (coluna "Status Atual")
      let status: 'Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação' = "Safe";
      const rawStatus = String(row.StatusAtual || "").trim();
      if (rawStatus.includes("🔴")) status = "Danger";
      else if (rawStatus.includes("🟡")) status = "Care";
      else if (rawStatus.includes("⏳")) status = "Aviso Prévio";
      else if (rawStatus.includes("⚙️") || /Implanta[çc]ão/.test(rawStatus))
        status = "Implementação";

      // Fee → já deve vir como número do NocoDB, mas vamos garantir
      const fee = typeof row.Fee === 'number' ? row.Fee : 
                  parseFloat(String(row.Fee || "0").replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;

      // LT → já deve vir como número do NocoDB, mas vamos garantir
      const lt = typeof row.LT === 'number' ? row.LT : 
                parseFloat(String(row.LT || "0").replace(",", ".")) || 0;

      return {
        id: row.Id || i + 1,
        name: row.Cliente || `Cliente ${i + 1}`,
        squad: row.Squad || "Indefinido",
        fee,
        lt,
        status,
      };
    });
  } catch (error) {
    console.error("Erro ao buscar dados do NocoDB:", error);
    throw error;
  }
}
