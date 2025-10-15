// src/components/MyLeaveRequests.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, Chip } from '@mui/material';

function MyLeaveRequests() {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        const fetchRequests = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/leave/my-requests', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setRequests(data);
            }
        };
        fetchRequests();
    }, []);

    const getStatusColor = (status) => {
        if (status === 'Approved') return 'success';
        if (status === 'Rejected') return 'error';
        return 'default';
    }

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                My Leave Requests
            </Typography>
            {requests.length === 0 ? (
                <Typography>You have not submitted any leave requests.</Typography>
            ) : (
                requests.map(req => (
                    <Card key={req._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography color="text.secondary">
                                Dates: {new Date(req.startDate).toLocaleDateString()} to {new Date(req.endDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body2" sx={{ my: 1 }}>
                                Reason: {req.reason}
                            </Typography>
                            <Chip label={req.status} color={getStatusColor(req.status)} size="small" />
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    );
}

export default MyLeaveRequests;