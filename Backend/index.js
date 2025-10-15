// backend/index.js

// ======================================================
// 1. IMPORTS & INITIAL SETUP
// ======================================================
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================================================
// 2. MIDDLEWARE
// ======================================================
app.use(cors());
app.use(express.json());

// ======================================================
// 3. DATABASE CONNECTION
// ======================================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ======================================================
// 4. DATABASE SCHEMAS (MODELS)
// ======================================================

// --- USER SCHEMA ---
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'Admin'], default: 'Employee' }
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

// --- EMPLOYEE SCHEMA ---
const EmployeeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  department: { type: String, required: true },
  baseSalary: { type: Number, required: true, default: 0 },
  tax: { type: Number, default: 0 },
  providentFund: { type: Number, default: 0 }
}, { timestamps: true });
const Employee = mongoose.model('Employee', EmployeeSchema);

// --- ATTENDANCE SCHEMA ---
const AttendanceSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Leave'], required: true }
}, { timestamps: true });
const Attendance = mongoose.model('Attendance', AttendanceSchema);

// --- LEAVE SCHEMA ---
const LeaveSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });
const Leave = mongoose.model('Leave', LeaveSchema);

// ======================================================
// 5. AUTHENTICATION MIDDLEWARE (MUST BE DEFINED FIRST)
// ======================================================
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid.' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// ======================================================
// 6. API ROUTES (USE THE MIDDLEWARE AFTER IT'S DEFINED)
// ======================================================

// -------------------- AUTH ROUTES --------------------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    if (!firstName || !lastName || !email || !password)
      return res.status(400).json({ message: "Please enter all required fields." });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User with this email already exists." });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    const newEmployee = new Employee({
      user: newUser._id,
      firstName,
      lastName,
      jobTitle: 'Not Assigned',
      department: 'Not Assigned',
      baseSalary: 0
    });
    await newEmployee.save();

    res.status(201).json({ message: "User and Employee registered successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials." });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- EMPLOYEE ROUTES (Admin) --------------------
app.post('/api/employees', [auth, adminAuth], async (req, res) => {
  try {
    const { userId, firstName, lastName, jobTitle, department, baseSalary } = req.body;
    const newEmployee = new Employee({ user: userId, firstName, lastName, jobTitle, department, baseSalary });
    await newEmployee.save();
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees', [auth, adminAuth], async (req, res) => {
  try {
    const employees = await Employee.find().populate('user', 'email role');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/employees/:id', [auth, adminAuth], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('user', 'email role');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/employees/:id', [auth, adminAuth], async (req, res) => {
  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('user', 'email role');
    if (!updatedEmployee) return res.status(404).json({ message: 'Employee not found' });
    res.json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/employees/:id', [auth, adminAuth], async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await User.findByIdAndDelete(employee.user);
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: 'Employee and associated user deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- ATTENDANCE ROUTES --------------------
app.post('/api/attendance/mark', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found." });

    const { date, status } = req.body;
    const startOfDay = new Date(date); startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date); endOfDay.setHours(23,59,59,999);

    const query = { employee: employee._id, date: { $gte: startOfDay, $lte: endOfDay } };
    const update = { employee: employee._id, date: startOfDay, status };
    const options = { upsert: true, new: true };

    const attendanceRecord = await Attendance.findOneAndUpdate(query, update, options);
    res.status(200).json({ message: 'Attendance updated successfully', record: attendanceRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/attendance', [auth, adminAuth], async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .populate({ path: 'employee', select: 'firstName lastName' })
      .sort({ date: -1 });
    res.json(attendanceRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- LEAVE ROUTES --------------------
app.post('/api/leave/apply', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found." });

    const { startDate, endDate, reason } = req.body;
    const newLeave = new Leave({ employee: employee._id, startDate, endDate, reason });
    await newLeave.save();
    res.status(201).json(newLeave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/leave/:id/status', [auth, adminAuth], async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!leave) return res.status(404).json({ message: "Leave request not found." });
    res.json(leave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leave', [auth, adminAuth], async (req, res) => {
  try {
    const leaveRequests = await Leave.find()
      .populate({ path: 'employee', populate: { path: 'user', select: 'email' } })
      .sort({ createdAt: -1 });
    res.json(leaveRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/leave/my-requests', auth, async (req, res) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) return res.status(404).json({ message: "Employee profile not found." });

    const myRequests = await Leave.find({ employee: employee._id }).sort({ createdAt: -1 });
    res.json(myRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------- PAYROLL & REPORTING --------------------
app.post('/api/payroll/process', [auth, adminAuth], async (req, res) => {
  try {
    const { employeeId, month, year } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const presentDays = await Attendance.countDocuments({
      employee: employeeId,
      status: 'Present',
      date: { $gte: startDate, $lte: endDate }
    });

    const totalDaysInMonth = endDate.getDate();
    const calculatedSalary = (employee.baseSalary / totalDaysInMonth) * presentDays;

    res.json({
      employeeName: `${employee.firstName} ${employee.lastName}`,
      month,
      year,
      baseSalary: employee.baseSalary,
      presentDays,
      totalDaysInMonth,
      calculatedSalary: calculatedSalary.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/payslip/:employeeId', auth, (req, res) => {
  res.json({ message: `Generating payslip for employee ${req.params.employeeId}` });
});

// -------------------- AI PREDICTION ROUTE --------------------
app.post('/api/predict/salary-hike', [auth, adminAuth], (req, res) => {
  const { performanceScore, attendancePercentage } = req.body;
  let predictedHikePercentage = 5.0;
  if (performanceScore > 90 && attendancePercentage > 95) predictedHikePercentage = 15.5;
  else if (performanceScore > 80) predictedHikePercentage = 10.0;

  res.json({ predictedHikePercentage });
});

// ======================================================
// 7. START SERVER
// ======================================================
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
