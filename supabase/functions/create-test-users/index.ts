
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting test user creation process...')

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Test users to create
    const testUsers = [
      {
        email: 'admin.demo@hibanstore.com',
        password: 'admin123',
        full_name: 'Super Administrator',
        role: 'super_admin'
      },
      {
        email: 'admin.hiban.demo@gmail.com', 
        password: 'admin123',
        full_name: 'Admin Hiban Store',
        role: 'admin'
      },
      {
        email: 'manager.demo@hibanstore.com',
        password: 'manager123', 
        full_name: 'Store Manager',
        role: 'manager'
      },
      {
        email: 'viewer.demo@hibanstore.com',
        password: 'viewer123',
        full_name: 'Data Viewer', 
        role: 'viewer'
      }
    ]

    console.log('Cleaning up existing corrupted data...')
    
    // Clean up existing users from public.users table
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .in('email', testUsers.map(u => u.email))

    if (deleteError) {
      console.warn('Error cleaning up existing users:', deleteError)
    }

    const results = []

    for (const testUser of testUsers) {
      try {
        console.log(`Creating user: ${testUser.email}`)

        // Create user using Admin API
        const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            full_name: testUser.full_name
          }
        })

        if (createError) {
          console.error(`Error creating ${testUser.email}:`, createError)
          results.push({
            email: testUser.email,
            success: false,
            error: createError.message
          })
          continue
        }

        console.log(`Auth user created successfully: ${testUser.email}`)

        // Create or update user profile
        const { error: profileError } = await supabaseAdmin
          .from('users')
          .upsert({
            id: authUser.user!.id,
            email: testUser.email,
            full_name: testUser.full_name,
            role: testUser.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error(`Error creating profile for ${testUser.email}:`, profileError)
          results.push({
            email: testUser.email,
            success: false,
            error: `Auth created but profile failed: ${profileError.message}`
          })
        } else {
          console.log(`Profile created successfully: ${testUser.email}`)
          results.push({
            email: testUser.email,
            success: true,
            userId: authUser.user!.id,
            role: testUser.role
          })
        }

      } catch (error) {
        console.error(`Unexpected error creating ${testUser.email}:`, error)
        results.push({
          email: testUser.email,
          success: false,
          error: error.message
        })
      }
    }

    console.log('Test user creation completed. Results:', results)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(JSON.stringify({
      success: true,
      message: `Test users creation completed: ${successCount} successful, ${failureCount} failed`,
      results: results,
      summary: {
        total: testUsers.length,
        successful: successCount,
        failed: failureCount
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Fatal error in create-test-users function:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
