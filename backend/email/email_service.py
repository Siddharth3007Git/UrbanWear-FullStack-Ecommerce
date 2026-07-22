import smtplib

from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from backend.email.email_config import (
    SMTP_SERVER,
    SMTP_PORT,
    SMTP_EMAIL,
    SMTP_PASSWORD,
    SENDER_NAME
)


class EmailService:

    @staticmethod
    def send_email(
        recipient: str,
        subject: str,
        html_content: str
    ):

        message = MIMEMultipart("alternative")

        message["From"] = f"{SENDER_NAME} <{SMTP_EMAIL}>"
        message["To"] = recipient
        message["Subject"] = subject

        message.attach(
            MIMEText(html_content, "html")
        )

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:

            server.starttls()

            server.login(
                SMTP_EMAIL,
                SMTP_PASSWORD
            )

            server.sendmail(
                SMTP_EMAIL,
                recipient,
                message.as_string()
            )