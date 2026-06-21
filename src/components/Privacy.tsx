import React from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

export const Privacy: React.FC = () => {
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
            <Mail size={20} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Privacy Policy</h1>
        </div>

        <p className="text-sm text-gray-500 mb-8">Last updated: June 20, 2026</p>

        <section className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-2">1. Introduction</h2>
            <p>
              SoliMail (“we”, “us”, or “our”) is an AI-powered email command center. This Privacy
              Policy explains how we collect, use, store, and protect your information when you use
              our service at https://solimail.app.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>Account information:</strong> Your name, email address, and authentication
                tokens when you connect an email account.
              </li>
              <li>
                <strong>Email metadata:</strong> Sender, recipient, subject, date, and message
                preview to display and organize your inbox.
              </li>
              <li>
                <strong>Email content:</strong> Message body may be processed by our AI analysis
                features only when you choose to analyze an email.
              </li>
              <li>
                <strong>Usage data:</strong> Basic logs such as IP address, browser type, and access
                times for security and troubleshooting.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide the SoliMail inbox, task, and digest features.</li>
              <li>To generate AI-powered summaries, priorities, and action suggestions.</li>
              <li>To send reminders and notifications you configure.</li>
              <li>To maintain security, prevent abuse, and improve the service.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">4. Gmail Data</h2>
            <p>
              If you connect a Gmail account, SoliMail uses Google OAuth 2.0 to access your Gmail
              data. We request only the minimum scopes required:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <code>https://www.googleapis.com/auth/gmail.readonly</code> — to read your emails
                and display them in SoliMail.
              </li>
              <li>
                <code>https://www.googleapis.com/auth/gmail.modify</code> — to mark emails as read,
                starred, or labeled as part of managing your inbox.
              </li>
            </ul>
            <p className="mt-2">
              We do not sell your Gmail data. We do not use your Gmail data for advertising. We do
              not train third-party AI models on your emails.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">5. Data Storage and Security</h2>
            <p>
              Your data is stored in encrypted databases hosted by Railway and PostgreSQL providers.
              Access tokens and passwords are encrypted at rest. We use industry-standard TLS for
              data in transit.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">6. Third-Party Services</h2>
            <p>We use the following third-party services to operate SoliMail:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>
                <strong>Railway</strong> — hosting and database infrastructure.
              </li>
              <li>
                <strong>Google APIs</strong> — Gmail account access (only when you connect Gmail).
              </li>
              <li>
                <strong>Kimi / Moonshot AI</strong> — optional AI analysis features (only when you
                enable or trigger analysis).
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">7. Cookies</h2>
            <p>
              SoliMail may use essential cookies to maintain your session and preferences. We do not
              use tracking or advertising cookies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">8. Your Rights</h2>
            <p>
              You can disconnect your email accounts, delete your data, or request account deletion
              at any time by contacting us. You can also revoke SoliMail’s access to your Gmail
              account at https://myaccount.google.com/permissions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this
              page with an updated “Last updated” date.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-2">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please contact us at{' '}
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
