from flask import Flask, request, jsonify
import joblib
import os
import numpy as np

app = Flask(__name__)

# Load models
model_dir = os.path.join(os.path.dirname(__file__), 'models')
emergency_model = joblib.load(os.path.join(model_dir, 'emergency_model.pkl'))
icu_model = joblib.load(os.path.join(model_dir, 'icu_model.pkl'))
vent_model = joblib.load(os.path.join(model_dir, 'vent_model.pkl'))
staff_model = joblib.load(os.path.join(model_dir, 'staff_model.pkl'))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Extract features
        features = [
            data['day_of_week'],
            data['hour_of_day'],
            data['previous_load'],
            data['seasonal_indicator'],
            data['accident_probability']
        ]
        
        # Convert to numpy array
        X = np.array([features])
        
        # Make predictions
        emergency_load = float(emergency_model.predict(X)[0])
        icu_beds = float(icu_model.predict(X)[0])
        ventilator_demand = float(vent_model.predict(X)[0])
        staff_workload = int(staff_model.predict(X)[0])
        
        # Determine alert level
        if emergency_load > 120 or icu_beds > 12:
            alert_level = 'RED'
            recommendations = [
                'Increase staff by 20%',
                'Prepare additional ICU beds',
                'Activate emergency protocol'
            ]
        elif emergency_load > 80 or icu_beds > 8:
            alert_level = 'YELLOW'
            recommendations = [
                'Monitor closely',
                'Prepare backup staff'
            ]
        else:
            alert_level = 'GREEN'
            recommendations = [
                'Normal operations',
                'Maintain current staffing'
            ]
        
        # Map staff workload to text
        workload_levels = ['LOW', 'MEDIUM', 'HIGH']
        staff_level = workload_levels[staff_workload]
        
        response = {
            'emergency_load': round(emergency_load, 1),
            'icu_beds': round(icu_beds, 1),
            'ventilator_demand': round(ventilator_demand, 1),
            'staff_workload': staff_level,
            'alert_level': alert_level,
            'recommendations': recommendations
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/predict-area-risk', methods=['POST'])
def predict_area_risk():
    try:
        data = request.get_json()
        
        # Area risk factors
        traffic_density = data.get('traffic_density', 5)
        industrial_activity = data.get('industrial_activity', 5)
        elderly_population = data.get('elderly_population', 15)
        medical_facilities = data.get('medical_facilities', 5)
        crime_rate = data.get('crime_rate', 5)
        population = data.get('population', 100000)
        time_of_day = data.get('time_of_day', 12)
        weather_factor = data.get('weather_factor', 1.0)
        
        # Enhanced risk calculation based on area factors
        base_risk = (traffic_density * 0.2 + 
                    industrial_activity * 0.15 + 
                    (elderly_population / 100) * 0.25 + 
                    (10 - medical_facilities) * 0.2 + 
                    crime_rate * 0.2)
        
        # Time-based multiplier (higher risk during peak hours)
        time_multiplier = 1.0
        if 7 <= time_of_day <= 9 or 17 <= time_of_day <= 19:  # Rush hours
            time_multiplier = 1.5
        elif 22 <= time_of_day <= 5:  # Night time
            time_multiplier = 1.3
        
        # Weather impact
        weather_multiplier = weather_factor
        
        # Population density factor
        population_factor = min(population / 50000, 2.0)  # Cap at 2x for very dense areas
        
        risk_score = base_risk * time_multiplier * weather_multiplier * population_factor
        risk_score = min(risk_score, 10)  # Cap at 10
        
        # Determine risk level
        if risk_score >= 7:
            risk_level = 'CRITICAL'
            risk_description = 'High emergency risk - prepare surge capacity'
        elif risk_score >= 5:
            risk_level = 'HIGH'
            risk_description = 'Elevated emergency risk - monitor closely'
        elif risk_score >= 3:
            risk_level = 'MEDIUM'
            risk_description = 'Moderate emergency risk - standard preparedness'
        else:
            risk_level = 'LOW'
            risk_description = 'Low emergency risk - normal operations'
        
        # Predicted emergency load for this area
        area_emergency_load = risk_score * 2.5  # Rough estimation
        
        response = {
            'area_risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'risk_description': risk_description,
            'predicted_emergency_load': round(area_emergency_load, 1),
            'time_multiplier': time_multiplier,
            'weather_multiplier': weather_multiplier,
            'population_factor': population_factor,
            'recommendations': generate_area_recommendations(risk_level, data.get('available_resources', {}))
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 400

def generate_area_recommendations(risk_level, available_resources):
    recommendations = []
    
    if risk_level == 'CRITICAL':
        recommendations.extend([
            'Deploy additional ambulances to area',
            'Increase staff presence at nearby hospitals',
            'Activate emergency coordination center',
            'Prepare for mass casualty response'
        ])
    elif risk_level == 'HIGH':
        recommendations.extend([
            'Monitor ambulance availability closely',
            'Ensure hospital surge capacity is ready',
            'Coordinate with local emergency services'
        ])
    elif risk_level == 'MEDIUM':
        recommendations.extend([
            'Maintain standard ambulance coverage',
            'Regular check-ins with local hospitals'
        ])
    else:
        recommendations.extend([
            'Normal operations',
            'Routine ambulance maintenance and checks'
        ])
    
    # Add resource-specific recommendations
    if available_resources.get('ambulances', 0) < 2:
        recommendations.append('⚠️ Low ambulance availability - consider redistribution')
    
    if available_resources.get('icu_beds', 0) < 5:
        recommendations.append('⚠️ Limited ICU capacity - prepare overflow protocols')
    
    return recommendations

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)