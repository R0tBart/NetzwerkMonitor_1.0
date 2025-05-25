// src/pages/devices.tsx

import { useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import DeviceTable from "@/components/dashboard/device-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import type { Device } from "@shared/schema";

export default function Devices() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-card shadow-sm border-b border-slate-200 dark:border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-foreground">
                Geräteverwaltung
              </h2>
              <p className="text-sm text-slate-600 dark:text-muted-foreground mt-1">
                Verwalten Sie Ihre Netzwerkgeräte
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <DeviceTable />
        </main>
      </div>
    </div>
  );
}