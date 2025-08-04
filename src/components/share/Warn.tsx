import React from 'react';
import { Paper, Box } from '@mui/material';

const Warn = () => {
    return (
        <Paper
            elevation={0}
            sx={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #e0e0e0'
            }}
        >
            <Box sx={{ p: 3, flex: 1 }}>

            </Box>
        </Paper>
    );
};

export default Warn;