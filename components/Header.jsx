'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BarLoader } from 'react-spinners'
import { LinkIcon, LogOut } from 'lucide-react'
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
import Image from 'next/image'
import { UrlState } from '@/context/url-provider'
import useFetch from '@/hooks/use-fetch'
import { logout } from '@/db/apiAuth'

export default function Header () {
  const router = useRouter()
  const { user, fetchUser } = UrlState()
  const { loading, fn: fnLogout } = useFetch(logout)
  return (
    <>
      <nav className='px-6 py-2 flex justify-between items-center'>
        <Link href='/'>
          <h1 className='text-2xl font-dancing font-extrabold'>Clippr</h1>
        </Link>
        <div className='flex gap-4'>
          {!user ? (
            <Button onClick={() => router.push('/auth')}>Login</Button>
          ) : (
            <DropdownMenu>
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
                  <Link href='/dashboard' className='flex items-center gap-2'>
                    <LinkIcon className='h-4 w-4' />
                    My Links
                  </Link>
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
          )}
        </div>
      </nav>
      {loading && <BarLoader className='mb-4' width={'100%'} color='#36d7b7' />}
    </>
  )
}
