import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dumbbell } from "lucide-react";

interface PhysioProps {
  searchQuery: string;
}

export default function Physio({ searchQuery }: PhysioProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <CardTitle className="text-xl mb-2">Physio Services Module</CardTitle>
        <p className="text-gray-500">
          Physiotherapy scheduling, treatment tracking, and progress monitoring will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
