'use client';

import { Drawer } from 'vaul';

export default function VaulDrawer() {
  return (
    <Drawer.Root>
      <Drawer.Trigger className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white">
        Open Drawer
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="bg-white flex flex-col fixed bottom-0 left-0 right-0 max-h-[82vh] rounded-t-[10px]">
          <div className="max-w-md w-full mx-auto overflow-auto p-4 rounded-t-[10px]">
            <Drawer.Handle />
            <Drawer.Title className="font-medium text-gray-900 mt-8">New Project</Drawer.Title>
            <Drawer.Description className="leading-6 mt-2 text-gray-600">
              Get started by filling in the information below to create your new project.
            </Drawer.Description>
            <label htmlFor="name" className="font-medium text-gray-900 text-sm mt-8 mb-2 block">
              Project name
            </label>
            <input
              id="name"
              className="border border-gray-200 bg-white w-full px-3 h-9 rounded-lg outline-none focus:ring-2 focus:ring-black/5 text-gray-900"
            />
            <label htmlFor="name" className="font-medium text-gray-900 text-sm mt-8 mb-2 block">
              Description
            </label>
            <textarea
              rows={6}
              className="border border-gray-200 bg-white w-full resize-none rounded-lg p-3 pt-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-black/5 focus:ring-offset-0"
            />
            <button className="h-[44px] bg-black text-gray-50 rounded-lg mt-4 w-full font-medium">Submit</button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}