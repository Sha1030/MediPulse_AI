import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from '../Modal';

function AreaManagement() {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArea, setNewArea] = useState({
    name: '',
    region: 'central',
    population: '',
    hospitals: [],
    riskFactors: {
      trafficDensity: 5,
      industrialActivity: 5,
      elderlyPopulation: 15,
      medicalFacilities: 5,
      crimeRate: 5
    },
    coordinates: {
      type: 'Polygon',
      coordinates: []
    },
    emergencyContacts: []
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const response = await axios.get('/api/areas');
      setAreas(response.data);
    } catch (error) {
      console.error('Error loading areas:', error);
      if (error.response?.status === 401) {
        alert('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
      } else {
        alert('Failed to load areas. Please check your connection and try again.');
      }
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/areas', newArea);
      setNewArea({
        name: '',
        region: 'central',
        population: '',
        hospitals: [],
        riskFactors: {
          trafficDensity: 5,
          industrialActivity: 5,
          elderlyPopulation: 15,
          medicalFacilities: 5,
          crimeRate: 5
        },
        coordinates: {
          type: 'Polygon',
          coordinates: []
        },
        emergencyContacts: []
      });
      setShowAddModal(false);
      loadAreas();
      alert('Area added successfully!');
    } catch (error) {
      console.error('Error adding area:', error);
      if (error.response?.status === 401) {
        alert('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
      } else if (error.response?.status === 400) {
        alert('Invalid data. Please check all required fields.');
      } else {
        alert('Failed to add area. Please try again.');
      }
    }
  };

  if (loading) return <div className="loading">Loading areas...</div>;

  return (
    <div className="area-management">
      <h2>Area Management</h2>

      <div className="area-summary">
        <div className="summary-card">
          <div className="summary-icon">🏙️</div>
          <div className="summary-content">
            <h3>Total Areas</h3>
            <div className="summary-value">{areas.length}</div>
            <p className="summary-description">Service areas configured</p>
          </div>
        </div>
      </div>

      <div className="area-list">
        <h3>Service Areas</h3>
        <div className="area-grid">
          {areas.map(area => (
            <div key={area._id} className="area-card">
              <div className="area-header">
                <div className="area-icon">📍</div>
                <div className="area-title-section">
                  <h4 className="area-name">{area.name}</h4>
                  <span className="area-region">{area.region?.toUpperCase()}</span>
                  <span className="area-population">{area.population?.toLocaleString() || 'N/A'} residents</span>
                </div>
              </div>
              <div className="area-content">
                <div className="area-risk-factors">
                  <h5>Risk Assessment:</h5>
                  <div className="risk-grid">
                    <div className="risk-item">
                      <span className="risk-label">Traffic:</span>
                      <span className="risk-value">{area.riskFactors?.trafficDensity ?? area.trafficDensity ?? 'N/A'}</span>
                    </div>
                    <div className="risk-item">
                      <span className="risk-label">Medical:</span>
                      <span className="risk-value">{area.riskFactors?.medicalFacilities ?? 'N/A'}</span>
                    </div>
                    <div className="risk-item">
                      <span className="risk-label">Elderly:</span>
                      <span className="risk-value">{area.riskFactors?.elderlyPopulation ?? 'N/A'}%</span>
                    </div>
                  </div>
                </div>
                {area.hospitals && area.hospitals.length > 0 && (
                  <div className="area-hospitals">
                    <h5>Hospitals ({area.hospitals.length}):</h5>
                    <div className="hospitals-list">
                      {area.hospitals.slice(0, 3).map((hospital, index) => (
                        <span key={index} className="hospital-tag">
                          {hospital.name} ({hospital.distance}km)
                        </span>
                      ))}
                      {area.hospitals.length > 3 && (
                        <span className="hospital-tag">+{area.hospitals.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )}
                {area.emergencyContacts && area.emergencyContacts.length > 0 && (
                  <div className="area-contacts">
                    <h5>Emergency Contacts:</h5>
                    <span className="contacts-count">{area.emergencyContacts.length} services available</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {areas.length === 0 && (
          <div className="no-areas">No areas configured</div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Area"
        size="large"
      >
        <form onSubmit={handleAddArea}>
          <div className="form-row">
            <div className="form-group">
              <label>Area Name:</label>
              <input
                type="text"
                value={newArea.name}
                onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                required
                placeholder="e.g., Downtown District"
              />
            </div>
            <div className="form-group">
              <label>Region:</label>
              <select
                value={newArea.region}
                onChange={(e) => setNewArea({...newArea, region: e.target.value})}
                required
              >
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
                <option value="suburban">Suburban</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Population:</label>
            <input
              type="number"
              value={newArea.population}
              onChange={(e) => setNewArea({...newArea, population: parseInt(e.target.value) || ''})}
              required
              placeholder="Approximate population"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Traffic Density (0-10):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={newArea.riskFactors.trafficDensity}
                onChange={(e) => setNewArea({
                  ...newArea,
                  riskFactors: {...newArea.riskFactors, trafficDensity: parseInt(e.target.value) || 5}
                })}
              />
            </div>
            <div className="form-group">
              <label>Medical Facilities (0-10):</label>
              <input
                type="number"
                min="0"
                max="10"
                value={newArea.riskFactors.medicalFacilities}
                onChange={(e) => setNewArea({
                  ...newArea,
                  riskFactors: {...newArea.riskFactors, medicalFacilities: parseInt(e.target.value) || 5}
                })}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="add-btn">Add Area</button>
            <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </Modal>

      <div className="area-actions">
        <button className="area-btn" onClick={() => setShowAddModal(true)}>Add New Area</button>
      </div>
    </div>
  );
}

export default AreaManagement;