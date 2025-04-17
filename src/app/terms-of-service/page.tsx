"use client";

import React from 'react';

const TermsAndConditions = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold leading-tight">
          Terms and Conditions
        </h1>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Introduction</h2>
        <p className="leading-relaxed">
          Welcome to Checkaroundme! By accessing or using the Checkaroundme platform (the “Platform"), you agree to comply with these Terms and Conditions (the “Terms"). Please read these Terms carefully, as they govern your use of our services. If you do not agree, we ask that you discontinue using the Platform.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Platform Overview</h2>
        <p className="leading-relaxed">
          Checkaroundme is designed to connect individuals seeking professional services with service providers in their area. Our goal is to facilitate these connections by providing a space to explore services and gather information.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Acceptable Use</h2>
        <p className="leading-relaxed">
          By using the Platform, you agree to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use it responsibly and lawfully.</li>
          <li>Avoid actions that may harm the Platform, its users, or third parties.</li>
          <li>Respect intellectual property rights and refrain from posting unauthorized or harmful content.</li>
        </ul>
        <p className="leading-relaxed">
          Prohibited activities include, but are not limited to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Engaging in fraudulent or deceptive behavior.</li>
          <li>Attempting to disrupt the functionality of the Platform or compromise its security.</li>
          <li>Uploading or distributing malware, harmful software, or spam.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Content Disclaimer</h2>
        <p className="leading-relaxed">
          The information and service listings available on the Platform are provided by third parties. While we aim to maintain a high standard of quality and accuracy, Checkaroundme does not guarantee the reliability, suitability, or completeness of any content or services listed.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>No Booking or Payment Processing:</strong> Checkaroundme does not handle bookings or payments. To book a service, you must contact the service provider directly using the contact information provided in the listing.</li>
          <li><strong>No Endorsement:</strong> While we strive to ensure the accuracy of merchant listings, Checkaroundme does not endorse, verify, or guarantee the services provided by any service provider listed on the Platform.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">User Conduct</h2>
        <p className="leading-relaxed">
          By using the Platform, you agree to:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use the Platform in a responsible, lawful manner.</li>
          <li>Not engage in any fraudulent activities, harassment, or the distribution of harmful software.</li>
          <li>Not manipulate or falsify any service provider ratings or reviews.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Dispute Resolution</h2>
        <p className="leading-relaxed">
          While Checkaroundme does not book services or process payments, we can assist in resolving disputes that may arise between users and service providers. However, Checkaroundme is not responsible for resolving disputes or issues related to the services provided.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Filing a Dispute:</strong> If you have a problem with a service, you can file a dispute through the Platform.</li>
          <li><strong>Assisting in Resolution:</strong> We will mediate and facilitate communication between you and the service provider. Checkaroundme is not liable for the final outcome or compensation.</li>
          <li><strong>Direct Communication:</strong> Any resolution or compensation must be arranged directly with the service provider.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Limitations of Liability</h2>
        <p className="leading-relaxed">
          The Platform is provided on an “as is” and “as available” basis. We do not guarantee uninterrupted access or the accuracy of information.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>No Liability for Services:</strong> Checkaroundme is not responsible for services listed by merchants and does not guarantee their quality, accuracy, or availability.</li>
          <li><strong>No Responsibility for Disputes:</strong> While we offer dispute mediation, we are not responsible for dispute resolutions or any damages arising from transactions.</li>
          <li><strong>No Liability for Transactions:</strong> Since we do not handle payments, we are not liable for payment, cancellation, or refund issues.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Privacy and Data Usage</h2>
        <p className="leading-relaxed">
          Your personal information is collected and used in accordance with our Privacy Policy. By registering, you consent to our collection and use of your data as described in the Privacy Policy.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Changes to Terms</h2>
        <p className="leading-relaxed">
          We may update these Terms to reflect changes in our services or legal requirements. Updates will be posted on the Platform. Continued use constitutes acceptance of updated Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Termination of Access</h2>
        <p className="leading-relaxed">
          Checkaroundme reserves the right to suspend or terminate your access if you violate these Terms. You may cancel your account at any time by contacting us.
        </p>
      </section>

      <footer className="space-y-4">
        <h2 className="text-2xl font-bold">Contact Us</h2>
        <p className="leading-relaxed">
          If you have any questions or concerns about these Terms or need to file a dispute, please contact us at <a href="mailto:support@checkaroundme.com" className="text-blue-600 hover:underline">support@checkaroundme.com</a>.
        </p>
      </footer>
    </main>
  );
};

export default TermsAndConditions;
