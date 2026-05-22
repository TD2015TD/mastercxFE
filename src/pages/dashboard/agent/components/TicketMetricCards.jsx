import React from 'react';
import Icon from '../../../../components/AppIcon';

const TicketMetricCards = ({ metrics, loading }) => {
  const cards = [
    {
      title: 'Total in Progress',
      value: metrics?.total_in_progress || 0,
      subtitle: `${metrics?.total_in_progress || 0} Tickets`,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
    {
      title: 'In Progress (of the Day)',
      value: metrics?.in_progress_today || 0,
      subtitle: `${metrics?.in_progress_today || 0} Tickets`,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Closed (for the Day)',
      value: metrics?.closed_today || 0,
      subtitle: `${metrics?.closed_today || 0} Tickets`,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total (of the Day)',
      value: metrics?.total_today || 0,
      subtitle: `${metrics?.total_today || 0} Tickets`,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">{card.title}</h3>
            <div className={`w-10 h-10 rounded-full ${card.bgColor} flex items-center justify-center`}>
              <div className={`w-8 h-8 rounded-full ${card.textColor} bg-opacity-20 flex items-center justify-center font-bold text-lg`}>
                {index === 0 || index === 3 ? (
                  <span className="text-2xl font-bold">{card.value}</span>
                ) : (
                  <span className="text-2xl font-bold">{card.value}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <p className={`text-3xl font-bold ${card.textColor}`}>
              {loading ? '...' : card.value}
            </p>
            <p className="text-sm text-gray-600 mt-1">Tickets</p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <button className="text-sm text-gray-600 hover:text-gray-800 flex items-center">
              View Tickets 
              <Icon name="ArrowRight" size={14} className="ml-1" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketMetricCards;
