import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail } = await req.json();
    
    if (!userEmail) {
      throw new Error("User email is required");
    }

    // Create Supabase client using the service role key to update user metadata
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Find the user by email
    const { data: userData, error: userError } = await supabaseService.auth.admin.listUsers();
    
    if (userError) {
      console.error('Failed to fetch users:', userError);
      throw new Error(`Failed to fetch users: ${userError.message}`);
    }

    console.log(`Found ${userData.users.length} total users`);
    console.log('Looking for email:', userEmail);
    
    // Log all user emails for debugging
    userData.users.forEach((user, index) => {
      console.log(`User ${index + 1}: ${user.email}`);
    });

    const targetUser = userData.users.find(user => user.email === userEmail);
    
    if (!targetUser) {
      console.error(`User with email ${userEmail} not found`);
      console.log('Available emails:', userData.users.map(u => u.email));
      throw new Error(`User with email ${userEmail} not found. Please verify the email address is correct.`);
    }

    // Update user metadata to mark as premium
    const { error: updateError } = await supabaseService.auth.admin.updateUserById(
      targetUser.id,
      {
        user_metadata: {
          ...targetUser.user_metadata,
          is_premium: true,
          premium_activated_at: new Date().toISOString(),
          upgraded_by_admin: true
        }
      }
    );

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      throw new Error('Failed to activate premium status');
    }

    console.log(`Premium activated for user ${targetUser.email} (${targetUser.id}) by admin`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Premium status activated successfully for ${userEmail}`,
      userId: targetUser.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error('Admin upgrade error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});