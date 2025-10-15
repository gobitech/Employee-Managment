// src/components/PayrollManager.js
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
    Paper, Typography, Box, FormControl, InputLabel,
    Select, MenuItem, Button, TextField, Alert
} from '@mui/material';

function PayrollManager() {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [payrollResult, setPayrollResult] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchEmployees = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/employees', {
                headers: { 'x-auth-token': token }
            });
            const data = await response.json();
            if (response.ok) setEmployees(data);
        };
        fetchEmployees();
    }, []);

    const handleCalculate = async (e) => {
        e.preventDefault();
        setMessage('Calculating...');
        setPayrollResult(null);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/payroll/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify({ employeeId: selectedEmployee, month: parseInt(month) + 1, year })
            });
            const data = await response.json();
            if (response.ok) {
                setPayrollResult(data);
                setMessage('');
            } else {
                setMessage(`Error: ${data.message}`);
                setPayrollResult(null);
            }
        } catch (error) {
            setMessage('Server error.');
            setPayrollResult(null);
        }
    };

    const generatePayslip = () => {
        if (!payrollResult) return;

        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Payslip', 14, 22);
        doc.setFontSize(12);
        doc.text(`Employee: ${payrollResult.employeeName}`, 14, 40);
        doc.text(`Period: ${payrollResult.month}/${payrollResult.year}`, 14, 48);

        doc.autoTable({
            startY: 60,
            head: [['Description', 'Amount']],
            body: [
                ['Base Salary', `$${Number(payrollResult.baseSalary).toFixed(2)}`],
                ['Attendance', `${payrollResult.presentDays} / ${payrollResult.totalDaysInMonth} days`],
                ['Deductions (based on absence)', `-$${(payrollResult.baseSalary - payrollResult.calculatedSalary).toFixed(2)}`],
                [{ content: 'Net Salary Payable', styles: { fontStyle: 'bold' } }, { content: `$${payrollResult.calculatedSalary}`, styles: { fontStyle: 'bold' } }]
            ],
        });

        doc.save(`Payslip-${payrollResult.employeeName.replace(' ', '_')}-${payrollResult.month}-${payrollResult.year}.pdf`);
    };

    return (
        <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h5" component="h3" gutterBottom>
                Payroll Calculator
            </Typography>
            <Box component="form" onSubmit={handleCalculate} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 200 }} required>
                    <InputLabel id="employee-select-label">Employee</InputLabel>
                    <Select
                        labelId="employee-select-label"
                        value={selectedEmployee}
                        label="Employee"
                        onChange={e => setSelectedEmployee(e.target.value)}
                    >
                        {employees.map(emp => (
                            <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl sx={{ minWidth: 150 }} required>
                    <InputLabel id="month-select-label">Month</InputLabel>
                    <Select labelId="month-select-label" value={month} label="Month" onChange={e => setMonth(e.target.value)}>
                        {[...Array(12).keys()].map(m => <MenuItem key={m} value={m}>{new Date(0, m).toLocaleString('default', { month: 'long' })}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField label="Year" type="number" value={year} onChange={e => setYear(e.target.value)} required sx={{ width: 100 }}/>
                <Button type="submit" variant="contained">Calculate Salary</Button>
            </Box>

            {message && <Alert severity={payrollResult ? "info" : "error"} sx={{ mt: 2 }}>{message}</Alert>}

            {payrollResult && (
                <Box sx={{ border: '1px solid green', p: 2, mt: 2, borderRadius: 1 }}>
                    <Typography variant="h6">Payroll Result</Typography>
                    <Typography><strong>Employee:</strong> {payrollResult.employeeName}</Typography>
                    <Typography><strong>Period:</strong> {payrollResult.month}/{payrollResult.year}</Typography>
                    <Typography><strong>Attendance:</strong> {payrollResult.presentDays} / {payrollResult.totalDaysInMonth} days</Typography>
                    <Typography variant="h6" sx={{ mt: 1 }}>
                        <strong>Calculated Salary: ${payrollResult.calculatedSalary}</strong>
                    </Typography>
                    
                    {/* --- THIS BUTTON WILL NOW APPEAR --- */}
                    <Button onClick={generatePayslip} variant="outlined" sx={{ mt: 2 }}>
                        Download Payslip 📥
                    </Button>
                </Box>
            )}
        </Paper>
    );
}

export default PayrollManager;