/* eslint-disable */

'use client'

import ThemeRegistry from "../share/ThemeRegistry";
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { ReactNode, useState, useEffect, useCallback } from 'react';
import {
   AppBar,
   Box,
   CssBaseline,
   Drawer,
   IconButton,
   ListItemButton,
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
import Grid from '@mui/material/Grid';
import {
   Menu as MenuIcon,
   Visibility as VisibilityIcon,
   LogoutOutlined,
   ChevronLeft,
   ChevronRight,
} from '@mui/icons-material';
import Swal from 'sweetalert2';
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import { getUrlWithBase } from "@/app/unit/getUrlWithBase";
import ViewAllStudent from "@/components/share/ViewAllStudent";

interface DiatyLayoutProps {
   children: ReactNode;
   selectedDate?: string;
}

export interface DiaryDateResponse {
   message: string;
   data: string[];
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

const DiatyLayout: React.FC<DiatyLayoutProps> = ({ children, selectedDate }) => {
   const { data: session, status } = useSession();
   const router = useRouter();
   const searchParams = useSearchParams();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
   const [user, setUser] = useState<User | null>(null);
   const [diaryDate, setDiaryDate] = useState<DiaryDateResponse | null>(null);
   const [userId, setUserId] = useState<number | null>(null);
   const [role, setRole] = useState<string | null>(null);
   const [mobileOpen, setMobileOpen] = useState(false);
   const [desktopOpen, setDesktopOpen] = useState(true);
   const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
   const [currentDate, setCurrentDate] = useState(new Date());
   const [open, setOpen] = useState(false);

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
               setUserId(data.id || data.ID);
               setRole(data.Role)
            } catch (error) {
               console.error('Error fetching user:', error);
            }
         }
         else if (status === 'unauthenticated' || !session) {
            const profile = await getProfileFromToken();
            console.log(profile);
            if (profile) {
               setUser(profile);
               setUserId(profile.id || profile.ID);
               setRole(profile.Role || profile.role)
            }
         }
      }

      fetchProfile();
   }, [session, status]);

   const fetchDiaryByDate = useCallback(async () => {
      if (userId) {
         try {
            const res = await fetchWithBase(`/api/diary/by-student?StudentID=${userId}`)
            if (!res.ok) {
               throw new Error('Failed to fetch student advisor data');
            }
            const data = await res.json()
            setDiaryDate(data)
         } catch (error) {
            console.error('Error fetching :', error);
         }
      }
   }, [userId])

   useEffect(() => {
      fetchDiaryByDate()
   }, [fetchDiaryByDate])

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
      setDesktopOpen(!desktopOpen);

      await Swal.fire({
         icon: "success",
         text: `กำลังออกจากระบบ`,
         showConfirmButton: false,
         timer: 1500,
      });

      localStorage.clear();
      sessionStorage.clear();

      if (session) {
         await signOut({
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
         });
      } else {
         window.location.href = `${getUrlWithBase('/')}`

      }
   };

   const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
   };

   const getFirstDayOfMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
   };

   const navigateYear = (direction: 'prev' | 'next') => {
      setSelectedYear(prev => {
         const currentYear = new Date().getFullYear();
         let newYear;

         if (direction === 'prev') {
            newYear = prev - 1;
         } else {
            newYear = prev + 1;
            if (newYear > currentYear) {
               return prev;
            }
         }

         const newDate = new Date(currentDate);
         newDate.setFullYear(newYear);
         setCurrentDate(newDate);
         return newYear;
      });
   };

   const isDateClickable = (day: number) => {
      const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      targetDate.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      return hasDiaryData(day) ||
         targetDate.getTime() === today.getTime() ||
         targetDate.getTime() === yesterday.getTime();
   };

   const selectDate = (day: number) => {
      if (!isDateClickable(day)) {
         return;
      }

      const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      setSelectedDateState(newDate);

      const year = newDate.getFullYear();
      const month = String(newDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateString = `${year}-${month}-${dayStr}`;

      router.push(`/diary/${dateString}`);
   };

   const isActualToday = (day: number) => {
      const today = new Date();
      return (
         today.getDate() === day &&
         today.getMonth() === currentDate.getMonth() &&
         today.getFullYear() === currentDate.getFullYear()
      );
   };

   const isYesterday = (day: number) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      return (
         yesterday.getDate() === day &&
         yesterday.getMonth() === currentDate.getMonth() &&
         yesterday.getFullYear() === currentDate.getFullYear()
      );
   };

   const isSelectedDay = (day: number) => {
      return (
         selectedDateState.getDate() === day &&
         selectedDateState.getMonth() === currentDate.getMonth() &&
         selectedDateState.getFullYear() === currentDate.getFullYear()
      );
   };

   const hasDiaryData = (day: number) => {
      if (!diaryDate?.data || diaryDate.data.length === 0) return false;

      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const targetDate = `${year}-${month}-${dayStr}`;

      const hasData = diaryDate.data.some(dateString => {
         try {
            const date = new Date(dateString);

            if (isNaN(date.getTime())) return false;

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateOnly = `${year}-${month}-${day}`;

            return dateOnly === targetDate;
         } catch (error) {
            console.error('Error parsing date:', dateString, error);
            return false;
         }
      });

      return hasData;
   };

   const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
   ];

   console.log("role =", role);

   useEffect(() => {
      if (role && role !== 'student') {
         sessionStorage.clear()
         signOut({
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH}/`,
         });
      }
   }, [role]);

   const drawer = (
      <Box sx={{
         display: 'flex',
         flexDirection: 'column',
         height: 'auto',
         minHeight: '100%',
         boxSizing: 'border-box'
      }}>
         <Box sx={{ p: 1.5, borderBottom: '1px solid #f0f0f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
               >
                  <Avatar
                     src={session?.user?.image || user?.image || undefined}
                     alt={session?.user?.name || user?.name || "User"}
                     sx={{ width: 50, height: 50 }}
                  >
                     {(session?.user?.name || user?.name || "U").charAt(0)}
                  </Avatar>

               </IconButton>

               <Box>
                  <Typography
                     sx={{
                        color: '#111827',
                        fontWeight: 600,
                        fontSize: '16px',
                        lineHeight: 1.2
                     }}
                  >
                     {session?.user?.name || user?.name || 'User'}
                  </Typography>
                  <Typography
                     sx={{
                        color: '#6b7280',
                        fontSize: '12px',
                        mt: 0.5
                     }}
                  >
                     {session?.user?.email || user?.email || 'email@example.com'}
                  </Typography>
               </Box>

            </Box>
         </Box>

         <Box sx={{ p: 2, borderBottom: '1px solid #f0f0f0', position: 'relative' }}>
            <IconButton
               size="small"
               onClick={() => navigateYear('prev')}
               sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  width: 24,
                  height: 24,
                  '&:hover': {
                     bgcolor: '#f3f4f6',
                  },
               }}
            >
               <ChevronLeft fontSize="small" />
            </IconButton>

            <Box
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
               }}
            >
               <Typography sx={{ color: '#111827', fontWeight: 600, fontSize: '14px' }}>
                  พ.ศ. {selectedYear + 543}
               </Typography>
            </Box>

            <IconButton
               size="small"
               onClick={() => navigateYear('next')}
               sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  width: 24,
                  height: 24,
                  '&:hover': {
                     bgcolor: '#f3f4f6',
                  },
               }}
            >
               <ChevronRight fontSize="small" />
            </IconButton>
         </Box>

         <Box
            sx={{
               overflowY: 'auto',
               scrollbarWidth: 'none',
               '&::-webkit-scrollbar': {
                  display: 'none',
               },
            }}
         >
            {months.map((month, index) => {
               const isSelectedMonth = index === currentDate.getMonth() && selectedYear === currentDate.getFullYear();

               return (
                  <Box key={`month-${index}`}>
                     <ListItemButton
                        onClick={() => {
                           const newDate = new Date(selectedYear, index, 1);
                           setCurrentDate(newDate);
                        }}
                        sx={{
                           py: 1.5,
                           px: 3,
                           bgcolor: isSelectedMonth ? '#f0f9ff' : 'transparent',
                           '&:hover': {
                              bgcolor: isSelectedMonth ? '#e0f2fe' : '#f8f9fa',
                           },
                           transition: 'all 0.2s ease-in-out',
                        }}
                     >
                        <Box
                           sx={{
                              fontSize: '14px',
                              color: isSelectedMonth ? '#7e57c2' : '#374151',
                              fontWeight: isSelectedMonth ? 600 : 400,
                              position: 'relative'
                           }}
                        >
                           {month}
                           {isSelectedMonth && (
                              <Box
                                 sx={{
                                    position: 'absolute',
                                    left: -16,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 3,
                                    height: 20,
                                    bgcolor: '#7e57c2',
                                    borderRadius: '0 2px 2px 0',
                                 }}
                              />
                           )}
                        </Box>
                     </ListItemButton>

                     {isSelectedMonth && (
                        <Box sx={{ px: 3, pb: 2 }}>
                           <Grid container spacing={0}>
                              {Array.from({ length: getFirstDayOfMonth(currentDate) }, (_, i) => (
                                 // @ts-ignore
                                 <Grid item xs key={`empty-${currentDate.getMonth()}-${i}`} sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    py: 0.2
                                 }}>
                                    <Box sx={{ width: 20, height: 20 }} />
                                 </Grid>
                              ))}

                              {Array.from({ length: getDaysInMonth(currentDate) }, (_, i) => {
                                 const day = i + 1;
                                 const actualToday = isActualToday(day);
                                 const yesterdayCheck = isYesterday(day);
                                 const selected = isSelectedDay(day);
                                 const hasData = hasDiaryData(day);
                                 const clickable = isDateClickable(day);

                                 let backgroundColor, color, fontWeight;

                                 if (hasData) {
                                    backgroundColor = '#388e3c';
                                    color = 'white';
                                    fontWeight = 600;
                                 } else if (yesterdayCheck) {
                                    backgroundColor = '#fdd835';
                                    color = '#333';
                                    fontWeight = 600;
                                 } else if (clickable) {
                                    backgroundColor = 'transparent';
                                    color = '#374151';
                                    fontWeight = 400;
                                 } else {
                                    backgroundColor = 'transparent';
                                    color: '#d1d5db';
                                    fontWeight = 300;
                                 }

                                 return (
                                    // @ts-ignore
                                    <Grid item xs key={`day-${currentDate.getMonth()}-${day}`} sx={{
                                       display: 'flex',
                                       justifyContent: 'center',
                                       py: 0.4
                                    }}>
                                       <Button
                                          onClick={() => selectDate(day)}
                                          disabled={!clickable}
                                          sx={{
                                             width: 20,
                                             height: 20,
                                             minWidth: 20,
                                             borderRadius: '50%',
                                             fontSize: '10px',
                                             fontWeight,
                                             color,
                                             bgcolor: backgroundColor,
                                             cursor: clickable ? 'pointer' : 'default',
                                             '&.Mui-disabled': {
                                                color: '#d1d5db',
                                                cursor: 'default',
                                             },
                                             border: 'none',
                                             p: 0,
                                             transition: 'all 0.2s ease-in-out',
                                             '&:hover': {
                                                bgcolor: clickable && !hasData && !yesterdayCheck ? '#f3f4f6' : backgroundColor,
                                             },
                                          }}
                                       >
                                          {day}
                                       </Button>
                                    </Grid>
                                 );
                              })}
                           </Grid>
                        </Box>
                     )}
                  </Box>
               );
            })}
         </Box>

         <Box sx={{ p: 3, borderTop: '1px solid #f0f0f0' }}>
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
                     md: desktopOpen ? `calc(100% - ${drawerWidth}px)` : '100%'
                  },
                  ml: {
                     md: desktopOpen ? `${drawerWidth}px` : 0
                  },
                  bgcolor: 'white',
                  color: '#111827',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  borderBottom: '1px solid #f0f0f0',
                  transition: theme.transitions.create(['width', 'margin'], {
                     easing: theme.transitions.easing.sharp,
                     duration: theme.transitions.duration.leavingScreen,
                  }),
                  '& .MuiToolbar-root': {
                     minHeight: 80,
                  }
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
                        color: '#6b7280',
                        '&:hover': {
                           bgcolor: '#f8f9fa',
                        },
                     }}
                  >
                     <MenuIcon />
                  </IconButton>

                  <Stack sx={{ flexGrow: 1 }}>
                     <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{
                           color: '#111827',
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
                           color: '#6b7280',
                           fontWeight: 400,
                           fontSize: '12px',
                           mt: -0.5,
                        }}
                     >
                        Computer Engineering – University of Phayao
                     </Typography>
                  </Stack>

                  <Box sx={{
                     display: {
                        xs: 'none',
                        sm: 'flex',
                     }, alignItems: 'center', gap: 1
                  }}>
                     <Stack
                        sx={{
                           flexGrow: 1,
                           alignItems: 'flex-end',
                           ml: 'auto',
                        }}
                     >
                        <Typography
                           variant="h6"
                           noWrap
                           component="div"
                           sx={{
                              color: '#111827',
                              fontWeight: 700,
                              fontSize: '16px',
                           }}
                        >
                           {session?.user?.name || user?.name || 'Unknown'}
                        </Typography>
                        <Typography
                           variant="caption"
                           noWrap
                           component="div"
                           sx={{
                              color: '#6b7280',
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
                           color: '#6b7280',
                           '&:hover': {
                              bgcolor: '#f8f9fa',
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
                           onClick={() => setOpen(true)}
                           sx={{
                              fontSize: '14px',
                              py: 1.5,
                              '&:hover': {
                                 bgcolor: '#f8f9fa',
                              },
                           }}
                        >
                           <ListItemIcon sx={{ minWidth: 32 }}>
                              <VisibilityIcon fontSize="small" sx={{ color: '#6b7280' }} />
                           </ListItemIcon>
                           ดูบันทึกนิสิตคนอื่น
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
                        bgcolor: 'white',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
                        bgcolor: 'white',
                        border: 'none',
                        borderRight: '1px solid #f0f0f0',
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
                  bgcolor: '#fafafa',
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
            <ViewAllStudent
               userId={userId}
               open={open}
               onClose={() => setOpen(false)}
            />
         </Box>
      </ThemeRegistry>
   );
};

export default DiatyLayout