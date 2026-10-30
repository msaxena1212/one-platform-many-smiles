revoke all
on function public.post_accounting_event_atomic(uuid)
from public;

revoke all
on function public.post_accounting_event_atomic(uuid)
from anon;

revoke all
on function public.post_accounting_event_atomic(uuid)
from authenticated;

grant execute
on function public.post_accounting_event_atomic(uuid)
to service_role;