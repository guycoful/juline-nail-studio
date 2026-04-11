import { useState } from 'react'
import { Toaster } from '@/components/ui/toaster'
import JulineStudio from '@/components/juline/JulineStudio'
import DemoGate from '@/components/juline/DemoGate'

function AdminLogin() {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (user === 'talkeren11' && pass === 'talkeren11') {
      localStorage.setItem('juline-admin', 'true')
      setDone(true)
      setTimeout(() => { window.location.href = '/' }, 500)
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center" dir="rtl">
        <div className="text-[#B76E79] text-xl font-semibold">מחובר! מעביר...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-4" dir="rtl">
      <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border border-[#F0E0E2] shadow-lg p-8 w-full max-w-sm space-y-4 ${error ? 'animate-shake' : ''}`}>
        <h2 className="text-xl font-bold text-center text-[#B76E79]">כניסת מנהל</h2>
        <input
          type="text"
          placeholder="שם משתמש"
          value={user}
          onChange={e => setUser(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#F0E0E2] focus:outline-none focus:border-[#B76E79] text-sm"
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[#F0E0E2] focus:outline-none focus:border-[#B76E79] text-sm"
        />
        {error && <p className="text-red-500 text-sm text-center">שם משתמש או סיסמה שגויים</p>}
        <button type="submit" className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#A05D67] transition-colors">
          כניסה
        </button>
      </form>
    </div>
  )
}

export default function App() {
  const path = window.location.pathname

  return (
    <>
      <Toaster />
      {path === '/admin' ? (
        <AdminLogin />
      ) : (
        <DemoGate>
          <JulineStudio />
        </DemoGate>
      )}
    </>
  )
}
