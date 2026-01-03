import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal';

function ResourceManagement() {
  const [beds, setBeds] = useState([]);
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBedForm, setShowBedForm] = useState(false);
  const [showAmbulanceForm, setShowAmbulanceForm] = useState(false);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [editingBed, setEditingBed] = useState(null);
  const [editingAmbulance, setEditingAmbulance] = useState(null);
  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [newBed, setNewBed] = useState({
    bedNumber: '',
    type: 'general',
    ward: '',
    floor: '',
    status: 'available',
    equipment: []
  });
  const [newAmbulance, setNewAmbulance] = useState({
    vehicleNumber: '',
    type: 'basic',
    status: 'available',
    equipment: [],
    location: {
      address: '',
      area: 'central'
    }
  });
  const [newMaintenance, setNewMaintenance] = useState({
    resourceId: '',
    resourceType: 'bed',
    description: '',
    scheduledDate: '',
    estimatedDuration: '2'
  });

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      const [bedsRes, ambulancesRes] = await Promise.all([
        axios.get('/api/beds'),
        axios.get('/api/ambulances')
      ]);
      setBeds(bedsRes.data);
      setAmbulances(ambulancesRes.data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBed = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/beds', newBed);
      setNewBed({
        bedNumber: '',
        type: 'general',
        ward: '',
        floor: '',
        status: 'available',
        equipment: []
      });
      setShowBedForm(false);
      loadResources();
    } catch (error) {
      console.error('Error adding bed:', error);
      alert('Failed to add bed');
    }
  };

  const handleAddAmbulance = async (e) => {
    e.prevent.preventDefault();
    try {
      await axios.post('/api/ambulances', newAmbulance);
      setNewAmbulance({
        vehicleNumber: '',
        type: 'basic',
        status: 'available',
        equipment: [],
        location: {
          address: '',
          area: 'central'
        }
      });
      setShowAmbulanceForm(false);
      loadResources();
    } catch (error) {
      console.error('Error adding ambulance:', error);
      alert('Failed to add ambulance');
    }
  };

  const handleUpdateBed = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/beds/${editingBed._id}`, editingBed);
      setEditingBed(null);
      loadResources();
      alert('Bed updated successfully!');
    } catch (error) {
      console.error('Error updating bed:', error);
      alert('Failed to update bed');
    }
  };

  const handleUpdateAmbulance = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/ambulances/${editingAmbulance._id}`, editingAmbulance);
      setEditingAmbulance(null);
      loadResources();
      alert('Ambulance updated successfully!');
    } catch (error) {
      console.error('Error updating ambulance:', error);
      alert('Failed to update ambulance');
    }
  };

  const handleUpdateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/maintenance/${editingMaintenance._id}`, editingMaintenance);
      setEditingMaintenance(null);
      loadMaintenanceSchedule();
      alert('Maintenance updated successfully!');
    } catch (error) {
      console.error('Error updating maintenance:', error);
      alert('Failed to update maintenance');
    }
  };

  const handleDeleteMaintenance = async (maintenanceId) => {
    if (window.confirm('Are you sure you want to delete this maintenance item?')) {
      try {
        await axios.delete(`/api/maintenance/${maintenanceId}`);
        loadMaintenanceSchedule();
        alert('Maintenance deleted successfully!');
      } catch (error) {
        console.error('Error deleting maintenance:', error);
        alert('Failed to delete maintenance');
      }
    }
  };

  const loadMaintenanceSchedule = async () => {
    try {
      const response = await axios.get('/api/maintenance');
      setMaintenanceItems(response.data);
    } catch (error) {
      console.error('Error loading maintenance:', error);
      // Fallback to mock data if API fails
      const mockMaintenance = [
        {
          id: 1,
          resourceType: 'bed',
          resourceId: 'Room 101-A',
          description: 'Regular cleaning and inspection',
          scheduledDate: '2026-01-10',
          status: 'scheduled'
        },
        {
          id: 2,
          resourceType: 'ambulance',
          resourceId: 'AMB-001',
          description: 'Engine maintenance and tire replacement',
          scheduledDate: '2026-01-15',
          status: 'scheduled'
        }
      ];
      setMaintenanceItems(mockMaintenance);
    }
  };

  const handleScheduleMaintenance = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/maintenance', newMaintenance);
      setNewMaintenance({
        resourceId: '',
        resourceType: 'bed',
        description: '',
        scheduledDate: '',
        estimatedDuration: '2'
      });
      setShowMaintenanceForm(false);
      loadMaintenanceSchedule();
      alert('Maintenance scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      alert('Failed to schedule maintenance');
    }
  };

  if (loading) return <div className="loading">Loading resources...</div>;

  const bedStats = {
    total: beds.length,
    available: beds.filter(b => b.status === 'available').length,
    occupied: beds.filter(b => b.status === 'occupied').length,
    maintenance: beds.filter(b => b.status === 'maintenance').length
  };

  const ambulanceStats = {
    total: ambulances.length,
    available: ambulances.filter(a => a.status === 'available').length,
    onCall: ambulances.filter(a => a.status === 'on_call').length,
    maintenance: ambulances.filter(a => a.status === 'maintenance').length
  };

  return (
    <div className="resource-management">
      <h2>Resource Management</h2>

      <div className="resource-overview">
        <div className="resource-section">
          <h3>Bed Status</h3>
          <div className="resource-stats">
            <div className="stat-item">
              <span className="stat-label">Total Beds:</span>
              <span className="stat-value">{bedStats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available:</span>
              <span className="stat-value available">{bedStats.available}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Occupied:</span>
              <span className="stat-value occupied">{bedStats.occupied}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maintenance:</span>
              <span className="stat-value maintenance">{bedStats.maintenance}</span>
            </div>
          </div>
        </div>

        <div className="resource-section">
          <h3>Ambulance Status</h3>
          <div className="resource-stats">
            <div className="stat-item">
              <span className="stat-label">Total Units:</span>
              <span className="stat-value">{ambulanceStats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Available:</span>
              <span className="stat-value available">{ambulanceStats.available}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">On Call:</span>
              <span className="stat-value on-call">{ambulanceStats.onCall}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Maintenance:</span>
              <span className="stat-value maintenance">{ambulanceStats.maintenance}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resource-details">
        <div className="resource-list-section">
          <h3>Beds ({beds.length})</h3>
          <div className="resource-list">
            {beds.map(bed => (
              <div key={bed._id} className="resource-item">
                <div className="resource-info">
                  <span className="resource-name">{bed.bedNumber}</span>
                  <span className="resource-type">{bed.type}</span>
                  <span className={`status-badge ${bed.status}`}>{bed.status}</span>
                </div>
                <div className="resource-details-text">
                  <p>{bed.ward} - Floor {bed.floor}</p>
                  {bed.equipment.length > 0 && (
                    <p>Equipment: {bed.equipment.join(', ')}</p>
                  )}
                </div>
                <button 
                  className="edit-btn-small" 
                  onClick={() => setEditingBed(bed)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="resource-list-section">
          <h3>Ambulances ({ambulances.length})</h3>
          <div className="resource-list">
            {ambulances.map(ambulance => (
              <div key={ambulance._id} className="resource-item">
                <div className="resource-info">
                  <span className="resource-name">{ambulance.vehicleNumber}</span>
                  <span className="resource-type">{ambulance.type}</span>
                  <span className={`status-badge ${ambulance.status}`}>{ambulance.status}</span>
                </div>
                <div className="resource-details-text">
                  <p>{ambulance.location.area} - {ambulance.location.address || 'No address'}</p>
                  {ambulance.equipment.length > 0 && (
                    <p>Equipment: {ambulance.equipment.join(', ')}</p>
                  )}
                </div>
                <button 
                  className="edit-btn-small" 
                  onClick={() => setEditingAmbulance(ambulance)}
                >
                  Edit
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

<Modal
        isOpen={showBedForm}
        onClose={() => setShowBedForm(false)}
        title="Add New Bed"
        size="medium"
      >
        <form onSubmit={handleAddBed}>
          <div className="form-group">
            <label>Bed Number:</label>
            <input
              type="text"
              value={newBed.bedNumber}
              onChange={(e) => setNewBed({...newBed, bedNumber: e.target.value})}
              required
              placeholder="e.g., 101-A"
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newBed.type}
              onChange={(e) => setNewBed({...newBed, type: e.target.value})}
              required
            >
              <option value="general">General</option>
              <option value="icu">ICU</option>
              <option value="emergency">Emergency</option>
              <option value="pediatric">Pediatric</option>
              <option value="maternity">Maternity</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ward:</label>
            <input
              type="text"
              value={newBed.ward}
              onChange={(e) => setNewBed({...newBed, ward: e.target.value})}
              required
              placeholder="e.g., Emergency Ward"
            />
          </div>
          <div className="form-group">
            <label>Floor:</label>
            <input
              type="number"
              value={newBed.floor}
              onChange={(e) => setNewBed({...newBed, floor: parseInt(e.target.value) || ''})}
              required
              placeholder="e.g., 1"
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={newBed.status}
              onChange={(e) => setNewBed({...newBed, status: e.target.value})}
              required
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>
          <div className="form-group">
            <label>Equipment (optional):</label>
            <div className="equipment-checkboxes">
              {['ventilator', 'monitor', 'oxygen', 'suction', 'defibrillator'].map(equip => (
                <label key={equip} className="equipment-checkbox">
                  <input
                    type="checkbox"
                    checked={newBed.equipment.includes(equip)}
                    onChange={(e) => {
                      const updatedEquipment = e.target.checked
                        ? [...newBed.equipment, equip]
                        : newBed.equipment.filter(item => item !== equip);
                      setNewBed({...newBed, equipment: updatedEquipment});
                    }}
                  />
                  {equip.charAt(0).toUpperCase() + equip.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="add-btn">Add Bed</button>
            <button type="button" onClick={() => setShowBedForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAmbulanceForm}
        onClose={() => setShowAmbulanceForm(false)}
        title="Add New Ambulance"
        size="medium"
      >
        <form onSubmit={handleAddAmbulance}>
          <div className="form-group">
            <label>Vehicle Number:</label>
            <input
              type="text"
              value={newAmbulance.vehicleNumber}
              onChange={(e) => setNewAmbulance({...newAmbulance, vehicleNumber: e.target.value})}
              required
              placeholder="e.g., AMB-001"
            />
          </div>
          <div className="form-group">
            <label>Type:</label>
            <select
              value={newAmbulance.type}
              onChange={(e) => setNewAmbulance({...newAmbulance, type: e.target.value})}
              required
            >
              <option value="basic">Basic Life Support</option>
              <option value="advanced">Advanced Life Support</option>
              <option value="critical_care">Critical Care</option>
              <option value="neonatal">Neonatal</option>
            </select>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <select
              value={newAmbulance.status}
              onChange={(e) => setNewAmbulance({...newAmbulance, status: e.target.value})}
              required
            >
              <option value="available">Available</option>
              <option value="on_call">On Call</option>
              <option value="maintenance">Maintenance</option>
              <option value="out_of_service">Out of Service</option>
            </select>
          </div>
          <div className="form-group">
            <label>Address:</label>
            <input
              type="text"
              value={newAmbulance.location.address}
              onChange={(e) => setNewAmbulance({
                ...newAmbulance,
                location: {...newAmbulance.location, address: e.target.value}
              })}
              placeholder="e.g., Emergency Department Parking"
            />
          </div>
          <div className="form-group">
            <label>Area:</label>
            <select
              value={newAmbulance.location.area}
              onChange={(e) => setNewAmbulance({
                ...newAmbulance,
                location: {...newAmbulance.location, area: e.target.value}
              })}
            >
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
              <option value="central">Central</option>
              <option value="suburban">Suburban</option>
            </select>
          </div>
          <div className="form-group">
            <label>Equipment (optional):</label>
            <div className="equipment-checkboxes">
              {['defibrillator', 'ventilator', 'monitor', 'oxygen', 'stretcher', 'suction', 'medications'].map(equip => (
                <label key={equip} className="equipment-checkbox">
                  <input
                    type="checkbox"
                    checked={newAmbulance.equipment.includes(equip)}
                    onChange={(e) => {
                      const updatedEquipment = e.target.checked
                        ? [...newAmbulance.equipment, equip]
                        : newAmbulance.equipment.filter(item => item !== equip);
                      setNewAmbulance({...newAmbulance, equipment: updatedEquipment});
                    }}
                  />
                  {equip.charAt(0).toUpperCase() + equip.slice(1)}
                </label>
              ))}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="add-btn">Add Ambulance</button>
            <button type="button" onClick={() => setShowAmbulanceForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showMaintenanceForm}
        onClose={() => setShowMaintenanceForm(false)}
        title="Schedule Maintenance"
        size="medium"
      >
        <form onSubmit={handleScheduleMaintenance}>
          <div className="form-group">
            <label>Resource Type:</label>
            <select
              value={newMaintenance.resourceType}
              onChange={(e) => setNewMaintenance({...newMaintenance, resourceType: e.target.value})}
              required
            >
              <option value="bed">Bed</option>
              <option value="ambulance">Ambulance</option>
            </select>
          </div>
          <div className="form-group">
            <label>Resource ID:</label>
            <select
              value={newMaintenance.resourceId}
              onChange={(e) => setNewMaintenance({...newMaintenance, resourceId: e.target.value})}
              required
            >
              <option value="">Select resource...</option>
              {newMaintenance.resourceType === 'bed'
                ? beds.map(bed => (
                    <option key={bed._id} value={bed.bedNumber}>
                      {bed.bedNumber} - {bed.ward} (Floor {bed.floor})
                    </option>
                  ))
                : ambulances.map(amb => (
                    <option key={amb._id} value={amb.vehicleNumber}>
                      {amb.vehicleNumber} ({amb.type})
                    </option>
                  ))
              }
            </select>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              value={newMaintenance.description}
              onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
              required
              placeholder="Maintenance description"
            />
          </div>
          <div className="form-group">
            <label>Scheduled Date:</label>
            <input
              type="date"
              value={newMaintenance.scheduledDate}
              onChange={(e) => setNewMaintenance({...newMaintenance, scheduledDate: e.target.value})}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>Estimated Duration (hours):</label>
            <select
              value={newMaintenance.estimatedDuration}
              onChange={(e) => setNewMaintenance({...newMaintenance, estimatedDuration: e.target.value})}
              required
            >
              <option value="1">1 hour</option>
              <option value="2">2 hours</option>
              <option value="4">4 hours</option>
              <option value="8">8 hours</option>
              <option value="24">1 day</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="maintenance-btn">Schedule Maintenance</button>
            <button type="button" onClick={() => setShowMaintenanceForm(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </Modal>

      {editingBed && (
        <div className="edit-resource-form">
          <h3>Edit Bed</h3>
          <form onSubmit={handleUpdateBed}>
            <div className="form-group">
              <label>Bed Number:</label>
              <input
                type="text"
                value={editingBed.bedNumber}
                onChange={(e) => setEditingBed({...editingBed, bedNumber: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={editingBed.type}
                onChange={(e) => setEditingBed({...editingBed, type: e.target.value})}
                required
              >
                <option value="general">General</option>
                <option value="icu">ICU</option>
                <option value="emergency">Emergency</option>
                <option value="pediatric">Pediatric</option>
                <option value="maternity">Maternity</option>
              </select>
            </div>
            <div className="form-group">
              <label>Ward:</label>
              <input
                type="text"
                value={editingBed.ward}
                onChange={(e) => setEditingBed({...editingBed, ward: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Floor:</label>
              <input
                type="number"
                value={editingBed.floor}
                onChange={(e) => setEditingBed({...editingBed, floor: parseInt(e.target.value) || ''})}
                required
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editingBed.status}
                onChange={(e) => setEditingBed({...editingBed, status: e.target.value})}
                required
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            <div className="form-group">
              <label>Equipment:</label>
              <div className="equipment-checkboxes">
                {['ventilator', 'monitor', 'oxygen', 'suction', 'defibrillator'].map(equip => (
                  <label key={equip} className="equipment-checkbox">
                    <input
                      type="checkbox"
                      checked={editingBed.equipment.includes(equip)}
                      onChange={(e) => {
                        const updatedEquipment = e.target.checked
                          ? [...editingBed.equipment, equip]
                          : editingBed.equipment.filter(item => item !== equip);
                        setEditingBed({...editingBed, equipment: updatedEquipment});
                      }}
                    />
                    {equip.charAt(0).toUpperCase() + equip.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="update-btn">Update Bed</button>
              <button type="button" onClick={() => setEditingBed(null)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingAmbulance && (
        <div className="edit-resource-form">
          <h3>Edit Ambulance</h3>
          <form onSubmit={handleUpdateAmbulance}>
            <div className="form-group">
              <label>Vehicle Number:</label>
              <input
                type="text"
                value={editingAmbulance.vehicleNumber}
                onChange={(e) => setEditingAmbulance({...editingAmbulance, vehicleNumber: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Type:</label>
              <select
                value={editingAmbulance.type}
                onChange={(e) => setEditingAmbulance({...editingAmbulance, type: e.target.value})}
                required
              >
                <option value="basic">Basic Life Support</option>
                <option value="advanced">Advanced Life Support</option>
                <option value="critical_care">Critical Care</option>
                <option value="neonatal">Neonatal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editingAmbulance.status}
                onChange={(e) => setEditingAmbulance({...editingAmbulance, status: e.target.value})}
                required
              >
                <option value="available">Available</option>
                <option value="on_call">On Call</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_service">Out of Service</option>
              </select>
            </div>
            <div className="form-group">
              <label>Address:</label>
              <input
                type="text"
                value={editingAmbulance.location.address}
                onChange={(e) => setEditingAmbulance({
                  ...editingAmbulance, 
                  location: {...editingAmbulance.location, address: e.target.value}
                })}
              />
            </div>
            <div className="form-group">
              <label>Area:</label>
              <select
                value={editingAmbulance.location.area}
                onChange={(e) => setEditingAmbulance({
                  ...editingAmbulance, 
                  location: {...editingAmbulance.location, area: e.target.value}
                })}
              >
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
                <option value="suburban">Suburban</option>
              </select>
            </div>
            <div className="form-group">
              <label>Equipment:</label>
              <div className="equipment-checkboxes">
                {['defibrillator', 'ventilator', 'monitor', 'oxygen', 'stretcher', 'suction', 'medications'].map(equip => (
                  <label key={equip} className="equipment-checkbox">
                    <input
                      type="checkbox"
                      checked={editingAmbulance.equipment.includes(equip)}
                      onChange={(e) => {
                        const updatedEquipment = e.target.checked
                          ? [...editingAmbulance.equipment, equip]
                          : editingAmbulance.equipment.filter(item => item !== equip);
                        setEditingAmbulance({...editingAmbulance, equipment: updatedEquipment});
                      }}
                    />
                    {equip.charAt(0).toUpperCase() + equip.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="update-btn">Update Ambulance</button>
              <button type="button" onClick={() => setEditingAmbulance(null)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {editingMaintenance && (
        <div className="edit-maintenance-form">
          <h3>Edit Maintenance</h3>
          <form onSubmit={handleUpdateMaintenance}>
            <div className="form-group">
              <label>Resource Type:</label>
              <select
                value={editingMaintenance.resourceType}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, resourceType: e.target.value})}
                required
              >
                <option value="bed">Bed</option>
                <option value="ambulance">Ambulance</option>
              </select>
            </div>
            <div className="form-group">
              <label>Resource ID:</label>
              <select
                value={editingMaintenance.resourceId}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, resourceId: e.target.value})}
                required
              >
                <option value="">Select resource...</option>
                {editingMaintenance.resourceType === 'bed' 
                  ? beds.map(bed => (
                      <option key={bed._id} value={bed.bedNumber}>
                        {bed.bedNumber} - {bed.ward} (Floor {bed.floor})
                      </option>
                    ))
                  : ambulances.map(amb => (
                      <option key={amb._id} value={amb.vehicleNumber}>
                        {amb.vehicleNumber} ({amb.type})
                      </option>
                    ))
                }
              </select>
            </div>
            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                value={editingMaintenance.description}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, description: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Scheduled Date:</label>
              <input
                type="date"
                value={editingMaintenance.scheduledDate}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, scheduledDate: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Estimated Duration (hours):</label>
              <select
                value={editingMaintenance.estimatedDuration}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, estimatedDuration: e.target.value})}
                required
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="8">8 hours</option>
                <option value="24">1 day</option>
              </select>
            </div>
            <div className="form-group">
              <label>Status:</label>
              <select
                value={editingMaintenance.status}
                onChange={(e) => setEditingMaintenance({...editingMaintenance, status: e.target.value})}
                required
              >
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="update-btn">Update Maintenance</button>
              <button type="button" onClick={() => setEditingMaintenance(null)} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {maintenanceItems.length > 0 && (
        <div className="maintenance-list">
          <h3>Scheduled Maintenance</h3>
          <div className="maintenance-items">
            {maintenanceItems.map(item => (
              <div key={item._id || item.id} className="maintenance-item">
                <div className="maintenance-header">
                  <span className="resource-info">
                    {item.resourceType === 'bed' ? '🛏️' : '🚑'} {item.resourceId}
                  </span>
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                  <div className="maintenance-actions">
                    <button 
                      className="edit-btn-small" 
                      onClick={() => setEditingMaintenance(item)}
                    >
                      Edit
                    </button>
                    <button 
                      className="delete-btn-small" 
                      onClick={() => handleDeleteMaintenance(item._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="maintenance-details">
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Scheduled Date:</strong> {new Date(item.scheduledDate).toLocaleDateString()}</p>
                  {item.estimatedDuration && (
                    <p><strong>Duration:</strong> {item.estimatedDuration} hours</p>
                  )}
                  {item.assignedStaff && (
                    <p><strong>Assigned Staff:</strong> {item.assignedStaff.name}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="resource-actions">
        <button className="resource-btn" onClick={() => setShowBedForm(true)}>Add New Bed</button>
        <button className="resource-btn" onClick={() => setShowAmbulanceForm(true)}>Add Ambulance</button>
        <button className="resource-btn" onClick={() => { setShowMaintenanceForm(true); loadMaintenanceSchedule(); }}>Maintenance Schedule</button>
      </div>
    </div>
  );
}

export default ResourceManagement;