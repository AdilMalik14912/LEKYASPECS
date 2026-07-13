const db = require('../config/db');

// 1. Submit HO Daily/EOD Report
const submitReport = async (req, res) => {
  const { tasks_completed, tasks_pending, issues_faced } = req.body;
  const userId = req.user.id;

  if (!tasks_completed || tasks_completed.trim() === '') {
    return res.status(400).json({ message: 'Tasks completed content is required' });
  }

  try {
    const result = await db.query(
      `INSERT INTO ho_reports (user_id, tasks_completed, tasks_pending, issues_faced)
       VALUES (?, ?, ?, ?) RETURNING id, report_date`,
      [userId, tasks_completed.trim(), tasks_pending ? tasks_pending.trim() : null, issues_faced ? issues_faced.trim() : null]
    );

    res.status(201).json({
      message: 'Daily EOD Report submitted successfully!',
      reportId: result.rows[0].id,
      reportDate: result.rows[0].report_date
    });
  } catch (err) {
    console.error('Submit HO report error:', err);
    res.status(500).json({ message: 'Server error saving daily report' });
  }
};

// 2. Fetch My HO Reports History
const getMyReports = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      `SELECT id, report_date, tasks_completed, tasks_pending, issues_faced, created_at
       FROM ho_reports
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get my reports error:', err);
    res.status(500).json({ message: 'Server error retrieving report history' });
  }
};

// 3. Fetch All HO Reports (For Admin/HO management checks)
const getAllReports = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.id, r.report_date, r.tasks_completed, r.tasks_pending, r.issues_faced, r.created_at,
              u.name as staff_name, u.email as staff_email
       FROM ho_reports r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get all reports error:', err);
    res.status(500).json({ message: 'Server error retrieving all reports' });
  }
};

module.exports = {
  submitReport,
  getMyReports,
  getAllReports
};
