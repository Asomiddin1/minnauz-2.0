'use client'

import { useScrollbarAutohide } from '@/lib/hooks'
import Nav from '@/components/intro/Nav'
import Hero from '@/components/intro/Hero'
import Levels from '@/components/intro/Levels'
import Practice from '@/components/intro/Practice'
import Premium from '@/components/intro/Premium'
import Schools from '@/components/intro/Schools'
import Footer from '@/components/intro/Footer'

function Content() {
  useScrollbarAutohide()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <Levels />
        <Practice />
        <Premium />
        <Schools />
      </main>
      <Footer />
    </div>
  )
}

export default function LandingPage() {
  return <Content />
}
