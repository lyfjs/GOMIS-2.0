# GOMIS Flask Backend

A Python Flask + SQLite backend for the Guidance Office Management Information System (GOMIS).

## Features
- CRUD for students and appointments
- CORS enabled for React frontend
- SQLite as persistent storage
- Modern API contracts for student and appointment
- (Easily extensible for users, authentication, etc)

## Requirements
- Python 3.9+
- pip (Python package manager)

## Setup & Run

```bash
cd gomis-flask-backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Unix/Mac:
# source venv/bin/activate
pip install -r requirements.txt

# Initialize DB (in Python shell):
# > from app import db
# > db.create_all()
# (Or let app create the DB on first run)

# Start the server:
python app.py
```

Backend will run at http://localhost:5000 by default.

## Endpoints (examples)
- GET    /api/students
- POST   /api/students
- GET    /api/students/&lt;id&gt;
- PUT    /api/students/&lt;id&gt;
- DELETE /api/students/&lt;id&gt;
- ...

## Next Steps
- Add authentication APIs (user login/register)
- Add more domain models if needed



