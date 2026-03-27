import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Replace with your actual credentials
ADMIN_EMAIL = "your-email@gmail.com"
APP_PASSWORD = "your-app-password" 

def send_task_notification(employee_email, task_title, due_date):
    try:
        msg = MIMEMultipart()
        msg['From'] = ADMIN_EMAIL
        msg['To'] = employee_email
        msg['Subject'] = f"🚀 New Task Assigned: {task_title}"

        body = f"Hi Machi,\n\nA new task '{task_title}' has been assigned to you.\nDue Date: {due_date}\n\nPlease check your dashboard and complete it ASAP!"
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(ADMIN_EMAIL, APP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Mail Error: {e}")
        return False