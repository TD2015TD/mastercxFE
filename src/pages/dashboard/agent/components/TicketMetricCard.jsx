import React from 'react';
import Icon from '../../../../components/AppIcon';

const TicketMetricCard = ({ title, value, bgColor, textColor, loading, onClick }) => {
  return (
    <div className={`${bgColor} rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xs font-medium text-gray-700">{title}</h3>
        <div className={`w-8 h-8 rounded-full ${bgColor} flex items-center justify-center`}>
          <div className={`w-6 h-6 rounded-full ${textColor} bg-opacity-20 flex items-center justify-center font-bold text-sm`}>
            {loading ? '...' : value}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <p className={`text-2xl font-bold ${textColor}`}>
          {loading ? '...' : value}
        </p>
        <p className="text-xs text-gray-600 mt-1">Tickets</p>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <button
          onClick={onClick}
          className="text-xs text-gray-600 hover:text-gray-800 flex items-center cursor-pointer"
        >
          View Tickets
          <Icon name="ArrowRight" size={12} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default TicketMetricCard;
