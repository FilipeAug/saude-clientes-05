
import Papa from "papaparse";
import { Client } from "./clientData"; // Keep the interface

const SHEET_ID = import.meta.env.VITE_SHEET_ID;
const SHEET_NAME = "Central de Saúde";

export async function fetchClients(): Promise<Client[]> {
  if (!SHEET_ID) throw new Error("VITE_SHEET_ID não definido");

  const url =
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?` +
    `tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}&t=${Date.now()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Falha ao obter CSV do Google Sheets");

  const csv = await res.text();
  const { data } = Papa.parse<Client>(csv, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  return data;
}
