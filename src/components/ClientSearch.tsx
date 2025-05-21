
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface ClientSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

const ClientSearch: React.FC<ClientSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusFilterChange 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Buscar por nome do cliente..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-dashboard-card border-gray-700 w-full"
        />
      </div>
      <div className="w-full md:w-60">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="bg-dashboard-card border-gray-700">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent className="bg-dashboard-card border-gray-700">
            <SelectItem value="todos">Todos os status</SelectItem>
            <SelectItem value="Safe">Safe</SelectItem>
            <SelectItem value="Care">Care</SelectItem>
            <SelectItem value="Danger">Danger</SelectItem>
            <SelectItem value="Aviso Prévio">Aviso Prévio</SelectItem>
            <SelectItem value="Implementação">Implementação</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ClientSearch;
