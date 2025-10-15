// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import EmployeeList from './EmployeeList';
import LeaveForm from './LeaveForm';
import MyLeaveRequests from './MyLeaveRequests';
import AdminLeaveManager from './AdminLeaveManager';
import AttendanceMarker from './AttendanceMarker';
import AdminAttendanceViewer from './AdminAttendanceViewer';
import PayrollManager from './PayrollManager';

function Dashboard() {
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                setUserRole(decodedToken.role);
            } catch (error) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!userRole) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1000px', margin: 'auto' }}>
            <button onClick={handleLogout} style={{ float: 'right', padding: '8px 15px' }}>Logout</button>
            <h1>Dashboard</h1>
            <p>Welcome! Your role is: <strong>{userRole}</strong></p>
            <hr style={{ margin: '20px 0' }} />

            {userRole === 'Admin' ? (
                <div>
                    <PayrollManager />
                    <hr style={{ margin: '40px 0' }} />
                    <AdminLeaveManager />
                    <hr style={{ margin: '40px 0' }} />
                    <AdminAttendanceViewer />
                    <hr style={{ margin: '40px 0' }} />
                    <EmployeeList />
                </div>
            ) : (
                <div>
                    <AttendanceMarker />
                    <hr style={{ margin: '40px 0' }} />
                    <LeaveForm />
                    <MyLeaveRequests />
                </div>
            )}
        </div>
    );
}

export default Dashboard;