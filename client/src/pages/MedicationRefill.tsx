import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, PlusCircle, Pill, AlertCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

// Define the form schema
const medicationRefillSchema = z.object({
  medicationName: z.string().min(2, "Medication name is required"),
  prescriptionNumber: z.string().optional(),
  pharmacy: z.string().min(2, "Pharmacy information is required"),
  refillQuantity: z.string().min(1, "Quantity is required"),
  urgency: z.string().min(1, "Please select urgency level"),
  instructions: z.string().optional(),
});

type MedicationRefillValues = z.infer<typeof medicationRefillSchema>;

const MedicationRefill = () => {
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  
  // Simulated query for patient medications
  const { data: medications, isLoading } = useQuery({
    queryKey: ['/api/medications'],
    queryFn: async () => {
      // This would normally fetch from the API
      return [
        { id: 1, name: "Lisinopril 10mg", prescriptionNumber: "RX12345678", pharmacy: "CVS Pharmacy" },
        { id: 2, name: "Metformin 500mg", prescriptionNumber: "RX23456789", pharmacy: "Walgreens" },
        { id: 3, name: "Atorvastatin 20mg", prescriptionNumber: "RX34567890", pharmacy: "Rite Aid" }
      ];
    },
    enabled: isAuthenticated
  });

  const form = useForm<MedicationRefillValues>({
    resolver: zodResolver(medicationRefillSchema),
    defaultValues: {
      medicationName: "",
      prescriptionNumber: "",
      pharmacy: "",
      refillQuantity: "",
      urgency: "normal",
      instructions: "",
    },
  });

  const onSubmit = async (data: MedicationRefillValues) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to request medication refills.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Refill Request Submitted",
        description: "Your medication refill request has been sent to your provider. You will be notified when it's processed.",
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const autofillMedication = (medication: any) => {
    form.setValue("medicationName", medication.name);
    form.setValue("prescriptionNumber", medication.prescriptionNumber);
    form.setValue("pharmacy", medication.pharmacy);
    form.setValue("refillQuantity", "30");
  };

  return (
    <>
      <Helmet>
        <title>Request Medication Refill | {APP_NAME}</title>
        <meta name="description" content="Request refills for your current medications through your healthcare provider." />
      </Helmet>

      <section className="container mx-auto px-4 py-6 mt-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-montserrat font-bold text-primary mb-2">Medication Refill Request</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Submit a request to refill your prescription medications. Your healthcare provider will review your request and process it accordingly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Request a Medication Refill</CardTitle>
                <CardDescription>
                  Fill out the form below to request a refill of your medication.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="medicationName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medication Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter medication name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prescriptionNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prescription Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., RX12345678" {...field} />
                          </FormControl>
                          <FormDescription>
                            Found on your prescription label
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pharmacy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Pharmacy</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter pharmacy name and location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="refillQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Refill Quantity</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 30 days supply" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select urgency level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="urgent">Urgent (less than 24 hours)</SelectItem>
                              <SelectItem value="soon">Soon (2-3 days)</SelectItem>
                              <SelectItem value="normal">Normal (4-7 days)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any special instructions for your provider" 
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? "Submitting..." : "Submit Refill Request"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Pill className="mr-2 h-5 w-5 text-primary" />
                  My Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p className="text-gray-500">Loading your medications...</p>
                ) : !isAuthenticated ? (
                  <div className="text-center py-6">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-gray-500">Please log in to view your medications</p>
                  </div>
                ) : medications && medications.length > 0 ? (
                  <div className="space-y-3">
                    {medications.map((med: any) => (
                      <div key={med.id} className="p-3 border rounded-md hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{med.name}</p>
                            <p className="text-xs text-gray-500">RX: {med.prescriptionNumber}</p>
                            <p className="text-xs text-gray-500">{med.pharmacy}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => autofillMedication(med)}
                            className="h-8 text-primary"
                          >
                            <PlusCircle className="h-4 w-4 mr-1" /> Refill
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-2">No medications found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5 text-primary" />
                  Refill Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Processing Times</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Urgent: Processed within 24 hours</li>
                    <li>• Soon: Processed within 2-3 business days</li>
                    <li>• Normal: Processed within 4-7 business days</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-1">Important Notes</h3>
                  <p className="text-sm text-gray-600">
                    For controlled substances or medications requiring special authorization, 
                    additional time may be needed for processing.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full text-sm" onClick={() => window.location.href = '/contact'}>
                    Need Help? Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default MedicationRefill;