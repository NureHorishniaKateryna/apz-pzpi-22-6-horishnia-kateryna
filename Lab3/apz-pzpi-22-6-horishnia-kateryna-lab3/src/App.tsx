import DevicesPage from './pages/DevicesPage'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import DeviceDetailPage from "./pages/DeviceInfoPage.tsx";
import DeviceSchedulePage from "./pages/DeviceSchedulePage.tsx";
import DeviceAnalyticsPage from "./pages/DeviceAnalyticsPage.tsx";
import AdminUsersPage from "./pages/AdminUsersPage.tsx";
import AdminUserDetailPage from "./pages/AdminUserDetailPage.tsx";

function App() {
    const default_route = <Navigate to="/devices" replace/>;

    // TODO: admin devices page
    // TODO: admin reports page
    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={default_route}/>
                <Route index path="/" element={default_route}/>
                <Route path="/devices" element={<DevicesPage/>}/>
                <Route path="/devices/:deviceId" element={<DeviceDetailPage/>}/>
                <Route path="/devices/:deviceId/schedule" element={<DeviceSchedulePage/>}/>
                <Route path="/devices/:deviceId/analytics" element={<DeviceAnalyticsPage/>}/>
                <Route path="/admin/users" element={<AdminUsersPage/>}/>
                <Route path="/admin/users/:userId" element={<AdminUserDetailPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
