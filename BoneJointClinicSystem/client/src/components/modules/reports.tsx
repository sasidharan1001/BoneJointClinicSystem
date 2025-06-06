import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ReportsProps {
  searchQuery: string;
}

export default function Reports({ searchQuery }: ReportsProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <CardTitle className="text-xl mb-2">Management Reports Module</CardTitle>
        <p className="text-gray-500">
          Daily, weekly, monthly, and yearly performance reports will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
