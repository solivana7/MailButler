import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0D0D12] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to SoliMail
        </a>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
            <FileText size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Terms of Service</h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">Last updated: June 20, 2026</p>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using SoliMail (“the Service”), you agree to be bound by these Terms
              of Service. If you do not agree to these terms, please do not use the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">2. Description of Service</h2>
            <p>
              SoliMail is an AI-powered email command center that helps users organize, analyze,
              and manage email messages from connected accounts. The Service may integrate with
              third-party email providers such as Gmail and generic IMAP servers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">3. User Accounts</h2>
            <p>
              To use certain features, you may be required to connect one or more email accounts.
              You are responsible for maintaining the confidentiality of your credentials and for
              all activities that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">4. Acceptable Use</h2>
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Violate any applicable laws or regulations.</li>
              <li>Infringe on the rights of others.</li>
              <li>Send spam, unsolicited messages, or abusive content.</li>
              <li>Attempt to gain unauthorized access to the Service or its infrastructure.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">5. Data and Privacy</h2>
            <p>
              Your use of the Service is also governed by our{' '}
              <a href="/privacy" className="text-violet-400 hover:text-violet-300">
                Privacy Policy
              </a>
              . By connecting an email account, you authorize SoliMail to access and process your
              email data in accordance with the Privacy Policy.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">6. Third-Party Services</h2>
            <p>
              The Service relies on third-party providers, including Google APIs, Railway, and AI
              services. Your use of these integrations is subject to their respective terms of
              service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">7. Service Availability</h2>
            <p>
              We strive to keep the Service available and reliable, but we do not guarantee
              uninterrupted access. Maintenance, updates, and unforeseen issues may cause downtime.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">8. Modifications to the Service</h2>
            <p>
              We reserve the right to modify, suspend, or discontinue the Service at any time, with
              or without notice. We may also update these Terms from time to time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, SoliMail and its operators shall not be
              liable for any indirect, incidental, special, or consequential damages arising out of
              or in connection with your use of the Service.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">10. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time if you violate
              these Terms. You may stop using the Service and disconnect your accounts at any time.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">11. Contact</h2>
            <p>
              For questions about these Terms, contact us at{' '}
              <a
                href="mailto:hello@madebysolivana.app"
                className="text-violet-400 hover:text-violet-300"
              >
                hello@madebysolivana.app
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
