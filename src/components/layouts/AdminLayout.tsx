/* eslint-disable */

'use client'

import ThemeRegistry from "../share/ThemeRegistry";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    IconButton,
    ListItemIcon,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Stack,
} from '@mui/material';
import {
    Menu as MenuIcon,
    LogoutOutlined,
    Person
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import ApproveUserPopup from "../share/ApproveUserPopup";

interface AdminLayoutProps {
    children: ReactNode;
    selectedDate?: string;
}

interface User {
    id: number;
    name: string | null;
    email: string;
    role: string;
    approved: boolean;
    image: string | null;
}

const drawerWidth = 280;

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const theme = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [role, setRole] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openApprovePopup, setOpenApprovePopup] = useState(false);

    async function getProfileFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const res = await fetchWithBase('/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                localStorage.removeItem('token');
                return null;
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('token');
            return null;
        }
    }

    useEffect(() => {
        async function fetchProfile() {
            if (status === 'authenticated' && session?.user?.email && !user) {
                try {
                    const res = await fetchWithBase(
                        `/api/user?email=${encodeURIComponent(session.user.email)}`
                    );
                    if (!res.ok) throw new Error('Failed to fetch user');
                    const data = await res.json();
                    setUser(data);
                    setRole(data.Role)
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
            else if (status === 'unauthenticated' || !session) {
                const profile = await getProfileFromToken();
                if (profile) {
                    setUser(profile);
                    setRole(profile.Role || profile.role)
                }
            }
        }

        fetchProfile();
    }, [session, status, user]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleApproveNewUser = () => {
        handleClose();
        setOpenApprovePopup(true);
    };

    const handleCloseApprovePopup = () => {
        setOpenApprovePopup(false);
    };

    const handleSignOut = async () => {
        handleClose();
        await Swal.fire({
            icon: "success",
            text: `กำลังออกจากระบบ`,
            showConfirmButton: false,
            timer: 1500,
        });
        sessionStorage.clear()
        await signOut({
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
        });
    };

    const handleToHome = () => {
        router.push('/admin')
    }

    useEffect(() => {
        if (role && role !== 'admin') {
            sessionStorage.clear()
            signOut({
                callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
            });
        }
    }, [role]);

    return (
        <ThemeRegistry>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />

                <AppBar
                    position="fixed"
                    sx={{
                        width: {
                            md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
                        },
                        ml: {
                            md: desktopOpen ? `${drawerWidth}px` : 0,
                        },
                        bgcolor: '#607d8b',
                        color: '#fff',
                        boxShadow: 'none',
                        borderBottom: 'none',
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        '& .MuiToolbar-root': {
                            minHeight: 80,
                        },
                    }}
                >
                    <Toolbar>
                        <Stack sx={{ flexGrow: 1 }}>
                            <Box
                                sx={{
                                    cursor: 'pointer',
                                }}
                                onClick={handleToHome}
                            >
                                <Typography
                                    variant="h6"
                                    noWrap
                                    component="div"
                                    sx={{
                                        color: '#f5f5f5',
                                        fontWeight: 800,
                                        fontSize: '16px',
                                    }}
                                >
                                    Project Progress Follow Up
                                </Typography>
                                <Typography
                                    variant="caption"
                                    noWrap
                                    component="div"
                                    sx={{
                                        color: '#fafafa',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                        mt: -0.5,
                                    }}
                                >
                                    Computer Engineering – University of Phayao
                                </Typography>
                            </Box>
                        </Stack>

                        <Box sx={{
                            display: {
                                xs: 'none',
                                sm: 'flex',
                            }, alignItems: 'center', gap: 1
                        }}>
                            <Stack sx={{
                                flexGrow: 1,
                                alignItems: 'flex-end',
                                ml: 'auto',
                            }}>
                                <Typography
                                    variant="h6"
                                    noWrap
                                    component="div"
                                    sx={{
                                        color: '#f5f5f5',
                                        fontWeight: 700,
                                        fontSize: '16px',
                                    }}
                                >
                                    {session?.user?.name || user?.name || session?.user?.email?.split('@')[0] || 'unknown'}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    noWrap
                                    component="div"
                                    sx={{
                                        color: '#fafafa',
                                        fontWeight: 400,
                                        fontSize: '12px',
                                        mt: -0.5,
                                    }}
                                >
                                    {session?.user?.email || user?.email || 'email@up.ac.th'}
                                </Typography>
                            </Stack>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleMenu}
                                sx={{
                                    color: '#fff',
                                    '&:hover': {
                                        bgcolor: '#607d8b',
                                    },
                                }}
                            >
                                <Avatar
                                    src={session?.user?.image || user?.image || undefined}
                                    alt={session?.user?.name || user?.name || "User"}
                                    sx={{ width: 50, height: 50 }}
                                >
                                    {(session?.user?.name || user?.name || "U").charAt(0)}
                                </Avatar>
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                                sx={{
                                    '& .MuiPaper-root': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px',
                                        mt: 1,
                                    },
                                }}
                            >
                                <MenuItem
                                    onClick={handleApproveNewUser}
                                    sx={{
                                        fontSize: '14px',
                                        py: 1.5,
                                        '&:hover': {
                                            bgcolor: '#f8f9fa',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <Person fontSize="small" sx={{ color: '#9e9e9e' }} />
                                    </ListItemIcon>
                                    อนุมัติผู้ใช้ใหม่
                                </MenuItem>
                                <MenuItem
                                    onClick={handleSignOut}
                                    sx={{
                                        fontSize: '14px',
                                        py: 1.5,
                                        color: '#dc2626',
                                        '&:hover': {
                                            bgcolor: '#fef2f2',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        <LogoutOutlined fontSize="small" sx={{ color: '#dc2626' }} />
                                    </ListItemIcon>
                                    ออกจากระบบ
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: {
                            ml: `${drawerWidth}px`,
                        },
                        bgcolor: '#F8F5FB',
                        minHeight: '100vh',
                        transition: theme.transitions.create(['width', 'margin'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    }}
                >
                    <Toolbar />
                    <Box sx={{ p: 3 }}>
                        {children}
                    </Box>
                </Box>
            </Box>
            <ApproveUserPopup
                open={openApprovePopup}
                onClose={handleCloseApprovePopup}
            />
        </ThemeRegistry>
    );
};

export default AdminLayout;