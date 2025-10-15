// src/components/EmployeeList.js
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Paper, TextField, Alert, Grid } from '@mui/material';

function EmployeeList() {
    const [employees, setEmployees] = useState([]);
    const [message, setMessage] = useState('Loading...');
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [predictionResult, setPredictionResult] = useState(null);

    const fetchEmployees = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/employees', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(data);
                setMessage('');
            } else {
                setMessage(`Error: ${data.message}`);
            }
        } catch (error) {
            setMessage('Could not connect to the server.');
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (employeeId) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': token }
        });
        fetchEmployees();
    };

    const handleUpdate = async (employeeId) => {
        const token = localStorage.getItem('token');
        const updatedData = {
            ...editingEmployee,
            baseSalary: Number(editingEmployee.baseSalary) || 0,
            tax: Number(editingEmployee.tax) || 0,
            providentFund: Number(editingEmployee.providentFund) || 0,
        };

        await fetch(`http://localhost:5000/api/employees/${employeeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
            body: JSON.stringify(updatedData)
        });
        setEditingEmployee(null);
        fetchEmployees();
    };

    const handlePredictHike = async (employee) => {
        const token = localStorage.getItem('token');
        setPredictionResult(`Predicting for ${employee.firstName}...`);
        try {
            const response = await fetch(`http://localhost:5000/api/predict/salary-hike`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ employeeId: employee._id, performanceScore: 92, attendancePercentage: 98 })
            });
            const data = await response.json();
            if (response.ok) {
                const resultMessage = `AI Prediction for ${employee.firstName} ${employee.lastName}: A salary hike of ${data.predictedHikePercentage}% is recommended.`;
                setPredictionResult(resultMessage);
            } else {
                setPredictionResult(`Error: ${data.message}`);
            }
        } catch (error) {
            setPredictionResult('Could not connect to the server for prediction.');
        }
    };
    
    const handleEditChange = (e) => {
        setEditingEmployee({ ...editingEmployee, [e.target.name]: e.target.value });
    };

    const renderEmployeeCard = (employee) => {
        const isEditing = editingEmployee && editingEmployee._id === employee._id;
        const netSalary = (employee.baseSalary || 0) - (employee.tax || 0) - (employee.providentFund || 0);

        return (
            <Card key={employee._id} sx={{ mb: 2 }}>
                <CardContent>
                    {isEditing ? (
                        <Box component="form">
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}><TextField size="small" label="First Name" name="firstName" defaultValue={employee.firstName} onChange={handleEditChange} fullWidth /></Grid>
                                <Grid item xs={12} sm={6}><TextField size="small" label="Last Name" name="lastName" defaultValue={employee.lastName} onChange={handleEditChange} fullWidth /></Grid>
                                <Grid item xs={12}><TextField size="small" label="Job Title" name="jobTitle" defaultValue={employee.jobTitle} onChange={handleEditChange} fullWidth /></Grid>
                                <Grid item xs={12} sm={4}><TextField size="small" label="Base Salary ($)" name="baseSalary" type="number" defaultValue={employee.baseSalary} onChange={handleEditChange} fullWidth /></Grid>
                                <Grid item xs={12} sm={4}><TextField size="small" label="Tax ($)" name="tax" type="number" defaultValue={employee.tax} onChange={handleEditChange} fullWidth /></Grid>
                                <Grid item xs={12} sm={4}><TextField size="small" label="PF ($)" name="providentFund" type="number" defaultValue={employee.providentFund} onChange={handleEditChange} fullWidth /></Grid>
                            </Grid>
                        </Box>
                    ) : (
                        <>
                            <Typography variant="h6">{employee.firstName} {employee.lastName}</Typography>
                            <Typography color="text.secondary">Title: {employee.jobTitle}</Typography>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2">Base Salary: ${employee.baseSalary?.toFixed(2) || '0.00'}</Typography>
                                <Typography variant="body2">Tax: ${employee.tax?.toFixed(2) || '0.00'}</Typography>
                                <Typography variant="body2">PF: ${employee.providentFund?.toFixed(2) || '0.00'}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 1 }}>Net Salary: ${netSalary.toFixed(2)}</Typography>
                            </Box>
                        </>
                    )}
                </CardContent>
                <CardActions>
                    {isEditing ? (
                        <>
                            <Button size="small" variant="contained" color="success" onClick={() => handleUpdate(employee._id)}>Save</Button>
                            <Button size="small" variant="outlined" onClick={() => setEditingEmployee(null)}>Cancel</Button>
                        </>
                    ) : (
                        <>
                            <Button size="small" onClick={() => setEditingEmployee({ ...employee })}>Edit Details</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(employee._id)}>Delete</Button>
                            <Button size="small" variant="outlined" color="info" onClick={() => handlePredictHike(employee)}>Predict Hike</Button>
                        </>
                    )}
                </CardActions>
            </Card>
        );
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Employee Management
            </Typography>
            {message && <Typography>{message}</Typography>}
            {predictionResult && <Alert severity="info" sx={{ mb: 2 }}>{predictionResult}</Alert>}
            <Box>
                {!message && employees.map(employee => renderEmployeeCard(employee))}
            </Box>
        </Paper>
    );
}

export default EmployeeList;