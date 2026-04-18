-- Juline: Payment transactions
CREATE TABLE IF NOT EXISTS public.jn_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'purchase',
  credits_amount INTEGER NOT NULL,
  amount_agorot INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  grow_transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jn_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own transactions"
  ON public.jn_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE TRIGGER jn_transactions_updated_at
  BEFORE UPDATE ON public.jn_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_jn_updated_at();
