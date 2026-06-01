import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const CTA = () => {
  return (
    <section className="cta-section">
      <div className="cta-badge">Start learning your way</div>

      <h2 className="text-3xl font-bold">
        Build and Personalize Learning Companion
      </h2>

      <p>
        Pick a name, subject, voice, & personality - and start learning
        through voice conversations that feel natural and fun.
      </p>

      <Image
        src="/images/cta.svg"
        alt="CTA illustration"
        width={362}
        height={232}
      />

      <Link href="/companions/new" className="btn-primary">
        <Image
          src="/icons/plus.svg"
          alt="plus"
          width={12}
          height={12}
          className="size-3 shrink-0"
        />

        <p>Build a new Companion</p>
      </Link>
    </section>
  )
}

export default CTA
