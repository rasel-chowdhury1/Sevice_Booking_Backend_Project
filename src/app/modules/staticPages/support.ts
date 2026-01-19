import { Request, Response } from "express";

export const getStaticSupportPage = (_req: Request, res: Response) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Support - This is Mauritius</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #333;
      text-align: center;
    }
    header {
      background-color: #00796b;
      color: #fff;
      padding: 20px 0;
    }
    h1 {
      margin: 0;
      font-size: 2rem;
    }
    .content {
      max-width: 600px;
      margin: 50px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .contact-info {
      margin-top: 20px;
      font-size: 1.1rem;
      line-height: 1.8;
    }
    .contact-info strong {
      color: #00796b;
    }
    footer {
      margin-top: 50px;
      padding: 15px;
      background-color: #f1f1f1;
      font-size: 0.9rem;
      color: #555;
    }
  </style>
</head>
<body>
  <header>
    <h1>Support - This is Mauritius</h1>
  </header>
  
  <div class="content">
    <p>If you need any assistance, feel free to contact us using the details below:</p>
    <div class="contact-info">
      <p><strong>Email:</strong> thisismauritiusteam2025@gmail.com</p>
      <p><strong>Phone:</strong> +230-58574811</p>
    </div>
  </div>
  
  <footer>
    © 2024 This is Mauritius. All rights reserved.
  </footer>
</body>
</html>
  `;
  res.send(html);
};