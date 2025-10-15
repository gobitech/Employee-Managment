// src/components/AttendanceMarker.js
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, Alert } from '@mui/material';

function AttendanceMarker() {
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleMarkAttendance = async (status) => {
        const token = localStorage.getItem('token');
        const today = new Date().toISOString().split('T')[0];

        try {
            const response = await fetch('http://localhost:5000/api/attendance/mark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ date: today, status })
            });
            const data = await response.json();
            if (response.ok) {
                setIsError(false);
                setMessage(`Attendance marked as ${status} for today.`);
            } else {
                setIsError(true);
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setIsError(true);
            setMessage('Server error.');
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Mark Today's Attendance
            </Typography>
            <Box>
                <Button onClick={() => handleMarkAttendance('Present')} variant="contained" color="success" sx={{ mr: 2 }}>
                    Present
                </Button>
                <Button onClick={() => handleMarkAttendance('Absent')} variant="contained" color="warning">
                    Absent
                </Button>
            </Box>
            {message && <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
        </Paper>
    );
}

export default AttendanceMarker;