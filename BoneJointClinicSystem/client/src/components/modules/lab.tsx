import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

interface LabProps {
  searchQuery: string;
}

export default function Lab({ searchQuery }: LabProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FlaskConical className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <CardTitle className="text-xl mb-2">Laboratory Module</CardTitle>
        <p className="text-gray-500">
          Patient testing, digital reports, and lab management will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
