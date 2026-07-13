/**
 * crmController.js — Customer Relationship Management (CRM) Engine
 * Features:
 *   - Executive CRM Analytics & Funnel Pipeline Metrics
 *   - Lead & Customer Lifecycle Stages ('New Lead' -> 'Converted Customer')
 *   - Auto-calculated 🔥 Lead Scores (0-100) based on spend & engagement
 *   - Customer Interaction Timeline (Calls, Emails, Meetings, Notes, WhatsApp)
 *   - Actionable Follow-up Task Manager with Priority & Due Date Tracking
 *   - Automated Customer Sync from Users & Contact Submissions
 */

const db = require('../config/db');

// Helper: safe inserted id getter
async function getInsertedId(result) {
  if (result.rows && result.rows.length > 0 && result.rows[0].id) {
    return result.rows[0].id;
  }
  const lastRes = await db.query(`SELECT last_insert_rowid() as id`);
  return lastRes.rows[0].id;
}

// =============================================================================
//  1. GET /api/crm/stats — Dashboard Analytics & Sales Funnel Pipeline
// =============================================================================
const getDashboardStats = async (req, res) => {
  try {
    // 1. Total Leads count
    const totalRes = await db.query(`SELECT COUNT(*) as cnt FROM crm_leads`);
    const totalLeads = parseInt(totalRes.rows[0]?.cnt) || 0;

    // 2. Total Pipeline Valuation & Total Converted Revenue
    const valRes = await db.query(
      `SELECT SUM(estimated_value) as total_val,
              SUM(CASE WHEN stage = 'Converted Customer' THEN estimated_value ELSE 0 END) as converted_val
       FROM crm_leads`
    );
    const pipelineValue = parseFloat(valRes.rows[0]?.total_val) || 0.0;
    const convertedValue = parseFloat(valRes.rows[0]?.converted_val) || 0.0;

    // 3. Converted count & Conversion Rate
    const convRes = await db.query(
      `SELECT COUNT(*) as cnt FROM crm_leads WHERE stage = 'Converted Customer'`
    );
    const convertedCount = parseInt(convRes.rows[0]?.cnt) || 0;
    const conversionRate = totalLeads > 0 ? ((convertedCount / totalLeads) * 100).toFixed(1) : 0;

    // 4. Funnel breakdown by stage
    const funnelRes = await db.query(
      `SELECT stage, COUNT(*) as count, SUM(estimated_value) as total_value
       FROM crm_leads
       GROUP BY stage
       ORDER BY count DESC`
    );

    // Ensure standard stages are present
    const STAGES = ['New Lead', 'Contacted', 'Qualified', 'Prescription Consult', 'Offer Sent', 'Converted Customer', 'Lost'];
    const stageCounts = {};
    STAGES.forEach(st => { stageCounts[st] = { count: 0, total_value: 0 }; });
    funnelRes.rows.forEach(r => {
      stageCounts[r.stage] = { count: parseInt(r.count) || 0, total_value: parseFloat(r.total_value) || 0.0 };
    });

    // 5. Tasks summary
    const taskRes = await db.query(
      `SELECT
         COUNT(*) as total_tasks,
         SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_tasks,
         SUM(CASE WHEN status = 'Pending' AND due_date < date('now') THEN 1 ELSE 0 END) as overdue_tasks,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_tasks
       FROM crm_tasks`
    );
    const tasksStats = {
      total:     parseInt(taskRes.rows[0]?.total_tasks) || 0,
      pending:   parseInt(taskRes.rows[0]?.pending_tasks) || 0,
      overdue:   parseInt(taskRes.rows[0]?.overdue_tasks) || 0,
      completed: parseInt(taskRes.rows[0]?.completed_tasks) || 0,
    };

    // 6. Source breakdown
    const sourceRes = await db.query(
      `SELECT source, COUNT(*) as count FROM crm_leads GROUP BY source ORDER BY count DESC LIMIT 5`
    );

    // 7. High Value / Hot Leads
    const hotLeadsRes = await db.query(
      `SELECT l.id, l.name, l.email, l.phone, l.stage, l.lead_score, l.estimated_value, u.name as assigned_name
       FROM crm_leads l
       LEFT JOIN users u ON l.assigned_to = u.id
       WHERE l.lead_score >= 70 OR l.stage = 'Offer Sent'
       ORDER BY l.lead_score DESC, l.estimated_value DESC
       LIMIT 5`
    );

    res.json({
      metrics: {
        totalLeads,
        pipelineValue,
        convertedValue,
        convertedCount,
        conversionRate: parseFloat(conversionRate),
      },
      funnel: stageCounts,
      tasks: tasksStats,
      sources: sourceRes.rows,
      hotLeads: hotLeadsRes.rows,
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ message: 'Server error generating CRM analytics' });
  }
};

// =============================================================================
//  2. GET /api/crm/leads — List leads with filtering, sorting & search
// =============================================================================
const getLeads = async (req, res) => {
  try {
    const { stage, source, assignedTo, search, sortBy = 'updated_at', sortOrder = 'DESC' } = req.query;

    let sql = `
      SELECT l.id, l.user_id, l.name, l.email, l.phone, l.stage, l.source,
             l.lead_score, l.estimated_value, l.assigned_to, l.tags, l.notes,
             l.created_at, l.updated_at,
             au.name as assigned_name,
             (SELECT COUNT(*) FROM orders o WHERE o.user_id = l.user_id AND o.status = 'Paid') as total_orders,
             (SELECT COALESCE(SUM(o.total_amount), 0) FROM orders o WHERE o.user_id = l.user_id AND o.status = 'Paid') as total_spent,
             (SELECT COUNT(*) FROM crm_interactions i WHERE i.lead_id = l.id) as interactions_count,
             (SELECT COUNT(*) FROM crm_tasks t WHERE t.lead_id = l.id AND t.status = 'Pending') as pending_tasks_count
      FROM crm_leads l
      LEFT JOIN users au ON l.assigned_to = au.id
      WHERE 1=1`;

    const params = [];

    if (stage) {
      sql += ` AND l.stage = ?`;
      params.push(stage);
    }
    if (source) {
      sql += ` AND l.source = ?`;
      params.push(source);
    }
    if (assignedTo) {
      sql += ` AND l.assigned_to = ?`;
      params.push(parseInt(assignedTo));
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += ` AND (l.name LIKE ? OR l.email LIKE ? OR l.phone LIKE ? OR l.notes LIKE ?)`;
      params.push(q, q, q, q);
    }

    // Sorting
    const validSorts = ['updated_at', 'created_at', 'lead_score', 'estimated_value', 'name', 'stage'];
    const sCol = validSorts.includes(sortBy) ? sortBy : 'updated_at';
    const sDir = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY l.${sCol} ${sDir}`;

    const result = await db.query(sql, params);

    // Parse JSON tags
    const leads = result.rows.map(row => {
      let parsedTags = [];
      if (row.tags) {
        try { parsedTags = typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags; } catch (_) {}
      }
      return { ...row, tags: parsedTags };
    });

    res.json(leads);
  } catch (err) {
    console.error('getLeads error:', err);
    res.status(500).json({ message: 'Server error fetching CRM leads' });
  }
};

// =============================================================================
//  3. GET /api/crm/leads/:id — Detailed lead profile
// =============================================================================
const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;

    const leadRes = await db.query(
      `SELECT l.id, l.user_id, l.name, l.email, l.phone, l.stage, l.source,
              l.lead_score, l.estimated_value, l.assigned_to, l.tags, l.notes,
              l.created_at, l.updated_at,
              au.name as assigned_name, au.email as assigned_email
       FROM crm_leads l
       LEFT JOIN users au ON l.assigned_to = au.id
       WHERE l.id = ?`,
      [id]
    );

    if (leadRes.rows.length === 0) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    const lead = leadRes.rows[0];
    try { lead.tags = typeof lead.tags === 'string' ? JSON.parse(lead.tags) : (lead.tags || []); } catch (_) { lead.tags = []; }

    // Fetch interaction timeline
    const interactionsRes = await db.query(
      `SELECT i.id, i.type, i.subject, i.notes, i.outcome, i.created_at,
              u.name as staff_name, u.role as staff_role
       FROM crm_interactions i
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.lead_id = ?
       ORDER BY i.created_at DESC`,
      [id]
    );

    // Fetch tasks
    const tasksRes = await db.query(
      `SELECT t.id, t.title, t.description, t.due_date, t.priority, t.status, t.created_at,
              u.name as assigned_name
       FROM crm_tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.lead_id = ?
       ORDER BY t.status ASC, t.due_date ASC`,
      [id]
    );

    // Fetch customer's order history if user linked
    let orderHistory = [];
    if (lead.user_id) {
      const ordersRes = await db.query(
        `SELECT id, total_amount, status, created_at, tracking_id
         FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [lead.user_id]
      );
      orderHistory = ordersRes.rows;
    }

    res.json({
      ...lead,
      interactions: interactionsRes.rows,
      tasks: tasksRes.rows,
      orders: orderHistory,
    });
  } catch (err) {
    console.error('getLeadById error:', err);
    res.status(500).json({ message: 'Server error fetching lead details' });
  }
};

// =============================================================================
//  4. POST /api/crm/leads — Create lead manually
// =============================================================================
const createLead = async (req, res) => {
  try {
    const { name, email, phone, stage = 'New Lead', source = 'Manual Entry', estimated_value = 0, assigned_to, tags, notes } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Lead name required' });

    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags : []);

    const result = await db.query(
      `INSERT INTO crm_leads (name, email, phone, stage, source, estimated_value, assigned_to, tags, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [name.trim(), email || null, phone || null, stage, source, parseFloat(estimated_value) || 0.0, assigned_to || null, tagsJson, notes || null]
    );

    const leadId = await getInsertedId(result);

    // Log creation interaction
    await db.query(
      `INSERT INTO crm_interactions (lead_id, created_by, type, subject, notes)
       VALUES (?, ?, 'note', 'Lead Created', ?)`,
      [leadId, req.user?.id || null, `Lead "${name.trim()}" created manually.`]
    );

    res.status(201).json({ id: leadId, message: 'CRM lead created successfully' });
  } catch (err) {
    console.error('createLead error:', err);
    res.status(500).json({ message: 'Server error creating lead' });
  }
};

// =============================================================================
//  5. PUT /api/crm/leads/:id — Update lead details, stage, score or assignment
// =============================================================================
const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, lead_score, estimated_value, assigned_to, tags, notes, name, email, phone } = req.body;

    const existing = await db.query(`SELECT * FROM crm_leads WHERE id = ?`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Lead not found' });
    const prev = existing.rows[0];

    const newStage = stage || prev.stage;
    const newScore = lead_score !== undefined ? parseInt(lead_score) : prev.lead_score;
    const newVal   = estimated_value !== undefined ? parseFloat(estimated_value) : prev.estimated_value;
    const newAgent = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to) : null) : prev.assigned_to;
    const newTags  = tags ? JSON.stringify(Array.isArray(tags) ? tags : []) : prev.tags;
    const newNotes = notes !== undefined ? notes : prev.notes;
    const newName  = name || prev.name;
    const newEmail = email !== undefined ? email : prev.email;
    const newPhone = phone !== undefined ? phone : prev.phone;

    await db.query(
      `UPDATE crm_leads
       SET name = ?, email = ?, phone = ?, stage = ?, lead_score = ?,
           estimated_value = ?, assigned_to = ?, tags = ?, notes = ?,
           updated_at = datetime('now')
       WHERE id = ?`,
      [newName, newEmail, newPhone, newStage, newScore, newVal, newAgent, newTags, newNotes, id]
    );

    // If stage changed, log timeline event
    if (newStage !== prev.stage) {
      await db.query(
        `INSERT INTO crm_interactions (lead_id, created_by, type, subject, notes)
         VALUES (?, ?, 'note', 'Stage Change', ?)`,
        [id, req.user?.id || null, `Stage changed from "${prev.stage}" to "${newStage}"`]
      );
    }

    res.json({ message: 'Lead updated successfully', id: parseInt(id) });
  } catch (err) {
    console.error('updateLead error:', err);
    res.status(500).json({ message: 'Server error updating lead' });
  }
};

// =============================================================================
//  6. POST /api/crm/leads/:id/interactions — Log customer interaction
// =============================================================================
const logInteraction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'note', subject, notes, outcome = 'Completed' } = req.body;

    if (!subject || !subject.trim()) return res.status(400).json({ message: 'Subject required' });

    const result = await db.query(
      `INSERT INTO crm_interactions (lead_id, created_by, type, subject, notes, outcome)
       VALUES (?, ?, ?, ?, ?, ?) RETURNING id`,
      [id, req.user?.id || null, type, subject.trim(), notes || null, outcome]
    );

    // Touch updated_at on lead
    await db.query(`UPDATE crm_leads SET updated_at = datetime('now') WHERE id = ?`, [id]);

    res.status(201).json({ id: await getInsertedId(result), message: 'Interaction logged' });
  } catch (err) {
    console.error('logInteraction error:', err);
    res.status(500).json({ message: 'Server error logging interaction' });
  }
};

// =============================================================================
//  7. GET /api/crm/tasks — List follow-up tasks
// =============================================================================
const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedTo } = req.query;

    let sql = `
      SELECT t.id, t.lead_id, t.assigned_to, t.created_by, t.title, t.description,
             t.due_date, t.priority, t.status, t.created_at,
             l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
             u.name as assigned_name
      FROM crm_tasks t
      LEFT JOIN crm_leads l ON t.lead_id = l.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE 1=1`;

    const params = [];
    if (status) {
      sql += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      sql += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (assignedTo) {
      sql += ` AND t.assigned_to = ?`;
      params.push(parseInt(assignedTo));
    }

    sql += ` ORDER BY CASE WHEN t.status = 'Pending' THEN 0 ELSE 1 END, t.due_date ASC`;

    const result = await db.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// =============================================================================
//  8. POST /api/crm/tasks — Schedule follow-up task
// =============================================================================
const createTask = async (req, res) => {
  try {
    const { lead_id, title, description, due_date, priority = 'Medium', assigned_to } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ message: 'Task title required' });
    if (!due_date) return res.status(400).json({ message: 'Due date required' });

    const result = await db.query(
      `INSERT INTO crm_tasks (lead_id, assigned_to, created_by, title, description, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending') RETURNING id`,
      [lead_id || null, assigned_to || req.user?.id || null, req.user?.id || null, title.trim(), description || null, due_date, priority]
    );

    res.status(201).json({ id: await getInsertedId(result), message: 'Task created successfully' });
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ message: 'Server error creating task' });
  }
};

// =============================================================================
//  9. PUT /api/crm/tasks/:id — Update task status / details
// =============================================================================
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, title, description, due_date, priority, assigned_to } = req.body;

    const existing = await db.query(`SELECT * FROM crm_tasks WHERE id = ?`, [id]);
    if (existing.rows.length === 0) return res.status(404).json({ message: 'Task not found' });
    const prev = existing.rows[0];

    const newStatus   = status || prev.status;
    const newTitle    = title || prev.title;
    const newDesc     = description !== undefined ? description : prev.description;
    const newDueDate  = due_date || prev.due_date;
    const newPriority = priority || prev.priority;
    const newAssigned = assigned_to !== undefined ? (assigned_to ? parseInt(assigned_to) : null) : prev.assigned_to;

    await db.query(
      `UPDATE crm_tasks
       SET title = ?, description = ?, due_date = ?, priority = ?,
           status = ?, assigned_to = ?
       WHERE id = ?`,
      [newTitle, newDesc, newDueDate, newPriority, newStatus, newAssigned, id]
    );

    res.json({ message: 'Task updated successfully', id: parseInt(id) });
  } catch (err) {
    console.error('updateTask error:', err);
    res.status(500).json({ message: 'Server error updating task' });
  }
};

// =============================================================================
//  10. POST /api/crm/auto-sync — Auto sync existing customers & contacts into CRM
// =============================================================================
const autoSyncLeads = async (req, res) => {
  try {
    let syncedUsers = 0;
    let syncedContacts = 0;

    // 1. Sync users without CRM entries
    const usersRes = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.created_at,
              COALESCE(SUM(o.total_amount), 0) as total_spent,
              COUNT(o.id) as order_count
       FROM users u
       LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'Paid'
       WHERE u.id NOT IN (SELECT user_id FROM crm_leads WHERE user_id IS NOT NULL)
       GROUP BY u.id`
    );

    for (const u of usersRes.rows) {
      const spent = parseFloat(u.total_spent) || 0.0;
      const oCnt = parseInt(u.order_count) || 0;
      const stage = oCnt > 0 ? 'Converted Customer' : 'New Lead';
      // Lead score calculation: 50 base + 10 per order + 1 point per ₹500 spent (max 100)
      const score = Math.min(100, Math.max(20, 50 + (oCnt * 10) + Math.floor(spent / 500)));
      const tags = JSON.stringify(oCnt > 2 ? ['Repeat Buyer'] : (spent > 5000 ? ['High Value'] : ['Storefront User']));

      await db.query(
        `INSERT INTO crm_leads (user_id, name, email, phone, stage, source, lead_score, estimated_value, tags)
         VALUES (?, ?, ?, ?, ?, 'Storefront Account', ?, ?, ?)`,
        [u.id, u.name, u.email, u.phone, stage, score, spent > 0 ? spent : 2000.0, tags]
      );
      syncedUsers++;
    }

    // 2. Sync contact messages without CRM entries
    const contactsRes = await db.query(
      `SELECT c.id, c.name, c.email, c.phone, c.subject, c.message, c.created_at
       FROM contact_messages c
       WHERE c.email NOT IN (SELECT email FROM crm_leads WHERE email IS NOT NULL)`
    );

    for (const c of contactsRes.rows) {
      await db.query(
        `INSERT INTO crm_leads (name, email, phone, stage, source, lead_score, estimated_value, notes)
         VALUES (?, ?, ?, 'Contacted', 'Contact Form Inquiry', 60, 1500.0, ?)`,
        [c.name, c.email, c.phone, `Inquiry: ${c.subject || ''} — ${c.message || ''}`]
      );
      syncedContacts++;
    }

    res.json({
      message: 'CRM Auto-Sync Complete!',
      syncedUsers,
      syncedContacts,
    });
  } catch (err) {
    console.error('autoSyncLeads error:', err);
    res.status(500).json({ message: 'Server error performing CRM auto-sync' });
  }
};

module.exports = {
  getDashboardStats,
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  logInteraction,
  getTasks,
  createTask,
  updateTask,
  autoSyncLeads,
};
