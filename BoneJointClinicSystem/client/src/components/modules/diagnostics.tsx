import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";

interface DiagnosticsProps {
  searchQuery: string;
}

export default function Diagnostics({ searchQuery }: DiagnosticsProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <X className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <CardTitle className="text-xl mb-2">Diagnostics Module</CardTitle>
        <p className="text-gray-500">
          Digital X-rays, reports, and diagnostic management will be available here.
        </p>
      </CardContent>
    </Card>
  );
}
