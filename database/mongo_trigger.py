from pymongo import MongoClient
from datetime import datetime

# اتصال (connection)
client = MongoClient("mongodb://localhost:27017")
db = client["water_quality_db"]

# 1. Enroll student
def enroll_student(student_id, course_id):
    db.enrollments.insert_one({
        "student_id": student_id,
        "course_id": course_id
    })

    db.courses.update_one(
        {"course_id": course_id},
        {"$inc": {"enrollmentCount": 1}}
    )

    print("Student enrolled & count updated")

# 2. Drop student
def drop_student(student_id, course_id):
    db.enrollments.delete_one({
        "student_id": student_id,
        "course_id": course_id
    })

    db.courses.update_one(
        {"course_id": course_id},
        {"$inc": {"enrollmentCount": -1}}
    )

    print("Student dropped & count updated")

# 3. Update grade + audit log
def update_grade(student_id, course_id, new_grade):
    old = db.grades.find_one({
        "student_id": student_id,
        "course_id": course_id
    })

    db.grades.update_one(
        {"student_id": student_id, "course_id": course_id},
        {"$set": {"grade": new_grade}}
    )

    db.audit_log.insert_one({
        "student_id": student_id,
        "course_id": course_id,
        "old_grade": old["grade"],
        "new_grade": new_grade,
        "changed_at": datetime.now()
    })

    print("Grade updated & logged")


# 🔥 IMPORTANT: CALL FUNCTIONS (this was missing)

enroll_student("student2", "WQ101")
drop_student("student2", "WQ101")
update_grade("student1", "WQ101", "A")