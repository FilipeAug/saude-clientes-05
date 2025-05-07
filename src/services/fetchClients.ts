
import type { Client } from "./clientData";

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const SHEET_NAME = "Central de Saúde";

/**
 * Faz download do CSV da aba "Central de Saúde",
 * carrega PapaParse via CDN em runtime e devolve {@link Client}[]
 */
export async function fetchClients(): Promise<Client[]> {
  if (!SHEET_ID) throw new Error("VITE_SHEET_ID não definido");

  // URL CSV pública
  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq` +
    `?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao obter CSV do Google Sheets");

  const csvText = await res.text();

  /* -----------------------------------------------------------
     Carrega PapaParse ESM direto do CDN — sem depender do node_modules
     A URL "+esm" entrega um módulo ESM puro, compilado para browsers.
  ----------------------------------------------------------- */
  const PapaModule: any = await import(
    /* webpackIgnore: true */ "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/+esm"
  );
  const Papa = PapaModule.default ?? PapaModule; // compatibilidade

  const { data } = Papa.parse<Client>(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return data;
}
