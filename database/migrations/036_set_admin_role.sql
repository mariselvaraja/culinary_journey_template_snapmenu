-- Function to set admin role in user metadata
CREATE OR REPLACE FUNCTION set_admin_role(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET raw_user_meta_data = 
    CASE 
      WHEN raw_user_meta_data IS NULL THEN 
        jsonb_build_object('role', 'admin')
      ELSE 
        raw_user_meta_data || jsonb_build_object('role', 'admin')
    END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION set_admin_role TO authenticated;

-- Set admin role for all existing users (you can modify this to target specific users)
DO $$ 
DECLARE 
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users
  LOOP
    PERFORM set_admin_role(user_record.id);
  END LOOP;
END $$;

-- Verify the changes
SELECT id, email, raw_user_meta_data
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'admin';
