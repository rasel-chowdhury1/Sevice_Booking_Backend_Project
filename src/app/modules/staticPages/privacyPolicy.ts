import { Request, Response } from "express";

export const getStaticPrivacyPolicy = (_req: Request, res: Response) => {
  const html = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Privacy Policy - This is Mauritius</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 40px;
      padding: 0;
      background-color: #ffffff;
      color: #333;
      line-height: 1.6;
    }
    h1, h2 {
      color: #e91e63;
    }
    h1 {
      text-align: center;
      margin-bottom: 10px;
    }
    p.intro {
      text-align: center;
      font-style: italic;
      margin-bottom: 40px;
    }
    section {
      margin-bottom: 25px;
    }
    footer {
      margin-top: 60px;
      font-size: 0.9rem;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>Privacy Policy</h1>
  <p class="intro">Effective Date: Date of Subscription and Profile Creation</p>

  <section>
    <p>Welcome to <strong>This is Mauritius</strong> (“we,” “us,” or “our”). We take your privacy seriously and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you access or use our mobile application (the “App”), as well as your rights and choices regarding your personal data. By using the App, you agree to the terms of this Privacy Policy.</p>
  </section>

  <section>
    <h2>Information We Collect</h2>
    <p>We collect various types of information to provide and improve our services. This includes:</p>
    <ul>
      <li>Personal data you voluntarily provide when registering or using certain features of the App (name, email, phone, business information for venues, language preferences).</li>
      <li>Technical data automatically collected (device identifiers, IP address, OS version, browser type, mobile network info, usage statistics).</li>
      <li>Geolocation data with your consent for GPS navigation, recommendations, and venue mapping.</li>
      <li>Information about your interactions with the App (viewed content, videos watched, categories browsed, search queries).</li>
      <li>Error or crash data to improve reliability and performance.</li>
    </ul>
  </section>

  <section>
    <h2>How We Use Your Information</h2>
    <p>We use your personal data to:</p>
    <ul>
      <li>Provide and maintain App functionality.</li>
      <li>Manage user accounts and venue registrations.</li>
      <li>Deliver multilingual content based on preferences.</li>
      <li>Enable geolocation services.</li>
      <li>Respond to inquiries and send important notifications.</li>
      <li>Conduct research and analytics to improve features.</li>
    </ul>
  </section>

  <section>
    <h2>Data Sharing and Disclosure</h2>
    <p>We do not sell or trade your data for marketing purposes. Data may be shared with:</p>
    <ul>
      <li>Trusted service providers (cloud hosting, analytics, software vendors) under strict data protection obligations.</li>
      <li>Mauritius Research and Innovation Council (MRIC) or authorized governmental bodies where legally required.</li>
    </ul>
  </section>

  <section>
    <h2>Legal Basis for Processing</h2>
    <p>We process your data based on consent, contract necessity, legal obligations, or legitimate interests. You may withdraw consent at any time without affecting prior lawful processing.</p>
  </section>

  <section>
    <h2>Data Retention</h2>
    <p>We retain data only as long as necessary for the purposes outlined or legal compliance. Data no longer needed is securely deleted or anonymized.</p>
  </section>

  <section>
    <h2>Your Rights</h2>
    <p>You have rights under the Mauritius Data Protection Act 2017 and EU GDPR, including access, rectification, erasure, restriction, objection, portability, and the right to lodge a complaint.</p>
  </section>

  <section>
    <h2>Data Security</h2>
    <p>We implement strong security measures including encryption, secure storage, access controls, regular security assessments, and staff training.</p>
  </section>

  <section>
    <h2>International Transfers</h2>
    <p>If data is transferred outside Mauritius or the EEA, we ensure safeguards such as Standard Contractual Clauses or adequacy decisions are in place.</p>
  </section>

  <section>
    <h2>Children's Privacy</h2>
    <p>The App is for adults and not directed at children under 16. We do not knowingly collect personal data from children without parental consent.</p>
  </section>

  <section>
    <h2>Cookies and Tracking</h2>
    <p>We may use cookies or similar technologies for analytics. These do not collect personal data unless you consent. You may disable tracking via device or app settings.</p>
  </section>

  <section>
    <h2>Policy Updates</h2>
    <p>This policy may be updated periodically. Significant changes will be communicated through the App and by updating the effective date.</p>
  </section>

  <section>
    <h2>Contact Us</h2>
    <p>If you have questions or wish to exercise your rights, contact:</p>
    <p><strong>This is Mauritius Team</strong><br/>
       <a href="http://www.thismauritius.com">www.thismauritius.com</a><br/>
       Email: <a href="mailto:Thisismauritiusteam@gmail.com">Thisismauritiusteam@gmail.com</a> or <a href="mailto:contact@thismauritius.com">contact@thismauritius.com</a>
    </p>
  </section>

  <footer>
    &copy; 2024 This is Mauritius. All rights reserved.
  </footer>
</body>
</html>
  `;

  res.send(html);
};
