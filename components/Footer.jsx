import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

export default function Footer () {
  return (
    <div className='px-2 md:px-0 mt-4'>
      <Accordion type='multiple' collapsible className='w-full md:p-11'>
      <AccordionItem value="item-1">
          <AccordionTrigger>
            How does the Clippr URL shortener works?
          </AccordionTrigger>
          <AccordionContent>
            When you enter a long URL, our system generates a shorter version of
            that URL. This shortened URL redirects to the original long URL when
            accessed.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>
            Do I need an account to use the app?
          </AccordionTrigger>
          <AccordionContent>
            Yes. Creating an account allows you to manage your URLs, view
            analytics, and customize your short URLs.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>
            What analytics are available for my shortened URLs?
          </AccordionTrigger>
          <AccordionContent>
            You can view the number of clicks, geolocation data of the clicks
            and device types (mobile/desktop) for each of your shortened URLs.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <footer className='p-4 text-center'>Made with 💗 by Hamza</footer>
    </div>
  )
}
