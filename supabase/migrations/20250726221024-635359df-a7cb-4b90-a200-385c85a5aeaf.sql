-- Create function to get fixture difficulty data from the "PL FDR INT" table
CREATE OR REPLACE FUNCTION public.get_fixture_difficulty_data()
RETURNS TABLE(
  team text,
  gw1 bigint, gw2 bigint, gw3 bigint, gw4 bigint, gw5 bigint,
  gw6 bigint, gw7 bigint, gw8 bigint, gw9 bigint, gw10 bigint,
  gw11 bigint, gw12 bigint, gw13 bigint, gw14 bigint, gw15 bigint,
  gw16 bigint, gw17 bigint, gw18 bigint, gw19 bigint, gw20 bigint,
  gw21 bigint, gw22 bigint, gw23 bigint, gw24 bigint, gw25 bigint,
  gw26 bigint, gw27 bigint, gw28 bigint, gw29 bigint, gw30 bigint,
  gw31 bigint, gw32 bigint, gw33 bigint, gw34 bigint, gw35 bigint,
  gw36 bigint, gw37 bigint, gw38 bigint
)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
  SELECT 
    "TEAM" as team,
    "GW1" as gw1, "GW2" as gw2, "GW3" as gw3, "GW4" as gw4, "GW5" as gw5,
    "GW6" as gw6, "GW7" as gw7, "GW8" as gw8, "GW9" as gw9, "GW10" as gw10,
    "GW11" as gw11, "GW12" as gw12, "GW13" as gw13, "GW14" as gw14, "GW15" as gw15,
    "GW16" as gw16, "GW17" as gw17, "GW18" as gw18, "GW19" as gw19, "GW20" as gw20,
    "GW21" as gw21, "GW22" as gw22, "GW23" as gw23, "GW24" as gw24, "GW25" as gw25,
    "GW26" as gw26, "GW27" as gw27, "GW28" as gw28, "GW29" as gw29, "GW30" as gw30,
    "GW31" as gw31, "GW32" as gw32, "GW33" as gw33, "GW34" as gw34, "GW35" as gw35,
    "GW36" as gw36, "GW37" as gw37, "GW38" as gw38
  FROM "PL FDR INT"
  ORDER BY "TEAM";
$function$