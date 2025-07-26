-- Grant execute permissions on the RPC function to authenticated users
GRANT EXECUTE ON FUNCTION public.rpc_get_insights(uuid) TO authenticated;