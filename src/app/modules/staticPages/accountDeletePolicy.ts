import { Request, Response } from "express";

export const getStaticAccountDeletePolicy = (_req: Request, res: Response) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Delete Account - Gydes</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      padding: 0;
      background-color: #ffffff;
      color: #333;
      line-height: 1.6;
    }
    h1, .intro {
      text-align: center;
    }
    h1 {
      color: #0862C5;
      margin-bottom: 10px;
    }
    h2 {
      color: #0862C5;
      margin-top: 32px;
    }
    .step {
      margin-bottom: 26px;
      max-width: 820px;
      margin-left: auto;
      margin-right: auto;
    }
    .illustration {
      display: block;
      margin: 10px auto;
      max-width: 320px;
      max-height: 200px;
      width: 100%;
      height: auto;
      object-fit: contain;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 4px;
      background: #fff;
    }
    footer {
      margin-top: 48px;
      font-size: 0.9rem;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>How to Delete Your Gydes Account</h1>
  <p class="intro">
    Follow the steps below to permanently delete your account from the <strong>Gydes</strong> service booking app.
  </p>

  <div class="step">
    <h2>Step 1: Open Settings</h2>
    <p>Open the Gydes app, go to your profile, and tap <strong>Settings</strong>.</p>
    <img src="/uploads/static/setting.png" alt="Open Settings" class="illustration">
  </div>

  <div class="step">
    <h2>Step 2: Select “Delete Account”</h2>
    <p>Scroll down and tap <strong>Delete Account</strong>.</p>
    <img src="/uploads/static/delete.png" alt="Delete Account Option" class="illustration">
  </div>

  <div class="step">
    <h2>Step 3: Verify Your Identity && Confirm Deletion</h2>
    <p>Enter your password or complete the verification step shown on screen.</p>
    <img src="/uploads/static/deleteAccount.png" alt="Verify Identity" class="illustration">
  </div>


  <div class="step">
    <h2>After Account Deletion</h2>
    <ul>
      <li>Your personal information will be removed in accordance with our privacy policy and legal requirements.</li>
      <li>You will lose access to all bookings, history, and saved preferences.</li>
      <li>If deletion is accidental, please contact Gydes support immediately.</li>
    </ul>
  </div>

  <footer>
    © 2026 Gydes. All rights reserved.
  </footer>
</body>
</html>
  `;
  res.send(html);
};
