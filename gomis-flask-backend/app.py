from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from db import db
import os
from werkzeug.security import generate_password_hash, check_password_hash
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///gomis.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)
db.init_app(app)

with app.app_context():
    from models import Student, Appointment, User, Violation, Incident, Session
    db.create_all()  # Create all tables if they don't exist

    @app.route("/")
    def index():
        return jsonify({"status": "ok", "message": "GOMIS Flask backend running"})

# STUDENTS API
@app.route('/api/students', methods=['GET'])
def list_students():
    students = Student.query.all()
    return jsonify([student_to_dict(s) for s in students])

@app.route('/api/students/<int:id>', methods=['GET'])
def get_student(id):
    student = Student.query.get_or_404(id)
    return jsonify(student_to_dict(student))

@app.route('/api/students', methods=['POST'])
def create_student():
    data = request.json
    student = Student(
        lrn=data['lrn'],
        first_name=data['firstName'],
        last_name=data['lastName'],
        middle_name=data.get('middleName'),
        grade_level=data.get('gradeLevel'),
        section=data.get('section'),
        track_strand=data.get('trackStrand'),
        specialization=data.get('specialization'),
        school_year=data.get('schoolYear'),
        status=data.get('status', 'ACTIVE'),
    )
    db.session.add(student)
    db.session.commit()
    return jsonify(student_to_dict(student)), 201

@app.route('/api/students/<int:id>', methods=['PUT'])
def update_student(id):
    data = request.json
    student = Student.query.get_or_404(id)
    for k,v in data.items():
        if hasattr(student, k):
            setattr(student, k, v)
    db.session.commit()
    return jsonify(student_to_dict(student))

@app.route('/api/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    student = Student.query.get_or_404(id)
    db.session.delete(student)
    db.session.commit()
    return '', 204

def student_to_dict(student):
    return {
        'id': student.id,
        'lrn': student.lrn,
        'firstName': student.first_name,
        'lastName': student.last_name,
        'middleName': student.middle_name,
        'gradeLevel': student.grade_level,
        'section': student.section,
        'trackStrand': student.track_strand,
        'specialization': student.specialization,
        'schoolYear': student.school_year,
        'status': student.status,
        'createdAt': student.created_at.isoformat() if student.created_at else None,
        'updatedAt': student.updated_at.isoformat() if student.updated_at else None,
    }

# APPOINTMENTS API
@app.route('/api/appointments', methods=['GET'])
def list_appointments():
    appointments = Appointment.query.all()
    return jsonify([appointment_to_dict(a) for a in appointments])

@app.route('/api/appointments/<int:id>', methods=['GET'])
def get_appointment(id):
    appt = Appointment.query.get_or_404(id)
    return jsonify(appointment_to_dict(appt))

@app.route('/api/appointments', methods=['POST'])
def create_appointment():
    data = request.json
    appt = Appointment(
        title=data['title'],
        participant_name=data['participantName'],
        participant_lrn=data.get('participantLRN'),
        participant_type=data.get('participantType'),
        date=data['date'],
        time=data['time'],
        consultation_type=data['consultationType'],
        notes=data.get('notes'),
        status=data.get('status', 'SCHEDULED'),
    )
    db.session.add(appt)
    db.session.commit()
    return jsonify(appointment_to_dict(appt)), 201

@app.route('/api/appointments/<int:id>', methods=['PUT'])
def update_appointment(id):
    data = request.json
    appt = Appointment.query.get_or_404(id)
    for k,v in data.items():
        if hasattr(appt, k):
            setattr(appt, k, v)
    db.session.commit()
    return jsonify(appointment_to_dict(appt))

@app.route('/api/appointments/<int:id>', methods=['DELETE'])
def delete_appointment(id):
    appt = Appointment.query.get_or_404(id)
    db.session.delete(appt)
    db.session.commit()
    return '', 204

def appointment_to_dict(appt):
    return {
        'id': appt.id,
        'title': appt.title,
        'participantName': appt.participant_name,
        'participantLRN': appt.participant_lrn,
        'participantType': appt.participant_type,
        'date': appt.date,
        'time': appt.time,
        'consultationType': appt.consultation_type,
        'notes': appt.notes,
        'status': appt.status,
        'createdAt': appt.created_at.isoformat() if appt.created_at else None,
        'updatedAt': appt.updated_at.isoformat() if appt.updated_at else None,
    }

# USERS API
@app.route('/api/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([user_to_dict(u) for u in users])

@app.route('/api/users/<int:id>', methods=['GET'])
def get_user(id):
    user = User.query.get_or_404(id)
    return jsonify(user_to_dict(user))

@app.route('/api/users/email/<string:email>', methods=['GET'])
def get_user_by_email(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Not found'}), 404
    return jsonify(user_to_dict(user))

@app.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    user = User(
        email=data['email'],
        password=generate_password_hash(data['password']),
        first_name=data['firstName'],
        last_name=data['lastName'],
        middle_name=data.get('middleName'),
        suffix=data.get('suffix'),
        gender=data['gender'],
        position=data.get('position'),
        work_position=data.get('workPosition'),
        specialization=data.get('specialization'),
        contact_no=data.get('contactNo'),
        role=data.get('role', 'ADMIN'),
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user_to_dict(user)), 201

@app.route('/api/users/<int:id>', methods=['PUT'])
def update_user(id):
    data = request.json
    user = User.query.get_or_404(id)
    for key, value in data.items():
        if key == 'password':
            user.password = generate_password_hash(value)
        elif hasattr(user, key):
            setattr(user, key, value)
    db.session.commit()
    return jsonify(user_to_dict(user))

@app.route('/api/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    user = User.query.get_or_404(id)
    db.session.delete(user)
    db.session.commit()
    return '', 204

@app.route('/api/users/authenticate', methods=['POST'])
def authenticate_user():
    data = request.json
    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        return jsonify(user_to_dict(user))
    return jsonify({'error': 'Unauthorized'}), 401

def user_to_dict(user):
    return {
        'id': user.id,
        'email': user.email,
        'firstName': user.first_name,
        'lastName': user.last_name,
        'middleName': user.middle_name,
        'suffix': user.suffix,
        'gender': user.gender,
        'position': user.position,
        'workPosition': user.work_position,
        'specialization': user.specialization,
        'contactNo': user.contact_no,
        'role': user.role,
        'createdAt': user.created_at.isoformat() if user.created_at else None,
        'updatedAt': user.updated_at.isoformat() if user.updated_at else None,
    }

# --- Preferences API (Stub) ---
@app.route('/api/preferences/<int:user_id>', methods=['GET'])
@cross_origin()
def get_preferences(user_id):
    # Return placeholder values for compatibility
    return jsonify({
        'userId': user_id,
        'theme': 'default',
        'twoFactorEnabled': False,
        'emailNotifications': True,
        'smsNotifications': False,
        'appointmentReminders': True,
        'incidentAlerts': True,
        'sessionTimeout': True,
        'backupPath': '',
        'retentionType': 'years',
        'retentionValue': '7',
    })

@app.route('/api/preferences/<int:user_id>', methods=['PUT'])
@cross_origin()
def update_preferences(user_id):
    # Accept posted JSON and return it
    data = request.json
    data['userId'] = user_id
    # In a real system, you'd update the DB!
    return jsonify(data)

# --- Student Count by Status ---
@app.route('/api/students/count/status/<status>', methods=['GET'])
@cross_origin()
def count_students_by_status(status):
    from models import Student
    # SQLite is case-sensitive, so match with upper() for convenience
    count = Student.query.filter(db.func.upper(Student.status) == status.upper()).count()
    return jsonify(count)

# VIOLATIONS API
@app.route('/api/violations', methods=['GET'])
@cross_origin()
def list_violations():
    # Optional filters: studentId, severity, status, date, q (student name contains)
    student_id = request.args.get('studentId', type=int)
    severity = request.args.get('severity')
    status = request.args.get('status')
    date = request.args.get('date')
    q = request.args.get('q')

    query = Violation.query
    if student_id is not None:
        query = query.filter(Violation.student_id == student_id)
    if severity:
        query = query.filter(db.func.upper(Violation.severity) == severity.upper())
    if status:
        query = query.filter(db.func.upper(Violation.status) == status.upper())
    if date:
        query = query.filter(Violation.date == date)
    if q:
        like = f"%{q}%"
        query = query.filter(Violation.student_name.ilike(like))

    items = query.order_by(Violation.date.desc(), Violation.id.desc()).all()
    return jsonify([violation_to_dict(v) for v in items])

@app.route('/api/violations', methods=['POST'])
@cross_origin()
def create_violation():
    data = request.json
    v = Violation(
        student_id=data['studentId'],
        student_name=data['studentName'],
        student_lrn=data.get('studentLRN'),
        violation_type=data['violationType'],
        date=data['date'],
        description=data.get('description'),
        severity=data.get('severity', 'Minor'),
        action_taken=data.get('actionTaken'),
        status=data.get('status', 'Pending'),
    )
    db.session.add(v)
    db.session.commit()
    return jsonify(violation_to_dict(v)), 201

@app.route('/api/violations/<int:id>', methods=['GET'])
@cross_origin()
def get_violation(id):
    v = Violation.query.get_or_404(id)
    return jsonify(violation_to_dict(v))

@app.route('/api/violations/<int:id>', methods=['PUT'])
@cross_origin()
def update_violation(id):
    v = Violation.query.get_or_404(id)
    data = request.json
    for k, val in data.items():
        if k == 'studentId':
            v.student_id = val
        elif k == 'studentName':
            v.student_name = val
        elif k == 'studentLRN':
            v.student_lrn = val
        elif k == 'violationType':
            v.violation_type = val
        elif k == 'date':
            v.date = val
        elif k == 'description':
            v.description = val
        elif k == 'severity':
            v.severity = val
        elif k == 'actionTaken':
            v.action_taken = val
        elif k == 'status':
            v.status = val
    db.session.commit()
    return jsonify(violation_to_dict(v))

@app.route('/api/violations/<int:id>', methods=['DELETE'])
@cross_origin()
def delete_violation(id):
    v = Violation.query.get_or_404(id)
    db.session.delete(v)
    db.session.commit()
    return '', 204

@app.route('/api/violations/student/<int:student_id>', methods=['GET'])
@cross_origin()
def list_violations_by_student(student_id):
    items = Violation.query.filter(Violation.student_id == student_id).order_by(Violation.date.desc(), Violation.id.desc()).all()
    return jsonify([violation_to_dict(v) for v in items])


def violation_to_dict(v: Violation):
    return {
        'id': v.id,
        'studentId': v.student_id,
        'studentName': v.student_name,
        'studentLRN': v.student_lrn,
        'violationType': v.violation_type,
        'date': v.date,
        'description': v.description,
        'severity': v.severity,
        'actionTaken': v.action_taken,
        'status': v.status,
        'createdAt': v.created_at.isoformat() if v.created_at else None,
        'updatedAt': v.updated_at.isoformat() if v.updated_at else None,
    }

@app.route('/api/violations/students', methods=['GET'])
@cross_origin()
def list_students_with_violations():
    date = request.args.get('date')
    query = db.session.query(Violation.student_id).distinct()
    if date:
      query = query.filter(Violation.date == date)
    ids = [row[0] for row in query.all() if row[0] is not None]
    return jsonify({ 'studentIds': ids })

@app.route('/api/students/meta', methods=['GET'])
@cross_origin()
def get_student_meta():
    # distinct grade levels, sections, trackStrands
    grades = [row[0] for row in db.session.query(Student.grade_level).filter(Student.grade_level.isnot(None)).distinct().all()]
    sections = [row[0] for row in db.session.query(Student.section).filter(Student.section.isnot(None)).distinct().all()]
    tracks = [row[0] for row in db.session.query(Student.track_strand).filter(Student.track_strand.isnot(None)).distinct().all()]
    return jsonify({
        'gradeLevels': grades,
        'sections': sections,
        'trackStrands': tracks,
    })

# INCIDENTS API
@app.route('/api/incidents', methods=['GET'])
@cross_origin()
def list_incidents():
    items = Incident.query.order_by(Incident.date.desc(), Incident.id.desc()).all()
    return jsonify([incident_to_dict(x) for x in items])

@app.route('/api/incidents', methods=['POST'])
@cross_origin()
def create_incident():
    data = request.json
    inc = Incident(
        reported_by=data['reportedBy'],
        reported_by_lrn=data.get('reportedByLRN'),
        grade=data.get('grade'),
        section=data.get('section'),
        date=data['date'],
        time=data['time'],
        status=data.get('status', 'Pending'),
        narrative_date=data.get('narrativeDate'),
        narrative_time=data.get('narrativeTime'),
        narrative_description=data.get('narrativeDescription'),
        action_taken=data.get('actionTaken'),
        recommendation=data.get('recommendation'),
        participants=json.dumps(data.get('participants') or []),
    )
    db.session.add(inc)
    db.session.commit()
    return jsonify(incident_to_dict(inc)), 201

@app.route('/api/incidents/<int:id>', methods=['GET'])
@cross_origin()
def get_incident(id):
    inc = Incident.query.get_or_404(id)
    return jsonify(incident_to_dict(inc))

@app.route('/api/incidents/<int:id>', methods=['PUT'])
@cross_origin()
def update_incident(id):
    inc = Incident.query.get_or_404(id)
    data = request.json
    # Map incoming fields to model
    if 'reportedBy' in data: inc.reported_by = data['reportedBy']
    if 'reportedByLRN' in data: inc.reported_by_lrn = data['reportedByLRN']
    if 'grade' in data: inc.grade = data['grade']
    if 'section' in data: inc.section = data['section']
    if 'date' in data: inc.date = data['date']
    if 'time' in data: inc.time = data['time']
    if 'status' in data: inc.status = data['status']
    if 'narrativeDate' in data: inc.narrative_date = data['narrativeDate']
    if 'narrativeTime' in data: inc.narrative_time = data['narrativeTime']
    if 'narrativeDescription' in data: inc.narrative_description = data['narrativeDescription']
    if 'actionTaken' in data: inc.action_taken = data['actionTaken']
    if 'recommendation' in data: inc.recommendation = data['recommendation']
    if 'participants' in data: inc.participants = json.dumps(data.get('participants') or [])
    db.session.commit()

    # Propagate status to related violations for the same student/date
    try:
        if inc.reported_by_lrn and inc.date and inc.status:
            q = Violation.query.filter(
                Violation.student_lrn == inc.reported_by_lrn,
                Violation.date == inc.date,
            )
            for v in q.all():
                v.status = inc.status
            db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify(incident_to_dict(inc))

# SESSIONS API
@app.route('/api/sessions', methods=['GET'])
@cross_origin()
def list_sessions():
    items = Session.query.order_by(Session.date.desc(), Session.id.desc()).all()
    return jsonify([session_to_dict(x) for x in items])

@app.route('/api/sessions', methods=['POST'])
@cross_origin()
def create_session():
    data = request.json
    sess = Session(
        date=data['date'],
        time=data['time'],
        appointment_type=data.get('appointmentType'),
        consultation_type=data.get('consultationType'),
        status=data.get('status'),
        notes=data.get('notes'),
        participants=json.dumps(data.get('participants') or []),
        summary=data.get('summary'),
    )
    db.session.add(sess)
    db.session.commit()
    return jsonify(session_to_dict(sess)), 201

@app.route('/api/sessions/<int:id>', methods=['GET'])
@cross_origin()
def get_session(id):
    sess = Session.query.get_or_404(id)
    return jsonify(session_to_dict(sess))

@app.route('/api/sessions/<int:id>', methods=['PUT'])
@cross_origin()
def update_session_api(id):
    sess = Session.query.get_or_404(id)
    data = request.json
    if 'date' in data: sess.date = data['date']
    if 'time' in data: sess.time = data['time']
    if 'appointmentType' in data: sess.appointment_type = data['appointmentType']
    if 'consultationType' in data: sess.consultation_type = data['consultationType']
    if 'status' in data: sess.status = data['status']
    if 'notes' in data: sess.notes = data['notes']
    if 'participants' in data: sess.participants = json.dumps(data.get('participants') or [])
    if 'summary' in data: sess.summary = data['summary']
    db.session.commit()

    # Propagate status to violations for participants on session date
    try:
        if sess.status and sess.date:
            participants = json.loads(sess.participants or '[]')
            lrns = set()
            ids = set()
            for p in participants:
                if isinstance(p, dict):
                    if 'lrn' in p and p['lrn']: lrns.add(str(p['lrn']))
                    if 'id' in p and p['id']: 
                        try:
                            ids.add(int(p['id']))
                        except Exception:
                            pass
            if lrns or ids:
                q = Violation.query.filter(Violation.date == sess.date)
                if lrns:
                    q = q.filter(Violation.student_lrn.in_(list(lrns)))
                rows = q.all()
                for v in rows:
                    v.status = sess.status
                db.session.commit()
    except Exception:
        db.session.rollback()

    return jsonify(session_to_dict(sess))


def incident_to_dict(x: Incident):
    return {
        'id': x.id,
        'reportedBy': x.reported_by,
        'reportedByLRN': x.reported_by_lrn,
        'grade': x.grade,
        'section': x.section,
        'date': x.date,
        'time': x.time,
        'status': x.status,
        'narrativeDate': x.narrative_date,
        'narrativeTime': x.narrative_time,
        'narrativeDescription': x.narrative_description,
        'actionTaken': x.action_taken,
        'recommendation': x.recommendation,
        'participants': json.loads(x.participants or '[]'),
        'createdAt': x.created_at.isoformat() if x.created_at else None,
        'updatedAt': x.updated_at.isoformat() if x.updated_at else None,
    }

def session_to_dict(x: Session):
    return {
        'id': x.id,
        'date': x.date,
        'time': x.time,
        'appointmentType': x.appointment_type,
        'consultationType': x.consultation_type,
        'status': x.status,
        'notes': x.notes,
        'participants': json.loads(x.participants or '[]'),
        'summary': x.summary,
        'createdAt': x.created_at.isoformat() if x.created_at else None,
        'updatedAt': x.updated_at.isoformat() if x.updated_at else None,
    }

if __name__ == "__main__":
    app.run(debug=True)
