import React, { useState } from 'react';
import Icon from '../../../../components/AppIcon';
import Button from '../../../../components/ui/Button';

const MySchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const schedule = {
    shifts: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', break: '12:00-13:00', status: 'scheduled' },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', break: '12:00-13:00', status: 'scheduled' },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', break: '12:00-13:00', status: 'scheduled' },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', break: '12:00-13:00', status: 'scheduled' },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', break: '12:00-13:00', status: 'scheduled' },
      { day: 'Saturday', startTime: '-', endTime: '-', break: '-', status: 'off' },
      { day: 'Sunday', startTime: '-', endTime: '-', break: '-', status: 'off' }
    ],
    upcomingLeave: [
      { type: 'Annual Leave', dates: 'Dec 20-22, 2024', days: 3, status: 'Approved' },
      { type: 'Medical Leave', dates: 'Dec 15, 2024', days: 1, status: 'Pending' }
    ],
    stats: {
      hoursWorked: 38.5,
      targetHours: 40,
      leaveBalance: 12,
      overtimeHours: 2.5
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Hours This Week</p>
          <p className="text-2xl font-bold text-foreground">{schedule.stats.hoursWorked}h</p>
          <p className="text-xs text-muted-foreground mt-1">Target: {schedule.stats.targetHours}h</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Leave Balance</p>
          <p className="text-2xl font-bold text-foreground">{schedule.stats.leaveBalance}</p>
          <p className="text-xs text-muted-foreground mt-1">days remaining</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Overtime</p>
          <p className="text-2xl font-bold text-foreground">{schedule.stats.overtimeHours}h</p>
          <p className="text-xs text-muted-foreground mt-1">this month</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-6">
          <p className="text-sm text-muted-foreground mb-1">Next Shift</p>
          <p className="text-2xl font-bold text-foreground">9:00 AM</p>
          <p className="text-xs text-muted-foreground mt-1">Tomorrow</p>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Calendar" size={20} className="mr-2 text-primary" />
            Weekly Schedule
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">End Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Break</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedule.shifts.map((shift, index) => (
                <tr key={index} className="hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <span className="font-medium text-foreground">{shift.day}</span>
                  </td>
                  <td className="px-6 py-4 text-foreground">{shift.startTime}</td>
                  <td className="px-6 py-4 text-foreground">{shift.endTime}</td>
                  <td className="px-6 py-4 text-muted-foreground">{shift.break}</td>
                  <td className="px-6 py-4">
                    {shift.status === 'scheduled' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        Scheduled
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
                        <Icon name="Coffee" size={12} className="mr-1" />
                        Day Off
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Leave */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center">
            <Icon name="Plane" size={20} className="mr-2 text-primary" />
            Upcoming Leave
          </h3>
          <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
            Request Leave
          </Button>
        </div>
        <div className="space-y-3">
          {schedule.upcomingLeave.map((leave, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon name="Calendar" size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{leave.type}</p>
                  <p className="text-sm text-muted-foreground">{leave.dates} • {leave.days} days</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                leave.status === 'Approved' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {leave.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MySchedule;
