DROP POLICY IF EXISTS proc_trade_categories_all ON public.proc_trade_categories;
DROP POLICY IF EXISTS proc_trade_categories_read ON public.proc_trade_categories;
DROP POLICY IF EXISTS proc_trade_categories_insert_admin ON public.proc_trade_categories;
DROP POLICY IF EXISTS proc_trade_categories_update_admin ON public.proc_trade_categories;
DROP POLICY IF EXISTS proc_trade_categories_delete_admin ON public.proc_trade_categories;

CREATE POLICY proc_trade_categories_read ON public.proc_trade_categories
  FOR SELECT TO authenticated
  USING (public.is_staff_user());

CREATE POLICY proc_trade_categories_insert_admin ON public.proc_trade_categories
  FOR INSERT TO authenticated
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY proc_trade_categories_update_admin ON public.proc_trade_categories
  FOR UPDATE TO authenticated
  USING (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'))
  WITH CHECK (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));

CREATE POLICY proc_trade_categories_delete_admin ON public.proc_trade_categories
  FOR DELETE TO authenticated
  USING (public.get_current_user_role() IN ('ADMIN', 'SUPER_ADMIN'));