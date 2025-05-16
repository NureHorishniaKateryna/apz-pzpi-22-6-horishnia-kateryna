import DevicesPage from './pages/DevicesPage'
import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import DeviceDetailPage from "./pages/DeviceInfoPage.tsx";

function App() {
    const default_route = <Navigate to="/devices" replace/>;

    return (
        <BrowserRouter>
            <Routes>
                <Route path="*" element={default_route}/>
                <Route index path="/" element={default_route}/>
                <Route path="/devices" element={<DevicesPage/>}/>
                <Route path="/devices/:deviceId" element={<DeviceDetailPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App;
