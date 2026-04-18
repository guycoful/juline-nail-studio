-- Atomic credit deduction - returns true if successful
CREATE OR REPLACE FUNCTION public.deduct_jn_credit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  rows_updated INTEGER;
BEGIN
  UPDATE public.jn_profiles
  SET credits_balance = credits_balance - 1
  WHERE id = p_user_id AND credits_balance > 0;

  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  RETURN rows_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic credit addition (for payments)
CREATE OR REPLACE FUNCTION public.add_jn_credits(p_user_id UUID, p_amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.jn_profiles
  SET credits_balance = credits_balance + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
