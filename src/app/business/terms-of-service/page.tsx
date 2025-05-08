import React from "react";

const TermsOfServicePage = () => {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Terms of Service</h1>
      <p className="text-lg font-medium mb-8 text-center">
        Merchant Terms and Conditions for Checkaroundme
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="text-lg mb-4 text-gray-700">
            Welcome to Checkaroundme! These Terms and Conditions ("Terms") apply
            to merchants and service providers who register and use our platform
            ("Merchant" or "you"). By creating a merchant account and using the
            Checkaroundme platform, you agree to comply with these Terms. If you
            do not agree to these Terms, please refrain from using the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Merchant Registration</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Account Creation:</span> You must
              create an account to list services on the platform. Accurate and
              complete information is required during registration, including
              your name, business name, valid contact information, and any
              necessary identification or business documentation.
            </li>
            <li>
              <span className="font-medium">Verification:</span> We may require
              additional verification documents, including but not limited to
              government-issued IDs, proof of address, or professional
              certifications, to confirm your identity and eligibility as a
              merchant.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Listing Services</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Service Accuracy:</span> All service
              listings must provide accurate, clear, and detailed descriptions
              of the services offered, including pricing, availability, and
              other relevant details. Misleading or false information is
              prohibited.
            </li>
            <li>
              <span className="font-medium">Content Ownership:</span> You retain
              ownership of the content you upload, but by posting it on the
              platform, you grant Checkaroundme a non-exclusive, royalty-free,
              and worldwide license to use, display, and promote your content in
              connection with the platform.
            </li>
            <li>
              <span className="font-medium">Compliance:</span> Your services
              must comply with all applicable laws, regulations, and
              professional standards. Any prohibited, unlawful, or harmful
              content is strictly forbidden.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Fees and Payments</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Listing Fees:</span> Merchants may
              be required to pay subscription or listing fees to use premium
              features on the platform. Fees are clearly outlined on the
              platform and are subject to change.
            </li>
            <li>
              <span className="font-medium">Payment Processing:</span> All
              payments for subscription fees are processed through third-party
              payment processors. Checkaroundme does not store or process your
              payment information.
            </li>
          </ul>
          <p className="mt-4 text-gray-700">
            <span className="font-medium">No Payments for Services:</span>{" "}
            Checkaroundme does not facilitate any financial transactions between
            merchants and clients. You are solely responsible for managing
            payments for services directly with your clients.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Subscription Fees:</span>{" "}
              Subscription fees are non-refundable once paid, except in cases
              where a refund is specifically required under the terms of the
              subscription plan.
            </li>
            <li>
              <span className="font-medium">Client Payments:</span> Any payments
              made directly to you by clients for services rendered are outside
              of Checkaroundme's control and are not eligible for refunds
              through Checkaroundme. Any refund requests must be handled
              directly between you and the client.
            </li>
            <li>
              <span className="font-medium">Dispute Resolution:</span> If a
              service dispute arises between you and a client, Checkaroundme can
              assist with communication and mediation but does not process
              refunds or manage service issues.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Merchant Conduct</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Professional Conduct:</span> You
              agree to conduct yourself and provide services in a professional
              manner, in accordance with the descriptions in your listings.
            </li>
            <li>
              <span className="font-medium">Prohibited Activities:</span> You
              may not engage in fraudulent, illegal, or harmful activities on
              the platform, including but not limited to:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>
                  Providing false or misleading information in service listings.
                </li>
                <li>
                  Engaging in harassment or unethical practices with clients.
                </li>
                <li>Violating any applicable laws or regulations.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Service Ratings and Reviews
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Client Feedback:</span> Clients may
              leave ratings and reviews based on their experiences with your
              services. You acknowledge that these reviews represent client
              opinions, and you agree not to manipulate or falsify reviews.
            </li>
            <li>
              <span className="font-medium">Responding to Reviews:</span> You
              may respond professionally to client reviews, especially if there
              is a need to clarify or address any concerns.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Disputes and Liability
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Disputes with Clients:</span>{" "}
              Checkaroundme is not responsible for disputes, refund requests, or
              complaints between merchants and clients. You must resolve all
              issues directly with your clients.
            </li>
            <li>
              <span className="font-medium">Platform Liability:</span>{" "}
              Checkaroundme is not liable for any damages, claims, or losses
              arising from interactions between merchants and clients, including
              disputes, service failures, or payment issues.
            </li>
            <li>
              <span className="font-medium">Indemnification:</span> You agree to
              indemnify and hold Checkaroundme harmless from any claims or
              damages resulting from your use of the platform, your services, or
              your interactions with clients.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Termination of Account
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">By Checkaroundme:</span> We reserve
              the right to suspend or terminate your merchant account if you
              violate these Terms or engage in activities that harm the platform
              or its users. No refunds will be issued for terminated accounts.
            </li>
            <li>
              <span className="font-medium">By Merchant:</span> You may cancel
              your subscription at any time by contacting our support team
              before the next billing cycle. No refunds will be provided for
              fees already paid.
            </li>
            <li>
              <span className="font-medium">Account Deactivation:</span> If your
              subscription is not renewed, your account may be deactivated, and
              you will lose access to your service listings.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Limitations and Disclaimers
          </h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">Platform Availability:</span>{" "}
              Checkaroundme provides the platform "as is" and "as available." We
              do not guarantee uninterrupted access or error-free service.
            </li>
            <li>
              <span className="font-medium">No Guarantee of Success:</span>{" "}
              Checkaroundme does not guarantee that your listings will lead to
              bookings, payments, or clients. The success of your business on
              the platform depends on your services, pricing, and client
              interactions.
            </li>
            <li>
              <span className="font-medium">
                No Liability for Third-Party Actions:
              </span>{" "}
              Checkaroundme is not liable for any actions or claims made by
              third-party service providers or clients. You are responsible for
              managing all business activities related to your service
              offerings.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms from time to time. Any changes will be
            posted on the platform. Your continued use of the platform after any
            changes constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions or concerns regarding these Terms or the
            platform, please contact us at:
          </p>
          <p className="mt-2 font-medium text-gray-800">
            support@checkaroundme.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
