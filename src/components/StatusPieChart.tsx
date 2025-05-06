
import React, { useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label, Tooltip } from 'recharts';

export interface StatusData {
  name: string;
  value: number;
  color: string;
  percentage?: string;
}

interface StatusPieChartProps {
  data: StatusData[];
  title: string;
}

const StatusPieChart: React.FC<StatusPieChartProps> = ({ data, title }) => {
  const processedData = data.map(item => ({
    ...item,
    percentage: `${Math.round((item.value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100)}%`
  }));

  return (
    <div className="bg-dashboard-card rounded-lg p-4 shadow-md h-full">
      <h3 className="text-lg font-medium mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={processedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${props.payload.percentage}`, 
                props.payload.name
              ]}
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
      <div className="grid grid-cols-2 gap-4 mt-4">
        {processedData.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-sm text-gray-300">{item.name}: {item.percentage}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusPieChart;
