import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Edit, Trash2, CreditCard } from "lucide-react";
import { cn, getInitials, getStatusColor, getStatusText, formatDate } from "@/lib/utils";
import type { Patient, Visit } from "@shared/schema";

interface PatientTableRow extends Patient {
  visits: Visit[];
  currentVisit?: Visit;
}

interface DataTableProps {
  data: PatientTableRow[];
  onView: (patient: PatientTableRow) => void;
  onEdit: (patient: PatientTableRow) => void;
  onDelete: (patient: PatientTableRow) => void;
  onBilling: (patient: PatientTableRow) => void;
}

export default function DataTable({ data, onView, onEdit, onDelete, onBilling }: DataTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Patient Records</h3>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Patient Details</TableHead>
              <TableHead>Visit Code</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Visit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No patients found
                </TableCell>
              </TableRow>
            ) : (
              data.map((patient) => (
                <TableRow key={patient.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 bg-blue-100">
                        <AvatarFallback className="text-blue-600 font-medium">
                          {getInitials(patient.firstName, patient.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{patient.phone}</div>
                        <div className="text-xs text-gray-400">
                          Age: {patient.age}, {patient.gender}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-gray-900">
                      {patient.currentVisit?.visitCode || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {patient.currentVisit?.tokenNumber ? (
                      <Badge 
                        className={cn(
                          "text-xs",
                          patient.currentVisit.status === "in_consultation"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        )}
                      >
                        {patient.currentVisit.tokenNumber}
                      </Badge>
                    ) : (
                      <span className="text-gray-400 text-sm">No token</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.currentVisit ? (
                      <Badge className={cn("text-xs", getStatusColor(patient.currentVisit.status))}>
                        {getStatusText(patient.currentVisit.status)}
                      </Badge>
                    ) : (
                      <Badge className="text-xs bg-gray-100 text-gray-600">No visit</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {patient.visits.length > 0 ? (
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatDate(patient.visits[0].visitDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {patient.visits[0].chiefComplaint || "General consultation"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No visits</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onView(patient)}
                        className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(patient)}
                        className="h-8 w-8 p-0 text-gray-600 hover:bg-gray-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onBilling(patient)}
                        className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(patient)}
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing 1 to {data.length} of {data.length} results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
