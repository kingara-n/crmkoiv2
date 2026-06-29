-- Rename priority to department in koi_tasks
ALTER TABLE koi_tasks RENAME COLUMN priority TO department;

-- Drop the user_id foreign key constraint from notifications
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
