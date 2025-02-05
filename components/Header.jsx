'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarLoader } from 'react-spinners'
import { LinkIcon, LogOut, X } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useState } from 'react'
import useMediaQuery from '@/hooks/use-media-query'
import { Drawer } from 'vaul'
import { UrlState } from '@/context/url-provider'
import useFetch from '@/hooks/use-fetch'
import { logout } from '@/db/apiAuth'
import { motion } from 'framer-motion'

export default function Header () {
  const router = useRouter()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { user, fetchUser } = UrlState()
  const { loading, fn: fnLogout } = useFetch(logout)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <motion.div>
      <nav className='fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#030303]/80 border-b border-white/[0.08]'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-16'>
            <Link href='/'>
              <motion.h1
                className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300 font-dancing'
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Clippr
              </motion.h1>
            </Link>
            <div className='flex gap-4 items-center'>
              {!user ? (
                <Button
                  onClick={() => router.push('/auth')}
                  className='bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
                >
                  Login
                </Button>
              ) : isDesktop ? (
                <DropdownMenu
                  open={drawerOpen}
                  onOpenChange={isOpen => setDrawerOpen(isOpen)}
                >
                  <DropdownMenuTrigger asChild>
                    <div className='w-10 rounded-full overflow-hidden cursor-pointer'>
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.profile_pic} />
                        <AvatarFallback className='bg-gradient-to-r from-indigo-500 to-rose-500'>
                          {user?.user_metadata?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className='mr-2 bg-[#030303] border border-white/[0.08]'>
                    <DropdownMenuLabel className='text-white'>
                      {user?.user_metadata?.name}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className='bg-white/[0.08]' />
                    <DropdownMenuItem className='focus:bg-white/[0.03] text-white/80'>
                      <div onClick={() => setDrawerOpen(false)}>
                        <Link
                          href='/dashboard'
                          className='flex items-center gap-2'
                        >
                          <LinkIcon className='h-4 w-4' />
                          My Links
                        </Link>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        fnLogout().then(() => {
                          fetchUser()
                          router.replace('/')
                        })
                      }}
                      className='text-rose-400 focus:bg-white/[0.03] focus:text-rose-400'
                    >
                      <LogOut className='mr-2 h-4 w-4' />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Drawer.Root
                  direction='right'
                  open={drawerOpen}
                  onOpenChange={isOpen => setDrawerOpen(isOpen)}
                >
                  <Drawer.Trigger asChild>
                    <div className='w-10 rounded-full overflow-hidden cursor-pointer'>
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.profile_pic} />
                        <AvatarFallback className='bg-gradient-to-r from-indigo-500 to-rose-500'>
                          {user?.user_metadata?.name[0]}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
                    <Drawer.Content className='bg-[#030303] text-white fixed right-0 top-0 bottom-0 w-[280px] border-l border-white/[0.08] shadow-xl'>
                      <div className='flex justify-between items-center p-4 border-b border-white/[0.08]'>
                        <Drawer.Title className='text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-white/90 to-rose-300'>
                          {user?.user_metadata?.name}
                        </Drawer.Title>
                        <Button
                          variant='ghost'
                          onClick={() => setDrawerOpen(false)}
                          className='rounded-full h-8 w-8 p-0 hover:bg-white/[0.03]'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                      <div className='p-4 space-y-4'>
                        <Link
                          href='/dashboard'
                          className='flex items-center gap-2 text-white/80 hover:text-white transition-colors'
                          onClick={() => setDrawerOpen(false)}
                        >
                          <LinkIcon className='h-4 w-4' />
                          My Links
                        </Link>
                        <button
                          onClick={() => {
                            fnLogout().then(() => {
                              fetchUser()
                              setDrawerOpen(false)
                              router.replace('/')
                            })
                          }}
                          className='flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors'
                        >
                          <LogOut className='h-4 w-4' />
                          Logout
                        </button>
                      </div>
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.Root>
              )}
            </div>
          </div>
        </div>
      </nav>
      {loading && (
        <BarLoader
          className='fixed top-16 left-0 right-0 z-50'
          width={'100%'}
          color='#6366f1'
        />
      )}
    </motion.div>
  )
}
