import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Paper, Box, Typography, Avatar, Divider, Chip } from '@mui/material';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import BookIcon from '@mui/icons-material/Book';
import CommentIcon from '@mui/icons-material/Comment';
import WarningIcon from '@mui/icons-material/Warning';

export interface Student {
    ID: number;
    Name: string | null;
    Email: string;
    Image: string | null;
    Role: string;
    CreatedAt: string;
}

export interface Attachment {
    ID: number;
    FileName: string;
    FileURL: string;
    CreatedAt: string;
}

export interface Diary {
    ID: number;
    StudentID: number;
    ContentHTML: string;
    ContentDelta: string;
    IsShared: string;
    AllowComment: boolean;
    Status: string;
    DiaryDate: string;
    CreatedAt: string;
    UpdatedAt: string;
    Student: Student;
    Attachments: Attachment[] | null;
}

export interface Notification {
    ID: number;
    UserID: number;
    DiaryID: number;
    Type: string;
    Title: string;
    Message: string;
    Data: {
        diary_date: string;
        student_id: number;
    };
    IsRead: boolean;
    CreatedAt: string;
    UpdatedAt: string;
    User: {
        ID: number;
        Name: string | null;
        Email: string;
        Image: string | null;
        Role: string;
        CreatedAt: string;
    };
    Diary: Diary;
}

export interface NotificationResponse {
    count: number;
    data: Notification[];
    limit: number;
    message: string;
    page: number;
    total: number;
}

interface AdvisorProps {
    advisorId: number | null;
}

const Warn = ({ advisorId }: AdvisorProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const reconnectCountRef = useRef(0);
    const maxReconnectAttempts = 10;
    const baseReconnectDelay = 1000;

    const fetchInitialNotifications = useCallback(async () => {
        if (advisorId) {
            try {
                setIsLoading(true);
                const res = await fetchWithBase(`/api/notification/all?advisor_id=${advisorId}`);
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: Failed to fetch notifications`);
                }
                const data: NotificationResponse = await res.json();
                const sortedNotifications = (data.data || []).sort((a, b) =>
                    new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
                );
                setNotifications(sortedNotifications);
                setError(null);
            } catch (error) {
                console.error('Error fetching initial notifications:', error);
                setError('ไม่สามารถดึงข้อมูลการแจ้งเตือนได้');
            } finally {
                setIsLoading(false);
            }
        }
    }, [advisorId]);

    const getReconnectDelay = useCallback(() => {
        return Math.min(baseReconnectDelay * Math.pow(2, reconnectCountRef.current), 30000);
    }, []);

    const closeSSE = useCallback(() => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
    }, []);

    const setupSSE = useCallback(() => {
        if (!advisorId) return;
        closeSSE();
        try {
            setConnectionStatus('connecting');
            // console.log(`Attempting SSE connection for advisor ${advisorId}`);
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
            const sseUrl = `${baseURL}/api/notification/stream?advisor_id=${advisorId}`;
            // console.log('SSE URL:', sseUrl);
            eventSourceRef.current = new EventSource(sseUrl, {
                withCredentials: true
            });
            // console.log('EventSource created, readyState:', eventSourceRef.current.readyState);
            eventSourceRef.current.onopen = () => {
                // console.log('SSE connection opened:', event);
                // console.log('EventSource readyState:', eventSourceRef.current?.readyState);
                setConnectionStatus('connected');
                setError(null);
                reconnectCountRef.current = 0;
            };
            eventSourceRef.current.onmessage = (event) => {
                try {
                    // console.log('SSE message received:', event.data);
                    const data = JSON.parse(event.data);
                    if (data.type === 'connected') {
                        // console.log('SSE connection confirmed');
                        return;
                    }
                    if (data.type === 'heartbeat') {
                        // console.log('Heartbeat received at', data.time);
                        return;
                    }
                    if (data.ID && data.Type) {
                        const newNotification: Notification = data;
                        // console.log('New notification received:', newNotification);
                        setNotifications(prev => {
                            const exists = prev.some(n => n.ID === newNotification.ID);
                            if (exists) return prev;
                            const updated = [newNotification, ...prev];
                            return updated.sort((a, b) =>
                                new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
                            );
                        });
                    }
                } catch (error) {
                    console.error('Error parsing SSE message:', error);
                }
            };
            eventSourceRef.current.onerror = () => {
                // console.error('SSE error occurred:', event);
                // console.error('EventSource readyState:', eventSourceRef.current?.readyState);
                // console.error('EventSource URL:', eventSourceRef.current?.url);
                setConnectionStatus('disconnected');
                if (eventSourceRef.current) {
                    eventSourceRef.current.close();
                    eventSourceRef.current = null;
                }
                if (reconnectCountRef.current < maxReconnectAttempts) {
                    const delay = getReconnectDelay();
                    // console.log(`Attempting reconnection in ${delay}ms (attempt ${reconnectCountRef.current + 1}/${maxReconnectAttempts})`);
                    reconnectTimeoutRef.current = setTimeout(() => {
                        reconnectCountRef.current++;
                        setupSSE();
                    }, delay);
                } else {
                    console.error('Max reconnection attempts reached');
                    setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาโหลดหน้าใหม่');
                }
            };
            eventSourceRef.current.addEventListener('notification_read', (event) => {
                try {
                    const { notification_id } = JSON.parse((event as MessageEvent).data);
                    setNotifications(prev =>
                        prev.map(notif =>
                            notif.ID === notification_id
                                ? { ...notif, IsRead: true }
                                : notif
                        )
                    );
                } catch (error) {
                    console.error('Error parsing notification_read event:', error);
                }
            });
        } catch (error) {
            console.error('Error setting up SSE:', error);
            setConnectionStatus('disconnected');
            setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }
    }, [advisorId, closeSSE, getReconnectDelay]);

    const handleManualReconnect = useCallback(() => {
        reconnectCountRef.current = 0;
        setError(null);
        setupSSE();
    }, [setupSSE]);

    const checkServerHealth = useCallback(async () => {
        try {
            const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL
            const response = await fetch(`${baseURL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Server health check failed:', error);
            return false;
        }
    }, []);

    useEffect(() => {
        if (advisorId) {
            checkServerHealth().then(isHealthy => {
                if (isHealthy) {
                    fetchInitialNotifications();
                    setTimeout(() => {
                        setupSSE();
                    }, 500);
                } else {
                    setError('เซิร์ฟเวอร์ไม่พร้อมใช้งาน กรุณาตรวจสอบการเชื่อมต่อ');
                    setIsLoading(false);
                }
            });
        }
        return () => {
            closeSSE();
        };
    }, [advisorId, fetchInitialNotifications, setupSSE, closeSSE, checkServerHealth]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (!document.hidden && advisorId && connectionStatus === 'disconnected') {
                // console.log('Tab became visible, checking server and attempting reconnection');
                checkServerHealth().then(isHealthy => {
                    if (isHealthy) {
                        handleManualReconnect();
                    } else {
                        setError('เซิร์ฟเวอร์ไม่พร้อมใช้งาน');
                    }
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [advisorId, connectionStatus, handleManualReconnect, checkServerHealth]);

    const formatDate = (dateString: string, showTime = true) => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        if (showTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        return new Date(dateString).toLocaleDateString('th-TH', options);
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new_diary':
                return <BookIcon />;
            case 'comment':
                return <CommentIcon />;
            default:
                return <WarningIcon />;
        }
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return '#4caf50';
            case 'connecting':
                return '#ff9800';
            case 'disconnected':
                return '#f44336';
            default:
                return '#9e9e9e';
        }
    };

    const containerStyles = {
        height: '41vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        border: '1px solid #e0e0e0',
        overflow: 'hidden'
    };

    if (isLoading) {
        return (
            <Paper elevation={0} sx={containerStyles}>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-lg">กำลังโหลด...</p>
                    </div>
                </Box>
            </Paper>
        );
    }

    if (error && notifications.length === 0 && !error.includes('เชื่อมต่อ')) {
        return (
            <Paper elevation={0} sx={containerStyles}>
                <Box sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 3,
                    gap: 2
                }}>
                    <Typography color="error" variant="h6" textAlign="center">
                        {error}
                    </Typography>
                    <button
                        onClick={handleManualReconnect}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        ลองเชื่อมต่อใหม่
                    </button>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper elevation={0} sx={containerStyles}>
            <Box sx={{
                p: 1.5,
                borderBottom: '1px solid #e0e0e0',
                flexShrink: 0,
                height: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="600" sx={{ ml: 2 }}>
                        การแจ้งเตือน ({notifications.length})
                    </Typography>
                    <Box
                        sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: getConnectionStatusColor(),
                            animation: connectionStatus === 'connecting' ? 'pulse 1.5s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 }
                            }
                        }}
                        title={
                            connectionStatus === 'connected' ? 'เชื่อมต่อแล้ว' :
                                connectionStatus === 'connecting' ? 'กำลังเชื่อมต่อ' :
                                    'ขาดการเชื่อมต่อ'
                        }
                    />
                </Box>
            </Box>
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#c1c1c1',
                    borderRadius: '4px',
                    '&:hover': {
                        background: '#a1a1a1',
                    },
                }
            }}>
                {error && error.includes('เชื่อมต่อ') && (
                    <Box sx={{ p: 1, backgroundColor: '#fff3cd', borderBottom: '1px solid #ffeaa7' }}>
                        <Typography variant="caption" color="warning.main">
                            {error}
                        </Typography>
                    </Box>
                )}
                {notifications.length === 0 ? (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            ไม่มีการแจ้งเตือนในขณะนี้
                        </Typography>
                    </Box>
                ) : (
                    <Box>
                        {notifications.map((notification, index) => (
                            <React.Fragment key={notification.ID}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        },
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                        <Box sx={{ position: 'relative' }}>
                                            <Avatar
                                                src={notification.Diary?.Student?.Image || ''}
                                                alt={notification.Diary?.Student?.Name || 'Student'}
                                                sx={{ width: 32, height: 32 }}
                                            >
                                                {notification.Diary?.Student?.Name?.charAt(0) || 'S'}
                                            </Avatar>
                                            {!notification.IsRead && (
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -2,
                                                        right: -2,
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        backgroundColor: 'primary.main'
                                                    }}
                                                />
                                            )}
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                <Typography variant="body2" component="span">
                                                    {getNotificationIcon(notification.Type)}
                                                </Typography>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {notification.Title}
                                                </Typography>
                                                <Chip
                                                    label={
                                                        notification.Type === 'new_diary'
                                                            ? 'บันทึกใหม่'
                                                            : notification.Type === 'comment'
                                                                ? 'ความคิดเห็นใหม่'
                                                                : notification.Type
                                                    }
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <Box sx={{ mb: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>นิสิต:</strong> {notification.Diary?.Student?.Name || 'ไม่ระบุชื่อ'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    <strong>วันที่บันทึก:</strong> {formatDate(notification.Data.diary_date, false)}
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                {formatDate(notification.CreatedAt)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                                {index < notifications.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

export default Warn;