'use client'

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from '@mui/material'
import { Microsoft } from '@mui/icons-material'
import Swal from 'sweetalert2';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"

export default function ButtonLoginWith365() {
    const { data: session } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (session?.user?.email) {
            fetchLogin(session.user.email)
        }
    }, [session])

    const fetchLogin = async (email: string) => {
        try {
            const res = await fetchWithBase('/api/auth/microsoft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await res.json()

            await Swal.fire({
                icon: "success",
                text: `ยินดีต้อนรับกลับ!`,
                showConfirmButton: false,
                timer: 1500,
            });

            if (data.role === 'Student') {
                router.push('/diary')
            } else if (data.role === 'Teacher') {
                router.push('/teacher')
            }
        } catch (error) {
            console.error("Login API Error:", error)
        }
    }

    const handleSignIn = () => {
        signIn("azure-ad")
    }

    return (
        <Button
            onClick={handleSignIn}
            variant="contained"
            size="large"
            startIcon={<Microsoft />}
            sx={{
                width: '100%',
                py: 1.5,
                px: 4,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 8px 32px rgba(156, 39, 176, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    background: 'linear-gradient(135deg, #8e24aa 0%, #5e35b1 100%)',
                    boxShadow: '0 12px 40px rgba(156, 39, 176, 0.4)',
                    transform: 'translateY(-2px)'
                },
                '&:active': {
                    transform: 'translateY(0px)',
                    boxShadow: '0 6px 24px rgba(156, 39, 176, 0.3)'
                }
            }}
        >
            เข้าสู่ระบบด้วย UP Account
        </Button>
    )
}