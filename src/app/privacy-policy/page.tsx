"use client";

import React from "react";

const PrivacyPolicy = () => {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold mb-6 text-center">
          Privacy Policy for Checkaroundme
        </h1>
        <p className="mt-2 text-lg leading-relaxed text-gray-600">
          Welcome to Checkaroundme! This Privacy Policy outlines how we collect,
          use, share, and protect your personal data when you visit or use our
          website,{" "}
          <a
            href="https://checkaroundme.com"
            className="text-blue-600 hover:underline"
          >
            checkaroundme.com
          </a>{" "}
          (the <em>"Service"</em>). The policy applies to all visitors,
          including users and merchants, regardless of whether they register or
          create an account.
        </p>
        <p className="mt-4 text-base leading-relaxed">
          We are committed to safeguarding your privacy and ensuring that your
          personal data is handled responsibly. By accessing or using the
          Service, you acknowledge that you have read, understood, and agree to
          this Privacy Policy. If you do not agree with any part of this policy,
          you must not use the Service.
        </p>
      </header>

      <section>
        <h2 className="text-2xl font-bold">1. Data We Collect</h2>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-xl font-semibold">
              1.1 Information You Provide to Us
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Identification Data:</strong> First name, last name,
                phone number, email, and date of birth.
              </li>
              <li>
                <strong>Contact Data:</strong> Address details and working
                hours.
              </li>
              <li>
                <strong>Profile Data:</strong> Preferences, interests, and any
                additional information you choose to provide.
              </li>
              <li>
                <strong>Media Data:</strong> Access to your photos, albums, and
                their metadata for specific features.
              </li>
              <li>
                <strong>Verification Data (for Merchants):</strong> A
                government-issued ID, tax identification number, business name,
                or similar documents for account verification and payout
                processing.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              1.2 Information Collected Automatically
            </h3>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>
                <strong>Device and Usage Data:</strong> IP address, time zone,
                device type, operating system, language settings, and browsing
                behavior.
              </li>
              <li>
                <strong>Location Data:</strong> Approximate location from IP or
                GPS (if enabled).
              </li>
              <li>
                <strong>Advertising IDs:</strong> Advertising identifiers for
                Apple (IDFA) or Google (AAID).
              </li>
              <li>
                <strong>Cookies and Similar Technologies:</strong> For
                interactions with the Service. See our Cookies Policy.
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold">
              1.3 Transaction Data (Merchants Only)
            </h3>
            <p className="mt-2 leading-relaxed">
              Payment details for subscriptions or payouts, including bank
              account details, billing addresses, and payment history.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">2. How We Use Your Personal Data</h2>
        <p className="mt-4 leading-relaxed">
          <strong>For All Visitors and Users:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Provide and improve the Service experience.</li>
          <li>Customize content and advertising.</li>
          <li>Communicate with you for support and updates.</li>
          <li>Prevent fraud and ensure security.</li>
          <li>Comply with legal obligations.</li>
          <li>Conduct research and analysis.</li>
        </ul>
        <p className="mt-4 leading-relaxed">
          <strong>For Merchants:</strong>
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Manage business listings.</li>
          <li>Process subscription payments and payouts securely.</li>
          <li>Verify business legitimacy and compliance.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          3. Legal Bases for Processing Personal Data
        </h2>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Consent:</strong> Your explicit consent for specific
            purposes.
          </li>
          <li>
            <strong>Contract Performance:</strong> To fulfill obligations to
            users or merchants.
          </li>
          <li>
            <strong>Legitimate Interests:</strong> Fraud prevention, security,
            and service improvement.
          </li>
          <li>
            <strong>Legal Obligations:</strong> Compliance with laws and
            regulations.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">4. Sharing Your Personal Data</h2>
        <ul className="list-disc list-inside mt-2 space-y-2">
          <li>
            <strong>Service Providers:</strong> Payment processors, cloud
            storage, analytics, support.
          </li>
          <li>
            <strong>Business Partners:</strong> Joint service offerings.
          </li>
          <li>
            <strong>Law Enforcement:</strong> When required by law.
          </li>
          <li>
            <strong>Corporate Transactions:</strong> Mergers, acquisitions, or
            asset sales.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">5. International Data Transfers</h2>
        <p className="mt-2 leading-relaxed">
          Data may be processed outside your country with appropriate safeguards
          like the EU Standard Contractual Clauses.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          6. Security of Your Personal Data
        </h2>
        <p className="mt-2 leading-relaxed">
          We implement encryption, access controls, and regular security
          assessments to protect your data.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">7. Data Retention</h2>
        <p className="mt-2 leading-relaxed">
          We retain personal data only as long as necessary or as required by
          law, then securely delete or anonymize it.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">8. Your Privacy Rights</h2>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>
            Access, rectification, deletion, restriction, portability, and
            objection rights.
          </li>
          <li>
            To exercise rights, contact:{" "}
            <a
              href="mailto:support@checkaroundme.com"
              className="text-blue-600 hover:underline"
            >
              support@checkaroundme.com
            </a>
            .
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          9. Cookies and Tracking Technologies
        </h2>
        <p className="mt-2 leading-relaxed">
          We use cookies and similar technologies. Manage preferences via your
          browser; see our Cookies Policy for details.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          10. Automated Decision-Making and Profiling
        </h2>
        <p className="mt-2 leading-relaxed">
          We use automation for service improvement and fraud prevention. You
          may request human intervention at{" "}
          <a
            href="mailto:support@checkaroundme.com"
            className="text-blue-600 hover:underline"
          >
            support@checkaroundme.com
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          11. Visitors, Users, and Merchants
        </h2>
        <p className="mt-2 leading-relaxed">
          This policy applies to all visitors, users, and merchants. Users
          aren’t required to register; merchants may need to verify and pay
          subscription fees.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">
          12. Changes to This Privacy Policy
        </h2>
        <p className="mt-2 leading-relaxed">
          We may update this policy; material changes will be communicated
          through the Service or other means.
        </p>
      </section>

      <footer>
        <h2 className="text-2xl font-bold">13. Contact Us</h2>
        <p className="mt-2 leading-relaxed">
          For questions, contact our Data Protection Officer at{" "}
          <a
            href="mailto:support@checkaroundme.com"
            className="text-blue-600 hover:underline"
          >
            support@checkaroundme.com
          </a>
          .
        </p>
      </footer>
    </main>
  );
};

export default PrivacyPolicy;
