from datetime import datetime
from database import db

class HelpTicket(db.Model):
    __tablename__ = 'help_tickets'

    id = db.Column(db.Integer, primary_key=True)
    employee_name = db.Column(db.String(100), nullable=False)
    employee_email = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(200), nullable=True, default="General Doubt")
    message = db.Column(db.Text, nullable=False)
    
    # Status: 'open', 'in_progress', 'resolved'
    status = db.Column(db.String(20), default='open')
    
    # Priority: 'low', 'medium', 'high'
    priority = db.Column(db.String(20), default='medium')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        """Convert model object to dictionary for JSON API responses"""
        return {
            "id": self.id,
            "employee_name": self.employee_name,
            "employee_email": self.employee_email,
            "subject": self.subject,
            "message": self.message,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S") if self.created_at else None,
            "resolved_at": self.resolved_at.strftime("%Y-%m-%d %H:%M:%S") if self.resolved_at else None
        }

    def __repr__(self):
        return f"<HelpTicket {self.id} - {self.employee_email}>"