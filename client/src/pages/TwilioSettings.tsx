import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'; 
import { ExternalLink, Settings, Save, RefreshCcw, Loader2 } from 'lucide-react';

interface TwilioCredentials {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

export default function TwilioSettings() {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<TwilioCredentials>({
    accountSid: '',
    authToken: '',
    phoneNumber: ''
  });
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);

  // Fetch current settings if they exist
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings/twilio'],
    enabled: true,
  });

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: TwilioCredentials) => {
      return apiRequest('POST', '/api/settings/twilio', data);
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Twilio credentials have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/settings/twilio'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to save Twilio credentials: ${error}`,
        variant: 'destructive',
      });
    },
  });

  // Test credentials mutation
  const testCredentials = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/settings/twilio/test', credentials);
    },
    onSuccess: (data) => {
      toast({
        title: 'Test Successful',
        description: 'Connection to Twilio service was successful.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Test Failed',
        description: `Could not connect to Twilio: ${error}`,
        variant: 'destructive',
      });
    },
  });

  // Update form when settings data is loaded
  useEffect(() => {
    if (settings) {
      // Use type assertion for settings object
      const settingsObj = settings as any;
      const twilioSettings = settingsObj.twilio || { accountSid: '', authToken: '', phoneNumber: '' };
      setCredentials({
        accountSid: twilioSettings.accountSid || '',
        authToken: twilioSettings.authToken || '',
        phoneNumber: twilioSettings.phoneNumber || ''
      });
    }
  }, [settings]);

  // Check if form is valid
  useEffect(() => {
    const isValid = credentials.accountSid.trim() !== '' && 
                   credentials.authToken.trim() !== '' && 
                   credentials.phoneNumber.trim() !== '';
    setIsButtonDisabled(!isValid);
  }, [credentials]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(credentials);
  };

  const handleTest = () => {
    testCredentials.mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Helmet>
        <title>Twilio SMS Settings - Health Insight Ventures</title>
        <meta name="description" content="Configure Twilio SMS settings for appointment reminders and notifications" />
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Twilio SMS Settings</h1>
          <a 
            href="https://www.twilio.com/console" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink size={16} />
            Twilio Console
          </a>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              SMS Notification Settings
            </CardTitle>
            <CardDescription>
              Configure your Twilio account credentials to enable SMS notifications for appointments and important updates.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="accountSid">Account SID</Label>
                <Input
                  id="accountSid"
                  name="accountSid"
                  placeholder="AC..."
                  value={credentials.accountSid}
                  onChange={handleChange}
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
                  value={credentials.authToken}
                  onChange={handleChange}
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
                  value={credentials.phoneNumber}
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500">
                  Use E.164 format: +[country code][number]. Example: +12025551234
                </p>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertTitle className="text-amber-800">Why configure SMS?</AlertTitle>
                <AlertDescription className="text-amber-700">
                  SMS notifications improve patient engagement by providing timely appointment reminders, 
                  reducing no-shows by up to 30%. All messages are HIPAA-compliant with minimal PHI.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTest}
                disabled={isButtonDisabled || testCredentials.isPending}
              >
                {testCredentials.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-2 h-4 w-4" />
                    Test Connection
                  </>
                )}
              </Button>
              <Button 
                type="submit" 
                disabled={isButtonDisabled || updateSettings.isPending}
              >
                {updateSettings.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}