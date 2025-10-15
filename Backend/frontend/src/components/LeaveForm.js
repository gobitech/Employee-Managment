// src/components/LeaveForm.js
import React, { useState } from 'react';
import { Box, Button, Typography, Paper, TextField, Alert } from '@mui/material';

function LeaveForm({ onLeaveApplied }) {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/leave/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ startDate, endDate, reason })
            });
            const data = await response.json();
            if (response.ok) {
                setIsError(false);
                setMessage('Leave request submitted successfully!');
                setStartDate('');
                setEndDate('');
                setReason('');
                if (onLeaveApplied) onLeaveApplied();
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
                Apply for Leave
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField type="date" label="Start Date" value={startDate} onChange={e => setStartDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
                <TextField type="date" label="End Date" value={endDate} onChange={e => setEndDate(e.target.value)} required InputLabelProps={{ shrink: true }} />
                <TextField label="Reason" value={reason} onChange={e => setReason(e.target.value)} required />
                <Button type="submit" variant="contained">Submit Request</Button>
            </Box>
            {message && <Alert severity={isError ? 'error' : 'success'} sx={{ mt: 2 }}>{message}</Alert>}
        </Paper>
    );
}

export default LeaveForm;