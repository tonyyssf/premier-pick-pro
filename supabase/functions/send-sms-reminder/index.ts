
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  userId: string;
  gameweekId: string;
  phoneNumber: string;
  countryCode: string;
  gameweekNumber: number;
  deadlineTime: string;
  reminderType?: string;
  customMessage?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('SMS reminder function called');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID')!;
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN')!;
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER')!;

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error('Missing Twilio credentials');
      return new Response(
        JSON.stringify({ error: 'Missing Twilio credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, gameweekId, phoneNumber, countryCode, gameweekNumber, deadlineTime, reminderType, customMessage }: SMSRequest = await req.json();

    console.log(`Sending ${reminderType || 'general'} SMS to ${countryCode}${phoneNumber} for gameweek ${gameweekNumber}`);

    // Format the full phone number
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // Use custom message if provided, otherwise use default
    const message = customMessage || `🏈 Premier League Picks Reminder!\n\nGameweek ${gameweekNumber} deadline is approaching at ${deadlineTime}.\n\nDon't forget to make your picks! Visit the app to submit your selections.\n\nGood luck! ⚽`;

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioPhoneNumber,
        To: fullPhoneNumber,
        Body: message,
      }),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio error:', twilioResult);
      throw new Error(`Twilio error: ${twilioResult.message || 'Unknown error'}`);
    }

    console.log('SMS sent successfully:', twilioResult.sid);

    // Log the SMS reminder in the database
    const { error: logError } = await supabase
      .from('sms_reminders')
      .insert({
        user_id: userId,
        gameweek_id: gameweekId,
        phone_number: fullPhoneNumber,
        message_content: message,
        provider_message_id: twilioResult.sid,
        status: 'sent'
      });

    if (logError) {
      console.error('Error logging SMS reminder:', logError);
      // Don't fail the request if logging fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: twilioResult.sid,
        message: 'SMS reminder sent successfully',
        reminderType: reminderType || 'general'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error sending SMS reminder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
