import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const moduleNames = {
  reception: "Reception - Patient Registration",
  diagnostics: "Diagnostics - Digital X-rays & Reports",
  lab: "Laboratory - Testing & Reports",
  pharmacy: "Pharmacy - Medicine Dispensing",
  physio: "Physio Services - Treatment & Tracking",
  consultation: "Doctor Consultation - Clinical Notes",
  reports: "Management Reports - Analytics",
};

export default function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            Bone & Joint Clinic Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Today, {formattedDate}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-64 pl-10"
            />
          </div>
          {/* User Profile */}
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&w=40&h=40&fit=crop&crop=face" />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">Dr. Priya Sharma</span>
          </div>
        </div>
      </div>
    </header>
  );
}
