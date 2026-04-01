-- RPC function to batch-update habit sort_order in a single call
CREATE OR REPLACE FUNCTION update_habit_sort_orders(updates jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE habits h
  SET sort_order = (u->>'sortOrder')::int
  FROM jsonb_array_elements(updates) AS u
  WHERE h.id = (u->>'id')::uuid
    AND h.user_id = auth.uid();
END;
$$;
