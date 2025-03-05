
-- Function to get user notifications
CREATE OR REPLACE FUNCTION get_user_notifications(p_days integer, p_user_id uuid)
RETURNS SETOF notifications
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT *
  FROM notifications
  WHERE user_id = p_user_id
    AND created_at >= (now() - (p_days || ' days')::interval)
  ORDER BY created_at DESC;
$$;

-- Function to mark a notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false;
  
  RETURN true;
END;
$$;

-- Function to create a notification
CREATE OR REPLACE FUNCTION create_notification(
  p_title text,
  p_description text,
  p_severity text,
  p_category text,
  p_read boolean,
  p_user_id uuid,
  p_link text DEFAULT NULL,
  p_related_id uuid DEFAULT NULL
)
RETURNS notifications
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification notifications;
BEGIN
  INSERT INTO notifications (
    title,
    description,
    severity,
    category,
    read,
    user_id,
    link,
    related_id,
    created_at
  ) VALUES (
    p_title,
    p_description,
    p_severity,
    p_category,
    p_read,
    p_user_id,
    p_link,
    p_related_id,
    now()
  )
  RETURNING * INTO v_notification;
  
  RETURN v_notification;
END;
$$;

-- Function to delete old notifications
CREATE OR REPLACE FUNCTION delete_old_notifications(p_days integer, p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = p_user_id
    AND created_at < (now() - (p_days || ' days')::interval);
  
  RETURN true;
END;
$$;

-- Function to count unread notifications
CREATE OR REPLACE FUNCTION count_unread_notifications(p_user_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
$$;

-- Function to insert a job run
CREATE OR REPLACE FUNCTION insert_job_run(
  p_job_id uuid,
  p_status text,
  p_user_id uuid
)
RETURNS job_runs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_job_run job_runs;
BEGIN
  INSERT INTO job_runs (
    job_id,
    status,
    started_at,
    user_id
  ) VALUES (
    p_job_id,
    p_status,
    now(),
    p_user_id
  )
  RETURNING * INTO v_job_run;
  
  RETURN v_job_run;
END;
$$;

-- Function to update job run to success
CREATE OR REPLACE FUNCTION update_job_run_success(
  p_run_id uuid,
  p_rows_processed integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE job_runs
  SET 
    status = 'Success',
    completed_at = now(),
    rows_processed = p_rows_processed
  WHERE id = p_run_id;
  
  RETURN FOUND;
END;
$$;

-- Function to update job run to failed
CREATE OR REPLACE FUNCTION update_job_run_failed(
  p_run_id uuid,
  p_error_message text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE job_runs
  SET 
    status = 'Failed',
    completed_at = now(),
    error_message = p_error_message
  WHERE id = p_run_id;
  
  RETURN FOUND;
END;
$$;
