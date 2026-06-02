import React, { forwardRef, useImperativeHandle, useRef } from "react";
import ObstaclesPanel from "./ObstaclesPanel";
import SidePanelLayout from "./SidePanelLayout";

const ObstaclesSidePanel = forwardRef(function ObstaclesSidePanel(
  { onClose, obstacles, onImportKmzFile, onImportAixmFile, onClearAll },
  ref,
) {
  const obstaclesPanelRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setErrorMessage(message) {
      obstaclesPanelRef.current?.setErrorMessage(message);
    },
  }));

  return (
    <SidePanelLayout title="Obstacles" onClose={onClose}>
      <ObstaclesPanel
        ref={obstaclesPanelRef}
        obstacles={obstacles}
        onImportKmzFile={onImportKmzFile}
        onImportAixmFile={onImportAixmFile}
        onClearAll={onClearAll}
      />
    </SidePanelLayout>
  );
});

export default ObstaclesSidePanel;
