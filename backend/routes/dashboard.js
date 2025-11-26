const express = require("express");
const router = express.Router();
const db = require("../config/db"); // ✅ MySQL connection

// 📊 Dashboard Stats API (MySQL version)
router.get("/", async (req, res) => {
  try {
    // 🧮 Query 1: Total Students
    const [studentRows] = await db.promise().query("SELECT COUNT(*) AS count FROM students");

    // 🧮 Query 2: Total Teachers
    const [teacherRows] = await db.promise().query("SELECT COUNT(*) AS count FROM teachers");

    // 🧮 Query 3: Monthly Revenue (Current Month Income - Expense)
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    let monthlyRevenue = 0;
    try {
      const [incomeRows] = await db.promise().query(
        "SELECT SUM(amount) AS total FROM finance_transactions WHERE type = 'income' AND MONTH(date) = ? AND YEAR(date) = ?",
        [currentMonth, currentYear]
      );
      const [expenseRows] = await db.promise().query(
        "SELECT SUM(amount) AS total FROM finance_transactions WHERE type = 'expense' AND MONTH(date) = ? AND YEAR(date) = ?",
        [currentMonth, currentYear]
      );
      monthlyRevenue = (incomeRows[0].total || 0) - (expenseRows[0].total || 0);
    } catch (err) {
      console.log('Finance transactions table not found or missing type column, skipping revenue calculation...');
      monthlyRevenue = 0;
    }

    // 🧮 Query 4: Recent Activities (Last 3 working days)
    const activities = [];
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const dateFilter = threeDaysAgo.toISOString().split('T')[0];

    // Get recent admissions
    try {
      const [admissionRows] = await db.promise().query(
        "SELECT admission_no, full_name, status, created_at FROM admissions WHERE created_at >= ? ORDER BY created_at DESC LIMIT 5",
        [dateFilter]
      );
      admissionRows.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `New admission: ${row.full_name} (${row.admission_no})`,
          user: "Admission Dept",
          status: row.status === 'approved' ? 'Completed' : row.status === 'pending' ? 'Pending' : 'Rejected'
        });
      });
    } catch (err) {
      console.log('Admissions table not found or schema mismatch, skipping...');
    }

    // Get recent finance transactions
    try {
      const [financeRows] = await db.promise().query(
        "SELECT type, category, amount, date FROM finance_transactions WHERE date >= ? ORDER BY date DESC LIMIT 5",
        [dateFilter]
      );
      financeRows.forEach(row => {
        const date = new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `${row.type === 'income' ? '💰 Income' : '💸 Expense'}: ${row.category} - ₹${row.amount}`,
          user: "Finance Dept",
          status: "Completed"
        });
      });
    } catch (err) {
      console.log('Finance transactions table not found or missing type column, skipping...');
    }

    // Get recent students
    try {
      const [studentRows2] = await db.promise().query(
        "SELECT name, class, created_at FROM students WHERE created_at >= ? ORDER BY created_at DESC LIMIT 3",
        [dateFilter]
      );
      studentRows2.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `👨‍🎓 New student registered: ${row.name} (Class ${row.class})`,
          user: "Admin",
          status: "Completed"
        });
      });
    } catch (err) {
      console.log('Students table not found or schema mismatch, skipping...');
    }

    // Get recent teachers
    try {
      const [teacherRows2] = await db.promise().query(
        "SELECT name, subject, created_at FROM teachers WHERE created_at >= ? ORDER BY created_at DESC LIMIT 3",
        [dateFilter]
      );
      teacherRows2.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `👨‍🏫 New teacher joined: ${row.name} (${row.subject})`,
          user: "HR Dept",
          status: "Completed"
        });
      });
    } catch (err) {
      console.log('Teachers table not found or schema mismatch, skipping...');
    }

    // Get recent parents
    try {
      const [parentRows] = await db.promise().query(
        "SELECT name, student_name, created_at FROM parents WHERE created_at >= ? ORDER BY created_at DESC LIMIT 3",
        [dateFilter]
      );
      parentRows.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `👨‍👩‍👦 New parent registered: ${row.name} (Student: ${row.student_name})`,
          user: "Admin",
          status: "Completed"
        });
      });
    } catch (err) {
      // Parents table might not exist, skip
      console.log('Parents table not found, skipping...');
    }

    // Get recent courses
    try {
      const [courseRows] = await db.promise().query(
        "SELECT name, class_level, created_at FROM courses WHERE created_at >= ? ORDER BY created_at DESC LIMIT 3",
        [dateFilter]
      );
      courseRows.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `📚 New course created: ${row.name} (Level: ${row.class_level})`,
          user: "Admin",
          status: "Completed"
        });
      });
    } catch (err) {
      // Courses table might not exist, skip
      console.log('Courses table not found, skipping...');
    }

    // Get recent donations
    try {
      const [donationRows] = await db.promise().query(
        "SELECT donor_name, amount, status, created_at FROM donations WHERE created_at >= ? ORDER BY created_at DESC LIMIT 3",
        [dateFilter]
      );
      donationRows.forEach(row => {
        const date = new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `🎁 Donation received: ${row.donor_name} - ₹${row.amount}`,
          user: "Finance Dept",
          status: row.status === 'completed' ? 'Completed' : row.status === 'pending' ? 'Pending' : 'Failed'
        });
      });
    } catch (err) {
      console.log('Donations table not found, skipping...');
    }

    // Get recent attendance records
    try {
      const [attendanceRows] = await db.promise().query(
        "SELECT student_name, class, date, status FROM attendance WHERE date >= ? ORDER BY date DESC LIMIT 3",
        [dateFilter]
      );
      attendanceRows.forEach(row => {
        const date = new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        activities.push({
          date: date,
          activity: `📋 Attendance marked: ${row.student_name} (${row.class}) - ${row.status}`,
          user: "Teacher",
          status: "Completed"
        });
      });
    } catch (err) {
      console.log('Attendance table not found, skipping...');
    }

    // Sort by date (newest first) and limit to 15
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivities = activities.slice(0, 15);

    console.log(`📊 Dashboard loaded: ${studentRows[0].count} students, ${teacherRows[0].count} teachers, ${recentActivities.length} recent activities`);

    // 📦 Send response to frontend
    res.json({
      success: true,
      stats: {
        totalStudents: studentRows[0].count || 0,
        totalTeachers: teacherRows[0].count || 0,
        activeCourses: 12, // Static or replace with query if you have 'courses' table
        monthlyRevenue: monthlyRevenue
      },
      activities: recentActivities
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
