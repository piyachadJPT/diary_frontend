'use client'

import React from 'react'
import { signOut } from "next-auth/react"

export default function Page() {
    return (
        <div className='flex justify-center'>
            <button
                onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/` })}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Sign out
            </button>
        </div >
    )
}
