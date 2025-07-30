-- Create kanban database tables
CREATE TABLE IF NOT EXISTS columns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  position INTEGER NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  column_id INTEGER NOT NULL,
  position INTEGER NOT NULL,
  priority TEXT DEFAULT 'medium',
  assignee TEXT,
  due_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (column_id) REFERENCES columns (id) ON DELETE CASCADE
);

-- Insert default columns
INSERT OR IGNORE INTO columns (id, title, position, color) VALUES 
  (1, 'Backlog', 0, '#64748b'),
  (2, 'In Progress', 1, '#f59e0b'),
  (3, 'Review', 2, '#8b5cf6'),
  (4, 'Done', 3, '#10b981');

-- Insert sample tasks
INSERT OR IGNORE INTO tasks (title, description, column_id, position, priority, assignee) VALUES 
  ('Design System Update', 'Update the design system components with new brand guidelines', 1, 0, 'high', 'Sarah Chen'),
  ('API Integration', 'Integrate third-party payment API for checkout process', 1, 1, 'medium', 'Mike Johnson'),
  ('User Authentication', 'Implement OAuth 2.0 authentication system', 2, 0, 'high', 'Alex Rodriguez'),
  ('Database Migration', 'Migrate user data to new database schema', 2, 1, 'medium', 'Sarah Chen'),
  ('Code Review', 'Review pull request for new feature implementation', 3, 0, 'low', 'Mike Johnson'),
  ('Deploy to Production', 'Deploy latest changes to production environment', 4, 0, 'high', 'Alex Rodriguez');
