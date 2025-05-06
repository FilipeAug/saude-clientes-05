
export interface Client {
  id: number;
  name: string;
  squad: string;
  fee: number;
  lt: number;
  status: 'Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação';
}

// Generate mock client data
export const generateMockClients = (): Client[] => {
  const squads = ['Templários', 'Spartans'];
  const statuses: ('Safe' | 'Care' | 'Danger' | 'Aviso Prévio' | 'Implementação')[] = [
    'Safe', 'Care', 'Danger', 'Aviso Prévio', 'Implementação'
  ];
  
  // Probability distribution for statuses to match the pie chart
  const statusProbability = [0.48, 0.25, 0.20, 0.05, 0.02]; // Safe, Care, Danger, Aviso Prévio, Implementação
  
  const clients: Client[] = [];
  
  for (let i = 1; i <= 61; i++) {
    const squad = Math.random() > 0.55 ? squads[0] : squads[1];
    
    // Determine status based on probability
    let statusIndex = 0;
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (let j = 0; j < statusProbability.length; j++) {
      cumulativeProbability += statusProbability[j];
      if (rand <= cumulativeProbability) {
        statusIndex = j;
        break;
      }
    }
    
    const status = statuses[statusIndex];
    
    // Generate fee based on squad (templários slightly higher average)
    let fee = 0;
    if (squad === 'Templários') {
      fee = Math.round(Math.random() * 5000 + 3000);
    } else {
      fee = Math.round(Math.random() * 4000 + 2000);
    }
    
    // Generate LT (lifetime in months)
    const lt = Math.round(Math.random() * 12 + 3);
    
    clients.push({
      id: i,
      name: `Cliente ${i}`,
      squad,
      fee,
      lt,
      status
    });
  }
  
  return clients;
};

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
