import requests
import random

API_URL = "http://localhost:5000/api/students"

first_names = ["John", "Jane", "Alex", "Emily", "Michael", "Sophia", "David", "Olivia", "Chris", "Ella"]
last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Martinez", "Lee", "Perez"]
middle_names = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J."]

SCHOOL_INFO = {
    "gradeLevel": "12",
    "section": "A",
    "trackStrand": "STEM",
    "specialization": "Science",
    "schoolYear": "2025-2026",
    "status": "ACTIVE"
}

def generate_random_lrn(existing_lrns):
    while True:
        lrn = str(random.randint(100000000000, 999999999999))
        if lrn not in existing_lrns:
            return lrn

def make_student(existing_lrns):
    first = random.choice(first_names)
    last = random.choice(last_names)
    middle = random.choice(middle_names)
    lrn = generate_random_lrn(existing_lrns)
    return {
        "lrn": lrn,
        "firstName": first,
        "lastName": last,
        "middleName": middle,
        **SCHOOL_INFO
    }

def main():
    count = 10  # Number of students to create
    existing_lrns = set()
    for _ in range(count):
        student = make_student(existing_lrns)
        existing_lrns.add(student["lrn"])
        resp = requests.post(API_URL, json=student)
        if resp.ok:
            print("Created:", student["firstName"], student["lastName"], "| LRN:", student["lrn"])
        else:
            print("Failed:", resp.status_code, resp.text)

if __name__ == "__main__":
    main()