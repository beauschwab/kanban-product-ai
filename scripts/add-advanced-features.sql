-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info', -- info, success, warning, error
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create time tracking table
CREATE TABLE IF NOT EXISTS time_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  agent_id INTEGER NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  duration_minutes INTEGER,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents (id) ON DELETE CASCADE
);

-- Create task comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
);

-- Create project metrics table
CREATE TABLE IF NOT EXISTS project_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  metric_name TEXT NOT NULL,
  metric_value REAL NOT NULL,
  metric_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_agent_id ON time_entries(agent_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_project_metrics_date ON project_metrics(metric_date);

-- Insert sample notifications
INSERT OR IGNORE INTO notifications (user_id, title, message, type, action_url) VALUES 
  ('sarah.chen@company.com', 'New Task Assigned', 'You have been assigned to "Design System Update"', 'info', '/task/1'),
  ('mike.johnson@company.com', 'Task Due Soon', 'API Integration task is due in 2 days', 'warning', '/task/2'),
  ('alex.rodriguez@company.com', 'Task Completed', 'User Authentication has been moved to Done', 'success', '/task/3'),
  ('emma.wilson@company.com', 'High Priority Issue', 'New critical bug reported in login system', 'error', '/issues');

-- Insert sample time entries
INSERT OR IGNORE INTO time_entries (task_id, agent_id, start_time, end_time, duration_minutes, description) VALUES 
  (1, 1, '2024-01-15 09:00:00', '2024-01-15 11:30:00', 150, 'Initial design system research and planning'),
  (1, 1, '2024-01-15 14:00:00', '2024-01-15 17:00:00', 180, 'Component library updates'),
  (2, 2, '2024-01-14 10:00:00', '2024-01-14 12:00:00', 120, 'API endpoint development'),
  (3, 3, '2024-01-13 09:30:00', '2024-01-13 16:30:00', 420, 'OAuth implementation and testing');

-- Insert sample comments
INSERT OR IGNORE INTO task_comments (task_id, author, content) VALUES 
  (1, 'Sarah Chen', 'Started working on the component updates. The new brand guidelines look great!'),
  (1, 'Mike Johnson', 'Let me know if you need help with the React components.'),
  (2, 'Mike Johnson', 'API integration is progressing well. Should be ready for testing tomorrow.'),
  (3, 'Alex Rodriguez', 'OAuth implementation complete. Running final security tests.');

-- Insert sample metrics
INSERT OR IGNORE INTO project_metrics (metric_name, metric_value, metric_date) VALUES 
  ('tasks_completed', 12, '2024-01-15'),
  ('tasks_created', 8, '2024-01-15'),
  ('average_completion_time', 2.5, '2024-01-15'),
  ('team_velocity', 15, '2024-01-15'),
  ('bug_resolution_rate', 85.5, '2024-01-15');
