import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Button,
    CircularProgress,
    Avatar,
    Divider,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { withBasePath } from '@/app/unit/imageSrc';

interface ApproveUserPopupProps {
    open: boolean;
    onClose: () => void;
}

interface Approve {
    ID: number;
    Name: string;
    Email: string;
    Approved: boolean;
    Image: string;
}

const ApproveUserPopup: React.FC<ApproveUserPopupProps> = ({ open, onClose }) => {
    const [approve, setApprove] = useState<Approve[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const defaultAvatar = `${withBasePath("/default-avatar.png")}`;

    const fetchApprove = async () => {
        setLoading(true);
        try {
            const res = await fetchWithBase("/api/alluser");
            if (!res.ok) throw new Error('ไม่สามารถโหลดรายชื่อผู้ใช้ได้');
            const data = await res.json();
            setApprove(Array.isArray(data) ? data : [data]);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถโหลดรายชื่อผู้ใช้');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithBase(`/api/user/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Approved: true }),
            });
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'อนุมัติผู้ใช้ไม่สำเร็จ');
            }
            setApprove(prev => prev.map(user => user.ID === id ? { ...user, Approved: true } : user));
        } catch (err) {
            console.error(err);
            setError('อนุมัติผู้ใช้ไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchApprove();
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    p: 0,
                    bgcolor: 'background.paper'
                }
            }}
        >
            <DialogContent sx={{ p: 0 }}>
                <Box sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3,
                        pb: 2,
                        borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{
                                p: 1.5,
                                backgroundColor: 'rgba(156, 39, 176, 0.08)',
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <PersonAddIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: '#1a1a1a',
                                    fontSize: '1.1rem',
                                    lineHeight: 1.2
                                }}
                            >
                                อนุมัติผู้ใช้
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#666',
                                padding: '8px',
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    color: '#333'
                                }
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>

                    {/* Content */}
                    {loading && <CircularProgress size={24} sx={{ display: 'block', mx: 'auto', my: 2 }} />}
                    {error && <Typography color="error" mb={2} textAlign="center">{error}</Typography>}

                    {approve.length > 0 ? (
                        approve.map(user => (
                            <Box key={user.ID}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}>
                                    <Avatar src={user.Image || defaultAvatar} alt={user.Name} sx={{ width: 50, height: 50 }} />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1">{user.Name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{user.Email}</Typography>
                                        <Typography variant="body2" color={user.Approved ? 'success.main' : 'text.secondary'}>
                                            สถานะ: {user.Approved ? 'อนุมัติแล้ว' : 'รอดำเนินการ'}
                                        </Typography>
                                    </Box>
                                    {!user.Approved && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            onClick={() => handleApprove(user.ID)}
                                            disabled={loading}
                                            sx={{
                                                borderRadius: 2.5,
                                                textTransform: 'none',
                                                backgroundColor: '#7E57C2',
                                                '&:hover': { backgroundColor: '#673ab7' }
                                            }}
                                        >
                                            อนุมัติ
                                        </Button>
                                    )}
                                </Box>
                                <Divider />
                            </Box>
                        ))
                    ) : (
                        !loading && <Typography textAlign="center" color="text.secondary" mt={2}>ไม่พบผู้ใช้</Typography>
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ApproveUserPopup;
