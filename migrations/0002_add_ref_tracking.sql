-- Add referral tracking column
ALTER TABLE results ADD COLUMN ref_id TEXT;
CREATE INDEX idx_results_ref_id ON results(ref_id);
