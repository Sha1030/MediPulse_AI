import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# Load data
data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'hospital_data.csv')
df = pd.read_csv(data_path)

# Features and targets
features = ['day_of_week', 'hour_of_day', 'previous_load', 'seasonal_indicator', 'accident_probability']
targets = ['emergency_load', 'icu_beds_required', 'ventilator_demand', 'staff_workload']

X = df[features]
y_emergency = df['emergency_load']
y_icu = df['icu_beds_required']
y_vent = df['ventilator_demand']
y_staff = df['staff_workload']

# Train models
# Emergency load prediction (regression)
X_train, X_test, y_train, y_test = train_test_split(X, y_emergency, test_size=0.2, random_state=42)
emergency_model = RandomForestRegressor(n_estimators=100, random_state=42)
emergency_model.fit(X_train, y_train)

# ICU beds (regression)
X_train, X_test, y_train, y_test = train_test_split(X, y_icu, test_size=0.2, random_state=42)
icu_model = RandomForestRegressor(n_estimators=100, random_state=42)
icu_model.fit(X_train, y_train)

# Ventilator demand (regression)
X_train, X_test, y_train, y_test = train_test_split(X, y_vent, test_size=0.2, random_state=42)
vent_model = RandomForestRegressor(n_estimators=100, random_state=42)
vent_model.fit(X_train, y_train)

# Staff workload (classification)
X_train, X_test, y_train, y_test = train_test_split(X, y_staff, test_size=0.2, random_state=42)
staff_model = RandomForestClassifier(n_estimators=100, random_state=42)
staff_model.fit(X_train, y_train)

# Save models
model_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(model_dir, exist_ok=True)

joblib.dump(emergency_model, os.path.join(model_dir, 'emergency_model.pkl'))
joblib.dump(icu_model, os.path.join(model_dir, 'icu_model.pkl'))
joblib.dump(vent_model, os.path.join(model_dir, 'vent_model.pkl'))
joblib.dump(staff_model, os.path.join(model_dir, 'staff_model.pkl'))

print("Models trained and saved successfully!")