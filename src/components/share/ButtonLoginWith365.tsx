'use client'

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Button } from '@mui/material'
// import { Microsoft } from '@mui/icons-material'
import Swal from 'sweetalert2'
import { fetchWithBase } from "@/app/unit/fetchWithUrl"

export default function ButtonLoginWith365() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const hasProcessedLogin = useRef(false)

    useEffect(() => {
        if (
            status === 'authenticated' &&
            session?.user?.email &&
            !isLoading &&
            !hasProcessedLogin.current
        ) {
            hasProcessedLogin.current = true;
            handleLogin(session.user.email);
        }
    }, [session?.user?.email, status]);

    const handleLogin = async (email: string) => {
        setIsLoading(true)

        const loginData = {
            email,
            name: session?.user?.name ?? null,
            image: session?.user?.image ?? null,
        };

        try {
            const res = await fetchWithBase('/api/auth/microsoft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            })

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`)
            }

            const data = await res.json()

            if (!data.role) {
                throw new Error('No role returned from API')
            }

            await Swal.fire({
                icon: 'success',
                text: 'ยินดีต้อนรับกลับ!',
                showConfirmButton: false,
                timer: 1500,
            })

            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0')
            const day = String(now.getDate()).padStart(2, '0')
            const dateString = `${year}-${month}-${day}`

            const userRole = data.role.toLowerCase()

            if (userRole === 'student') {
                router.push(`/diary/${dateString}`)
            } else if (userRole === 'teacher') {
                router.push('/teacher')
            } else {
                throw new Error(`Unknown role: ${data.role}`)
            }

        } catch (error) {
            console.error('Login API Error:', error)
            await Swal.fire({
                icon: 'error',
                text: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ!',
                showConfirmButton: false,
                timer: 1500,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSignIn = () => {
        if (isLoading) return
        signIn("azure-ad")
    }

    return (
        <Button
            onClick={handleSignIn}
            variant="contained"
            size="large"
            // startIcon={<Microsoft />}
            disabled={isLoading || status === 'loading'}
            sx={{
                width: '100%',
                py: 1.5,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                background: '#673ab7',
                color: 'white',
                border: 'none',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    background: '#5e35b1',
                    boxShadow: '0 12px 40px rgba(156, 39, 176, 0.4)',
                    transform: 'translateY(-2px)'
                },
                '&:active': {
                    transform: 'translateY(0px)',
                    boxShadow: '0 6px 24px rgba(156, 39, 176, 0.3)'
                },
                '&:disabled': {
                    background: '#cccccc',
                    color: '#666666',
                    boxShadow: 'none'
                }
            }}
        >
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย UP Account'}
        </Button>
    )
}