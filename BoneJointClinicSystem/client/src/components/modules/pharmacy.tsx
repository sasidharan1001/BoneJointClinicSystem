import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pill } from "lucide-react";

interface PharmacyProps {
  searchQuery: string;
}

export default function Pharmacy({ searchQuery }: PharmacyProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Pill className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <CardTitle className="text-xl mb-2">Pharmacy Module</CardTitle>
        <p className="text-gray-500">
          Prescription management, medicine dispensing, and billing will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
