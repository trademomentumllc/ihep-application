import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, MessageSquare } from 'lucide-react';

export default function TwilioConfig() {
  const [formState, setFormState] = useState({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  // Load saved credentials on mount (if any)
  useEffect(() => {
    const savedCreds = localStorage.getItem('twilioConfig');
    if (savedCreds) {
      try {
        const parsed = JSON.parse(savedCreds);
        setFormState(parsed);
        setSaved(true);
      } catch (e) {
        console.error('Error parsing saved Twilio config', e);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formState.accountSid || !formState.authToken || !formState.phoneNumber) {
      setMessage('Please fill out all fields');
      return;
    }
    
    try {
      setMessage('Saving Twilio configuration...');
      
      // Save credentials to server
      const response = await fetch('/api/settings/twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid: formState.accountSid,
          authToken: formState.authToken,
          phoneNumber: formState.phoneNumber
        }),
      });
      
      if (response.ok) {
        // Save to localStorage for form persistence
        localStorage.setItem('twilioConfig', JSON.stringify(formState));
        setMessage('Twilio configuration saved successfully!');
        setSaved(true);
      } else {
        const error = await response.json();
        setMessage(`Failed to save configuration: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving Twilio configuration:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Error saving configuration: ${errorMessage}`);
    }
  };

  const handleTestSms = async () => {
    try {
      setMessage('Sending test SMS...');
      
      // Call API to send a test SMS
      const response = await fetch('/api/sms/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: formState.phoneNumber,  // Using the Twilio number as test recipient
          message: 'This is a test SMS from Health Insight Ventures. Your SMS configuration is working correctly!'
        }),
      });
      
      if (response.ok) {
        setMessage('Test SMS sent successfully! Check your phone or the logs to confirm delivery.');
      } else {
        const error = await response.json();
        setMessage(`Failed to send test SMS: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error sending test SMS:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setMessage(`Error sending test SMS: ${errorMessage}`);
    }
  };

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-primary" />
          Twilio SMS Configuration
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>SMS Notification Settings</CardTitle>
            <CardDescription>
              Configure your Twilio credentials to enable SMS notifications for appointments and reminders.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {message && (
                <Alert className={`${saved ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'} mb-4`}>
                  <AlertDescription className={saved ? 'text-green-800' : 'text-amber-800'}>
                    {message}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="accountSid">Twilio Account SID</Label>
                <Input
                  id="accountSid"
                  name="accountSid"
                  value={formState.accountSid}
                  onChange={handleChange}
                  placeholder="AC..."
                />
                <p className="text-xs text-gray-500">
                  The Account SID from your Twilio dashboard
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authToken">Auth Token</Label>
                <Input
                  id="authToken"
                  name="authToken"
                  type="password"
                  value={formState.authToken}
                  onChange={handleChange}
                  placeholder="Your Twilio Auth Token"
                />
                <p className="text-xs text-gray-500">
                  The Auth Token from your Twilio dashboard (kept secure)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Twilio Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formState.phoneNumber}
                  onChange={handleChange}
                  placeholder="+15551234567"
                />
                <p className="text-xs text-gray-500">
                  Your Twilio phone number in E.164 format (e.g., +15551234567)
                </p>
              </div>
              
              <div className="pt-2">
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertDescription className="text-blue-800">
                    These credentials will be used to send appointment reminders and notifications to patients.
                    All SMS messages are HIPAA-compliant and contain minimal PHI.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestSms}
                disabled={!saved}
              >
                Test SMS
              </Button>
              
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Configuration
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}