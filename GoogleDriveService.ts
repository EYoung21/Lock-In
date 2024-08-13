import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import RNFS from 'react-native-fs';

export const uploadFileToGoogleDrive = async (filePath: string, mimeType: string) => {
  try {
    // Get the access token
    const { accessToken } = await GoogleSignin.getTokens();

    // Create metadata for the file
    const metadata = {
      name: 'statistics.csv',
      mimeType,
    };

    // Create the form data
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json', lastModified: Date.now() }));
    form.append('file', {
      uri: `file://${filePath}`,
      type: mimeType,
      name: 'statistics.csv',
    } as any); // Use `as any` to bypass the TypeScript check

    // Make the request to Google Drive API
    const response = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', form, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/related',
      },
    });

    console.log('File Id:', response.data.id);
    return response.data.id;
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
  }
};
