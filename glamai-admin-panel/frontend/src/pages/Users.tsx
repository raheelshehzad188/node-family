import React from 'react';
import { Box, Typography } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        User Management
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Manage users, roles, and permissions
      </Typography>
    </Box>
  );
};

export default Users;