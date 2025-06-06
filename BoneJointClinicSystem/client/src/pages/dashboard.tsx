import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Reception from "@/components/modules/reception";
import Diagnostics from "@/components/modules/diagnostics";
import Lab from "@/components/modules/lab";
import Pharmacy from "@/components/modules/pharmacy";
import Physio from "@/components/modules/physio";
import Consultation from "@/components/modules/consultation";
import Reports from "@/components/modules/reports";

type Module = "reception" | "diagnostics" | "lab" | "pharmacy" | "physio" | "consultation" | "reports";

export default function Dashboard() {
  const [activeModule, setActiveModule] = useState<Module>("reception");
  const [searchQuery, setSearchQuery] = useState("");

  const moduleComponents = {
    reception: Reception,
    diagnostics: Diagnostics,
    lab: Lab,
    pharmacy: Pharmacy,
    physio: Physio,
    consultation: Consultation,
    reports: Reports,
  };

  const ActiveComponent = moduleComponents[activeModule];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeModule={activeModule} onModuleChange={setActiveModule} />
      <div className="flex-1 ml-64">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="p-6">
          <ActiveComponent searchQuery={searchQuery} />
        </main>
      </div>
    </div>
  );
}
