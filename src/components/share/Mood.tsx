import React from 'react';
import { Paper, Box } from '@mui/material';

const Mood = () => {
    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                height: '50vh',
                display: 'flex',
                alignItems: 'center',
                borderRadius: 3,
                border: '1px solid #e0e0e0'
            }}
        >
            <Box sx={{ px: 3, width: '100%' }}>

            </Box>
        </Paper>
    );
};

export default Mood;