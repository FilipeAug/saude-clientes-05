
export interface Client {
  id: number;
  name: string;
  squad: string;
  fee: number;
  lt: number;
  status: 'Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação';
}

export const getClientStats = (clients: Client[]) => {
  // Total clients
  const totalClients = clients.length;
  
  // Total fee
  const totalFee = clients.reduce((sum, client) => sum + client.fee, 0);
  
  // Average LT
  const averageLT = clients.reduce((sum, client) => sum + client.lt, 0) / (clients.length || 1);
  
  // Average ticket
  const averageTicket = totalFee / (totalClients || 1);
  
  // Status counts
  const statusCounts = clients.reduce((counts, client) => {
    counts[client.status] = (counts[client.status] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
  // Fee by squad
  const feeBySquad = clients.reduce((squads, client) => {
    squads[client.squad] = (squads[client.squad] || 0) + client.fee;
    return squads;
  }, {} as Record<string, number>);
  
  // LT by squad
  const ltBySquad = clients.reduce((result, client) => {
    if (!result[client.squad]) {
      result[client.squad] = { total: 0, count: 0 };
    }
    result[client.squad].total += client.lt;
    result[client.squad].count += 1;
    return result;
  }, {} as Record<string, { total: number, count: number }>);

  // Calculate average LT by squad
  const ltAvgBySquad = Object.entries(ltBySquad).reduce((result, [squad, data]) => {
    result[squad] = data.total / data.count;
    return result;
  }, {} as Record<string, number>);
  
  // Ticket by squad (fee/client count)
  const ticketBySquad = Object.entries(feeBySquad).reduce((result, [squad, fee]) => {
    const clientCount = clients.filter(client => client.squad === squad).length;
    result[squad] = fee / clientCount;
    return result;
  }, {} as Record<string, number>);
  
  return {
    totalClients,
    totalFee,
    averageLT,
    averageTicket,
    statusCounts,
    feeBySquad,
    ltBySquad: ltAvgBySquad,
    ticketBySquad
  };
};

export const getUniqueSquads = (clients: Client[]): string[] => {
  return [...new Set(clients.map(client => client.squad))];
};

export const filterClientsBySquad = (clients: Client[], squad: string): Client[] => {
  if (squad === 'todos') return clients;
  return clients.filter(client => client.squad === squad);
};
