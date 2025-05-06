
import React, { useState, useEffect } from 'react';
import MetricCard from '@/components/MetricCard';
import StatusPieChart, { StatusData } from '@/components/StatusPieChart';
import SquadFeeChart, { SquadFeeData, SquadMetricData } from '@/components/SquadFeeChart';
import ChatBox from '@/components/ChatBox';
import SquadFilter from '@/components/SquadFilter';
import { 
  Users, 
  TrendingUp, 
  BarChart,
  MessageSquare
} from 'lucide-react';
import { 
  generateMockClients, 
  getClientStats, 
  getUniqueSquads,
  filterClientsBySquad
} from '@/services/clientData';

const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  });
};

const formatLT = (value: number): string => {
  return `${value.toFixed(1)} meses`;
};

const Index = () => {
  const [clients, setClients] = useState(generateMockClients());
  const [filteredClients, setFilteredClients] = useState(clients);
  const [selectedSquad, setSelectedSquad] = useState('todos');
  const [squads, setSquads] = useState<string[]>([]);
  
  const [stats, setStats] = useState({
    totalClients: 0,
    totalFee: 0,
    averageLT: 0,
    averageTicket: 0,
    statusCounts: {} as Record<string, number>,
    feeBySquad: {} as Record<string, number>,
    ltBySquad: {} as Record<string, number>,
    ticketBySquad: {} as Record<string, number>
  });
  
  useEffect(() => {
    // Get unique squads
    setSquads(getUniqueSquads(clients));
  }, [clients]);
  
  useEffect(() => {
    // Apply squad filter
    const filtered = filterClientsBySquad(clients, selectedSquad);
    setFilteredClients(filtered);
  }, [clients, selectedSquad]);
  
  useEffect(() => {
    // Calculate stats from filtered clients
    const newStats = getClientStats(filteredClients);
    setStats(newStats);
  }, [filteredClients]);
  
  // Prepare status data for chart
  const statusData: StatusData[] = [
    { 
      name: 'Safe', 
      value: stats.statusCounts['Safe'] || 0, 
      color: '#3CDC86' 
    },
    { 
      name: 'Care', 
      value: stats.statusCounts['Care'] || 0, 
      color: '#FFAB2D' 
    },
    { 
      name: 'Danger', 
      value: stats.statusCounts['Danger'] || 0, 
      color: '#FF5C5C' 
    },
    { 
      name: 'Aviso Prévio', 
      value: stats.statusCounts['Aviso Prévio'] || 0, 
      color: '#FFD166' 
    },
    { 
      name: 'Implementação', 
      value: stats.statusCounts['Implementação'] || 0, 
      color: '#7A6AF7' 
    }
  ];
  
  // Prepare squad data for charts
  const prepareSquadData = (): SquadMetricData => {
    // Ensure all objects exist before using Object.entries
    const feeBySquad = stats.feeBySquad || {};
    const ltBySquad = stats.ltBySquad || {};
    const ticketBySquad = stats.ticketBySquad || {};
    
    const feeData: SquadFeeData[] = Object.entries(feeBySquad).map(([squad, fee]) => ({
      name: squad,
      value: fee,
      color: squad === 'Templários' ? '#faa307' : '#9d0208',
      formattedValue: formatCurrency(fee)
    }));
    
    const ltData: SquadFeeData[] = Object.entries(ltBySquad).map(([squad, lt]) => ({
      name: squad,
      value: lt,
      color: squad === 'Templários' ? '#faa307' : '#9d0208',
      formattedValue: formatLT(lt)
    }));
    
    const ticketData: SquadFeeData[] = Object.entries(ticketBySquad).map(([squad, ticket]) => ({
      name: squad,
      value: ticket,
      color: squad === 'Templários' ? '#faa307' : '#9d0208',
      formattedValue: formatCurrency(ticket)
    }));
    
    return { feeData, ltData, ticketData };
  };
  
  const squadMetricData = prepareSquadData();
  
  const handleSquadChange = (squad: string) => {
    setSelectedSquad(squad);
  };
  
  return (
    <div className="min-h-screen bg-dashboard-background text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard de Clientes</h1>
          <SquadFilter 
            currentSquad={selectedSquad}
            squads={squads}
            onSquadChange={handleSquadChange}
          />
        </div>
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Clientes"
            value={stats.totalClients}
            icon={<Users className="w-6 h-6 text-dashboard-accent" />}
          />
          <MetricCard
            title="Fee Total"
            value={formatCurrency(stats.totalFee)}
            icon={<TrendingUp className="w-6 h-6 text-dashboard-accent" />}
          />
          <MetricCard
            title="LT Médio"
            value={`${stats.averageLT.toFixed(1)} meses`}
            icon={<BarChart className="w-6 h-6 text-dashboard-accent" />}
            trend="up"
          />
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(stats.averageTicket)}
            icon={<MessageSquare className="w-6 h-6 text-dashboard-accent" />}
            trend="up"
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <StatusPieChart data={statusData} title="Status dos Clientes" />
          </div>
          <div className="lg:col-span-1">
            <SquadFeeChart data={squadMetricData} title="Métricas por Squad" />
          </div>
        </div>
        
        {/* Chat */}
        <div className="h-[400px]">
          <ChatBox />
        </div>
      </div>
    </div>
  );
};

export default Index;
