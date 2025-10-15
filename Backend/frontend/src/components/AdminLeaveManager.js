// src/components/AdminLeaveManager.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Paper } from '@mui/material';

function AdminLeaveManager() {
    const [leaveRequests, setLeaveRequests] = useState([]);

    const fetchLeaveRequests = async () => {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/leave', {
            headers: { 'x-auth-token': token }
        });
        const data = await response.json();
        if (response.ok) {
            setLeaveRequests(data);
        }
    };

    useEffect(() => {
        fetchLeaveRequests();
    }, []);

    const handleUpdateRequest = async (id, status) => {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/leave/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify({ status })
        });
        fetchLeaveRequests(); // Refresh list after updating
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Manage Leave Requests
            </Typography>
            <Box>
                {leaveRequests.map(req => (
                    <Card key={req._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {req.employee ? `${req.employee.firstName} ${req.employee.lastName}` : 'Unknown Employee'}
                            </Typography>
                            <Typography color="text.secondary">
                                Dates: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                Reason: {req.reason}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                Status: {req.status}
                            </Typography>
                        </CardContent>
                        {req.status === 'Pending' && (
                            <CardActions>
                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateRequest(req._id, 'Approved')}>Approve</Button>
                                <Button size="small" variant="contained" color="error" onClick={() => handleUpdateRequest(req._id, 'Rejected')}>Reject</Button>
                            </CardActions>
                        )}
                    </Card>
                ))}
            </Box>
        </Paper>
    );
}

export default AdminLeaveManager;