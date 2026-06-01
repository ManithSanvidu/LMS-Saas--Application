'use server';
import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient, createSupabaseAdminClient } from "../supabase";
import { revalidatePath } from "next/cache";

type Companion = {
  id: string;
  name: string;
  subject: string;
  topic: string;
  style: string;
  voice: string;
  duration: number;
  author: string;
  created_at?: string;
  [key: string]: unknown;
};

type SessionRow = {
  companions: Companion | Companion[] | null;
};

export const createCompanion=async(formData: CreateCompanion)=>{
    try {
        const authSession = await auth();

        if (!authSession.userId) {
            return null;
        }

        const supabase = createSupabaseClient();

        const { data, error } = await supabase
            .from("companions")
            .insert({ ...formData, author: authSession.userId })
            .select();

        if (error || !data) {
            // log and return null rather than throwing a server error
            // eslint-disable-next-line no-console
            console.error('createCompanion failed:', error);
            return null;
        }

        revalidatePath("/companions");
        revalidatePath("/");

        return data[0];
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('createCompanion exception:', e);
        return null;
    }
} 

export const getAllCompanions=async({limit=10, page=1,subject,topic}:GetAllCompanions)=>{
  try {
    const supabase=createSupabaseClient();

    let query=supabase.from('companions').select();

    if(subject && topic) {
      query = query.ilike('subject', `%${subject}%`)
        .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    } else if(subject) {
      query = query.ilike('subject', `%${subject}%`);
    } else if(topic) {
      query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
    }

    query=query.range((page-1)* limit,page*limit-1);

    const {data:companions,error}=await query;

    if(error) {
      console.error('Error fetching companions:', error.message);
      return [];
    }

    return companions || [];
  } catch (e) {
    console.error('Error fetching companions:', e);
    return [];
  }

}

export const getCompanion = async (id: string) => {
    try {
        const supabase = createSupabaseClient();

        const { data, error } = await supabase
            .from('companions')
            .select()
            .eq('id', id);

        if(error) {
            console.error('Error fetching companion:', error);
            return null;
        }

        return data?.[0] || null;
    } catch (e) {
        console.error('Error in getCompanion:', e);
        return null;
    }
}

export const addToSessionHistory=async(companionId:string)=>{
    try {
        const authSession = await auth();

        if (!authSession.userId) {
            // Not authenticated — do nothing and return null instead of throwing
            return null;
        }

        // Use the admin (service-role) client to bypass RLS.
        // This is safe because this function only runs server-side and
        // we already validated the Clerk userId above.
        const supabase = createSupabaseAdminClient();
        const { data, error } = await supabase.from('session_history').insert({
            companion_id: companionId,
            user_id: authSession.userId,
        });

        if (error) {
            // Log and return null to avoid crashing SSR
            // eslint-disable-next-line no-console
            console.error('addToSessionHistory failed:', error);
            return null;
        }

        return data;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error('addToSessionHistory exception:', e);
        return null;
    }
}

export const getRecentSessions=async(limit=10)=>{
    try {
        const supabase=createSupabaseClient();
        const {data,error}=await supabase
            .from('session_history')
            .select('companions:companion_id(*)')
            .order('created_at',{ascending:false})
            .limit(limit)

        if(error) {
            console.error('Error fetching recent sessions:', error);
            return [];
        }

        return ((data || []) as SessionRow[]).map(({ companions }) => companions).filter(Boolean);
    } catch (e) {
        console.error('Error in getRecentSessions:', e);
        return [];
    }
}

export const getUserSessions=async(userId:string,limit=10)=>{
    try {
        const supabase=createSupabaseClient();
        const {data,error}=await supabase
            .from('session_history')
            .select('companions:companion_id(*)')
            .eq('user_id',userId)
            .order('created_at',{ascending:false})
            .limit(limit)

        if(error) {
            console.error('Error fetching user sessions:', error);
            return [];
        }

        return ((data || []) as SessionRow[]).map(({ companions }) => companions).filter(Boolean);
    } catch (e) {
        console.error('Error in getUserSessions:', e);
        return [];
    }
}

export const getUserCompanions=async(userId:string)=>{
    try {
        const supabase=createSupabaseClient();
        const {data,error}=await supabase
            .from('companions')
            .select()
            .eq('author',userId)
            
        if(error) {
            console.error('Error fetching user companions:', error);
            return [];
        }

        return data || [];
    } catch (e) {
        console.error('Error in getUserCompanions:', e);
        return [];
    }
}

export const newCompanionPermissions=async()=>{
    const authSession = await auth();
    
    if (!authSession.userId) {
      return false;
    }
    
    return true;
}
