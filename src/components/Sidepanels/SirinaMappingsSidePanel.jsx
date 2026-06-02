import React from "react";
import SirinaMappingsPanel from "./SirinaMappingsPanel";
import SidePanelLayout from "./SidePanelLayout";

export default function SirinaMappingsSidePanel({ onClose }) {
  return (
    <SidePanelLayout title="SIRINA MAPPINGS" onClose={onClose}>
      <SirinaMappingsPanel />
    </SidePanelLayout>
  );
}
