import React from 'react'
import { FloatingDock } from '@/components/ui/floating-dock'
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconHome,
  IconNewSection,
  IconTerminal2
} from '@tabler/icons-react'
import Image from 'next/image'
import { LinkIcon, LogOutIcon } from 'lucide-react'

export function Navbar () {
  const links = [
    {
      title: 'Home',
      icon: (
        <IconHome className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '/'
    },
    {
      title: 'My Links',
      icon: (
        <LinkIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '/link'
    },
    {
      title: 'Logout',
      icon: (
        <LogOutIcon className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#'
    },
    
    {
      title: 'Changelog',
      icon: (
        <IconExchange className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#'
    },

    {
      title: 'Twitter',
      icon: (
        <IconBrandX className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#'
    },
    {
      title: 'GitHub',
      icon: (
        <IconBrandGithub className='h-full w-full text-neutral-500 dark:text-neutral-300' />
      ),
      href: '#'
    }
  ]
  return (
    <div className='flex items-center justify-center h-[35rem] w-full'>
      <FloatingDock mobileClassName='' items={links} />
    </div>
  )
}
