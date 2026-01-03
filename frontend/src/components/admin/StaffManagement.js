import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../Modal';

function StaffManagement() {
  const { logout } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPerformanceForm, setShowPerformanceForm] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'nurse',
    department: 'emergency',
    phone: '',
    employeeId: '',
    shift: 'morning',
    skills: []
  });
  const [scheduleDepartment, setScheduleDepartment] = useState('emergency');
  const [scheduleStartTime, setScheduleStartTime] = useState('06:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('14:00');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleShift, setScheduleShift] = useState('morning');
  const [editingStaff, setEditingStaff] = useState(null);

  const loadStaff = useCallback(async () => {
    try {
      const response = await axios.get('/api/staff');
      setStaff(response.data);
    } catch (error) {
      console.error('Error loading staff:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
      } else {
        setStaff([]);
      }
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const loadSchedules = async () => {
    try {
      const response = await axios.get('/api/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error loading schedules:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
      } else {
        setSchedules([]);
      }
    }
  };

  const handleAddStaff = async (e) => {
  e.preventDefault();
  try {
    const token = localStorage.getItem("token");

    await axios.post(
      '/api/auth/register',
      newStaff,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setNewStaff({
      name: '',
      email: '',
      password: '',
      role: 'nurse',
      department: 'emergency',
      phone: '',
      employeeId: '',
      shift: 'morning',
      skills: []
    });

    setShowAddForm(false);
    loadStaff();

  } catch (error) {
    console.error('Error adding staff:', error);

    if (error.response?.status === 401) {
      alert('Your session has expired. Please log in again.');
      logout();
    } else if (error.response?.status === 403) {
      alert('You do not have permission to add staff members.');
    } else {
      alert('Failed to add staff member. Please try again.');
    }
  }
};


  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `/api/staff/${editingStaff._id}`,
        editingStaff,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEditingStaff(null);
      loadStaff();
      alert('Staff member updated successfully!');
    } catch (error) {
      console.error('Error updating staff:', error);

      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
      } else if (error.response?.status === 403) {
        alert('You do not have permission to update staff members.');
      } else {
        alert('Failed to update staff member. Please try again.');
      }
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/schedules', {
        staffId: selectedStaff,
        date: scheduleDate,
        shift: scheduleShift,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
        department: scheduleDepartment
      });
      setSelectedStaff('');
      setScheduleDate('');
      setScheduleShift('morning');
      setScheduleStartTime('06:00');
      setScheduleEndTime('14:00');
      setScheduleDepartment('emergency');
      setShowScheduleForm(false);
      loadSchedules();
      alert('Schedule created successfully!');
    } catch (error) {
      console.error('Error creating schedule:', error);
      if (error.response?.status === 401) {
        alert('Your session has expired. Please log in again.');
        logout();
      } else {
        alert('Failed to create schedule');
      }
    }
  };

  if (loading) return <div className="loading">Loading staff...</div>;

  const staffByRole = {
    admin: staff.filter(s => s.role === 'admin'),
    doctor: staff.filter(s => s.role === 'doctor'),
    nurse: staff.filter(s => s.role === 'nurse'),
    paramedic: staff.filter(s => s.role === 'paramedic'),
    technician: staff.filter(s => s.role === 'technician')
  };

  return (
    <div className="staff-management">
      <h2>Staff Management</h2>

      <div className="staff-summary">
        <div className="staff-stat">
          <h3>Total Staff</h3>
          <div className="stat-value">{staff.length}</div>
        </div>
        <div className="staff-stat">
          <h3>Doctors</h3>
          <div className="stat-value">{staffByRole.doctor.length}</div>
        </div>
        <div className="staff-stat">
          <h3>Nurses</h3>
          <div className="stat-value">{staffByRole.nurse.length}</div>
        </div>
        <div className="staff-stat">
          <h3>Paramedics</h3>
          <div className="stat-value">{staffByRole.paramedic.length}</div>
        </div>
        <div className="staff-stat">
          <h3>Technicians</h3>
          <div className="stat-value">{staffByRole.technician.length}</div>
        </div>
      </div>

      <div className="staff-list">
        <h3>Staff Directory</h3>
        {Object.entries(staffByRole).map(([role, staffList]) => (
          <div key={role} className="staff-role-section">
            <h4>{role.charAt(0).toUpperCase() + role.slice(1)}s ({staffList.length})</h4>
            <div className="staff-grid">
              {staffList.map(person => (
                <div key={person._id} className="staff-card">
                  <div className="staff-name">{person.name}</div>
                  <div className="staff-details">
                    <span className="staff-dept">{person.department}</span>
                    <span className="staff-email">{person.email}</span>
                  </div>
                  <button 
                    className="edit-btn-small" 
                    onClick={() => setEditingStaff(person)}
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        title="Add New Staff Member"
        size="large"
      >
          <form onSubmit={handleAddStaff}>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
                required
                placeholder="Enter full name"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                required
                placeholder="Enter email address"
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={newStaff.role}
                onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
                required
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="paramedic">Paramedic</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                value={newStaff.department}
                onChange={(e) => setNewStaff({...newStaff, department: e.target.value})}
                required
              >
                <option value="emergency">Emergency</option>
                <option value="icu">ICU</option>
                <option value="general">General</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="surgery">Surgery</option>
                <option value="ambulance">Ambulance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={newStaff.password}
                onChange={(e) => setNewStaff({...newStaff, password: e.target.value})}
                required
                minLength="6"
                placeholder="Enter password (minimum 6 characters)"
              />
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>
            <div className="form-group">
              <label>Employee ID:</label>
              <input
                type="text"
                value={newStaff.employeeId}
                onChange={(e) => setNewStaff({...newStaff, employeeId: e.target.value})}
                placeholder="Enter employee ID"
              />
            </div>
            <div className="form-group">
              <label>Shift:</label>
              <select
                value={newStaff.shift}
                onChange={(e) => setNewStaff({...newStaff, shift: e.target.value})}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="form-group">
              <label>Skills (comma-separated):</label>
              <input
                type="text"
                value={newStaff.skills.join(', ')}
                onChange={(e) => setNewStaff({...newStaff, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                placeholder="e.g., emergency_care, icu_care, surgery, pediatrics, ambulance_driver, ventilator_management"
              />
              <small className="form-hint">Available: emergency_care, icu_care, surgery, pediatrics, ambulance_driver, ventilator_management</small>
            </div>
            <div className="form-actions">
              <button type="submit" className="add-btn">Add Staff Member</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
      </Modal>

      {editingStaff && (
        <div className="edit-staff-form">
          <h3>Edit Staff Member</h3>
          <form onSubmit={handleUpdateStaff}>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={editingStaff.name}
                onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={editingStaff.role}
                onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
                required
              >
                <option value="admin">Admin</option>
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
                <option value="paramedic">Paramedic</option>
                <option value="technician">Technician</option>
              </select>
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                value={editingStaff.department}
                onChange={(e) => setEditingStaff({...editingStaff, department: e.target.value})}
                required
              >
                <option value="emergency">Emergency</option>
                <option value="icu">ICU</option>
                <option value="general">General</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="surgery">Surgery</option>
                <option value="ambulance">Ambulance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Phone:</label>
              <input
                type="tel"
                value={editingStaff.phone || ''}
                onChange={(e) => setEditingStaff({...editingStaff, phone: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Shift:</label>
              <select
                value={editingStaff.shift}
                onChange={(e) => setEditingStaff({...editingStaff, shift: e.target.value})}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div className="form-group">
              <label>Skills (comma-separated):</label>
              <input
                type="text"
                value={editingStaff.skills ? editingStaff.skills.join(', ') : ''}
                onChange={(e) => setEditingStaff({...editingStaff, skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                placeholder="e.g., emergency_care, icu_care, surgery, pediatrics, ambulance_driver, ventilator_management"
              />
              <small className="form-hint">Available: emergency_care, icu_care, surgery, pediatrics, ambulance_driver, ventilator_management</small>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editingStaff.isActive !== undefined ? editingStaff.isActive : true}
                onChange={(e) => setEditingStaff({...editingStaff, isActive: e.target.value === 'true'})}
              >
                <option value={true}>Active</option>
                <option value={false}>Inactive</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="update-btn">Update Staff Member</button>
              <button type="button" onClick={() => setEditingStaff(null)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showScheduleForm && (
        <Modal
          isOpen={showScheduleForm}
          onClose={() => setShowScheduleForm(false)}
          title="Create Staff Schedule"
          size="large"
        >
          <form onSubmit={handleCreateSchedule}>
            <div className="form-group">
              <label>Select Staff Member:</label>
              <select
                value={selectedStaff}
                onChange={(e) => {
                  setSelectedStaff(e.target.value);
                  // Auto-set department based on selected staff
                  const selectedStaffMember = staff.find(s => s._id === e.target.value);
                  if (selectedStaffMember) {
                    setScheduleDepartment(selectedStaffMember.department);
                  }
                }}
                required
              >
                <option value="">Choose staff member...</option>
                {staff.map(person => (
                  <option key={person._id} value={person._id}>
                    {person.name} - {person.role} ({person.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label>Shift:</label>
              <select
                value={scheduleShift}
                onChange={(e) => {
                  setScheduleShift(e.target.value);
                  // Auto-set times based on shift
                  switch(e.target.value) {
                    case 'morning':
                      setScheduleStartTime('06:00');
                      setScheduleEndTime('14:00');
                      break;
                    case 'evening':
                      setScheduleStartTime('14:00');
                      setScheduleEndTime('22:00');
                      break;
                    case 'night':
                      setScheduleStartTime('22:00');
                      setScheduleEndTime('06:00');
                      break;
                    case 'on_call':
                      setScheduleStartTime('00:00');
                      setScheduleEndTime('23:59');
                      break;
                    default:
                      break;
                  }
                }}
                required
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
                <option value="on_call">On Call</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Time:</label>
              <input
                type="time"
                value={scheduleStartTime}
                onChange={(e) => setScheduleStartTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time:</label>
              <input
                type="time"
                value={scheduleEndTime}
                onChange={(e) => setScheduleEndTime(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Department:</label>
              <select
                value={scheduleDepartment}
                onChange={(e) => setScheduleDepartment(e.target.value)}
                required
              >
                <option value="emergency">Emergency</option>
                <option value="icu">ICU</option>
                <option value="general">General</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="surgery">Surgery</option>
                <option value="ambulance">Ambulance</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="schedule-btn">Create Schedule</button>
              <button type="button" onClick={() => setShowScheduleForm(false)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </Modal>
      )}

      <Modal
        isOpen={showPerformanceForm}
        onClose={() => setShowPerformanceForm(false)}
        title="Staff Performance Report"
        size="xlarge"
      >
          <div className="report-content">
            <div className="report-stats">
              <div className="stat-item">
                <span className="stat-label">Total Staff:</span>
                <span className="stat-value">{staff.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Schedules:</span>
                <span className="stat-value">{schedules.filter(s => new Date(s.date) >= new Date()).length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Doctors:</span>
                <span className="stat-value">{staff.filter(s => s.role === 'doctor').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Nurses:</span>
                <span className="stat-value">{staff.filter(s => s.role === 'nurse').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Paramedics:</span>
                <span className="stat-value">{staff.filter(s => s.role === 'paramedic').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Technicians:</span>
                <span className="stat-value">{staff.filter(s => s.role === 'technician').length}</span>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button onClick={() => setShowPerformanceForm(false)} className="close-btn">Close Report</button>
          </div>
      </Modal>

      <div className="staff-actions">
        <button className="staff-btn" onClick={() => setShowAddForm(true)}>Add New Staff</button>
        <button className="staff-btn" onClick={() => { setShowScheduleForm(true); loadSchedules(); }}>Schedule Management</button>
        <button className="staff-btn" onClick={() => { setShowPerformanceForm(true); loadSchedules(); }}>Performance Reports</button>
      </div>
    </div>
  );
}

export default StaffManagement;