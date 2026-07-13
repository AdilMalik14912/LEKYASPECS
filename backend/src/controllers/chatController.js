/**
 * chatController.js — Team Chat System for Specs Admin Platform
 * Features: DMs, Groups, File Uploads (Cloudinary), Emoji Reactions,
 *           Message Pinning, Reply Threading, Read Receipts, Typing Indicators,
 *           Online Presence, Member Management.
 */

const db = require('../config/db');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── In-Memory Typing Store ───────────────────────────────────────────────────
// { conversationId: { userId: { name, until } } }
const typingStore = {};

// ─── Helper: safe last_insert_rowid fallback ──────────────────────────────────
async function getInsertedId(result) {
  if (result.rows && result.rows.length > 0 && result.rows[0].id) {
    return result.rows[0].id;
  }
  const lastRes = await db.query(`SELECT last_insert_rowid() as id`);
  return lastRes.rows[0].id;
}

// ─── Helper: check if user is team member (any non-customer role) ─────────────
function isTeamRole(role, email) {
  const adminEmails = ['dev.parceluncle@gmail.com', 'admin@specs.com'];
  return ['admin', 'seller', 'delivery', 'stylist', 'ho_staff'].includes(role) || adminEmails.includes(email);
}

// ─── Helper: check if user is admin ──────────────────────────────────────────
function isAdminUser(user) {
  return user.role === 'admin' ||
    user.email === 'dev.parceluncle@gmail.com' ||
    user.email === 'admin@specs.com';
}

// =============================================================================
//  1. GET /api/chat/team — All team members with online status
// =============================================================================
const getTeamMembers = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role,
              MAX(CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END) as is_online,
              MAX(s.last_active_at) as last_seen
       FROM users u
       LEFT JOIN active_sessions s
         ON s.user_id = u.id
         AND s.last_active_at > datetime('now', '-5 minutes')
       WHERE u.role IN ('admin','seller','delivery','stylist','ho_staff')
          OR u.email IN ('dev.parceluncle@gmail.com','admin@specs.com')
       GROUP BY u.id
       ORDER BY is_online DESC, u.name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getTeamMembers error:', err);
    res.status(500).json({ message: 'Server error fetching team' });
  }
};

// =============================================================================
//  2. GET /api/chat/conversations — My conversations (DMs + Groups)
// =============================================================================
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Auto-join Admins to all Group channels if not joined yet
    if (isAdminUser(req.user)) {
      await db.query(
        `INSERT OR IGNORE INTO chat_members (conversation_id, user_id)
         SELECT id, ? FROM chat_conversations WHERE type = 'group'`,
        [userId]
      );
    }

    // 1. Fetch all conversations user is in, with last message & unread count
    const result = await db.query(
      `SELECT c.id, c.type, c.name, c.avatar, c.created_by, c.created_at,
              lm.content        as last_message,
              lm.file_name      as last_file_name,
              lm.file_type      as last_file_type,
              lm.sender_id      as last_sender_id,
              lm.created_at     as last_message_at,
              lu.name           as last_sender_name,
              (SELECT COUNT(*) FROM chat_messages m2
               LEFT JOIN chat_reads r ON r.message_id = m2.id AND r.user_id = ?
               WHERE m2.conversation_id = c.id
                 AND m2.sender_id != ?
                 AND r.message_id IS NULL
              ) as unread_count
       FROM chat_conversations c
       JOIN chat_members cm ON cm.conversation_id = c.id AND cm.user_id = ?
       LEFT JOIN (
         SELECT conversation_id, MAX(id) as max_id FROM chat_messages GROUP BY conversation_id
       ) latest ON latest.conversation_id = c.id
       LEFT JOIN chat_messages lm ON lm.id = latest.max_id
       LEFT JOIN users lu ON lu.id = lm.sender_id
       ORDER BY COALESCE(last_message_at, c.created_at) DESC`,
      [userId, userId, userId]
    );

    const conversations = result.rows.map(row => ({
      id: row.id,
      type: row.type,
      name: row.name,
      avatar: row.avatar,
      created_by: row.created_by,
      created_at: row.created_at,
      last_message: row.last_message,
      last_file_name: row.last_file_name,
      last_file_type: row.last_file_type,
      last_sender_id: row.last_sender_id,
      last_message_at: row.last_message_at,
      last_sender_name: row.last_sender_name,
      unread_count: parseInt(row.unread_count) || 0
    }));

    // 2. Batch fetch DM opponent user details
    const dmIds = conversations.filter(c => c.type === 'dm').map(c => c.id);
    if (dmIds.length > 0) {
      const placeholders = dmIds.map(() => '?').join(',');
      const otherUsersRes = await db.query(
        `SELECT cm.conversation_id, u.id, u.name, u.email, u.role,
                MAX(CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END) as is_online
         FROM chat_members cm
         JOIN users u ON cm.user_id = u.id
         LEFT JOIN active_sessions s
           ON s.user_id = u.id
           AND s.last_active_at > datetime('now', '-5 minutes')
         WHERE cm.conversation_id IN (${placeholders}) AND cm.user_id != ?
         GROUP BY cm.conversation_id, u.id`,
        [...dmIds, userId]
      );

      const otherUserMap = {};
      for (const row of otherUsersRes.rows) {
        otherUserMap[row.conversation_id] = {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          is_online: row.is_online === 1
        };
      }

      conversations.forEach(c => {
        if (c.type === 'dm') {
          c.other_user = otherUserMap[c.id] || null;
          if (!c.name && c.other_user) c.name = c.other_user.name;
          if (!c.name) c.name = 'Direct Message';
        }
      });
    }

    res.json(conversations);
  } catch (err) {
    console.error('getConversations error:', err);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// =============================================================================
//  3. POST /api/chat/conversations/dm — Start or get a DM conversation
// =============================================================================
const getDmConversation = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { targetUserId } = req.body;

    if (!targetUserId) return res.status(400).json({ message: 'targetUserId required' });
    if (parseInt(targetUserId) === userId) return res.status(400).json({ message: 'Cannot DM yourself' });

    // Check if DM already exists
    const existing = await db.query(
      `SELECT c.id FROM chat_conversations c
       JOIN chat_members cm1 ON cm1.conversation_id = c.id AND cm1.user_id = ?
       JOIN chat_members cm2 ON cm2.conversation_id = c.id AND cm2.user_id = ?
       WHERE c.type = 'dm'
       LIMIT 1`,
      [userId, targetUserId]
    );

    if (existing.rows.length > 0) {
      return res.json({ id: existing.rows[0].id, isNew: false });
    }

    // Create new DM
    const convRes = await db.query(
      `INSERT INTO chat_conversations (type, created_by) VALUES ('dm', ?) RETURNING id`,
      [userId]
    );
    const convId = await getInsertedId(convRes);

    await db.query(`INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [convId, userId]);
    await db.query(`INSERT INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [convId, targetUserId]);

    res.json({ id: convId, isNew: true });
  } catch (err) {
    console.error('getDmConversation error:', err);
    res.status(500).json({ message: 'Server error creating DM' });
  }
};

// =============================================================================
//  4. POST /api/chat/conversations/group — Create a group conversation
// =============================================================================
const createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, memberIds, description } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Group name required' });

    const convRes = await db.query(
      `INSERT INTO chat_conversations (type, name, description, created_by) VALUES ('group', ?, ?, ?) RETURNING id`,
      [name.trim(), description || null, userId]
    );
    const convId = await getInsertedId(convRes);

    // Add creator as first member
    await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [convId, userId]);

    // Automatically add all Admins to newly created Group channels
    await db.query(
      `INSERT OR IGNORE INTO chat_members (conversation_id, user_id)
       SELECT ?, id FROM users WHERE role = 'admin' OR email IN ('dev.parceluncle@gmail.com', 'admin@specs.com')`,
      [convId]
    );

    // Add selected members
    if (Array.isArray(memberIds)) {
      for (const mid of memberIds) {
        if (parseInt(mid) !== userId) {
          await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [convId, mid]);
        }
      }
    }

    // Send a system message announcing the group
    await db.query(
      `INSERT INTO chat_messages (conversation_id, sender_id, content, message_type)
       VALUES (?, ?, ?, 'system')`,
      [convId, userId, `${req.user.name} created group "${name.trim()}"`]
    );

    res.json({ id: convId, name: name.trim(), type: 'group', created_by: userId });
  } catch (err) {
    console.error('createGroup error:', err);
    res.status(500).json({ message: 'Server error creating group' });
  }
};

// =============================================================================
//  5. GET /api/chat/conversations/:id/messages — Get messages (paginated)
// =============================================================================
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const { before, limit = 50 } = req.query;

    // Verify membership or auto-join if Admin
    const memberCheck = await db.query(
      `SELECT id FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, userId]
    );
    if (memberCheck.rows.length === 0) {
      if (isAdminUser(req.user)) {
        await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [id, userId]);
      } else {
        return res.status(403).json({ message: 'Not a member of this conversation' });
      }
    }

    let sql = `
      SELECT m.id, m.conversation_id, m.sender_id, m.content, m.file_url,
             m.file_name, m.file_type, m.is_pinned, m.reply_to_id,
             m.created_at, m.edited_at, m.message_type,
             u.name       as sender_name,
             u.role       as sender_role,
             u.email      as sender_email,
             rm.content   as reply_content,
             rm.file_name as reply_file_name,
             ru.name      as reply_sender_name
      FROM chat_messages m
      LEFT JOIN users u  ON m.sender_id  = u.id
      LEFT JOIN chat_messages rm ON m.reply_to_id = rm.id
      LEFT JOIN users ru ON rm.sender_id = ru.id
      WHERE m.conversation_id = ?`;

    const params = [id];
    if (before) {
      sql += ` AND m.id < ?`;
      params.push(parseInt(before));
    }
    sql += ` ORDER BY m.created_at DESC LIMIT ?`;
    params.push(Math.min(parseInt(limit), 100));

    const result = await db.query(sql, params);
    const messages = result.rows.reverse(); // Oldest first

    // Attach reactions & read receipts
    if (messages.length > 0) {
      const msgIds = messages.map(m => m.id);
      const placeholders = msgIds.map(() => '?').join(',');
      const reactionsRes = await db.query(
        `SELECT r.message_id, r.emoji, r.user_id, u.name as user_name
         FROM chat_reactions r
         JOIN users u ON r.user_id = u.id
         WHERE r.message_id IN (${placeholders})`,
        msgIds
      );

      const reactionMap = {};
      for (const r of reactionsRes.rows) {
        if (!reactionMap[r.message_id]) reactionMap[r.message_id] = {};
        if (!reactionMap[r.message_id][r.emoji]) reactionMap[r.message_id][r.emoji] = [];
        reactionMap[r.message_id][r.emoji].push({ user_id: r.user_id, user_name: r.user_name });
      }

      const readsRes = await db.query(
        `SELECT cr.message_id, cr.user_id, u.name as user_name
         FROM chat_reads cr
         JOIN users u ON cr.user_id = u.id
         WHERE cr.message_id IN (${placeholders})`,
        msgIds
      );
      const readMap = {};
      for (const r of readsRes.rows) {
        if (!readMap[r.message_id]) readMap[r.message_id] = [];
        readMap[r.message_id].push({ user_id: r.user_id, user_name: r.user_name });
      }

      messages.forEach(m => {
        m.reactions = reactionMap[m.id] || {};
        m.read_by   = readMap[m.id]     || [];
      });

      // Single fast batch query to mark messages as read
      db.query(
        `INSERT OR IGNORE INTO chat_reads (message_id, user_id)
         SELECT id, ? FROM chat_messages
         WHERE conversation_id = ? AND sender_id != ?`,
        [userId, id, userId]
      ).catch(() => {});
    }

    res.json(messages);
  } catch (err) {
    console.error('getMessages error:', err);
    res.status(500).json({ message: 'Server error fetching messages' });
  }
};

// =============================================================================
//  6. POST /api/chat/conversations/:id/messages — Send a message
// =============================================================================
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const { content, replyToId, fileData, fileName, fileType } = req.body;

    // Verify membership or auto-join if Admin
    const memberCheck = await db.query(
      `SELECT id FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, userId]
    );
    if (memberCheck.rows.length === 0) {
      if (isAdminUser(req.user)) {
        await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [id, userId]);
      } else {
        return res.status(403).json({ message: 'Not a member of this conversation' });
      }
    }

    if (!content && !fileData) return res.status(400).json({ message: 'Content or file required' });

    let fileUrl  = null;
    let finalFileName = fileName || null;
    let finalFileType = fileType || null;

    // Upload file via Cloudinary with robust fallback to base64
    if (fileData) {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const uploadResult = await cloudinary.uploader.upload(fileData, {
            folder:        'specs_chat_files',
            resource_type: 'auto',
            public_id:     `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          });
          fileUrl       = uploadResult.secure_url;
          finalFileType = uploadResult.resource_type === 'image' ? 'image' : finalFileType;
        } else {
          fileUrl = fileData;
        }
      } catch (uploadErr) {
        console.warn('Cloudinary upload warning, using direct fileData fallback:', uploadErr.message);
        fileUrl = fileData;
      }
    }

    const msgRes = await db.query(
      `INSERT INTO chat_messages
         (conversation_id, sender_id, content, file_url, file_name, file_type, reply_to_id)
       VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      [id, userId, content || null, fileUrl, finalFileName, finalFileType, replyToId || null]
    );
    const msgId = await getInsertedId(msgRes);

    // Fetch full message with sender info
    const fullMsgRes = await db.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.content, m.file_url, m.file_name, m.file_type,
              m.is_pinned, m.reply_to_id, m.created_at, m.message_type,
              u.name  as sender_name,
              u.role  as sender_role,
              u.email as sender_email,
              rm.content  as reply_content,
              rm.file_name as reply_file_name,
              ru.name as reply_sender_name
       FROM chat_messages m
       LEFT JOIN users u  ON m.sender_id  = u.id
       LEFT JOIN chat_messages rm ON m.reply_to_id = rm.id
       LEFT JOIN users ru ON rm.sender_id = ru.id
       WHERE m.id = ?`,
      [msgId]
    );

    const msg = fullMsgRes.rows[0];
    msg.reactions = {};
    msg.read_by   = [];

    res.status(201).json(msg);
  } catch (err) {
    console.error('sendMessage error:', err);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// =============================================================================
//  7. PUT /api/chat/messages/:id/pin — Pin / unpin a message
// =============================================================================
const togglePin = async (req, res) => {
  try {
    const { id } = req.params;
    const msg = await db.query(`SELECT is_pinned, conversation_id FROM chat_messages WHERE id = ?`, [id]);
    if (msg.rows.length === 0) return res.status(404).json({ message: 'Message not found' });

    const newState = msg.rows[0].is_pinned ? 0 : 1;
    await db.query(`UPDATE chat_messages SET is_pinned = ? WHERE id = ?`, [newState, id]);

    res.json({ id: parseInt(id), is_pinned: newState });
  } catch (err) {
    console.error('togglePin error:', err);
    res.status(500).json({ message: 'Server error toggling pin' });
  }
};

// =============================================================================
//  8. DELETE /api/chat/messages/:id — Delete a message
// =============================================================================
const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;

    const msg = await db.query(`SELECT sender_id FROM chat_messages WHERE id = ?`, [id]);
    if (msg.rows.length === 0) return res.status(404).json({ message: 'Message not found' });

    if (msg.rows[0].sender_id !== userId && !isAdminUser(req.user)) {
      return res.status(403).json({ message: 'Cannot delete this message' });
    }

    await db.query(`DELETE FROM chat_messages WHERE id = ?`, [id]);
    res.json({ deleted: true, id: parseInt(id) });
  } catch (err) {
    console.error('deleteMessage error:', err);
    res.status(500).json({ message: 'Server error deleting message' });
  }
};

// =============================================================================
//  8b. PUT /api/chat/messages/:id — Edit message (sender or admin only)
// =============================================================================
const updateMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) return res.status(400).json({ message: 'Content required' });

    const msg = await db.query(`SELECT sender_id FROM chat_messages WHERE id = ?`, [id]);
    if (msg.rows.length === 0) return res.status(404).json({ message: 'Message not found' });

    if (parseInt(msg.rows[0].sender_id) !== parseInt(userId) && !isAdminUser(req.user)) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    await db.query(
      `UPDATE chat_messages SET content = ?, edited_at = datetime('now') WHERE id = ?`,
      [content.trim(), id]
    );

    res.json({ ok: true, id: parseInt(id), content: content.trim(), edited_at: new Date().toISOString() });
  } catch (err) {
    console.error('updateMessage error:', err);
    res.status(500).json({ message: 'Server error updating message' });
  }
};

// =============================================================================
//  9. POST /api/chat/messages/:id/react — Toggle emoji reaction
// =============================================================================
const toggleReaction = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ message: 'Emoji required' });

    const existing = await db.query(
      `SELECT id FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?`,
      [id, userId, emoji]
    );

    if (existing.rows.length > 0) {
      await db.query(`DELETE FROM chat_reactions WHERE message_id = ? AND user_id = ? AND emoji = ?`,
        [id, userId, emoji]);
    } else {
      await db.query(
        `INSERT INTO chat_reactions (message_id, user_id, emoji) VALUES (?, ?, ?)`,
        [id, userId, emoji]
      );
    }

    // Fetch updated reactions map to return enriched object
    const updatedReactions = await db.query(
      `SELECT r.emoji, r.user_id, u.name as user_name
       FROM chat_reactions r
       JOIN users u ON r.user_id = u.id
       WHERE r.message_id = ?`,
      [id]
    );

    const map = {};
    for (const r of updatedReactions.rows) {
      if (!map[r.emoji]) map[r.emoji] = [];
      map[r.emoji].push({ user_id: r.user_id, user_name: r.user_name });
    }

    res.json({ messageId: parseInt(id), reactions: map });
  } catch (err) {
    console.error('toggleReaction error:', err);
    res.status(500).json({ message: 'Server error toggling reaction' });
  }
};

// =============================================================================
//  10. POST /api/chat/conversations/:id/read — Mark all messages as read
// =============================================================================
const markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;

    const result = await db.query(
      `INSERT OR IGNORE INTO chat_reads (message_id, user_id)
       SELECT id, ? FROM chat_messages
       WHERE conversation_id = ? AND sender_id != ?`,
      [userId, id, userId]
    );

    res.json({ ok: true, markedCount: result.rowCount || 0 });
  } catch (err) {
    console.error('markRead error:', err);
    res.status(500).json({ message: 'Server error marking read' });
  }
};

// =============================================================================
//  11. GET /api/chat/conversations/:id/pinned — Get pinned messages
// =============================================================================
const getPinnedMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;

    const memberCheck = await db.query(
      `SELECT id FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, userId]
    );
    if (memberCheck.rows.length === 0) return res.status(403).json({ message: 'Not a member' });

    const result = await db.query(
      `SELECT m.id, m.content, m.file_url, m.file_name, m.file_type, m.created_at,
              u.name as sender_name, u.role as sender_role
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.is_pinned = 1
       ORDER BY m.created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getPinnedMessages error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  12. GET /api/chat/conversations/:id/members — Get conversation members
// =============================================================================
const getMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify membership or auto-join if Admin
    const memberCheck = await db.query(
      `SELECT id FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, req.user.id]
    );
    if (memberCheck.rows.length === 0) {
      if (isAdminUser(req.user)) {
        await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [id, req.user.id]);
      } else {
        return res.status(403).json({ message: 'Not a member of this conversation' });
      }
    }
    const result = await db.query(
      `SELECT u.id, u.name, u.email, u.role, cm.joined_at,
              MAX(CASE WHEN s.user_id IS NOT NULL THEN 1 ELSE 0 END) as is_online,
              MAX(s.last_active_at) as last_seen
       FROM chat_members cm
       JOIN users u ON cm.user_id = u.id
       LEFT JOIN active_sessions s
         ON s.user_id = u.id
         AND s.last_active_at > datetime('now', '-5 minutes')
       WHERE cm.conversation_id = ?
       GROUP BY u.id
       ORDER BY is_online DESC, u.name ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getMembers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  13. POST /api/chat/conversations/:id/members — Add member to group
// =============================================================================
const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId: newUserId } = req.body;

    if (!newUserId) return res.status(400).json({ message: 'userId required' });

    // Check it's a group
    const conv = await db.query(`SELECT type FROM chat_conversations WHERE id = ?`, [id]);
    if (!conv.rows.length || conv.rows[0].type !== 'group') {
      return res.status(400).json({ message: 'Can only add members to groups' });
    }

    await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [id, newUserId]);

    // System message
    const newUser = await db.query(`SELECT name FROM users WHERE id = ?`, [newUserId]);
    if (newUser.rows.length > 0) {
      await db.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, content, message_type) VALUES (?, ?, ?, 'system')`,
        [id, req.user.id, `${req.user.name} added ${newUser.rows[0].name} to the group`]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('addMember error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  14. DELETE /api/chat/conversations/:id/members/:uid — Remove member
// =============================================================================
const removeMember = async (req, res) => {
  try {
    const { id, uid } = req.params;
    const userId      = req.user.id;

    // Can remove self, or admin can remove anyone
    if (parseInt(uid) !== userId && !isAdminUser(req.user)) {
      return res.status(403).json({ message: 'Only admins can remove other members' });
    }

    await db.query(`DELETE FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, uid]);

    // System message
    await db.query(
      `INSERT INTO chat_messages (conversation_id, sender_id, content, message_type) VALUES (?, ?, ?, 'system')`,
      [id, userId, parseInt(uid) === userId ? `${req.user.name} left the group` : `${req.user.name} removed a member`]
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('removeMember error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  15. POST /api/chat/typing — Set typing status
// =============================================================================
const setTyping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, isTyping } = req.body;

    if (!conversationId) return res.status(400).json({ message: 'conversationId required' });

    if (!typingStore[conversationId]) typingStore[conversationId] = {};

    if (isTyping) {
      typingStore[conversationId][userId] = {
        name:  req.user.name,
        until: Date.now() + 4000, // expire after 4 seconds
      };
    } else {
      delete typingStore[conversationId][userId];
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  16. GET /api/chat/typing/:id — Get who is typing
// =============================================================================
const getTyping = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;
    const now     = Date.now();

    const store  = typingStore[id] || {};
    const active = Object.entries(store)
      .filter(([uid, data]) => data.until > now && parseInt(uid) !== userId)
      .map(([uid, data]) => ({ userId: parseInt(uid), name: data.name }));

    res.json(active);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  17. GET /api/chat/conversations/:id/files — Get shared files in conversation
// =============================================================================
const getSharedFiles = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;

    const memberCheck = await db.query(
      `SELECT id FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, userId]
    );
    if (memberCheck.rows.length === 0) {
      if (isAdminUser(req.user)) {
        await db.query(`INSERT OR IGNORE INTO chat_members (conversation_id, user_id) VALUES (?, ?)`, [id, userId]);
      } else {
        return res.status(403).json({ message: 'Not a member' });
      }
    }

    const result = await db.query(
      `SELECT m.id, m.file_url, m.file_name, m.file_type, m.created_at,
              u.name as sender_name
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.file_url IS NOT NULL
       ORDER BY m.created_at DESC
       LIMIT 50`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('getSharedFiles error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  18. PUT /api/chat/messages/:id/edit — Edit a message
// =============================================================================
const editMessage = async (req, res) => {
  try {
    const userId    = req.user.id;
    const { id }    = req.params;
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Content required' });

    const msg = await db.query(`SELECT sender_id FROM chat_messages WHERE id = ?`, [id]);
    if (!msg.rows.length) return res.status(404).json({ message: 'Message not found' });
    if (msg.rows[0].sender_id !== userId) return res.status(403).json({ message: 'Can only edit your own messages' });

    await db.query(
      `UPDATE chat_messages SET content = ?, edited_at = datetime('now') WHERE id = ?`,
      [content, id]
    );

    res.json({ id: parseInt(id), content, edited: true });
  } catch (err) {
    console.error('editMessage error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
//  19. DELETE /api/chat/conversations/:id — Leave / delete a conversation
// =============================================================================
const leaveConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id }  = req.params;

    const conv = await db.query(`SELECT type, created_by FROM chat_conversations WHERE id = ?`, [id]);
    if (!conv.rows.length) return res.status(404).json({ message: 'Conversation not found' });

    if (conv.rows[0].type === 'dm') {
      // For DM: delete entirely
      await db.query(`DELETE FROM chat_conversations WHERE id = ?`, [id]);
    } else {
      // For group: remove member
      await db.query(`DELETE FROM chat_members WHERE conversation_id = ? AND user_id = ?`, [id, userId]);
      await db.query(
        `INSERT INTO chat_messages (conversation_id, sender_id, content, message_type) VALUES (?, ?, ?, 'system')`,
        [id, userId, `${req.user.name} left the group`]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('leaveConversation error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTeamMembers,
  getConversations,
  getDmConversation,
  createGroup,
  getMessages,
  sendMessage,
  togglePin,
  deleteMessage,
  toggleReaction,
  markRead,
  getPinnedMessages,
  getMembers,
  addMember,
  removeMember,
  setTyping,
  getTyping,
  getSharedFiles,
  editMessage,
  updateMessage,
  leaveConversation,
};
