import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

let supabaseClient: SupabaseClient<Database> | null = null

export const SUPABASE_CONFIGURED = Boolean(
	process.env.NEXT_PUBLIC_SUPABASE_URL &&
	(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
)

export function getSupabaseClient() {
	if (supabaseClient) return supabaseClient

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseKey) {
		throw new Error('Supabase environment variables are required')
	}

	supabaseClient = createClient<Database>(supabaseUrl, supabaseKey)
	return supabaseClient
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
	get(_target, property) {
		const client = getSupabaseClient()
		const value = client[property as keyof SupabaseClient<Database>]
		return typeof value === 'function' ? value.bind(client) : value
	},
}) as SupabaseClient<Database>

export default supabase
