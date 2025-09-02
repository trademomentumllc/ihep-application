import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Phone, Lock, ArrowRight, Check, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Form schema
const phoneFormSchema = z.object({
  phoneNumber: z.string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(15, { message: 'Phone number cannot exceed 15 digits' })
    .refine(val => /^\+?[1-9]\d{9,14}$/.test(val), { 
      message: 'Please enter a valid phone number (E.164 format recommended, e.g., +12125551234)' 
    })
});

const verificationFormSchema = z.object({
  code: z.string()
    .min(4, { message: 'Verification code must be at least 4 digits' })
    .max(10, { message: 'Verification code cannot exceed 10 digits' })
});

const PhoneVerification = () => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState<'phone' | 'verification'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<'sms' | 'call'>('sms');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Phone form
  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      phoneNumber: ''
    }
  });

  // Verification form
  const verificationForm = useForm<z.infer<typeof verificationFormSchema>>({
    resolver: zodResolver(verificationFormSchema),
    defaultValues: {
      code: ''
    }
  });

  // Handle phone submission
  const onPhoneSubmit = async (values: z.infer<typeof phoneFormSchema>) => {
    setIsLoading(true);
    try {
      // Format phone number to E.164 if not already
      let formattedPhone = values.phoneNumber;
      if (!formattedPhone.startsWith('+')) {
        // Simple format assuming US number if no country code
        formattedPhone = '+1' + formattedPhone.replace(/\D/g, '');
      }
      
      // Store the formatted phone number
      setPhoneNumber(formattedPhone);
      
      // Call verification API
      const response = await fetch('/api/verification/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          channel: verificationMethod
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setVerificationSent(true);
        setStep('verification');
        toast({
          title: "Verification code sent!",
          description: `We've sent a verification code to ${formattedPhone} via ${verificationMethod}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to send verification",
          description: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error sending verification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const onVerificationSubmit = async (values: z.infer<typeof verificationFormSchema>) => {
    setIsLoading(true);
    try {
      // Call verification check API
      const response = await fetch('/api/verification/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          code: values.code
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success && data.valid) {
        setIsVerified(true);
        toast({
          title: "Phone verified!",
          description: "Your phone number has been successfully verified.",
        });
        
        // Redirect to profile page after verification
        setTimeout(() => {
          setLocation('/profile');
        }, 2000);
      } else {
        toast({
          variant: "destructive",
          title: "Verification failed",
          description: data.message || "Invalid verification code. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error checking verification code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to verify code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/verification/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber,
          channel: verificationMethod
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({
          title: "Code resent!",
          description: `We've sent a new verification code to ${phoneNumber}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to resend code",
          description: data.message || "Something went wrong. Please try again.",
        });
      }
    } catch (error) {
      console.error('Error resending verification:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resend verification code. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Switch between verification methods (SMS or Call)
  const handleMethodChange = (value: string) => {
    setVerificationMethod(value as 'sms' | 'call');
  };

  return (
    <div className="container max-w-md py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Phone Verification</CardTitle>
          <CardDescription className="text-center">
            Verify your phone number to enable secure notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isVerified ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">Verification Complete!</h3>
              <p className="text-gray-500 mt-2">
                Your phone number has been successfully verified.
              </p>
            </div>
          ) : step === 'phone' ? (
            <>
              <Tabs defaultValue="sms" onValueChange={handleMethodChange}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="sms">SMS</TabsTrigger>
                  <TabsTrigger value="call">Phone Call</TabsTrigger>
                </TabsList>
                <TabsContent value="sms">
                  <p className="text-sm text-gray-500 mb-4">
                    We'll send a verification code to your phone via text message.
                  </p>
                </TabsContent>
                <TabsContent value="call">
                  <p className="text-sm text-gray-500 mb-4">
                    We'll call your phone and provide a verification code.
                  </p>
                </TabsContent>
              </Tabs>
              
              <Form {...phoneForm}>
                <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-6">
                  <FormField
                    control={phoneForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="relative flex-1">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="+12125551234" 
                                className="pl-10" 
                                {...field}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter your phone number in E.164 format with country code.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              </Form>
            </>
          ) : (
            <>
              <div className="mb-6">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Verification Code Sent</AlertTitle>
                  <AlertDescription>
                    We've sent a verification code to {phoneNumber} via {verificationMethod === 'sms' ? 'SMS' : 'phone call'}.
                  </AlertDescription>
                </Alert>
              </div>
              
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(onVerificationSubmit)} className="space-y-6">
                  <FormField
                    control={verificationForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Verification Code</FormLabel>
                        <FormControl>
                          <div className="flex">
                            <div className="relative flex-1">
                              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input 
                                placeholder="123456" 
                                className="pl-10" 
                                {...field}
                              />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the verification code we sent you.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setStep('phone')}
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm" 
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    Didn't receive a code? Send again
                  </Button>
                </form>
              </Form>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500 px-6">
          <p>
            Your phone number will only be used for verification and notifications related to your healthcare. 
            We do not share this information with third parties.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PhoneVerification;