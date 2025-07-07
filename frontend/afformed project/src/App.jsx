import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} role="tabpanel">
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [urlInputs, setUrlInputs] = useState([{ url: '', validity: 30, shortcode: '' }]);
  const [shortenedUrls, setShortenedUrls] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Handle route changes and redirections
    const path = window.location.pathname.substring(1); // Remove leading slash
    if (path) {
      const urlData = shortenedUrls.find(url => {
        const shortCode = url.shortUrl.split('/').pop();
        return shortCode === path;
      });

      if (urlData) {
        // Check if URL has expired
        if (new Date() > new Date(urlData.expiryDate)) {
          setError('This URL has expired');
          return;
        }

        // Update click statistics
        const updatedUrls = shortenedUrls.map(url => {
          if (url === urlData) {
            return {
              ...url,
              clicks: url.clicks + 1,
              clickData: [...url.clickData, {
                timestamp: new Date().toISOString(),
                source: document.referrer || 'Direct',
                location: 'Local' // In a real app, you'd get this from an API
              }]
            };
          }
          return url;
        });
        setShortenedUrls(updatedUrls);

        // Redirect to original URL
        window.location.href = urlData.originalUrl;
      }
    }
  }, [shortenedUrls]);

  const shortenUrls = () => {
    const newUrls = urlInputs.map(input => {
      const shortcode = input.shortcode || Math.random().toString(36).substr(2, 6);
      
      // Check for shortcode uniqueness
      if (input.shortcode && shortenedUrls.some(url => url.shortUrl.endsWith(input.shortcode))) {
        throw new Error('Custom shortcode already exists');
      }

      return {
        originalUrl: input.url,
        shortUrl: `http://localhost:3000/${shortcode}`,
        createdAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + input.validity * 60000).toISOString(),
        clicks: 0,
        clickData: []
      };
    });

    setShortenedUrls([...shortenedUrls, ...newUrls]);
    setUrlInputs([{ url: '', validity: 30, shortcode: '' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      // Validate URLs
      const invalidUrls = urlInputs.filter(input => {
        try {
          new URL(input.url);
          return false;
        } catch {
          return true;
        }
      });

      if (invalidUrls.length > 0) {
        setError('Please enter valid URLs');
        return;
      }

      shortenUrls();
    } catch (err) {
      setError(err.message);
    }
  };

  const addUrlInput = () => {
    if (urlInputs.length < 5) {
      setUrlInputs([...urlInputs, { url: '', validity: 30, shortcode: '' }]);
    }
  };

  const removeUrlInput = (index) => {
    const newInputs = urlInputs.filter((_, i) => i !== index);
    setUrlInputs(newInputs);
  };

  const handleInputChange = (index, field, value) => {
    const newInputs = [...urlInputs];
    newInputs[index][field] = value;
    setUrlInputs(newInputs);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ width: '100%', mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>

        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
          >
            <Tab label="Shorten URLs" />
            <Tab label="Statistics" />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TabPanel value={activeTab} index={0}>
          <form onSubmit={handleSubmit}>
            {urlInputs.map((input, index) => (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="URL to Shorten"
                        value={input.url}
                        onChange={(e) => handleInputChange(index, 'url', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Validity (minutes)"
                        value={input.validity}
                        onChange={(e) => handleInputChange(index, 'validity', e.target.value)}
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <TextField
                        fullWidth
                        label="Custom Shortcode"
                        value={input.shortcode}
                        onChange={(e) => handleInputChange(index, 'shortcode', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={1}>
                      {urlInputs.length > 1 && (
                        <IconButton onClick={() => removeUrlInput(index)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            ))}
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
              {urlInputs.length < 5 && (
                <Button
                  startIcon={<AddIcon />}
                  onClick={addUrlInput}
                  variant="outlined"
                >
                  Add URL
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Shorten URLs
              </Button>
            </Box>
          </form>

          {shortenedUrls.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Shortened URLs
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Original URL</TableCell>
                      <TableCell>Short URL</TableCell>
                      <TableCell>Expiry Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shortenedUrls.map((url, index) => (
                      <TableRow key={index}>
                        <TableCell>{url.originalUrl}</TableCell>
                        <TableCell>
                          <a href={url.shortUrl} target="_blank" rel="noopener noreferrer">
                            {url.shortUrl}
                          </a>
                        </TableCell>
                        <TableCell>
                          {new Date(url.expiryDate).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Short URL</TableCell>
                  <TableCell>Original URL</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Expires At</TableCell>
                  <TableCell>Clicks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {shortenedUrls.map((url, index) => (
                  <TableRow key={index}>
                    <TableCell>{url.shortUrl}</TableCell>
                    <TableCell>{url.originalUrl}</TableCell>
                    <TableCell>{new Date(url.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(url.expiryDate).toLocaleString()}</TableCell>
                    <TableCell>{url.clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Box>
    </Container>
  );
}

export default App;