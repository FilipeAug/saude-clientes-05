
// @ts-nocheck   <-- desativa verificação TS só neste arquivo
/**
 * Carrega CSV da aba "Central de Saúde" (Google Sheets),
 * importa PapaParse via CDN em runtime e devolve Client[].
 */
import type { Client } from "./clientData";

const SHEET_ID   = import.meta.env.VITE_SHEET_ID;
const SHEET_NAME = "Central de Saúde";

export async function fetchClients(): Promise<Client[]> {
  if (!SHEET_ID) throw new Error("VITE_SHEET_ID não definido");

  // URL CSV pública (timestamp reduz cache)
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;

  const res  = await fetch(url);
  if (!res.ok) throw new Error("Falha ao obter CSV do Google Sheets");
  const csv  = await res.text();

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
    let status = "Safe";
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
