
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

    // Get the first fixture kickoff time for this gameweek
    const { data: firstFixture, error: fixtureError } = await supabase
      .from('fixtures')
      .select('kickoff_time')
      .eq('gameweek_id', currentGameweek.id)
      .order('kickoff_time', { ascending: true })
      .limit(1)
      .single();

    if (fixtureError || !firstFixture) {
      console.log('No fixtures found for current gameweek:', fixtureError);
      return new Response(
        JSON.stringify({ message: 'No fixtures found for current gameweek' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date();
    const firstFixtureTime = new Date(firstFixture.kickoff_time);
    const timeUntilFirstFixture = firstFixtureTime.getTime() - now.getTime();
    const hoursUntilFirstFixture = timeUntilFirstFixture / (1000 * 60 * 60);

    console.log(`Current gameweek: ${currentGameweek.number}, first fixture: ${firstFixtureTime}, hours until: ${hoursUntilFirstFixture}`);

    // Check if first fixture has already started
    if (hoursUntilFirstFixture <= 0) {
      console.log('First fixture has already started - no reminders needed');
      return new Response(
        JSON.stringify({ message: 'First fixture has already started - no reminders needed' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only send reminders if we're within the reminder windows (24 hours or 1 hour before first fixture)
    const isOneDayWindow = hoursUntilFirstFixture <= 25 && hoursUntilFirstFixture > 23; // 1 day window (23-25 hours)
    const isOneHourWindow = hoursUntilFirstFixture <= 1.5 && hoursUntilFirstFixture > 0.5; // 1 hour window (0.5-1.5 hours)

    if (!isOneDayWindow && !isOneHourWindow) {
      console.log(`Not in reminder window - first fixture is ${hoursUntilFirstFixture.toFixed(1)} hours away`);
      return new Response(
        JSON.stringify({ 
          message: `Not in reminder window - first fixture is ${hoursUntilFirstFixture.toFixed(1)} hours away`,
          reminderWindows: {
            oneDayWindow: '23-25 hours before first fixture',
            oneHourWindow: '0.5-1.5 hours before first fixture'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reminderType = isOneDayWindow ? 'one_day' : 'one_hour';
    console.log(`In ${reminderType} reminder window`);

    // Get all users who have SMS reminders enabled
    const { data: usersWithSMS, error: usersError } = await supabase
      .from('profiles')
      .select('id, phone_number, country_code')
      .eq('sms_reminders_enabled', true)
      .not('phone_number', 'is', null)
      .not('phone_number', 'eq', '');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!usersWithSMS || usersWithSMS.length === 0) {
      console.log('No users with SMS reminders enabled found');
      return new Response(
        JSON.stringify({ message: 'No users with SMS reminders enabled found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${usersWithSMS.length} users with SMS reminders enabled`);

    // Get users who have already made picks for this gameweek
    const { data: usersWithPicks, error: picksError } = await supabase
      .from('user_picks')
      .select('user_id')
      .eq('gameweek_id', currentGameweek.id);

    if (picksError) {
      console.error('Error fetching user picks:', picksError);
    }

    const userIdsWithPicks = new Set(usersWithPicks?.map(pick => pick.user_id) || []);
    
    // Filter to only users who haven't made picks yet
    const usersNeedingReminders = usersWithSMS.filter(user => !userIdsWithPicks.has(user.id));

    console.log(`${usersNeedingReminders.length} users need reminders (${userIdsWithPicks.size} already made picks)`);

    if (usersNeedingReminders.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'All users with SMS enabled have already made their picks for this gameweek',
          totalUsersWithSMS: usersWithSMS.length,
          usersWithPicks: userIdsWithPicks.size
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check which users already received reminders for this gameweek and reminder type
    const { data: alreadySent, error: sentError } = await supabase
      .from('sms_reminders')
      .select('user_id, message_content')
      .eq('gameweek_id', currentGameweek.id);

    if (sentError) {
      console.error('Error checking sent reminders:', sentError);
    }

    // Filter out users who already received this type of reminder
    const sentUserIds = new Set();
    alreadySent?.forEach(reminder => {
      // Check if this reminder was for the same time window based on message content
      const isOneDayReminder = reminder.message_content.includes('1 day') || reminder.message_content.includes('24 hour');
      const isOneHourReminder = reminder.message_content.includes('1 hour') || reminder.message_content.includes('soon');
      
      if ((reminderType === 'one_day' && isOneDayReminder) || 
          (reminderType === 'one_hour' && isOneHourReminder)) {
        sentUserIds.add(reminder.user_id);
      }
    });

    const finalUsersToRemind = usersNeedingReminders.filter(user => !sentUserIds.has(user.id));

    console.log(`${finalUsersToRemind.length} users need ${reminderType} reminders (${sentUserIds.size} already received this type)`);

    if (finalUsersToRemind.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: `All eligible users have already received ${reminderType} reminders for this gameweek`,
          reminderType,
          totalEligible: usersNeedingReminders.length,
          alreadySent: sentUserIds.size
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format time for display
    const timeFormatted = firstFixtureTime.toLocaleString('en-US', {
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
    for (const user of finalUsersToRemind) {
      try {
        console.log(`Sending ${reminderType} SMS reminder to user ${user.id} at ${user.country_code}${user.phone_number}`);

        // Create appropriate message based on reminder type
        const urgencyText = reminderType === 'one_day' ? 'tomorrow' : 'soon';
        const timeText = reminderType === 'one_day' ? `The first match starts ${timeFormatted}` : `The first match starts in about 1 hour at ${timeFormatted}`;

        // Call the send-sms-reminder function
        const { error: smsError } = await supabase.functions.invoke('send-sms-reminder', {
          body: {
            userId: user.id,
            gameweekId: currentGameweek.id,
            phoneNumber: user.phone_number,
            countryCode: user.country_code || '+1',
            gameweekNumber: currentGameweek.number,
            deadlineTime: timeFormatted,
            reminderType,
            customMessage: `🏈 Premier League Picks Reminder!\n\nGameweek ${currentGameweek.number} starts ${urgencyText}!\n\n${timeText}\n\nYou haven't made your pick yet - don't miss out! Visit the app to submit your selection.\n\nGood luck! ⚽`
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
      message: `${reminderType} SMS reminders processed for gameweek ${currentGameweek.number}`,
      gameweek: currentGameweek.number,
      firstFixtureTime: timeFormatted,
      hoursUntilFirstFixture: Math.round(hoursUntilFirstFixture * 10) / 10,
      reminderType,
      totalUsersWithSMS: usersWithSMS.length,
      usersWithExistingPicks: userIdsWithPicks.size,
      usersNeedingReminders: usersNeedingReminders.length,
      usersAlreadySentThisType: sentUserIds.size,
      finalUsersReminded: finalUsersToRemind.length,
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
