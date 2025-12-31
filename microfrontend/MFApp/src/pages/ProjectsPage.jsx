import React, { lazy, Suspense } from "react";
import { useData } from "../context/DataContext.jsx";

const ProjectApp = lazy(() => import("ProjectAppHost/ProjectApp"));

const ProjectsPage = () => {
    const dataContext = useData();

    return (
        <div className="page-container">
            <Suspense fallback={<div className="loading">Loading Projects...</div>}>
                <ProjectApp dataContext={dataContext} />
            </Suspense>
        </div>
    );
}

export default ProjectsPage;
