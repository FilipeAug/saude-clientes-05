
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client, filterClientsBySquad } from '@/services/clientData';
import { fetchClients, fetchClientsFromGoogleSheets } from '@/services/fetchClients';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import ClientSearch from '@/components/ClientSearch';
import ClientTable from '@/components/ClientTable';
import SquadFilter from '@/components/SquadFilter';

const Clients = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedSquad, setSelectedSquad] = useState('todos');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [squads, setSquads] = useState<string[]>([]);

  // Fetch clients data
  const { data: clients = [], isLoading, isError, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        // Tentar primeiro o NocoDB
        return await fetchClients();
      } catch (e) {
        console.warn('Erro ao buscar dados do NocoDB, tentando Google Sheets:', e);
        toast({
          title: 'Aviso',
          description: 'Não foi possível conectar ao NocoDB. Usando dados do Google Sheets como fallback.',
          variant: 'destructive',
        });
        // Fallback para Google Sheets
        return fetchClientsFromGoogleSheets();
      }
    },
    refetchInterval: 60000, // Auto refresh every minute
  });

  // Extract unique squads
  useEffect(() => {
    if (clients && clients.length > 0) {
      const uniqueSquads = [...new Set(clients.map(client => client.squad))];
      setSquads(uniqueSquads);
    }
  }, [clients]);

  // Filter clients based on search, status and squad
  useEffect(() => {
    if (clients) {
      let filtered = filterClientsBySquad(clients, selectedSquad);
      
      // Apply search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(client => 
          client.name.toLowerCase().includes(term)
        );
      }
      
      // Apply status filter
      if (statusFilter !== 'todos') {
        filtered = filtered.filter(client => client.status === statusFilter);
      }
      
      setFilteredClients(filtered);
    }
  }, [clients, searchTerm, statusFilter, selectedSquad]);

  // Handle squad change
  const handleSquadChange = (squad: string) => {
    setSelectedSquad(squad);
  };

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-dashboard-background text-white p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar dados</AlertTitle>
            <AlertDescription>
              Ocorreu um erro ao buscar os dados dos clientes. Verifique a conexão com o NocoDB.
              <p className="mt-2 text-sm text-red-300">Detalhes: {(error as Error)?.message || "Erro desconhecido"}</p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-background text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <SquadFilter 
            currentSquad={selectedSquad}
            squads={squads}
            onSquadChange={handleSquadChange}
          />
        </div>
        
        {/* Data Source Indicator */}
        <div className="mb-4 text-sm text-dashboard-accent">
          <p>Fonte de dados: {import.meta.env.VITE_NOCODB_URL ? 'NocoDB' : 'Google Sheets'}</p>
        </div>
        
        {/* Search and filters */}
        <ClientSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
        
        {/* Clients table */}
        <ClientTable clients={filteredClients} isLoading={isLoading} />
        
        {/* Stats */}
        <div className="mt-6 text-sm text-gray-400">
          {filteredClients.length} cliente(s) encontrado(s)
          {searchTerm || statusFilter !== 'todos' || selectedSquad !== 'todos' 
            ? ' com os filtros aplicados' 
            : ''}
        </div>
      </div>
    </div>
  );
};

export default Clients;
