
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

interface SquadFilterProps {
  currentSquad: string;
  squads: string[];
  onSquadChange: (squad: string) => void;
}

const SquadFilter: React.FC<SquadFilterProps> = ({ currentSquad, squads, onSquadChange }) => {
  return (
    <div className="flex items-center">
      <Filter className="w-5 h-5 mr-2" />
      <span className="mr-2 text-sm">Filtrar por Squad:</span>
      <Select value={currentSquad} onValueChange={onSquadChange}>
        <SelectTrigger className="w-[180px] bg-dashboard-card border-gray-700">
          <SelectValue placeholder="Selecione um squad" />
        </SelectTrigger>
        <SelectContent className="bg-dashboard-card border-gray-700">
          <SelectItem value="todos">Todos</SelectItem>
          {squads.map(squad => (
            <SelectItem key={squad} value={squad}>{squad}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SquadFilter;
