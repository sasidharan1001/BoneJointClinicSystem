import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import DataTable from "@/components/ui/data-table";
import PatientFormModal from "@/components/modals/patient-form-modal";
import PaymentModal from "@/components/modals/payment-modal";
import {
  UserPlus,
  TicketCheck,
  CreditCard,
  Calendar,
  Clock,
  Zap,
  Eye,
  RefreshCw,
  Download,
  AlertCircle,
  Video,
  Ambulance,
} from "lucide-react";
import type { Patient, PatientWithVisits } from "@shared/schema";

interface ReceptionProps {
  searchQuery: string;
}

export default function Reception({ searchQuery }: ReceptionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch patients
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients", searchQuery],
    queryFn: async () => {
      const url = searchQuery 
        ? `/api/patients?search=${encodeURIComponent(searchQuery)}`
        : "/api/patients";
      const response = await fetch(url);
      return response.json();
    },
  }) as { data: PatientWithVisits[]; isLoading: boolean };

  // Fetch today's stats
  const { data: todayStats } = useQuery({
    queryKey: ["/api/stats/today"],
  }) as { data: { totalPatients: number; completed: number; inProgress: number; pending: number } | undefined };

  // Generate token mutation
  const generateTokenMutation = useMutation({
    mutationFn: async (patientId: number) => {
      const response = await apiRequest("POST", "/api/visits", {
        patientId,
        status: "waiting",
        chiefComplaint: "Regular consultation",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/today"] });
      toast({
        title: "Success",
        description: "Token generated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate token",
        variant: "destructive",
      });
    },
  });

  const handleNewPatient = () => {
    setSelectedPatient(undefined);
    setModalMode("create");
    setPatientModalOpen(true);
  };

  const handleEditPatient = (patient: PatientWithVisits) => {
    setSelectedPatient(patient);
    setModalMode("edit");
    setPatientModalOpen(true);
  };

  const handleViewPatient = (patient: PatientWithVisits) => {
    // TODO: Implement patient details view
    toast({
      title: "View Patient",
      description: `Viewing details for ${patient.firstName} ${patient.lastName}`,
    });
  };

  const handleDeletePatient = (patient: PatientWithVisits) => {
    // TODO: Implement patient deletion with confirmation
    toast({
      title: "Delete Patient",
      description: "Delete functionality to be implemented",
    });
  };

  const handleBilling = (patient: PatientWithVisits) => {
    setSelectedPatient(patient);
    setPaymentModalOpen(true);
  };

  const handleGenerateToken = () => {
    // For demo, generate token for first patient
    if (patients.length > 0) {
      generateTokenMutation.mutate(patients[0].id);
    } else {
      toast({
        title: "No Patients",
        description: "Please register a patient first",
        variant: "destructive",
      });
    }
  };

  // Current token info (mock data for display)
  const currentToken = {
    number: "T-019",
    patient: patients.length > 0 ? `${patients[0]?.firstName} ${patients[0]?.lastName}` : "No patient",
    visitCode: patients.length > 0 ? "V240315019" : "N/A",
    time: "2:45 PM",
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-3">
          <Button onClick={handleNewPatient} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            New Patient Registration
          </Button>
          <Button 
            onClick={handleGenerateToken}
            className="bg-green-600 hover:bg-green-700"
            disabled={generateTokenMutation.isPending}
          >
            <TicketCheck className="h-4 w-4 mr-2" />
            {generateTokenMutation.isPending ? "Generating..." : "Generate Token"}
          </Button>
          <Button variant="outline" className="bg-gray-600 text-white hover:bg-gray-700">
            <CreditCard className="h-4 w-4 mr-2" />
            Payment & Billing
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filter:</span>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients</SelectItem>
              <SelectItem value="today">Today's Appointments</SelectItem>
              <SelectItem value="pending">Pending Consultations</SelectItem>
              <SelectItem value="completed">Completed Visits</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Today's Overview</CardTitle>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString("en-IN", { 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Patients</span>
              <span className="font-semibold">{todayStats?.totalPatients || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{todayStats?.completed || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Progress</span>
              <span className="font-semibold text-orange-600">{todayStats?.inProgress || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Current Token */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg font-semibold">Current Token</CardTitle>
              <p className="text-sm text-gray-500">Now Serving</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TicketCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{currentToken.number}</div>
            <div className="text-sm text-gray-600 mt-1">{currentToken.patient} - {currentToken.visitCode}</div>
            <div className="text-xs text-gray-500">Called at {currentToken.time}</div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              <span className="text-sm">View Waiting List</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <Ambulance className="h-4 w-4 mr-2 text-red-500" />
              <span className="text-sm">Emergency Registration</span>
            </Button>
            <Button variant="ghost" className="w-full justify-start p-3 h-auto">
              <Video className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm">Telemedicine Booking</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Patient Data Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading patients...</p>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          data={patients}
          onView={handleViewPatient}
          onEdit={handleEditPatient}
          onDelete={handleDeletePatient}
          onBilling={handleBilling}
        />
      )}

      {/* Modals */}
      <PatientFormModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
        patient={selectedPatient}
        mode={modalMode}
      />

      {selectedPatient && (
        <PaymentModal
          open={paymentModalOpen}
          onOpenChange={setPaymentModalOpen}
          patient={selectedPatient as PatientWithVisits}
          visit={(selectedPatient as PatientWithVisits)?.currentVisit}
        />
      )}
    </div>
  );
}
