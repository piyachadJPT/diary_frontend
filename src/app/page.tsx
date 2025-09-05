'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthLayout from "@/components/layouts/AuthLayout"
import ButtonLoginWith365 from "../components/share/ButtonLoginWith365"
import Swal from 'sweetalert2'
import { fetchWithBase } from '@/app/unit/fetchWithUrl'
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Link,
    alpha,
    CircularProgress
} from '@mui/material'
import { withBasePath } from './unit/imageSrc'

export default function Home() {
    const router = useRouter()
    const [showEmailLogin, setShowEmailLogin] = useState(false)
    const [showRegister, setShowRegister] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                text: 'กรุณากรอกอีเมลและรหัสผ่าน',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                text: 'กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetchWithBase('/api/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                const userRole = data.role.toLowerCase();
                const now = new Date();
                const dateString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

                localStorage.setItem('token', data.token);

                Swal.fire({
                    icon: 'success',
                    text: 'เข้าสู่ระบบสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                }).then(() => {
                    if (userRole === 'student') {
                        router.push(`/diary/${dateString}`);
                    } else if (userRole === 'advisor') {
                        router.push('/teacher');
                    } else if (userRole === 'admin') {
                        router.push('/admin');
                    } else {
                        return
                    }
                });
            } else {
                let errorMessage = 'ไม่สามารถเข้าสู่ระบบได้';

                if (data.error === 'Your account has not been approved yet') {
                    errorMessage = 'บัญชีของคุณยังไม่ได้รับการอนุมัติ';
                } else if (data.error === 'Incorrect password') {
                    errorMessage = 'รหัสผ่านไม่ถูกต้อง';
                } else if (data.error === 'Email and password are required') {
                    errorMessage = 'กรุณากรอกอีเมลและรหัสผ่าน';
                } else if (data.error) {
                    errorMessage = data.error;
                }

                Swal.fire({
                    icon: 'error',
                    text: errorMessage,
                    showConfirmButton: false,
                    timer: 3000,
                });
            }
        } catch (error) {
            console.error('Login error:', error);
            Swal.fire({
                icon: 'error',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
                showConfirmButton: false,
                timer: 2500,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword) {
            Swal.fire({
                icon: 'error',
                text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
                showConfirmButton: false,
                timer: 2500,
            })
            return
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                text: 'กรุณาตรวจสอบรหัสผ่านและการยืนยันรหัสผ่านให้ตรงกัน',
                showConfirmButton: false,
                timer: 2500,
            })
            return
        }

        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
                showConfirmButton: false,
                timer: 2500,
            })
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                text: 'กรุณากรอกอีเมลในรูปแบบที่ถูกต้อง',
                showConfirmButton: false,
                timer: 2500,
            })
            return
        }

        setLoading(true)

        try {
            const response = await fetchWithBase('/api/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    text: 'สมัครสมาชิกสำเร็จ กรุณารอการอนุมัติจากผู้ดูแลระบบ',
                    showConfirmButton: false,
                    timer: 2500,
                }).then(() => {
                    setName('')
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                    setShowRegister(false)
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    text: data.error || 'ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง',
                    showConfirmButton: false,
                    timer: 2500,
                })
            }
        } catch (error) {
            console.error('Registration error:', error)
            Swal.fire({
                icon: 'error',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง',
                showConfirmButton: false,
                timer: 2500,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleSwitchToRegister = () => {
        setShowRegister(true)
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    const handleBackToMain = () => {
        setShowEmailLogin(false)
        setShowRegister(false)
        setName('')
        setEmail('')
        setPassword('')
        setConfirmPassword('')
    }

    return (
        <AuthLayout>
            <Box
                sx={{
                    minHeight: '100vh',
                    background: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4,
                }}
            >
                <Container maxWidth="lg">
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '2px solid #ccc',
                            borderColor: alpha('#000', 0.08),
                            maxWidth: '1000px',
                            margin: '0 auto',
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            minHeight: '600px',
                            display: 'flex',
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            width: '100%',
                            flexDirection: { xs: 'column', md: 'row' }
                        }}>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 6,
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '100%',
                                        maxWidth: '360px',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography
                                        variant="h3"
                                        component="h1"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c2c2c',
                                            mb: 1,
                                            fontSize: { xs: '2rem', md: '2.5rem' }
                                        }}
                                    >
                                        ยินดีต้อนรับ
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: alpha('#9e9e9e', 0.7),
                                            mb: 6,
                                            fontSize: '1rem',
                                            fontWeight: 400
                                        }}
                                    >
                                        {!showEmailLogin
                                            ? 'เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน'
                                            : showRegister
                                                ? 'สมัครสมาชิกใหม่'
                                                : 'เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน'
                                        }
                                    </Typography>

                                    {!showEmailLogin ? (
                                        <Box>
                                            <ButtonLoginWith365 />
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: alpha('#9e9e9e', 0.6),
                                                    my: 2,
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                หรือ
                                            </Typography>
                                            <Link
                                                component="button"
                                                onClick={() => setShowEmailLogin(true)}
                                                sx={{
                                                    color: '#673ab7',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        textDecoration: 'underline'
                                                    }
                                                }}
                                            >
                                                เข้าสู่ระบบด้วย Email/Password
                                            </Link>
                                        </Box>
                                    ) : (
                                        <Box>
                                            <Box component="form" onSubmit={showRegister ? handleRegisterSubmit : handleEmailLogin}>
                                                {showRegister && (
                                                    <TextField
                                                        fullWidth
                                                        label="ชื่อ-นามสกุล"
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        sx={{
                                                            mb: 3,
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <TextField
                                                    fullWidth
                                                    label="อีเมล"
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                    sx={{
                                                        mb: 3,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                        }
                                                    }}
                                                />
                                                <TextField
                                                    fullWidth
                                                    label="รหัสผ่าน"
                                                    type="password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                    disabled={loading}
                                                    sx={{
                                                        mb: showRegister ? 3 : 4,
                                                        '& .MuiOutlinedInput-root': {
                                                            borderRadius: 2,
                                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                        }
                                                    }}
                                                />
                                                {showRegister && (
                                                    <TextField
                                                        fullWidth
                                                        label="ยืนยันรหัสผ่าน"
                                                        type="password"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        required
                                                        disabled={loading}
                                                        sx={{
                                                            mb: 4,
                                                            '& .MuiOutlinedInput-root': {
                                                                borderRadius: 2,
                                                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                                            }
                                                        }}
                                                    />
                                                )}
                                                <Button
                                                    type="submit"
                                                    fullWidth
                                                    variant="contained"
                                                    disabled={loading}
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
                                                    {loading ? (
                                                        <CircularProgress
                                                            size={24}
                                                            sx={{ color: 'white' }}
                                                        />
                                                    ) : (
                                                        showRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ'
                                                    )}
                                                </Button>
                                            </Box>

                                            {!showRegister && (
                                                <Button
                                                    fullWidth
                                                    variant="outlined"
                                                    onClick={handleSwitchToRegister}
                                                    disabled={loading}
                                                    sx={{
                                                        width: '100%',
                                                        py: 1.5,
                                                        px: 4,
                                                        my: 1.5,
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
                                                    สมัครสมาชิก
                                                </Button>
                                            )}
                                            <Link
                                                component="button"
                                                type="button"
                                                onClick={handleBackToMain}
                                                disabled={loading}
                                                sx={{
                                                    color: loading ? 'rgba(124, 58, 237, 0.5)' : '#673ab7',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    '&:hover': {
                                                        textDecoration: loading ? 'none' : 'underline'
                                                    }
                                                }}
                                            >
                                                เข้าสู่ระบบด้วย UP Account
                                            </Link>
                                        </Box>
                                    )}
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    flex: 1,
                                    display: { xs: 'none', md: 'flex' },
                                    alignItems: 'stretch',
                                    justifyContent: 'stretch',
                                    position: 'relative',
                                    background: '#ffffff',
                                    overflow: 'hidden',
                                    minHeight: '100%'
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={withBasePath('/dose.png')}
                                        alt="login-image"
                                        sx={{
                                            maxWidth: '80%',
                                            maxHeight: '300px',
                                            width: 'auto',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            position: 'relative',
                                            zIndex: 1,
                                            filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                                        }}
                                    />
                                </Box>

                                <style jsx global>{`
                                    @keyframes float {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-20px); }
                                    }
                                `}</style>
                            </Box>
                        </Box>
                    </Paper>
                </Container>
            </Box>
        </AuthLayout>
    )
}