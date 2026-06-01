import { createClient, SupabaseClient } from "@supabase/supabase-js";

type SupabaseResult = { data: unknown[]; error: null };

interface MockQuery {
  select: () => MockQuery;
  insert: () => MockQuery;
  ilike: () => MockQuery;
  or: () => MockQuery;
  range: () => MockQuery;
  eq: () => MockQuery;
  order: () => MockQuery;
  limit: () => MockQuery;
  then: <T>(
    resolve: (value: SupabaseResult) => T,
    reject: (reason: unknown) => T
  ) => Promise<T>;
}

// Provide a minimal mock query object that is thenable so awaiting returns
// a shape matching Supabase responses: { data, error }
function createMockQuery(): MockQuery {
  const obj = {} as MockQuery;
  const noopChain = () => obj;

  obj.select = noopChain;
  obj.insert = noopChain;
  obj.ilike = noopChain;
  obj.or = noopChain;
  obj.range = noopChain;
  obj.eq = noopChain;
  obj.order = noopChain;
  obj.limit = noopChain;

  // Make it awaitable: when used with `await` it resolves to an empty result
  obj.then = <T>(
    resolve: (value: SupabaseResult) => T,
    reject: (reason: unknown) => T
  ) => Promise.resolve({ data: [], error: null }).then(resolve, reject);

  return obj;
}

interface MockClient {
  from: (_: string) => MockQuery;
}

export const createSupabaseClient = (): SupabaseClient | MockClient => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        // Instead of throwing (which causes a 500 during SSR), return a
        // mock client that yields empty results. Also log a clear error so
        // deploy logs show the missing configuration.
        // eslint-disable-next-line no-console
        console.error('Missing Supabase configuration: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return {
            from: (_: string) => createMockQuery(),
        };
    }

    return createClient(supabaseUrl, supabaseKey);
};

/**
 * Admin client using the service-role key — bypasses ALL RLS policies.
 * ONLY call this from server-side code (Server Actions, Route Handlers).
 * Never expose the service-role key to the browser.
 */
export const createSupabaseAdminClient = (): SupabaseClient | MockClient => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        // eslint-disable-next-line no-console
        console.error(
            'Missing Supabase admin configuration: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
            'Get the service role key from your Supabase project Settings → API.'
        );
        return { from: (_: string) => createMockQuery() };
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false },
    });
};
