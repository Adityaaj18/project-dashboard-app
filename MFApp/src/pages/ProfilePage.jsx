import React, { lazy, Suspense } from "react";

const Profile = lazy(() => import("AuthAppHost/Profile"));

const ProfilePage = () => {
    return (
        <div className="page-container">
            <Suspense fallback={<div className="loading">Loading Profile...</div>}>
                <Profile />
            </Suspense>
        </div>
    );
}

export default ProfilePage;
