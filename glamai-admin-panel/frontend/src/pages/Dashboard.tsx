import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
} from '@mui/material';
import {
  TrendingUp,
  CheckroomOutlined,
  AutoAwesome,
  Palette,
  AccessTime,
  CheckCircle,
  Error,
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

// Mock data
const statsData = [
  {
    title: 'Total API Calls',
    value: '12,543',
    change: '+12%',
    icon: <TrendingUp />,
    color: '#6C63FF',
  },
  {
    title: 'Virtual Try-Ons',
    value: '3,421',
    change: '+8%',
    icon: <CheckroomOutlined />,
    color: '#FF6B6B',
  },
  {
    title: 'Beautifications',
    value: '5,892',
    change: '+15%',
    icon: <AutoAwesome />,
    color: '#48BB78',
  },
  {
    title: 'Templates Used',
    value: '2,230',
    change: '+5%',
    icon: <Palette />,
    color: '#ED8936',
  },
];

const chartData = [
  { name: 'Mon', calls: 1800 },
  { name: 'Tue', calls: 2400 },
  { name: 'Wed', calls: 2200 },
  { name: 'Thu', calls: 2800 },
  { name: 'Fri', calls: 3200 },
  { name: 'Sat', calls: 2100 },
  { name: 'Sun', calls: 1900 },
];

const recentActivity = [
  {
    id: 1,
    user: 'John Doe',
    action: 'Virtual Try-On',
    status: 'success',
    time: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 2,
    user: 'Jane Smith',
    action: 'Image Beautification',
    status: 'success',
    time: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: 3,
    user: 'Mike Johnson',
    action: 'Template Apply',
    status: 'error',
    time: new Date(Date.now() - 1000 * 60 * 30),
  },
  {
    id: 4,
    user: 'Sarah Williams',
    action: 'Background Removal',
    status: 'success',
    time: new Date(Date.now() - 1000 * 60 * 45),
  },
];

const Dashboard: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Welcome back! Here's an overview of your GlamAI activity.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {statsData.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}20`,
                      color: stat.color,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box sx={{ ml: 'auto' }}>
                    <Chip
                      label={stat.change}
                      size="small"
                      sx={{
                        bgcolor: '#48BB7820',
                        color: '#48BB78',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Usage This Week
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="calls"
                    stroke="#6C63FF"
                    strokeWidth={3}
                    dot={{ fill: '#6C63FF', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              API Health
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Success Rate</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    98.5%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={98.5}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#48BB78',
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Average Response Time</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    245ms
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#ED8936',
                    },
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">API Quota Used</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    65%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={65}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: '#e0e0e0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: '#6C63FF',
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {recentActivity.map((activity) => (
                <ListItem key={activity.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>{activity.user.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1">{activity.user}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          performed
                        </Typography>
                        <Typography variant="body1" fontWeight="medium">
                          {activity.action}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <AccessTime fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {format(activity.time, 'MMM d, h:mm a')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box>
                    {activity.status === 'success' ? (
                      <Chip
                        icon={<CheckCircle />}
                        label="Success"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<Error />}
                        label="Failed"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;