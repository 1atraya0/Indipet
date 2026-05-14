'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type QueryFn<T> = () => PromiseLike<{ data: T[] | null; error: { message: string } | null }>

export function useSupabaseTable<T>(
  queryFn: QueryFn<T>,
  realtimeTable: string,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetch, setLastFetch] = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: result, error: err } = await queryFn()
      if (err) throw new Error(err.message)
      setData(result ?? [])
      setLastFetch(Date.now())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    fetch()
  }, [fetch])

  // Supabase Realtime subscription
  useEffect(() => {
    if (!realtimeTable) return
    let channel: RealtimeChannel

    const setup = () => {
      channel = supabase
        .channel(`realtime:${realtimeTable}:${Date.now()}`)
        .on(
          'postgres_changes' as never,
          { event: '*', schema: 'public', table: realtimeTable },
          () => { fetch() }
        )
        .subscribe()
    }

    setup()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [realtimeTable, fetch])

  return { data, loading, error, refetch: fetch, lastFetch }
}

export function useSupabaseCount(table: string) {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    try {
      const { count: c } = await supabase.from(table as never).select('id', { count: 'exact', head: true })
      setCount(c ?? 0)
    } catch {
      setCount(0)
    } finally {
      setLoading(false)
    }
  }, [table])

  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    const channel = supabase
      .channel(`count:${table}:${Date.now()}`)
      .on('postgres_changes' as never, { event: '*', schema: 'public', table }, () => fetch())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, fetch])

  return { count, loading, refetch: fetch }
}
