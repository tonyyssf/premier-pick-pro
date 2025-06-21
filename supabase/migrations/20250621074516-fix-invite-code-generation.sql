
-- Update the generate_invite_code function to ensure consistent uppercase codes
CREATE OR REPLACE FUNCTION generate_invite_code() 
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric code and ensure it's uppercase
    code := upper(substr(replace(encode(gen_random_bytes(6), 'base64'), '/', '1'), 1, 6));
    
    -- Replace any special characters that might slip through
    code := regexp_replace(code, '[^A-Z0-9]', '0', 'g');
    
    -- Ensure we have exactly 6 characters
    code := lpad(code, 6, '0');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM leagues WHERE invite_code = code) INTO exists_check;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;
