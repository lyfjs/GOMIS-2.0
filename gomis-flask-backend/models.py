from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from db import db

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lrn = db.Column(db.String(12), unique=True, nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    grade_level = db.Column(db.String(10))
    section = db.Column(db.String(30))
    track_strand = db.Column(db.String(60))
    specialization = db.Column(db.String(60))
    school_year = db.Column(db.String(20))
    status = db.Column(db.String(20), default='ACTIVE')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    participant_name = db.Column(db.String(100), nullable=False)
    participant_lrn = db.Column(db.String(12))
    participant_type = db.Column(db.String(20))
    date = db.Column(db.String(10), nullable=False) # yyyy-MM-dd
    time = db.Column(db.String(8), nullable=False)  # HH:mm:ss
    consultation_type = db.Column(db.String(60), nullable=False)
    notes = db.Column(db.Text)
    status = db.Column(db.String(20), default='SCHEDULED')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    middle_name = db.Column(db.String(100))
    suffix = db.Column(db.String(30))
    gender = db.Column(db.String(30), nullable=False)  # e.g. MALE/FEMALE/OTHER/PREFER_NOT_TO_SAY
    position = db.Column(db.String(100))
    work_position = db.Column(db.String(100))
    specialization = db.Column(db.String(100))
    contact_no = db.Column(db.String(30))
    role = db.Column(db.String(30), nullable=False, default='ADMIN')  # ADMIN/COUNSELOR/TEACHER/STAFF
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Violation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, nullable=False)
    student_name = db.Column(db.String(200), nullable=False)
    student_lrn = db.Column(db.String(12))
    violation_type = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(10), nullable=False)  # yyyy-MM-dd
    description = db.Column(db.Text)
    severity = db.Column(db.String(20), default='Minor')  # Minor/Major/Severe
    action_taken = db.Column(db.Text)
    status = db.Column(db.String(20), default='Pending')  # Pending/Resolved/Appealed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Incident(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reported_by = db.Column(db.String(200), nullable=False)
    reported_by_lrn = db.Column(db.String(12))
    grade = db.Column(db.String(10))
    section = db.Column(db.String(60))
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(8), nullable=False)
    status = db.Column(db.String(40), default='Pending')
    narrative_date = db.Column(db.String(10))
    narrative_time = db.Column(db.String(8))
    narrative_description = db.Column(db.Text)
    action_taken = db.Column(db.Text)
    recommendation = db.Column(db.Text)
    participants = db.Column(db.Text)  # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Session(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(8), nullable=False)
    appointment_type = db.Column(db.String(40))
    consultation_type = db.Column(db.String(80))
    status = db.Column(db.String(40))
    notes = db.Column(db.Text)
    participants = db.Column(db.Text)  # JSON string
    summary = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)