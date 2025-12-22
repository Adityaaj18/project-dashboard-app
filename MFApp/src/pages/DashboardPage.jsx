import React, { lazy, Suspense } from "react";
import { useData } from "../context/DataContext.jsx";

const DashboardApp = lazy(() => import("DashboardAppHost/DashboardApp"));

const DashboardPage = () => {
    const dataContext = useData();

    return (
        <div className="page-container">
            <Suspense fallback={<div className="loading">Loading Dashboard...</div>}>
                <DashboardApp dataContext={dataContext} />
            </Suspense>
        </div>
    );
}

export default DashboardPage;
