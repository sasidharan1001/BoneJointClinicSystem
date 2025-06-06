import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ConsultationForm from "@/components/modals/consultation-form-modal";
import {
  Stethoscope,
  UserCheck,
  FileText,
  Heart,
  Activity,
  Thermometer,
  Eye,
  Search,
  Plus,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  BookOpen,
  Clipboard,
  Target,
  RefreshCw,
} from "lucide-react";
import type { PatientWithVisits, Visit, Consultation as ConsultationType } from "@shared/schema";
import { cn, formatDate, formatDateTime, getStatusColor } from "@/lib/utils";

interface ConsultationProps {
  searchQuery: string;
}

export default function Consultation({ searchQuery }: ConsultationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPatient, setSelectedPatient] = useState<PatientWithVisits | undefined>();
  const [selectedVisit, setSelectedVisit] = useState<Visit | undefined>();
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [searchPatient, setSearchPatient] = useState("");

  // Fetch patients for consultation
  const { data: patients = [], isLoading: patientsLoading } = useQuery({
    queryKey: ["/api/patients", searchQuery, searchPatient],
    queryFn: async () => {
      const searchTerm = searchQuery || searchPatient;
      const url = searchTerm 
        ? `/api/patients?search=${encodeURIComponent(searchTerm)}`
        : "/api/patients";
      const response = await fetch(url);
      return response.json();
    },
  }) as { data: PatientWithVisits[]; isLoading: boolean };

  // Fetch today's visits for consultation
  const { data: todaysVisits = [] } = useQuery({
    queryKey: ["/api/visits", "today"],
    queryFn: async () => {
      const response = await fetch("/api/visits?today=true");
      return response.json();
    },
  }) as { data: Visit[] };

  // Get patients ready for consultation (in_consultation status)
  const patientsInConsultation = patients.filter(p => 
    p.currentVisit?.status === "in_consultation"
  );

  // Get waiting patients
  const waitingPatients = patients.filter(p => 
    p.currentVisit?.status === "waiting"
  );

  const handleStartConsultation = (patient: PatientWithVisits) => {
    if (patient.currentVisit) {
      setSelectedPatient(patient);
      setSelectedVisit(patient.currentVisit);
      setConsultationModalOpen(true);
    } else {
      toast({
        title: "No Active Visit",
        description: "Patient must have an active visit to start consultation",
        variant: "destructive",
      });
    }
  };

  const handleViewConsultation = (patient: PatientWithVisits) => {
    setSelectedPatient(patient);
    setSelectedVisit(patient.currentVisit);
    // TODO: Implement view consultation details
    toast({
      title: "View Consultation",
      description: `Viewing consultation for ${patient.firstName} ${patient.lastName}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Doctor Consultation</h2>
          <p className="text-sm text-gray-500 mt-1">Clinical examination and treatment planning</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          <Button 
            onClick={() => setConsultationModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Consultation
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Consultation</CardTitle>
            <Stethoscope className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{patientsInConsultation.length}</div>
            <p className="text-xs text-gray-500">Active consultations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiting</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{waitingPatients.length}</div>
            <p className="text-xs text-gray-500">Patients waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visits</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todaysVisits.length}</div>
            <p className="text-xs text-gray-500">Total today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {todaysVisits.filter(v => v.status === "completed").length}
            </div>
            <p className="text-xs text-gray-500">Consultations done</p>
          </CardContent>
        </Card>
      </div>

      {/* Patient List Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today's Patients</TabsTrigger>
          <TabsTrigger value="consultation">In Consultation</TabsTrigger>
          <TabsTrigger value="waiting">Waiting Queue</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                Today's Consultation Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsLoading ? (
                <div className="flex items-center justify-center p-8">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-500">Loading patients...</span>
                </div>
              ) : patients.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients scheduled for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patients.map((patient) => (
                    <PatientConsultationCard
                      key={patient.id}
                      patient={patient}
                      onStartConsultation={handleStartConsultation}
                      onViewConsultation={handleViewConsultation}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-blue-600" />
                Active Consultations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patientsInConsultation.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active consultations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientsInConsultation.map((patient) => (
                    <PatientConsultationCard
                      key={patient.id}
                      patient={patient}
                      onStartConsultation={handleStartConsultation}
                      onViewConsultation={handleViewConsultation}
                      isActive={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-orange-600" />
                Waiting Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitingPatients.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No patients waiting</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {waitingPatients.map((patient) => (
                    <PatientConsultationCard
                      key={patient.id}
                      patient={patient}
                      onStartConsultation={handleStartConsultation}
                      onViewConsultation={handleViewConsultation}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Consultation Form Modal */}
      {selectedPatient && selectedVisit && (
        <ConsultationForm
          open={consultationModalOpen}
          onOpenChange={setConsultationModalOpen}
          patient={selectedPatient}
          visit={selectedVisit}
        />
      )}
    </div>
  );
}

interface PatientConsultationCardProps {
  patient: PatientWithVisits;
  onStartConsultation: (patient: PatientWithVisits) => void;
  onViewConsultation: (patient: PatientWithVisits) => void;
  isActive?: boolean;
}

function PatientConsultationCard({
  patient,
  onStartConsultation,
  onViewConsultation,
  isActive = false,
}: PatientConsultationCardProps) {
  const visit = patient.currentVisit;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors",
        isActive && "border-blue-200 bg-blue-50"
      )}
    >
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <User className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-gray-900">
              {patient.firstName} {patient.lastName}
            </h3>
            {visit && (
              <Badge className={cn("text-xs", getStatusColor(visit.status))}>
                {visit.tokenNumber}
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            <span>Age: {patient.age}, {patient.gender}</span>
            {visit && (
              <span className="ml-4">Visit: {visit.visitCode}</span>
            )}
          </div>
          {visit?.chiefComplaint && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Chief Complaint:</span> {visit.chiefComplaint}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {visit?.status === "waiting" && (
          <Button
            onClick={() => onStartConsultation(patient)}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Stethoscope className="h-4 w-4 mr-2" />
            Start Consultation
          </Button>
        )}
        {visit?.status === "in_consultation" && (
          <Button
            onClick={() => onViewConsultation(patient)}
            variant="outline"
            size="sm"
          >
            <Eye className="h-4 w-4 mr-2" />
            Continue
          </Button>
        )}
        {visit?.status === "completed" && (
          <Button
            onClick={() => onViewConsultation(patient)}
            variant="outline"
            size="sm"
          >
            <FileText className="h-4 w-4 mr-2" />
            View Report
          </Button>
        )}
      </div>
    </div>
  );
}
