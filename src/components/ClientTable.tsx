
import React from 'react';
import { Client } from '@/services/clientData';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ClientTableProps {
  clients: Client[];
  isLoading: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, isLoading }) => {
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Safe': return 'bg-green-500';
      case 'Care': return 'bg-yellow-500';
      case 'Danger': return 'bg-red-500';
      case 'Aviso Prévio': return 'bg-orange-500';
      case 'Implementação': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-gray-400">Carregando dados dos clientes...</div>;
  }

  if (clients.length === 0) {
    return <div className="p-6 text-center text-gray-400">Nenhum cliente encontrado com os filtros aplicados.</div>;
  }

  return (
    <div className="rounded-lg border border-gray-700 overflow-hidden">
      <Table>
        <TableHeader className="bg-dashboard-card">
          <TableRow>
            <TableHead className="text-white">Nome</TableHead>
            <TableHead className="text-white">Squad</TableHead>
            <TableHead className="text-white">Fee</TableHead>
            <TableHead className="text-white">LT (meses)</TableHead>
            <TableHead className="text-white">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id} className="bg-dashboard-card border-t border-gray-700">
              <TableCell className="font-medium text-white">{client.name}</TableCell>
              <TableCell className="text-gray-300">{client.squad}</TableCell>
              <TableCell className="text-gray-300">{formatCurrency(client.fee)}</TableCell>
              <TableCell className="text-gray-300">{client.lt.toFixed(1)}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${getStatusColor(client.status)}`} />
                  <span className="text-gray-300">{client.status}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientTable;
