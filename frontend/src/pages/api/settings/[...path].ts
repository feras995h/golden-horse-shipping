import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import FormData from 'form-data';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path;

  try {
    // Handle file uploads differently
    if (req.method === 'POST' && apiPath === 'upload-logo') {
      // For file uploads, we need to stream the request body directly
      const response = await axios({
        method: req.method,
        url: `${BACKEND_URL}/api/settings/${apiPath}`,
        data: req,
        headers: {
          ...req.headers,
          host: undefined, // Remove host header to avoid conflicts
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      });

      res.status(response.status).json(response.data);
    } else {
      // Handle regular API calls
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', async () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          
          const response = await axios({
            method: req.method,
            url: `${BACKEND_URL}/api/settings/${apiPath}`,
            data: parsedBody,
            headers: {
              'Content-Type': 'application/json',
              ...(req.headers.authorization && { Authorization: req.headers.authorization }),
            },
            params: req.query,
          });

          res.status(response.status).json(response.data);
        } catch (error: any) {
          console.error('Settings API proxy error:', error.message);
          if (error.response) {
            res.status(error.response.status).json(error.response.data);
          } else {
            res.status(500).json({ message: 'Internal server error' });
          }
        }
      });
    }
  } catch (error: any) {
    console.error('Settings API proxy error:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}