'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CreditCard, Trophy, CheckCircle, Info } from 'lucide-react'
import { markNotificationsAsRead } from '@/components/actions'

type Notification = {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export default function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleOpen() {
      setIsOpen(!isOpen)
      if (!isOpen && unreadCount > 0) {
          // Mark as read in DB
          await markNotificationsAsRead(notifications.filter(n => !n.read).map(n => n.id))
          // Optimistic UI update
          setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      }
  }

  return (
    <div className="relative" ref={ref}>
        <button 
           onClick={handleOpen}
           className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
        >
            <Bell className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
            )}
        </button>

        {isOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0f1117] border border-white/15 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-4 z-50 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                   <h3 className="font-bold text-lg text-white">Notifications</h3>
                   <span className="text-xs text-muted-foreground">{notifications.length} recent</span>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                   {notifications.length === 0 ? (
                       <p className="text-sm text-muted-foreground text-center py-4">No new notifications.</p>
                   ) : (
                       notifications.map(n => (
                           <div key={n.id} className={`p-3 rounded-xl border ${n.read ? 'bg-white/5 border-white/5' : 'bg-primary/10 border-primary/25'} flex gap-3`}>
                               <div className="mt-0.5 shrink-0">
                                   {n.title.includes('Won') ? <Trophy className="w-5 h-5 text-yellow-400" /> : <Info className="w-5 h-5 text-blue-400" />}
                               </div>
                               <div className="min-w-0">
                                   <p className={`text-sm font-semibold ${n.read ? 'text-white/80' : 'text-primary'}`}>{n.title}</p>
                                   <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                                   <p className="text-[10px] text-muted-foreground/50 mt-2">{new Date(n.created_at).toLocaleString()}</p>
                               </div>
                           </div>
                       ))
                   )}
                </div>
            </div>
        )}
    </div>
  )
}
