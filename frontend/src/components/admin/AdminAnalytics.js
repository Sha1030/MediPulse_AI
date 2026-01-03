import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState({
    alerts: [],
    staff: [],
    beds: [],
    ambulances: [],
    schedules: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      const [alertsRes, staffRes, bedsRes, ambulancesRes, schedulesRes] = await Promise.all([
        axios.get('/api/alerts'),
        axios.get('/api/staff'),
        axios.get('/api/beds'),
        axios.get('/api/ambulances'),
        axios.get('/api/schedules')
      ]);

      setAnalyticsData({
        alerts: alertsRes.data,
        staff: staffRes.data,
        beds: bedsRes.data,
        ambulances: ambulancesRes.data,
        schedules: schedulesRes.data
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set mock data for demo
      setAnalyticsData({
        alerts: [],
        staff: [],
        beds: [],
        ambulances: [],
        schedules: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  // Calculate metrics
  const totalStaff = analyticsData.staff.length;
  const totalBeds = analyticsData.beds.length;
  const totalAmbulances = analyticsData.ambulances.length;
  const activeAlerts = analyticsData.alerts.filter(a => a.status === 'active').length;
  const availableBeds = analyticsData.beds.filter(b => b.status === 'available').length;
  const availableAmbulances = analyticsData.ambulances.filter(a => a.status === 'available').length;

  // Staff distribution data
  const staffByRole = {
    doctors: analyticsData.staff.filter(s => s.role === 'doctor').length,
    nurses: analyticsData.staff.filter(s => s.role === 'nurse').length,
    paramedics: analyticsData.staff.filter(s => s.role === 'paramedic').length,
    admins: analyticsData.staff.filter(s => s.role === 'admin').length,
  };

  // Bed status data
  const bedStatusData = {
    available: analyticsData.beds.filter(b => b.status === 'available').length,
    occupied: analyticsData.beds.filter(b => b.status === 'occupied').length,
    maintenance: analyticsData.beds.filter(b => b.status === 'maintenance').length,
  };

  // Alert trends (last 7 days)
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const alertTrendData = getLast7Days().map(date => {
    return analyticsData.alerts.filter(alert =>
      alert.createdAt && alert.createdAt.split('T')[0] === date
    ).length;
  });

  // Chart configurations
  const staffDistributionOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Staff Distribution by Role',
      },
    },
  };

  const staffDistributionData = {
    labels: ['Doctors', 'Nurses', 'Paramedics', 'Admins'],
    datasets: [
      {
        label: 'Number of Staff',
        data: [staffByRole.doctors, staffByRole.nurses, staffByRole.paramedics, staffByRole.admins],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const bedStatusOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Bed Status Overview',
      },
    },
  };

  const bedStatusDataChart = {
    labels: ['Available', 'Occupied', 'Maintenance'],
    datasets: [
      {
        label: 'Beds',
        data: [bedStatusData.available, bedStatusData.occupied, bedStatusData.maintenance],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 205, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 205, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const alertTrendOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Alert Trends (Last 7 Days)',
      },
    },
  };

  const alertTrendChartData = {
    labels: getLast7Days().map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Alerts Created',
        data: alertTrendData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div className="analytics-dashboard">
      <h2>Analytics Dashboard</h2>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <div className="metric-card">
          <h3>Total Staff</h3>
          <div className="metric-value">{totalStaff}</div>
          <p>Active personnel</p>
        </div>
        <div className="metric-card">
          <h3>Bed Occupancy</h3>
          <div className="metric-value">{totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0}%</div>
          <p>{availableBeds} beds available</p>
        </div>
        <div className="metric-card">
          <h3>Active Alerts</h3>
          <div className="metric-value">{activeAlerts}</div>
          <p>Require attention</p>
        </div>
        <div className="metric-card">
          <h3>Ambulance Status</h3>
          <div className="metric-value">{availableAmbulances}/{totalAmbulances}</div>
          <p>Available vehicles</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="analytics-charts">
        <div className="chart-container">
          <Doughnut data={staffDistributionData} options={staffDistributionOptions} />
        </div>
        <div className="chart-container">
          <Bar data={bedStatusDataChart} options={bedStatusOptions} />
        </div>
        <div className="chart-container full-width">
          <Line data={alertTrendChartData} options={alertTrendOptions} />
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="analytics-details">
        <div className="detail-section">
          <h3>Resource Utilization</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Bed Utilization:</span>
              <span className="detail-value">{totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ambulance Availability:</span>
              <span className="detail-value">{totalAmbulances > 0 ? Math.round((availableAmbulances / totalAmbulances) * 100) : 0}%</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Staff-to-Patient Ratio:</span>
              <span className="detail-value">{totalBeds > 0 ? (totalStaff / totalBeds).toFixed(1) : 0}:1</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            {analyticsData.alerts.slice(0, 5).map(alert => (
              <div key={alert._id} className="activity-item">
                <span className="activity-type">{alert.type}</span>
                <span className="activity-desc">{alert.title}</span>
                <span className="activity-time">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
            {analyticsData.alerts.length === 0 && (
              <p className="no-activity">No recent alerts</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAnalytics;