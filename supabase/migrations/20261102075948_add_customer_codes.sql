ALTER TABLE public.customers
  ADD COLUMN IF NOT EXISTS customer_code TEXT;

WITH legacy_codes AS (
  SELECT
    id,
    CASE
      WHEN btrim(COALESCE(tax_identification_no, '')) ~ '^[0-9]{13}$'
        THEN btrim(tax_identification_no)
      WHEN remarks ~ '^CUSTOMER_ID:([0-9]{13})'
        THEN substring(remarks FROM '^CUSTOMER_ID:([0-9]{13})')
      ELSE NULL
    END AS legacy_code
  FROM public.customers
),
ranked_codes AS (
  SELECT
    id,
    legacy_code,
    row_number() OVER (
      PARTITION BY legacy_code
      ORDER BY id
    ) AS duplicate_number
  FROM legacy_codes
  WHERE legacy_code IS NOT NULL
)
UPDATE public.customers AS customer
SET customer_code = ranked_codes.legacy_code
FROM ranked_codes
WHERE customer.id = ranked_codes.id
  AND ranked_codes.duplicate_number = 1;

CREATE SEQUENCE IF NOT EXISTS public.customer_code_seq AS BIGINT;
GRANT USAGE, SELECT ON SEQUENCE public.customer_code_seq TO authenticated, service_role;

SELECT setval(
  'public.customer_code_seq',
  GREATEST(
    COALESCE(MAX(customer_code::BIGINT), 1000000000000),
    1000000000000
  ),
  true
)
FROM public.customers
WHERE customer_code ~ '^[0-9]{13}$';

UPDATE public.customers
SET customer_code = lpad(nextval('public.customer_code_seq')::TEXT, 13, '0')
WHERE customer_code IS NULL OR btrim(customer_code) = '';

ALTER TABLE public.customers
  ALTER COLUMN customer_code SET NOT NULL;

ALTER TABLE public.customers
  ADD CONSTRAINT customers_customer_code_format_check
  CHECK (customer_code ~ '^[0-9]{13}$');

CREATE UNIQUE INDEX IF NOT EXISTS customers_customer_code_key
  ON public.customers (customer_code);

CREATE OR REPLACE FUNCTION public.assign_customer_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.customer_code IS NULL OR btrim(NEW.customer_code) = '' THEN
    NEW.customer_code := lpad(nextval('public.customer_code_seq')::TEXT, 13, '0');
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_customer_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.assign_customer_code() TO authenticated, service_role;

CREATE TRIGGER customers_assign_customer_code
  BEFORE INSERT OR UPDATE OF customer_code
  ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_customer_code();