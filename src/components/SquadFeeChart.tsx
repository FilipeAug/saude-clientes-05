
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface SquadFeeData {
  name: string;
  value: number;
  color: string;
  formattedValue: string;
}

export interface SquadMetricData {
  feeData: SquadFeeData[];
  ltData: SquadFeeData[];
  ticketData: SquadFeeData[];
}

interface SquadFeeChartProps {
  data: SquadMetricData;
  title: string;
}

type MetricType = 'fee' | 'lt' | 'ticket';

// Custom tooltip for better styling
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const data = payload[0].payload;
  
  return (
    <div className="bg-white text-gray-800 p-2 rounded-md shadow-lg border border-gray-200">
      <p className="font-bold">{data.name}</p>
      <p className="text-sm">{data.formattedValue}</p>
    </div>
  );
};

const SquadFeeChart: React.FC<SquadFeeChartProps> = ({ data, title }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('fee');

  const getDisplayData = () => {
    switch (selectedMetric) {
      case 'lt':
        return data.ltData;
      case 'ticket':
        return data.ticketData;
      case 'fee':
      default:
        return data.feeData;
    }
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'lt':
        return 'LT Médio';
      case 'ticket':
        return 'Ticket Médio';
      case 'fee':
      default:
        return 'Fee Total';
    }
  };

  const displayData = getDisplayData();

  return (
    <div className="bg-dashboard-card rounded-lg p-4 shadow-md h-full">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <Select value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as MetricType)}>
            <SelectTrigger className="w-[130px] bg-gray-700 border-gray-600 text-sm">
              <SelectValue placeholder={getMetricLabel()} />
            </SelectTrigger>
            <SelectContent className="bg-dashboard-card border-gray-700">
              <SelectItem value="fee">Fee Total</SelectItem>
              <SelectItem value="lt">LT Médio</SelectItem>
              <SelectItem value="ticket">Ticket Médio</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {displayData.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-sm mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <span className="text-sm">{item.formattedValue}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SquadFeeChart;
