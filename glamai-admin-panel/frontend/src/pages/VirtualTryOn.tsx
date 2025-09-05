import React, { useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  CloudUpload,
  CheckroomOutlined,
  Person,
  AutoAwesome,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import glamaiService from '../services/glamaiService';

interface ImageFile {
  file: File;
  preview: string;
}

const VirtualTryOn: React.FC = () => {
  const [userImage, setUserImage] = useState<ImageFile | null>(null);
  const [garmentImage, setGarmentImage] = useState<ImageFile | null>(null);
  const [maskType, setMaskType] = useState<string>('overall');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  const onDropUser = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUserImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  const onDropGarment = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setGarmentImage({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  }, []);

  const userDropzone = useDropzone({
    onDrop: onDropUser,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  const garmentDropzone = useDropzone({
    onDrop: onDropGarment,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
  });

  const handleTryOn = async () => {
    if (!userImage || !garmentImage) {
      enqueueSnackbar('Please upload both user and garment images', {
        variant: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      // In a real implementation, you would upload the images first
      // and get their URLs, then call the API
      const response = await glamaiService.virtualTryOn({
        userImageUrl: 'uploaded-user-image-url',
        garmentImageUrl: 'uploaded-garment-image-url',
        maskType,
      });

      if (response.success) {
        setResult(response.data.resultUrl);
        enqueueSnackbar('Virtual try-on completed successfully!', {
          variant: 'success',
        });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      enqueueSnackbar(error.message || 'Failed to process try-on', {
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetImages = () => {
    setUserImage(null);
    setGarmentImage(null);
    setResult(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Virtual Try-On
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Upload a user photo and garment image to see how they look together
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Upload Section */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upload Images
              </Typography>

              {/* User Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  User Photo
                </Typography>
                <Box
                  {...userDropzone.getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: userDropzone.isDragActive
                      ? 'primary.main'
                      : 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: userDropzone.isDragActive
                      ? 'action.hover'
                      : 'background.paper',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input {...userDropzone.getInputProps()} />
                  {userImage ? (
                    <Box>
                      <img
                        src={userImage.preview}
                        alt="User"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          borderRadius: 8,
                        }}
                      />
                      <Typography variant="caption" display="block" mt={1}>
                        {userImage.file.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <Person
                        sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Drag & drop user photo here, or click to select
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Garment Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Garment Image
                </Typography>
                <Box
                  {...garmentDropzone.getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderColor: garmentDropzone.isDragActive
                      ? 'primary.main'
                      : 'divider',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: garmentDropzone.isDragActive
                      ? 'action.hover'
                      : 'background.paper',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <input {...garmentDropzone.getInputProps()} />
                  {garmentImage ? (
                    <Box>
                      <img
                        src={garmentImage.preview}
                        alt="Garment"
                        style={{
                          maxWidth: '100%',
                          maxHeight: 200,
                          borderRadius: 8,
                        }}
                      />
                      <Typography variant="caption" display="block" mt={1}>
                        {garmentImage.file.name}
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <CheckroomOutlined
                        sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Drag & drop garment image here, or click to select
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Mask Type Selection */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Mask Type</InputLabel>
                <Select
                  value={maskType}
                  onChange={(e) => setMaskType(e.target.value)}
                  label="Mask Type"
                >
                  <MenuItem value="overall">Overall</MenuItem>
                  <MenuItem value="upper">Upper Body</MenuItem>
                  <MenuItem value="lower">Lower Body</MenuItem>
                </Select>
              </FormControl>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleTryOn}
                  disabled={!userImage || !garmentImage || loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AutoAwesome />
                    )
                  }
                >
                  {loading ? 'Processing...' : 'Try On'}
                </Button>
                <Button variant="outlined" onClick={resetImages}>
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Tips */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Tips for Best Results
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Use high-quality images with good lighting
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Ensure the person is facing forward in the photo
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Garment images should have a clean background
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Select the appropriate mask type for your garment
                </Typography>
              </li>
            </Box>
          </Paper>
        </Grid>

        {/* Result Section */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Result</Typography>
                {result && (
                  <Chip
                    label="Processing Complete"
                    color="success"
                    size="small"
                  />
                )}
              </Box>

              {result ? (
                <Box>
                  <img
                    src={result}
                    alt="Try-on result"
                    style={{
                      width: '100%',
                      borderRadius: 8,
                      marginBottom: 16,
                    }}
                  />
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<CloudUpload />}
                    >
                      Download
                    </Button>
                    <Button variant="outlined" fullWidth>
                      Share
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 400,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckroomOutlined
                      sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      Try-on result will appear here
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default VirtualTryOn;