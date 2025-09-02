import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service | {APP_NAME}</title>
        <meta name="description" content="Read the terms of service and user agreement for the Integrated Health Empowerment Program platform." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-2">Terms of Service</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Last updated: May 10, 2025</p>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <h2>Agreement to Terms</h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement made between you and the 
                Integrated Health Empowerment Program ("IHEP," "we," "our," or "us") concerning your access to and 
                use of our website and services.
              </p>
              <p>
                Please read these Terms carefully before accessing or using our platform. By accessing or using the 
                platform, you agree to be bound by these Terms. If you do not agree to all the terms and conditions 
                of this agreement, you may not access or use the platform.
              </p>

              <h2>Platform Use</h2>
              <h3>User Accounts</h3>
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. 
                You are responsible for maintaining the confidentiality of your account credentials and for all 
                activities that occur under your account.
              </p>
              <p>
                You agree to notify us immediately of any unauthorized use of your account or any other breach of 
                security. We cannot and will not be liable for any loss or damage arising from your failure to 
                comply with the above requirements.
              </p>

              <h3>Acceptable Use</h3>
              <p>You agree not to:</p>
              <ul>
                <li>Use the platform in any way that violates any applicable laws or regulations</li>
                <li>Impersonate or attempt to impersonate IHEP, an IHEP employee, or another user</li>
                <li>Transmit any material that is harmful, threatening, abusive, or otherwise objectionable</li>
                <li>Attempt to gain unauthorized access to any portion of the platform</li>
                <li>Interfere with or disrupt the platform or servers connected to the platform</li>
                <li>Use any automated means to access the platform</li>
                <li>Reproduce, duplicate, copy, sell, resell, or exploit any portion of the platform without express written permission</li>
              </ul>

              <h2>Healthcare Services and Information</h2>
              <p>
                The platform facilitates connections between users and healthcare providers but does not itself 
                provide medical services. IHEP is not a medical provider and does not provide medical advice, 
                diagnosis, or treatment.
              </p>
              <p>
                Any information provided through the platform is for general informational purposes only and 
                should not be considered a substitute for professional medical advice. Always consult with a 
                qualified healthcare provider regarding any health concerns.
              </p>

              <h2>Appointment Scheduling</h2>
              <p>
                The platform allows users to schedule appointments with healthcare providers. By scheduling an 
                appointment, you agree to:
              </p>
              <ul>
                <li>Provide accurate information</li>
                <li>Attend scheduled appointments or cancel/reschedule with reasonable notice</li>
                <li>Comply with the healthcare provider's office policies</li>
              </ul>
              <p>
                We are not responsible for any issues arising from appointments, including but not limited to 
                quality of care, billing disputes, or insurance coverage.
              </p>

              <h2>User-Generated Content</h2>
              <p>
                Users may post, upload, or otherwise contribute content to the platform, such as in community 
                forums and groups. By providing content, you grant us a non-exclusive, royalty-free, perpetual, 
                and worldwide license to use, store, display, reproduce, and distribute your content in connection 
                with the platform.
              </p>
              <p>You are solely responsible for the content you contribute and must not post content that:</p>
              <ul>
                <li>Infringes on any intellectual property rights</li>
                <li>Contains false or misleading information</li>
                <li>Promotes illegal activities</li>
                <li>Contains personal or sensitive information about others without their consent</li>
                <li>Is harmful, harassing, or otherwise objectionable</li>
              </ul>

              <h2>Intellectual Property</h2>
              <p>
                The platform and its contents, features, and functionality are owned by IHEP and are protected by 
                copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, 
                create derivative works of, publicly display, or otherwise use any content from the platform without 
                prior written permission.
              </p>

              <h2>Limitation of Liability</h2>
              <p>
                In no event shall IHEP be liable for any indirect, incidental, special, consequential, or punitive 
                damages, including loss of profits, data, or goodwill, arising out of or in connection with your 
                access to or use of the platform.
              </p>

              <h2>Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless IHEP and its officers, directors, employees, and agents 
                from any claims, liabilities, damages, losses, costs, or expenses arising out of your use of the 
                platform or violation of these Terms.
              </p>

              <h2>Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the Commonwealth of 
                Massachusetts, without regard to its conflict of law provisions.
              </p>

              <h2>Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. The updated version will be indicated by 
                an updated "Last Updated" date. Your continued use of the platform after any changes constitutes 
                your acceptance of such changes.
              </p>

              <h2>Contact Us</h2>
              <p>
                If you have questions or concerns about these Terms, please contact us at:
              </p>
              <p>
                Integrated Health Empowerment Program<br />
                123 Health Avenue, Suite 300<br />
                Boston, MA 02118<br />
                Email: legal@ihep.app<br />
                Phone: (555) 123-4567
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

export default Terms;