import React, { lazy, Suspense } from "react";

const Settings = lazy(() => import("AuthAppHost/Settings"));

const SettingsPage = () => {
    return (
        <div className="page-container">
            <Suspense fallback={<div className="loading">Loading Settings...</div>}>
                <Settings />
            </Suspense>
        </div>
    );
}

export default SettingsPage;
