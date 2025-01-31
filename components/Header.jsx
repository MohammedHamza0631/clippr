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

export default function Header () {
  const router = useRouter()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const { user, fetchUser } = UrlState()

  const { loading, fn: fnLogout } = useFetch(logout)
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div>
      <nav className='px-8 py-2 flex justify-between items-center'>
        <Link href='/'>
          <h1 className='text-2xl font-dancing font-extrabold'>Clippr</h1>
        </Link>
        <div className='flex gap-4'>
          {!user ? (
            <Button onClick={() => router.push('/auth')}>Login</Button>
          ) : isDesktop ? (
            <DropdownMenu
              open={drawerOpen}
              onOpenChange={isOpen => setDrawerOpen(isOpen)}
            >
              <DropdownMenuTrigger asChild>
                <div className='w-10 mr-2 rounded-full overflow-hidden cursor-pointer object-cover'>
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.profile_pic} />
                    <AvatarFallback>
                      {user?.user_metadata?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='mr-2'>
                <DropdownMenuLabel>
                  {user?.user_metadata?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div
                    onClick={() => {
                      setDrawerOpen(false)
                    }}
                  >
                    <Link href='/dashboard' className='flex items-center gap-2'>
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
                  className='text-red-400'
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
                <div className='w-10 mr-2 rounded-full overflow-hidden cursor-pointer object-cover'>
                  <Avatar>
                    <AvatarImage src={user?.user_metadata?.profile_pic} />
                    <AvatarFallback>
                      {user?.user_metadata?.name[0]}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className='fixed inset-0 bg-black/40' />
                <Drawer.Content className='bg-zinc-800 text-white right-0 top-0 bottom-0 fixed z-100 outline-none w-[230px] rounded-t-lg rounded-b-lg flex flex-col shadow-lg'>
                  <div className='flex justify-between items-center px-4 py-2'>
                    <Drawer.Title className='p-4 text-lg font-bold'>
                      {user?.user_metadata?.name}
                    </Drawer.Title>
                    <Button
                      variant='icon'
                      onClick={() => setDrawerOpen(false)}
                      className='rounded-md p-2'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  <Drawer.Description className='px-4 pb-4 text-sm text-gray-600'>
                    Access your account options
                  </Drawer.Description>
                  <div className='flex flex-col px-4 gap-4'>
                    <div
                      onClick={() => {
                        setDrawerOpen(false)
                      }}
                    >
                      <Link
                        href='/dashboard'
                        className='flex items-center gap-2'
                      >
                        <LinkIcon className='h-4 w-4' />
                        My Links
                      </Link>
                    </div>
                    <button
                      onClick={() => {
                        fnLogout().then(() => {
                          fetchUser()
                          setDrawerOpen(false)
                          router.replace('/')
                        })
                      }}
                      className='text-red-400 flex items-center gap-2'
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
      </nav>
      {loading && <BarLoader className='mb-4' width={'100%'} color='#36d7b7' />}
    </div>
  )
}
