import DevicesPage from './pages/DevicesPage'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import DeviceDetailPage from "./pages/DeviceInfoPage.tsx";
import DeviceSchedulePage from "./pages/DeviceSchedulePage.tsx";
import DeviceAnalyticsPage from "./pages/DeviceAnalyticsPage.tsx";
import AdminUsersPage from "./pages/AdminUsersPage.tsx";
import AdminUserDetailPage from "./pages/AdminUserDetailPage.tsx";
import AdminDevicesPage from "./pages/AdminDevicesPage.tsx";
import AdminDeviceDetailPage from "./pages/AdminDeviceDetailPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import AppLayout from "./pages/AppLayout.tsx";
import AdminBackupsPage from './pages/AdminBackupsPage.tsx';

function App() {
    const default_route = <Navigate to="/login" replace/>;

    return (
        <BrowserRouter>
            <Routes>
                <Route index path="/" element={default_route}/>
                <Route
                    path="*"
                    element={
                        <AppLayout>
                            <Routes>
                                <Route path="*" element={default_route}/>

                                <Route path="/devices" element={<DevicesPage/>}/>
                                <Route path="/devices/:deviceId" element={<DeviceDetailPage/>}/>
                                <Route path="/devices/:deviceId/schedule" element={<DeviceSchedulePage/>}/>
                                <Route path="/devices/:deviceId/analytics" element={<DeviceAnalyticsPage/>}/>
                                <Route path="/admin/users" element={<AdminUsersPage/>}/>
                                <Route path="/admin/users/:userId" element={<AdminUserDetailPage/>}/>
                                <Route path="/admin/devices" element={<AdminDevicesPage/>}/>
                                <Route path="/admin/devices/:deviceId" element={<AdminDeviceDetailPage/>}/>
                                <Route path="/admin/backups" element={<AdminBackupsPage/>}/>

                            </Routes>
                        </AppLayout>
                    }
                />
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
