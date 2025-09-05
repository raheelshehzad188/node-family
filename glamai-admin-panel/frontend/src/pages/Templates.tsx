import React from 'react';
import { Box, Typography } from '@mui/material';

const Templates: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Templates & Filters
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Browse and apply pre-designed templates and filters
      </Typography>
    </Box>
  );
};

export default Templates;