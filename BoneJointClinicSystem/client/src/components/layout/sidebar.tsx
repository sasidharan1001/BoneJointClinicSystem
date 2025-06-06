import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { 
  UserPlus, 
  X, 
  FlaskConical, 
  Pill, 
  Dumbbell, 
  Stethoscope, 
  BarChart3,
  Bone 
} from "lucide-react";

interface SidebarProps {
  activeModule: string;
  onModuleChange: (module: string) => void;
}

const modules = [
  { id: "reception", name: "Reception", icon: UserPlus },
  { id: "diagnostics", name: "Diagnostics", icon: X },
  { id: "lab", name: "Laboratory", icon: FlaskConical },
  { id: "pharmacy", name: "Pharmacy", icon: Pill },
  { id: "physio", name: "Physio Services", icon: Dumbbell },
  { id: "consultation", name: "Doctor Consultation", icon: Stethoscope },
  { id: "reports", name: "Management Reports", icon: BarChart3 },
];

export default function Sidebar({ activeModule, onModuleChange }: SidebarProps) {
  const { data: todayStats } = useQuery({
    queryKey: ["/api/stats/today"],
  });

  return (
    <div className="w-64 bg-white shadow-lg fixed h-full z-10">
      {/* Clinic Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Bone & Joint Clinic</h1>
            <p className="text-sm text-gray-500">Chennai, India</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        <div className="px-3">
          <div className="space-y-1">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = activeModule === module.id;
              
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={cn(
                    "w-full text-left group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon 
                    className={cn(
                      "mr-3 h-5 w-5",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
                    )} 
                  />
                  {module.name}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Quick Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Today's Patients:</span>
            <span className="font-medium">{todayStats?.totalPatients || 0}</span>
          </div>
          <div className="flex justify-between">
            <span>Pending Tokens:</span>
            <span className="font-medium text-orange-600">{todayStats?.pending || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
