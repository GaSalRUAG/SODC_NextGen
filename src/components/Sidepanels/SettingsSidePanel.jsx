import React from "react";
import SettingsPanel from "./SettingsPanel";
import SidePanelLayout from "./SidePanelLayout";

export default function SettingsSidePanel({ onClose }) {
  return (
    <SidePanelLayout title="Settings" onClose={onClose}>
      <SettingsPanel />
    </SidePanelLayout>
  );
}
