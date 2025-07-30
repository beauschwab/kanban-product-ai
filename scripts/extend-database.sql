-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'developer',
  status TEXT DEFAULT 'available',
  current_workload INTEGER DEFAULT 0,
  max_workload INTEGER DEFAULT 5,
  skills TEXT, -- JSON array of skills
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create issues table (from SharePoint)
CREATE TABLE IF NOT EXISTS issues (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sharepoint_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  category TEXT,
  reporter TEXT,
  reported_date DATE,
  affected_system TEXT,
  reproduction_steps TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  status TEXT DEFAULT 'new',
  selected_for_kanban BOOLEAN DEFAULT FALSE,
  kanban_task_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kanban_task_id) REFERENCES tasks (id) ON DELETE SET NULL
);

-- Create agent assignments table
CREATE TABLE IF NOT EXISTS agent_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id INTEGER NOT NULL,
  task_id INTEGER NOT NULL,
  assigned_by TEXT DEFAULT 'coordinator',
  assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Create file diffs table
CREATE TABLE IF NOT EXISTS file_diffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  old_content TEXT,
  new_content TEXT,
  diff_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Insert sample agents
INSERT OR IGNORE INTO agents (name, email, role, skills) VALUES 
  ('Sarah Chen', 'sarah.chen@company.com', 'senior_developer', '["React", "TypeScript", "Node.js", "Database"]'),
  ('Mike Johnson', 'mike.johnson@company.com', 'developer', '["JavaScript", "Python", "API Integration"]'),
  ('Alex Rodriguez', 'alex.rodriguez@company.com', 'lead_developer', '["System Architecture", "DevOps", "Security"]'),
  ('Emma Wilson', 'emma.wilson@company.com', 'developer', '["Frontend", "UI/UX", "Testing"]'),
  ('Coordinator Bot', 'coordinator@company.com', 'coordinator', '["Task Assignment", "Workload Management"]');

-- Insert sample issues from SharePoint
INSERT OR IGNORE INTO issues (sharepoint_id, title, description, severity, category, reporter, reported_date, affected_system, reproduction_steps, expected_behavior, actual_behavior) VALUES 
  ('SP-001', 'Login page not responsive on mobile', 'Users cannot login on mobile devices due to layout issues', 'high', 'UI/UX', 'John Doe', '2024-01-15', 'Authentication System', '1. Open app on mobile\n2. Navigate to login\n3. Try to enter credentials', 'Login form should be fully functional on mobile', 'Form elements are overlapping and unusable'),
  ('SP-002', 'API timeout on large data requests', 'API calls timeout when requesting large datasets', 'medium', 'Backend', 'Jane Smith', '2024-01-14', 'Data API', '1. Make API call with >1000 records\n2. Wait for response', 'API should return data within 30 seconds', 'Request times out after 10 seconds'),
  ('SP-003', 'Memory leak in dashboard component', 'Dashboard component causes memory usage to increase over time', 'high', 'Performance', 'Bob Wilson', '2024-01-13', 'Dashboard', '1. Open dashboard\n2. Leave open for 30+ minutes\n3. Monitor memory usage', 'Memory usage should remain stable', 'Memory usage increases continuously'),
  ('SP-004', 'Incorrect date formatting in reports', 'Date fields show wrong format in generated reports', 'low', 'Reports', 'Alice Brown', '2024-01-12', 'Reporting System', '1. Generate any report\n2. Check date fields', 'Dates should show in MM/DD/YYYY format', 'Dates show in YYYY-MM-DD format'),
  ('SP-005', 'File upload fails for large files', 'Cannot upload files larger than 10MB', 'medium', 'File Management', 'Tom Davis', '2024-01-11', 'File Upload Service', '1. Try to upload file >10MB\n2. Submit form', 'File should upload successfully', 'Upload fails with generic error message');

-- Insert sample file diffs
INSERT OR IGNORE INTO file_diffs (task_id, file_path, old_content, new_content, diff_content) VALUES 
  (1, 'components/auth/LoginForm.tsx', 'const LoginForm = () => {\n  return (\n    <div className="login-form">\n      <input type="email" />\n      <input type="password" />\n    </div>\n  );\n};', 'const LoginForm = () => {\n  return (\n    <div className="login-form responsive">\n      <input type="email" className="mobile-friendly" />\n      <input type="password" className="mobile-friendly" />\n    </div>\n  );\n};', '@@ -2,6 +2,6 @@\n   return (\n-    <div className="login-form">\n-      <input type="email" />\n-      <input type="password" />\n+    <div className="login-form responsive">\n+      <input type="email" className="mobile-friendly" />\n+      <input type="password" className="mobile-friendly" />\n     </div>'),
  (2, 'api/data/controller.ts', 'export const getData = async (req: Request) => {\n  const data = await db.query("SELECT * FROM large_table");\n  return data;\n};', 'export const getData = async (req: Request) => {\n  const data = await db.query("SELECT * FROM large_table LIMIT 100");\n  return data;\n};', '@@ -1,3 +1,3 @@\n export const getData = async (req: Request) => {\n-  const data = await db.query("SELECT * FROM large_table");\n+  const data = await db.query("SELECT * FROM large_table LIMIT 100");\n   return data;');
