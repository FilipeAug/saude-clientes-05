
/**
 * Busca dados de clientes da API do NocoDB e os transforma para interface Client[].
 */
import type { Client } from "./clientData";

const NOCODB_URL = import.meta.env.VITE_NOCODB_URL;
const NOCODB_API_KEY = import.meta.env.VITE_NOCODB_API_KEY;
const TABLE_NAME = "Clientes"; // Nome da tabela no NocoDB

export async function fetchClients(): Promise<Client[]> {
  if (!NOCODB_URL || !NOCODB_API_KEY) {
    throw new Error("Credenciais do NocoDB não definidas (VITE_NOCODB_URL, VITE_NOCODB_API_KEY)");
  }

  try {
    // URL da API do NocoDB para a tabela de clientes
    const url = `${NOCODB_URL}/api/v1/db/data/v1/${TABLE_NAME}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "xc-auth": NOCODB_API_KEY,
        "Accept": "application/json"
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
        id: row.id || i + 1,
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

// Função de fallback para Google Sheets caso NocoDB não esteja configurado
export async function fetchClientsFromGoogleSheets(): Promise<Client[]> {
  const SHEET_ID = import.meta.env.VITE_SHEET_ID;
  const SHEET_NAME = "Central de Saúde";

  if (!SHEET_ID) throw new Error("VITE_SHEET_ID não definido");

  // URL CSV pública (timestamp reduz cache)
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao obter CSV do Google Sheets");
  const csv = await res.text();

  // PapaParse ESM via CDN (sem precisar instalar pacote)
  const Papa = (await import(
    /* webpackIgnore: true */
    "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm"
  )).default;

  const { data } = Papa.parse(csv, {
    header: true,
    skipEmptyLines: true,
  });

  // ---- transformar linhas brutas -> interface Client ------------
  return data.map((row: any, i: number): Client => {
    // Status (coluna "Status Atual")
    let status: 'Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação' = "Safe";
    const rawStatus = String(row["Status Atual"] || "").trim();
    if (rawStatus.includes("🔴")) status = "Danger";
    else if (rawStatus.includes("🟡")) status = "Care";
    else if (rawStatus.includes("⏳")) status = "Aviso Prévio";
    else if (rawStatus.includes("⚙️") || /Implanta[çc]ão/.test(rawStatus))
      status = "Implementação";

    // Fee → número
    const feeStr = String(row["Fee"] || "")
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();
    const fee = parseFloat(feeStr) || 0;

    // LT → número (virgula para ponto)
    const lt = parseFloat(String(row["LT"] || "0").replace(",", ".")) || 0;

    return {
      id: i + 1,
      name: row["Cliente"] || `Cliente ${i + 1}`,
      squad: row["Squad"] || "Indefinido",
      fee,
      lt,
      status,
    };
  });
}
