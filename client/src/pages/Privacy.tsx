import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy | {APP_NAME}</title>
        <meta name="description" content="Learn about how the Integrated Health Empowerment Program protects and handles your personal and health information." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-2">Privacy Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Last updated: May 10, 2025</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <h2>Introduction</h2>
              <p>
                Health Insight Ventures ("IHEP," "we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p>
                Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, 
                please do not access the platform.
              </p>

              <h2>Information We Collect</h2>
              <h3>Personal Information</h3>
              <p>We may collect personal information that you voluntarily provide to us when you:</p>
              <ul>
                <li>Register on the platform</li>
                <li>Fill out a form</li>
                <li>Schedule appointments</li>
                <li>Participate in community forums or groups</li>
                <li>Contact us</li>
              </ul>
              <p>The personal information we may collect includes:</p>
              <ul>
                <li>Name and contact information (email address, phone number, etc.)</li>
                <li>Date of birth</li>
                <li>Health insurance information</li>
                <li>Medical history and conditions</li>
                <li>Treatment information</li>
                <li>Login credentials</li>
              </ul>

              <h3>Automatically Collected Information</h3>
              <p>
                When you access our platform, we may automatically collect certain information 
                about your device, including:
              </p>
              <ul>
                <li>IP address</li>
                <li>Browser type</li>
                <li>Operating system</li>
                <li>Access times</li>
                <li>Pages viewed</li>
                <li>Links clicked</li>
                <li>Interactions with platform features</li>
              </ul>

              <h2>How We Use Your Information</h2>
              <p>We may use the information we collect for various purposes, including to:</p>
              <ul>
                <li>Provide, maintain, and improve our services</li>
                <li>Facilitate appointment scheduling and management</li>
                <li>Connect you with healthcare providers and resources</li>
                <li>Process and complete transactions</li>
                <li>Send administrative information, such as appointment reminders</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Protect the security and integrity of our platform</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>

              <h2>Information Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li>Healthcare providers involved in your care</li>
                <li>Third-party service providers who assist us in operating our platform</li>
                <li>Legal and regulatory authorities when required by law</li>
                <li>Business partners with your consent</li>
              </ul>

              <h2>HIPAA Compliance</h2>
              <p>
                As a healthcare platform, we are committed to complying with the Health Insurance Portability 
                and Accountability Act (HIPAA). We implement physical, technical, and administrative safeguards 
                designed to protect the privacy and security of protected health information (PHI).
              </p>

              <h2>Your Rights</h2>
              <p>Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul>
                <li>Right to access and receive a copy of your personal information</li>
                <li>Right to rectify or update your personal information</li>
                <li>Right to restrict or object to processing</li>
                <li>Right to data portability</li>
                <li>Right to erasure ("right to be forgotten")</li>
              </ul>

              <h2>Security</h2>
              <p>
                We use appropriate security measures to protect your information from unauthorized access, 
                alteration, disclosure, or destruction. However, no internet transmission is completely secure, 
                and we cannot guarantee the security of information transmitted to or from our platform.
              </p>

              <h2>Children's Privacy</h2>
              <p>
                Our platform is not intended for individuals under the age of 18. We do not knowingly collect 
                personal information from children. If you are a parent or guardian and believe that your child 
                has provided us with personal information, please contact us.
              </p>

              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. The updated version will be indicated by 
                an updated "Last Updated" date. We encourage you to review this privacy policy frequently to 
                stay informed about how we are protecting your information.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions or concerns about this privacy policy or our privacy practices, 
                please contact us at:
              </p>
              <p>
                Integrated Health Empowerment Program<br />
                123 Health Avenue, Suite 300<br />
                Boston, MA 02118<br />
                Email: privacy@ihep.app<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Privacy;