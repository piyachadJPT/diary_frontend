/* eslint-disable */

'use client'

import ThemeRegistry from "../share/ThemeRegistry";
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { ReactNode, useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    ListItemIcon,
    Toolbar,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    Stack,
    Button
} from '@mui/material';
import {
    Menu as MenuIcon,
    Person,
    LogoutOutlined,
    AccountCircle,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import ApproveUserPopup from '@/components/share/ApproveUserPopup';
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import { withBasePath } from "@/app/unit/imageSrc";

interface TeacherLayoutProps {
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

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, selectedDate }) => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const theme = useTheme();
    const [user, setUser] = useState<User | null>(null);
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [desktopOpen, setDesktopOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [openApprovePopup, setOpenApprovePopup] = useState(false);

    // useEffect(() => {
    //     if (status === 'unauthenticated') {
    //         const doSignOut = async () => {
    //             await Swal.fire({
    //                 icon: "success",
    //                 text: `กรุณาล็อคอินก่อนเข้าสู่ระบบ`,
    //                 showConfirmButton: false,
    //                 timer: 1000,
    //             });
    //             sessionStorage.clear()
    //             await signOut({
    //                 callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
    //             });
    //         };

    //         doSignOut();
    //     }
    // }, [status]);

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
            // ตรวจสอบ NextAuth session ก่อน
            if (status === 'authenticated' && session?.user?.email && !user) {
                try {
                    const res = await fetchWithBase(
                        `/api/user?email=${encodeURIComponent(session.user.email)}`
                    );
                    if (!res.ok) throw new Error('Failed to fetch user');
                    const data = await res.json();
                    setUser(data);
                } catch (error) {
                    console.error('Error fetching user:', error);
                }
            }
            // ถ้าไม่มี NextAuth session หรือ unauthenticated ให้ตรวจสอบ localStorage token
            else if (status === 'unauthenticated' || !session) {
                const profile = await getProfileFromToken();
                if (profile) {
                    setUser(profile);
                }
            }
        }

        fetchProfile();
    }, [session, status, user]);

    const getInitialSelectedDate = () => {
        if (selectedDate) {
            const parsedDate = new Date(selectedDate);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }

        const dateParam = searchParams.get('date');
        if (dateParam) {
            const parsedDate = new Date(dateParam);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
        }
        return new Date();
    };

    const [selectedDateState, setSelectedDateState] = useState<Date>(getInitialSelectedDate());
    const [selectedYear, setSelectedYear] = useState(() => {
        const initial = getInitialSelectedDate();
        return initial.getFullYear();
    });

    useEffect(() => {
        if (selectedDate) {
            const parsedDate = new Date(selectedDate);
            if (!isNaN(parsedDate.getTime())) {
                setSelectedDateState(parsedDate);
                setCurrentDate(parsedDate);
                setSelectedYear(parsedDate.getFullYear());
            }
        }
    }, [selectedDate]);

    useEffect(() => {
        const dateParam = searchParams.get('date');
        if (dateParam) {
            const parsedDate = new Date(dateParam);
            if (!isNaN(parsedDate.getTime())) {
                setSelectedDateState(parsedDate);
                setCurrentDate(parsedDate);
                setSelectedYear(parsedDate.getFullYear());
            }
        } else if (!selectedDate) {
            const today = new Date();
            setSelectedDateState(today);
            setCurrentDate(today);
            setSelectedYear(today.getFullYear());
        }
    }, [searchParams, selectedDate]);

    const handleDrawerToggle = () => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setDesktopOpen(!desktopOpen);
        }
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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

    const handleApproveNewUser = () => {
        handleClose();
        setOpenApprovePopup(true); // Open the popup
    };

    const handleCloseApprovePopup = () => {
        setOpenApprovePopup(false); // Close the popup
    };

    const handleToHome = () => {
        router.push('/teacher')
    }

    const drawer = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                boxSizing: 'border-box',
                bgcolor: '#fff',
            }}
        >
            <Box sx={{ p: 1.5, borderBottom: '1px solid #e0e0e0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                    >
                        {session?.user?.image || user?.image ? (
                            <Avatar
                                src={session?.user?.image || user?.image || `${withBasePath("/default-avatar.png")}`}
                                alt={session?.user?.name || user?.name || 'User'}
                                sx={{ width: 60, height: 60 }}
                            />
                        ) : (
                            <AccountCircle sx={{ fontSize: '28px' }} />
                        )}
                    </IconButton>
                    <Box>
                        <Typography
                            sx={{
                                color: '#111827',
                                fontWeight: 600,
                                fontSize: '16px',
                                lineHeight: 1.2,
                            }}
                        >
                            {session?.user?.name || user?.name || session?.user?.email?.split('@')[0] || 'unknown'}
                        </Typography>
                        <Typography
                            sx={{
                                color: '#6b7280',
                                fontSize: '12px',
                                mt: 0.5,
                            }}
                        >
                            {session?.user?.email || user?.email || 'email@up.ac.th'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
                <Button
                    fullWidth
                    variant="outlined"
                    onClick={handleSignOut}
                    sx={{
                        py: 0.5,
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        borderRadius: '25px',
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        '&:hover': {
                            borderColor: '#dc2626',
                            bgcolor: '#fef2f2',
                        },
                    }}
                >
                    ออกจากระบบ
                </Button>
            </Box>
        </Box>
    );

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
                        bgcolor: '#7E57C2',
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
                        <IconButton
                            color="inherit"
                            aria-label="toggle drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{
                                mr: 2,
                                color: '#fff',
                                '&:hover': {
                                    bgcolor: '#9575cd',
                                },
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
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
                                    Project Progress Diary
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
                                        bgcolor: '#9575cd',
                                    },
                                }}
                            >
                                {session?.user?.image ? (
                                    <Avatar
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        sx={{ width: 40, height: 40 }}
                                    />
                                ) : (
                                    <AccountCircle sx={{ fontSize: '28px' }} />
                                )}
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
                                <Divider sx={{ my: 0.5 }} />
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
                    component="nav"
                    sx={{
                        width: { md: desktopOpen ? drawerWidth : 0 },
                        flexShrink: { md: 0 },
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                    }}
                >
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{
                            keepMounted: true,
                        }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                                bgcolor: '#7E57C2',
                                border: 'none',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>

                    <Drawer
                        variant="persistent"
                        open={desktopOpen}
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: drawerWidth,
                                bgcolor: '#7E57C2',
                                borderRight: '1px solid #e0e0e0',
                                boxShadow: 'none',
                                position: 'fixed',
                                height: '100vh',
                                transition: theme.transitions.create('width', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.enteringScreen,
                                }),
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>
                </Box>

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

                {/* Render the ApproveUserPopup */}
                <ApproveUserPopup
                    open={openApprovePopup}
                    onClose={handleCloseApprovePopup}
                />
            </Box>
        </ThemeRegistry>
    );
};

export default TeacherLayout;