import React from "react";
import ConvertPanel from "./ConvertPanel";
import SidePanelLayout from "./SidePanelLayout";

export default function ConvertSidePanel({ onClose }) {
  return (
    <SidePanelLayout title="Convert" onClose={onClose}>
      <ConvertPanel />
    </SidePanelLayout>
  );
}
