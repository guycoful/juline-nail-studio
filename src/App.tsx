import { Toaster } from '@/components/ui/toaster'
import JulineStudio from '@/components/juline/JulineStudio'
import DemoGate from '@/components/juline/DemoGate'

export default function App() {
  return (
    <>
      <Toaster />
      <DemoGate>
        <JulineStudio />
      </DemoGate>
    </>
  )
}
