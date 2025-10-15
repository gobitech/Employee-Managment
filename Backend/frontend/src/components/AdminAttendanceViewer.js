// src/components/AdminAttendanceViewer.js
import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Typography 
} from '@mui/material';

function AdminAttendanceViewer() {
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const fetchRecords = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/attendance', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setRecords(data);
            }
        };
        fetchRecords();
    }, []);

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Attendance Records
            </Typography>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Employee</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {records.map(record => (
                            <TableRow key={record._id}>
                                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                <TableCell>{record.employee ? `${record.employee.firstName} ${record.employee.lastName}` : 'N/A'}</TableCell>
                                <TableCell>{record.status}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

export default AdminAttendanceViewer;