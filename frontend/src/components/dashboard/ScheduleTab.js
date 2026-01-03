import React from 'react';
import { format } from 'date-fns';

function ScheduleTab({ schedules }) {
  const today = new Date();
  const todaysSchedules = schedules.filter(schedule =>
    new Date(schedule.date).toDateString() === today.toDateString()
  );

  const upcomingSchedules = schedules.filter(schedule =>
    new Date(schedule.date) > today
  ).slice(0, 5);

  return (
    <div className="schedule-tab">
      <h2>My Schedule</h2>

      <div className="schedule-section">
        <h3>Today's Schedule</h3>
        <div className="schedule-list">
          {todaysSchedules.map(schedule => (
            <div key={schedule._id} className="schedule-item">
              <div className="schedule-time">
                {schedule.startTime} - {schedule.endTime}
              </div>
              <div className="schedule-details">
                <span className="shift">{schedule.shift}</span>
                <span className="department">{schedule.department}</span>
                <span className={`status ${schedule.status}`}>{schedule.status}</span>
              </div>
              {schedule.notes && (
                <div className="schedule-notes">{schedule.notes}</div>
              )}
            </div>
          ))}
          {todaysSchedules.length === 0 && (
            <div className="no-schedule">No schedules for today</div>
          )}
        </div>
      </div>

      <div className="schedule-section">
        <h3>Upcoming Schedules</h3>
        <div className="schedule-list">
          {upcomingSchedules.map(schedule => (
            <div key={schedule._id} className="schedule-item">
              <div className="schedule-date">
                {format(new Date(schedule.date), 'MMM dd, yyyy')}
              </div>
              <div className="schedule-time">
                {schedule.startTime} - {schedule.endTime}
              </div>
              <div className="schedule-details">
                <span className="shift">{schedule.shift}</span>
                <span className="department">{schedule.department}</span>
              </div>
            </div>
          ))}
          {upcomingSchedules.length === 0 && (
            <div className="no-schedule">No upcoming schedules</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScheduleTab;