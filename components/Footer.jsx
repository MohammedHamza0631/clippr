'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Heart } from 'lucide-react'

export default function Footer() {
  const faqs = [
    {
      question: "How does the Clippr URL shortener work?",
      answer: "When you enter a long URL, our system generates a shorter version of that URL. This shortened URL redirects to the original long URL when accessed."
    },
    {
      question: "Do I need an account to use the app?",
      answer: "Yes. Creating an account allows you to manage your URLs, view analytics, and customize your short URLs."
    },
    {
      question: "What analytics are available for my shortened URLs?",
      answer: "You can view the number of clicks, geolocation data of the clicks and device types (mobile/desktop) for each of your shortened URLs."
    }
  ]

  return (
    <div className='bg-[#030303] border-t border-white/[0.08]'>
      <div className='max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-16'
        >
          <h2 className='text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300'>
            Frequently Asked Questions
          </h2>
          <Accordion type='multiple' className='space-y-4'>
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index + 1}`}
                className='border border-white/[0.08] rounded-lg bg-white/[0.02]'
              >
                <AccordionTrigger className='px-4 hover:no-underline hover:bg-white/[0.03] rounded-t-lg text-white'>
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className='px-4 text-white/60'>
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className='text-center'
        >
          <p className='text-white/40 flex items-center justify-center gap-2'>
            Made with <Heart className='h-4 w-4 text-rose-400 animate-pulse' /> by{' '}
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-rose-300 font-medium'>
              Hamza
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  )
}