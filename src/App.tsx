import { Toaster } from '@/components/ui/toaster'
import JulineStudio from '@/components/juline/JulineStudio'
import DemoGate from '@/components/juline/DemoGate'
import AuthPage from '@/pages/Auth'
import PricingPage from '@/pages/Pricing'
import PaymentSuccessPage from '@/pages/PaymentSuccess'

function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F9] to-[#FFF0F2] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl border border-[#F0E0E2] shadow-xl p-8 max-w-sm w-full text-center space-y-6">
        <h2 className="text-xl font-bold text-[#333]">התשלום בוטל</h2>
        <p className="text-gray-500 text-sm">לא חויבת. תוכלי לנסות שוב בכל עת.</p>
        <button
          onClick={() => window.location.href = '/pricing'}
          className="w-full py-3 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#A05D67] transition-colors"
        >
          חזרה לחבילות
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const path = window.location.pathname

  return (
    <>
      <Toaster />
      {path === '/login' ? (
        <AuthPage initialMode="login" />
      ) : path === '/signup' ? (
        <AuthPage initialMode="signup" />
      ) : path === '/pricing' ? (
        <PricingPage />
      ) : path === '/payment-success' ? (
        <PaymentSuccessPage />
      ) : path === '/payment-cancel' ? (
        <PaymentCancelPage />
      ) : (
        <DemoGate>
          <JulineStudio />
        </DemoGate>
      )}
    </>
  )
}
