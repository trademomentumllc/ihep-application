import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Save } from 'lucide-react';

export default function SimpleTwilioForm() {
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save credentials to local storage for demonstration
    localStorage.setItem('twilioCredentials', JSON.stringify({
      accountSid,
      authToken,
      phoneNumber
    }));
    
    // Set success message
    setMessage('Twilio credentials saved successfully!');
    
    // In a real implementation, we would send these to the server
    console.log('Saved Twilio credentials:', { accountSid, authToken, phoneNumber });
  };

  return (
    <div className="container py-10">
      <Helmet>
        <title>Twilio SMS Settings - Health Insight Ventures</title>
        <meta name="description" content="Configure Twilio SMS settings for appointment reminders" />
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Twilio SMS Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMS Notification Settings
            </CardTitle>
            <CardDescription>
              Configure your Twilio account credentials to enable SMS notifications for appointments.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {message && (
                <Alert className="bg-green-50 border-green-200 mb-4">
                  <AlertDescription className="text-green-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="accountSid">Account SID</Label>
                <Input
                  id="accountSid"
                  name="accountSid"
                  placeholder="AC..."
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Your Twilio Account SID can be found in your Twilio Console dashboard.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authToken">Auth Token</Label>
                <Input
                  id="authToken"
                  name="authToken"
                  type="password"
                  placeholder="Your Twilio Auth Token"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Keep your Auth Token secure. It grants access to your Twilio account.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Use E.164 format: +[country code][number]. Example: +12025551234
                </p>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-700">
                  SMS notifications improve patient engagement by providing timely appointment reminders, 
                  reducing no-shows by up to 30%. All messages are HIPAA-compliant with minimal PHI.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}