'use client'
import AuthLayout from "@/components/layouts/AuthLayout"
import ButtonLoginWith365 from "../components/share/ButtonLoginWith365"
import {
    Box,
    Container,
    Paper,
    Grid,
    Typography,
    alpha
} from '@mui/material'
import Image from 'next/image'

export default function Home() {

    return (
        <AuthLayout>
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 4
                }}
            >
                <Container maxWidth="lg">
                    <Paper
                        elevation={0}
                        sx={{
                            borderRadius: 6,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: alpha('#fdd835', 0.08),
                            maxWidth: '1000px',
                            margin: '0 auto',
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            minHeight: '600px',
                            display: 'flex'
                        }}
                    >
                        <Grid container sx={{ minHeight: '100%', flex: 1 }}>
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    p: 6
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
                                            fontWeight: 300,
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
                                            color: alpha('#2c2c2c', 0.7),
                                            mb: 6,
                                            fontSize: '1rem',
                                            fontWeight: 400
                                        }}
                                    >
                                        เข้าสู่ระบบเพื่อเริ่มต้นใช้งาน
                                    </Typography>

                                    <ButtonLoginWith365 />
                                </Box>
                            </Grid>

                            <Grid
                                item
                                md={6}
                                sx={{
                                    display: { xs: 'none', md: 'flex' },
                                    alignItems: 'stretch',
                                    justifyContent: 'stretch',
                                    position: 'relative',
                                    background: 'linear-gradient(135deg, #fdd835 0%, #ffeb3b 20%, #ffc107 40%, #ff9800 60%, #f57c00 80%, #e65100 100%)',
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
                                            background: 'rgba(255, 255, 255, 0.15)',
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
                                            background: 'rgba(255, 255, 255, 0.1)',
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
                                            background: 'rgba(255, 255, 255, 0.08)',
                                            top: '30%',
                                            left: '20%',
                                            animation: 'float 10s ease-in-out infinite'
                                        }}
                                    />

                                    <Image
                                        src="/dose.png"
                                        alt="login-image"
                                        width={400}
                                        height={300}
                                        style={{
                                            maxWidth: '80%',
                                            height: 'auto',
                                            objectFit: 'contain',
                                            position: 'relative',
                                            zIndex: 1,
                                            filter: 'brightness(1.1) drop-shadow(0 10px 20px rgba(0,0,0,0.1))'
                                        }}
                                        priority={true}
                                    />
                                </Box>

                                <style jsx global>{`
                                    @keyframes float {
                                        0%, 100% { transform: translateY(0px); }
                                        50% { transform: translateY(-20px); }
                                    }
                                `}</style>
                            </Grid>
                        </Grid>
                    </Paper>
                </Container>
            </Box>
        </AuthLayout>
    )
}