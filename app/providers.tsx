'use client'

import React from 'react'
import {ThemeProvider} from "@/app/theme-provider";
import {Toaster} from "@/components/ui/toaster";
import ChatProvider from '@/components/chat/ChatProvider';

function Providers({children} : {children: React.ReactNode}) {
    return (
        <>
            <Toaster />
            <ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange>
                <ChatProvider>
                    {children}
                </ChatProvider>
            </ThemeProvider>
        </>
    )
}

export default Providers
