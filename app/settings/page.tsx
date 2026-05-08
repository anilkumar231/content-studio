"use client";

import { ProviderSettings } from "@/components/providers/ProviderSettings";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your pipeline providers and API integrations.
        </p>
      </div>

      <ProviderSettings />
    </div>
  );
}
