import { NextApiRequest, NextApiResponse } from 'next';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';
import fs from 'fs';

let db: Database | null = null;

async function openDb() {
  if (!db) {
    try {
      const dbPath = path.resolve('./itaudit.sqlite');
      console.log('Attempting to open database at:', dbPath);
      
      // Check if the file exists
      if (!fs.existsSync(dbPath)) {
        console.log('Database file does not exist. It will be created.');
      } else {
        console.log('Database file already exists.');
      }

      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      console.log('Database opened successfully');

      await db.exec(`
        CREATE TABLE IF NOT EXISTS computers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          ipAddress TEXT,
          cpu TEXT,
          ram TEXT,
          storage TEXT,
          printer TEXT,
          users TEXT,
          teamviewerId TEXT,
          antivirus TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          computerId INTEGER,
          content TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (computerId) REFERENCES computers(id)
        );

        CREATE TABLE IF NOT EXISTS network_devices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          ipAddress TEXT,
          type TEXT,
          model TEXT,
          location TEXT,
          managementUrl TEXT,
          notes TEXT
        );

        CREATE TABLE IF NOT EXISTS network_device_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          deviceId INTEGER,
          content TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (deviceId) REFERENCES network_devices(id)
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT,
          phone TEXT,
          workstationName TEXT
        );

        CREATE TABLE IF NOT EXISTS site_content (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          key TEXT UNIQUE,
          value TEXT
        );

        CREATE TABLE IF NOT EXISTS auth_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          password TEXT,
          role TEXT
        );

        INSERT OR IGNORE INTO site_content (key, value) VALUES 
        ('welcome_message', 'Welcome to IT Audit'),
        ('audit_start_date', '9/28/2024'),
        ('audit_company', 'Medstuff');

        INSERT OR IGNORE INTO auth_users (username, password, role) VALUES 
        ('admin', 'p@ssw0rd', 'admin');
      `);
      console.log('Tables created or already exist');
    } catch (error) {
      console.error('Error opening database:', error);
      throw error;
    }
  }
  return db;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'POST') {
      const { action, data, id, comment } = req.body;  // Extract comment here
      console.log('Received action:', action, 'with data:', data);
      
      const db = await openDb();

      switch (action) {
        case 'addComputer':
          try {
            const { name, ipAddress, cpu, ram, storage, printer, users, teamviewerId, antivirus, notes } = data;
            const result = await db.run(
              'INSERT INTO computers (name, ipAddress, cpu, ram, storage, printer, users, teamviewerId, antivirus, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
              [name, ipAddress, cpu, ram, storage, printer, users, teamviewerId, antivirus, notes]
            );
            console.log('Insert result:', result);
            res.status(200).json({ message: 'Computer added successfully', id: result.lastID });
          } catch (error: unknown) {
            console.error('Error adding computer:', error);
            res.status(500).json({ message: 'Error adding computer', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getComputers':
          try {
            console.log('Fetching computers...');
            const computers = await db.all('SELECT * FROM computers');
            console.log('Retrieved computers:', computers);
            res.status(200).json(computers);
          } catch (error: unknown) {
            console.error('Error getting computers:', error);
            res.status(500).json({ message: 'Error getting computers', error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
          }
          break;

        case 'updateComputer':
          try {
            const { id, ...updateData } = data;
            const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const updateValues = Object.values(updateData);
            const result = await db.run(
              `UPDATE computers SET ${updateFields} WHERE id = ?`,
              [...updateValues, id]
            );
            console.log('Update result:', result);
            res.status(200).json({ message: 'Computer updated successfully' });
          } catch (error: unknown) {
            console.error('Error updating computer:', error);
            res.status(500).json({ message: 'Error updating computer', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteComputer':
          try {
            const result = await db.run('DELETE FROM computers WHERE id = ?', [id]);
            console.log('Delete result:', result);
            res.status(200).json({ message: 'Computer deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting computer:', error);
            res.status(500).json({ message: 'Error deleting computer', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'addComment':
          try {
            const result = await db.run(
              'INSERT INTO comments (computerId, content, timestamp) VALUES (?, ?, ?)',
              [id, comment, new Date().toISOString()]
            );
            console.log('Add comment result:', result);
            res.status(200).json({ message: 'Comment added successfully' });
          } catch (error: unknown) {
            console.error('Error adding comment:', error);
            res.status(500).json({ message: 'Error adding comment', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getComments':
          try {
            const comments = await db.all('SELECT * FROM comments WHERE computerId = ? ORDER BY timestamp DESC', [id]);
            console.log('Retrieved comments:', comments);
            res.status(200).json(comments);
          } catch (error: unknown) {
            console.error('Error getting comments:', error);
            res.status(500).json({ message: 'Error getting comments', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteComment':
          try {
            const result = await db.run('DELETE FROM comments WHERE id = ?', [id]);
            console.log('Delete comment result:', result);
            res.status(200).json({ message: 'Comment deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting comment:', error);
            res.status(500).json({ message: 'Error deleting comment', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'addNetworkDevice':
          try {
            const { name, ipAddress, type, model, location, managementUrl, notes } = data;
            const result = await db.run(
              'INSERT INTO network_devices (name, ipAddress, type, model, location, managementUrl, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [name, ipAddress, type, model, location, managementUrl, notes]
            );
            console.log('Insert result:', result);
            res.status(200).json({ message: 'Network device added successfully', id: result.lastID });
          } catch (error: unknown) {
            console.error('Error adding network device:', error);
            res.status(500).json({ message: 'Error adding network device', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getNetworkDevices':
          try {
            console.log('Fetching network devices...');
            const devices = await db.all('SELECT * FROM network_devices');
            console.log('Retrieved network devices:', devices);
            res.status(200).json(devices);
          } catch (error: unknown) {
            console.error('Error getting network devices:', error);
            res.status(500).json({ message: 'Error getting network devices', error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
          }
          break;

        case 'updateNetworkDevice':
          try {
            const { id, ...updateData } = data;
            const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const updateValues = Object.values(updateData);
            const result = await db.run(
              `UPDATE network_devices SET ${updateFields} WHERE id = ?`,
              [...updateValues, id]
            );
            console.log('Update network device result:', result);
            res.status(200).json({ message: 'Network device updated successfully' });
          } catch (error: unknown) {
            console.error('Error updating network device:', error);
            res.status(500).json({ message: 'Error updating network device', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteNetworkDevice':
          try {
            const result = await db.run('DELETE FROM network_devices WHERE id = ?', [id]);
            console.log('Delete network device result:', result);
            res.status(200).json({ message: 'Network device deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting network device:', error);
            res.status(500).json({ message: 'Error deleting network device', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getLatestComputersWithComments':
          try {
            const latestComputers = await db.all(`
              SELECT c.id, c.name, c.ipAddress, c.teamviewerId,
                     cm.content as latestComment,
                     cm.timestamp as commentTimestamp
              FROM computers c
              INNER JOIN comments cm ON c.id = cm.computerId
              INNER JOIN (
                SELECT computerId, MAX(timestamp) as maxTimestamp
                FROM comments
                GROUP BY computerId
              ) latest ON cm.computerId = latest.computerId AND cm.timestamp = latest.maxTimestamp
              ORDER BY cm.timestamp DESC
              LIMIT 3
            `);
            console.log('Retrieved latest computers with comments:', latestComputers);
            res.status(200).json(latestComputers);
          } catch (error: unknown) {
            console.error('Error getting latest computers with comments:', error);
            res.status(500).json({ message: 'Error getting latest computers with comments', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'addNetworkDeviceComment':
          try {
            const result = await db.run(
              'INSERT INTO network_device_comments (deviceId, content, timestamp) VALUES (?, ?, ?)',
              [id, comment, new Date().toISOString()]
            );
            console.log('Add network device comment result:', result);
            res.status(200).json({ message: 'Network device comment added successfully' });
          } catch (error: unknown) {
            console.error('Error adding network device comment:', error);
            res.status(500).json({ message: 'Error adding network device comment', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getNetworkDeviceComments':
          try {
            const comments = await db.all('SELECT * FROM network_device_comments WHERE deviceId = ? ORDER BY timestamp DESC', [id]);
            console.log('Retrieved network device comments:', comments);
            res.status(200).json(comments);
          } catch (error: unknown) {
            console.error('Error getting network device comments:', error);
            res.status(500).json({ message: 'Error getting network device comments', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteNetworkDeviceComment':
          try {
            const result = await db.run('DELETE FROM network_device_comments WHERE id = ?', [id]);
            console.log('Delete network device comment result:', result);
            res.status(200).json({ message: 'Network device comment deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting network device comment:', error);
            res.status(500).json({ message: 'Error deleting network device comment', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getLatestNetworkDevicesWithComments':
          try {
            const latestDevices = await db.all(`
              SELECT d.id, d.name, d.ipAddress, d.type,
                     cm.content as latestComment,
                     cm.timestamp as commentTimestamp
              FROM network_devices d
              INNER JOIN network_device_comments cm ON d.id = cm.deviceId
              INNER JOIN (
                SELECT deviceId, MAX(timestamp) as maxTimestamp
                FROM network_device_comments
                GROUP BY deviceId
              ) latest ON cm.deviceId = latest.deviceId AND cm.timestamp = latest.maxTimestamp
              ORDER BY cm.timestamp DESC
              LIMIT 3
            `);
            console.log('Retrieved latest network devices with comments:', latestDevices);
            res.status(200).json(latestDevices);
          } catch (error: unknown) {
            console.error('Error getting latest network devices with comments:', error);
            res.status(500).json({ message: 'Error getting latest network devices with comments', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getComputer':
          try {
            const computer = await db.get('SELECT * FROM computers WHERE id = ?', [id]);
            if (computer) {
              res.status(200).json(computer);
            } else {
              res.status(404).json({ message: 'Computer not found' });
            }
          } catch (error: unknown) {
            console.error('Error getting computer:', error);
            res.status(500).json({ message: 'Error getting computer', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getNetworkDevice':
          try {
            const device = await db.get('SELECT * FROM network_devices WHERE id = ?', [id]);
            if (device) {
              res.status(200).json(device);
            } else {
              res.status(404).json({ message: 'Network device not found' });
            }
          } catch (error: unknown) {
            console.error('Error getting network device:', error);
            res.status(500).json({ message: 'Error getting network device', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getTotalComputers':
          try {
            const result = await db.get('SELECT COUNT(*) as total FROM computers');
            res.status(200).json({ total: result.total });
          } catch (error: unknown) {
            console.error('Error getting total computers:', error);
            res.status(500).json({ message: 'Error getting total computers', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getTotalNetworkDevices':
          try {
            const result = await db.get('SELECT COUNT(*) as total FROM network_devices');
            res.status(200).json({ total: result.total });
          } catch (error: unknown) {
            console.error('Error getting total network devices:', error);
            res.status(500).json({ message: 'Error getting total network devices', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'addUser':
          try {
            const { name, email, phone, workstationName } = data;
            const result = await db.run(
              'INSERT INTO users (name, email, phone, workstationName) VALUES (?, ?, ?, ?)',
              [name, email, phone, workstationName]
            );
            console.log('Insert user result:', result);
            res.status(200).json({ message: 'User added successfully', id: result.lastID });
          } catch (error: unknown) {
            console.error('Error adding user:', error);
            res.status(500).json({ message: 'Error adding user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getUsers':
          try {
            const users = await db.all('SELECT * FROM users');
            console.log('Retrieved users:', users);
            res.status(200).json(users);
          } catch (error: unknown) {
            console.error('Error getting users:', error);
            res.status(500).json({ message: 'Error getting users', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getTotalUsers':
          try {
            const result = await db.get('SELECT COUNT(*) as total FROM users');
            res.status(200).json({ total: result.total });
          } catch (error: unknown) {
            console.error('Error getting total users:', error);
            res.status(500).json({ message: 'Error getting total users', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getSiteContent':
          try {
            const content = await db.all('SELECT * FROM site_content');
            res.status(200).json(content);
          } catch (error: unknown) {
            console.error('Error getting site content:', error);
            res.status(500).json({ message: 'Error getting site content', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'updateSiteContent':
          try {
            const { key, value } = data;
            await db.run('UPDATE site_content SET value = ? WHERE key = ?', [value, key]);
            res.status(200).json({ message: 'Site content updated successfully' });
          } catch (error: unknown) {
            console.error('Error updating site content:', error);
            res.status(500).json({ message: 'Error updating site content', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'updateUser':
          try {
            const { id, ...updateData } = data;
            const updateFields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const updateValues = Object.values(updateData);
            const result = await db.run(
              `UPDATE users SET ${updateFields} WHERE id = ?`,
              [...updateValues, id]
            );
            console.log('Update user result:', result);
            res.status(200).json({ message: 'User updated successfully' });
          } catch (error: unknown) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Error updating user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteUser':
          try {
            const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
            console.log('Delete user result:', result);
            res.status(200).json({ message: 'User deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Error deleting user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'getAuthUsers':
          try {
            const users = await db.all('SELECT id, username, role FROM auth_users');
            res.status(200).json(users);
          } catch (error: unknown) {
            console.error('Error getting auth users:', error);
            res.status(500).json({ message: 'Error getting auth users', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'addAuthUser':
          try {
            const { username, password, role } = data;
            const result = await db.run(
              'INSERT INTO auth_users (username, password, role) VALUES (?, ?, ?)',
              [username, password, role]
            );
            res.status(200).json({ message: 'Auth user added successfully', id: result.lastID });
          } catch (error: unknown) {
            console.error('Error adding auth user:', error);
            res.status(500).json({ message: 'Error adding auth user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'updateAuthUser':
          try {
            const { id, username, password, role } = data;
            await db.run(
              'UPDATE auth_users SET username = ?, password = ?, role = ? WHERE id = ?',
              [username, password, role, id]
            );
            res.status(200).json({ message: 'Auth user updated successfully' });
          } catch (error: unknown) {
            console.error('Error updating auth user:', error);
            res.status(500).json({ message: 'Error updating auth user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'deleteAuthUser':
          try {
            await db.run('DELETE FROM auth_users WHERE id = ?', [id]);
            res.status(200).json({ message: 'Auth user deleted successfully' });
          } catch (error: unknown) {
            console.error('Error deleting auth user:', error);
            res.status(500).json({ message: 'Error deleting auth user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        case 'verifyUser':
          try {
            const { username, password } = data;
            const user = await db.get('SELECT * FROM auth_users WHERE username = ?', [username]);
            if (user && user.password === password) {
              res.status(200).json({ success: true, role: user.role });
            } else {
              res.status(401).json({ success: false, message: 'Invalid username or password' });
            }
          } catch (error: unknown) {
            console.error('Error verifying user:', error);
            res.status(500).json({ message: 'Error verifying user', error: error instanceof Error ? error.message : 'Unknown error' });
          }
          break;

        default:
          res.status(400).json({ message: 'Invalid action' });
      }
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: unknown) {
    console.error('Unhandled error in API route:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
  }
}