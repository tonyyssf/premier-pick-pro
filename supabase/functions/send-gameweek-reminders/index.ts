
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Gameweek reminders function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the current gameweek
    const { data: currentGameweek, error: gameweekError } = await supabase
      .from('gameweeks')
      .select('*')
      .eq('is_current', true)
      .single();

    if (gameweekError || !currentGameweek) {
      console.log('No current gameweek found or error:', gameweekError);
      return new Response(
        JSON.stringify({ message: 'No current gameweek found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const deadline = new Date(currentGameweek.deadline);
    const timeUntilDeadline = deadline.getTime() - now.getTime();
    const hoursUntilDeadline = timeUntilDeadline / (1000 * 60 * 60);

    console.log(`Current gameweek: ${currentGameweek.number}, deadline: ${deadline}, hours until: ${hoursUntilDeadline}`);

    // Only send reminders if deadline is within 2-24 hours
    if (hoursUntilDeadline < 2 || hoursUntilDeadline > 24) {
      console.log(`Not sending reminders - deadline is ${hoursUntilDeadline} hours away`);
      return new Response(
        JSON.stringify({ message: `Deadline is ${hoursUntilDeadline.toFixed(1)} hours away - no reminders sent` }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all users who have SMS reminders enabled and haven't received a reminder for this gameweek
    const { data: usersToRemind, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        phone_number,
        country_code,
        sms_reminders_enabled
      `)
      .eq('sms_reminders_enabled', true)
      .not('phone_number', 'is', null)
      .not('phone_number', 'eq', '');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!usersToRemind || usersToRemind.length === 0) {
      console.log('No users with SMS reminders enabled found');
      return new Response(
        JSON.stringify({ message: 'No users with SMS reminders enabled found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${usersToRemind.length} users with SMS reminders enabled`);

    // Filter out users who already received a reminder for this gameweek
    const { data: alreadySent, error: sentError } = await supabase
      .from('sms_reminders')
      .select('user_id')
      .eq('gameweek_id', currentGameweek.id);

    if (sentError) {
      console.error('Error checking sent reminders:', sentError);
    }

    const sentUserIds = new Set(alreadySent?.map(r => r.user_id) || []);
    const usersNeedingReminders = usersToRemind.filter(user => !sentUserIds.has(user.id));

    console.log(`${usersNeedingReminders.length} users need reminders (${sentUserIds.size} already sent)`);

    if (usersNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({ message: 'All eligible users have already received reminders for this gameweek' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format deadline time for display
    const deadlineFormatted = deadline.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    let successCount = 0;
    let errorCount = 0;

    // Send SMS reminders to each user
    for (const user of usersNeedingReminders) {
      try {
        console.log(`Sending SMS reminder to user ${user.id} at ${user.country_code}${user.phone_number}`);

        // Call the send-sms-reminder function
        const { error: smsError } = await supabase.functions.invoke('send-sms-reminder', {
          body: {
            userId: user.id,
            gameweekId: currentGameweek.id,
            phoneNumber: user.phone_number,
            countryCode: user.country_code || '+1',
            gameweekNumber: currentGameweek.number,
            deadlineTime: deadlineFormatted
          }
        });

        if (smsError) {
          console.error(`Error sending SMS to user ${user.id}:`, smsError);
          errorCount++;
        } else {
          console.log(`SMS sent successfully to user ${user.id}`);
          successCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`Error processing user ${user.id}:`, error);
        errorCount++;
      }
    }

    const result = {
      message: `SMS reminders processed for gameweek ${currentGameweek.number}`,
      gameweek: currentGameweek.number,
      deadline: deadlineFormatted,
      hoursUntilDeadline: Math.round(hoursUntilDeadline * 10) / 10,
      totalEligible: usersNeedingReminders.length,
      successCount,
      errorCount
    };

    console.log('Reminder process completed:', result);

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in gameweek reminders function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
