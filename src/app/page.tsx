'use client'
import AuthLayout from "@/components/layouts/AuthLayout"
import ButtonLoginWith365 from "../components/share/ButtonLoginWith365"
import {
    Box,
    Container,
    Paper,
    Typography,
    alpha
} from '@mui/material'

export default function Home() {

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
                                        เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
                                    </Typography>

                                    <ButtonLoginWith365 />
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
                                        sx={{
                                            position: 'absolute',
                                            width: '200px',
                                            height: '200px',
                                            borderRadius: '50%',
                                            background: 'rgba(0, 0, 0, 0.02)',
                                            top: '-50px',
                                            right: '-50px',
                                            animation: 'float 6s ease-in-out infinite'
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: '150px',
                                            height: '150px',
                                            borderRadius: '50%',
                                            background: 'rgba(0, 0, 0, 0.02)',
                                            bottom: '-25px',
                                            left: '-25px',
                                            animation: 'float 8s ease-in-out infinite reverse'
                                        }}
                                    />
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            width: '100px',
                                            height: '100px',
                                            borderRadius: '50%',
                                            background: 'rgba(0, 0, 0, 0.02)',
                                            top: '30%',
                                            left: '20%',
                                            animation: 'float 10s ease-in-out infinite'
                                        }}
                                    />

                                    <Box
                                        component="img"
                                        src="/dose.png"
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