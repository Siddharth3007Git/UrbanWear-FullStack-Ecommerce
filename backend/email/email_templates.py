from datetime import datetime


class EmailTemplates:

    @staticmethod
    def welcome_email(name: str):

        return f"""
<!DOCTYPE html>
<html>

<head>

<style>

body{{
background:#f5f5f5;
font-family:Arial,sans-serif;
}}

.container{{
width:600px;
margin:auto;
background:white;
padding:40px;
border-radius:10px;
}}

.header{{
background:#212529;
padding:20px;
text-align:center;
color:white;
font-size:30px;
font-weight:bold;
}}

.content{{
padding:30px;
}}

.btn{{
display:inline-block;
padding:12px 25px;
background:#198754;
color:white !important;
text-decoration:none;
border-radius:6px;
margin-top:20px;
}}

.footer{{
margin-top:40px;
font-size:13px;
color:#888;
text-align:center;
}}

</style>

</head>

<body>

<div class="container">

<div class="header">

UrbanWear

</div>

<div class="content">

<h2>Welcome {name} 👋</h2>

<p>

Thank you for joining UrbanWear.

</p>

<p>

Your account has been successfully created.

</p>

<p>

We're excited to have you with us.

</p>

<a class="btn"
href="http://localhost:5500/frontend/pages/home.html">

Start Shopping

</a>

</div>

<div class="footer">

© {datetime.now().year} UrbanWear

</div>

</div>

</body>

</html>
"""
    @staticmethod
    def order_confirmation(
        name,
        order_id,
        amount
    ):

        return f"""

<!DOCTYPE html>

<html>

<body style="font-family:Arial;background:#f5f5f5;">

<div style="max-width:600px;margin:auto;background:white;padding:40px;">

<h1 style="color:#198754;">

Order Confirmed

</h1>

<p>

Hello <b>{name}</b>,

</p>

<p>

Thank you for your purchase.

</p>

<hr>

<h3>

Order Details

</h3>

<p>

Order ID :

<b>{order_id}</b>

</p>

<p>

Amount :

<b>₹{amount}</b>

</p>

<hr>

<p>

We'll notify you once your order has been shipped.

</p>

<br>

<h4>

Thank you for shopping with UrbanWear ❤️

</h4>

</div>

</body>

</html>

"""
    @staticmethod
    def payment_success(
        name,
        order_id,
        payment_id,
        amount
    ):

        return f"""

<!DOCTYPE html>

<html>

<body style="font-family:Arial;background:#f4f6f9;">

<div style="max-width:650px;
margin:auto;
background:white;
padding:40px;">

<h1 style="color:#198754;">

Payment Successful

</h1>

<p>

Hi {name},

</p>

<p>

We've received your payment.

</p>

<hr>

<h3>

Payment Details

</h3>

<p>

Order ID :

<b>{order_id}</b>

</p>

<p>

Payment ID :

<b>{payment_id}</b>

</p>

<p>

Amount :

<b>₹{amount}</b>

</p>

<hr>

<p>

Thank you for choosing UrbanWear.

</p>

</div>

</body>

</html>

"""