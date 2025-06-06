import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertConsultationSchema, type InsertConsultation, type PatientWithVisits, type Visit } from "@shared/schema";
import {
  Stethoscope,
  Heart,
  Activity,
  Thermometer,
  Eye,
  Brain,
  Bone,
  Pill,
  FileText,
  AlertTriangle,
  Calendar,
  Save,
  X,
} from "lucide-react";
import { z } from "zod";

const consultationFormSchema = insertConsultationSchema.extend({
  vitalSigns: z.string().optional(),
});

type ConsultationFormData = z.infer<typeof consultationFormSchema>;

interface ConsultationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: PatientWithVisits;
  visit: Visit;
}

export default function ConsultationForm({
  open,
  onOpenChange,
  patient,
  visit,
}: ConsultationFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("history");

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationFormSchema),
    defaultValues: {
      visitId: visit.id,
      chiefComplaint: visit.chiefComplaint || "",
      historyOfPresentIllness: "",
      pastMedicalHistory: "",
      familyHistory: "",
      socialHistory: "",
      allergies: "",
      currentMedications: [],
      vitalSigns: "",
      generalExamination: "",
      systemicExamination: "",
      clinicalFindings: "",
      provisionalDiagnosis: "",
      differentialDiagnosis: "",
      investigationsAdvised: [],
      treatmentPlan: "",
      advice: "",
      followUpInstructions: "",
      criticalNotes: "",
      doctorName: "Dr. Priya Sharma",
    },
  });

  const createConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationFormData) => {
      // Parse vital signs JSON if provided
      const consultationData: InsertConsultation = {
        ...data,
        vitalSigns: data.vitalSigns || null,
        currentMedications: data.currentMedications?.filter(med => med.trim()) || null,
        investigationsAdvised: data.investigationsAdvised?.filter(inv => inv.trim()) || null,
      };
      
      const response = await apiRequest("POST", "/api/consultations", consultationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/visits"] });
      toast({
        title: "Success",
        description: "Consultation saved successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save consultation",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ConsultationFormData) => {
    createConsultationMutation.mutate(data);
  };

  const isLoading = createConsultationMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
            Doctor Consultation - {patient.firstName} {patient.lastName}
          </DialogTitle>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Visit: {visit.visitCode}</span>
            <span>Age: {patient.age}, {patient.gender}</span>
            <span>Phone: {patient.phone}</span>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="history">History</TabsTrigger>
                  <TabsTrigger value="examination">Examination</TabsTrigger>
                  <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
                  <TabsTrigger value="treatment">Treatment</TabsTrigger>
                  <TabsTrigger value="followup">Follow-up</TabsTrigger>
                </TabsList>

                <TabsContent value="history" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Chief Complaint */}
                    <FormField
                      control={form.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                            Chief Complaint
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Patient's main complaint and duration"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* History of Present Illness */}
                    <FormField
                      control={form.control}
                      name="historyOfPresentIllness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            History of Present Illness (HPI)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed history of current illness - onset, duration, character, progression, associated symptoms, relieving/aggravating factors"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Past Medical History */}
                    <FormField
                      control={form.control}
                      name="pastMedicalHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Heart className="h-4 w-4 mr-2 text-red-500" />
                            Past Medical History
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Previous illnesses, surgeries, hospitalizations, chronic conditions"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Family History */}
                    <FormField
                      control={form.control}
                      name="familyHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-green-500" />
                            Family History
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Family history of relevant medical conditions - diabetes, hypertension, heart disease, etc."
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Social History */}
                    <FormField
                      control={form.control}
                      name="socialHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Social History</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Occupation, lifestyle, smoking, alcohol, diet, exercise habits"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Allergies */}
                    <FormField
                      control={form.control}
                      name="allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                            Known Allergies
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Drug allergies, food allergies, environmental allergies"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="examination" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Vital Signs */}
                    <FormField
                      control={form.control}
                      name="vitalSigns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Thermometer className="h-4 w-4 mr-2 text-blue-500" />
                            Vital Signs
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="BP: __/__mmHg, Pulse: __/min, Temp: __°C, RR: __/min, SpO2: __%"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* General Examination */}
                    <FormField
                      control={form.control}
                      name="generalExamination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-green-500" />
                            General Examination
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="General appearance, consciousness, orientation, build, nourishment, pallor, icterus, cyanosis, clubbing, lymphadenopathy, edema"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Systemic Examination */}
                    <FormField
                      control={form.control}
                      name="systemicExamination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Bone className="h-4 w-4 mr-2 text-purple-500" />
                            Systemic Examination
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="CVS: Heart sounds, murmurs | RS: Breath sounds, chest movement | CNS: Motor, sensory, reflexes | MSK: Joint examination, range of motion, deformity"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Clinical Findings */}
                    <FormField
                      control={form.control}
                      name="clinicalFindings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Brain className="h-4 w-4 mr-2 text-indigo-500" />
                            Clinical Findings
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Key positive and negative findings, relevant abnormalities"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="diagnosis" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Provisional Diagnosis */}
                    <FormField
                      control={form.control}
                      name="provisionalDiagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-600" />
                            Provisional Diagnosis
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Primary working diagnosis based on clinical findings"
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Differential Diagnosis */}
                    <FormField
                      control={form.control}
                      name="differentialDiagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Differential Diagnosis</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Other possible diagnoses to consider and rule out"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Investigations Advised */}
                    <FormField
                      control={form.control}
                      name="investigationsAdvised"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investigations Advised</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="X-rays, blood tests, MRI, CT scan, etc. (separate each with a new line)"
                              rows={4}
                              value={field.value?.join('\n') || ''}
                              onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="treatment" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Treatment Plan */}
                    <FormField
                      control={form.control}
                      name="treatmentPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Pill className="h-4 w-4 mr-2 text-green-600" />
                            Treatment Plan
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Detailed treatment approach - medications, procedures, physiotherapy, lifestyle modifications"
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Current Medications */}
                    <FormField
                      control={form.control}
                      name="currentMedications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Medications</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List current medications patient is taking (separate each with a new line)"
                              rows={3}
                              value={field.value?.join('\n') || ''}
                              onChange={(e) => field.onChange(e.target.value.split('\n').filter(Boolean))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Advice */}
                    <FormField
                      control={form.control}
                      name="advice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patient Advice</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Diet, exercise, precautions, activity restrictions, warning signs to watch for"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="followup" className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    {/* Follow-up Instructions */}
                    <FormField
                      control={form.control}
                      name="followUpInstructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                            Follow-up Instructions
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="When to return, what to monitor, when to seek immediate care"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Critical Notes */}
                    <FormField
                      control={form.control}
                      name="criticalNotes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                            Critical Notes & Alerts
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Important alerts, red flags, critical observations that need special attention"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Doctor Name */}
                    <FormField
                      control={form.control}
                      name="doctorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Consulting Doctor</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Doctor's name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Consultation"}
                </Button>
              </div>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}