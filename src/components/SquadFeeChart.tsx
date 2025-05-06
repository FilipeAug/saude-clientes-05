
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export interface SquadFeeData {
  name: string;
  value: number;
  color: string;
  formattedValue: string;
}

interface SquadFeeChartProps {
  data: SquadFeeData[];
  title: string;
}

const SquadFeeChart: React.FC<SquadFeeChartProps> = ({ data, title }) => {
  return (
    <div className="bg-dashboard-card rounded-lg p-4 shadow-md h-full">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className="bg-gray-800 px-3 py-1 rounded-full text-sm">Fee Total</div>
      </div>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`R$ ${value.toLocaleString('pt-BR')}`, name]}
              contentStyle={{ 
                backgroundColor: '#1B2032',
                border: '1px solid #2D344B',
                borderRadius: '4px',
                color: 'white'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2 mt-2">
        {data.map((item, index) => (
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
