import { CONFIG } from '@/config';
import { Button, FormControl, FormHelperText, Input, InputLabel, Stack } from '@mui/material';
import React from 'react';

async function uploadFile(files: File[]) {
    const formData = new FormData();

    for (const file of files) {
        formData.append('file', file);
    }

    const requestOptions = {
        method: 'POST',
        body: formData,
        // redirect: 'follow'
    };

    const response = await fetch(CONFIG.API_BASE + '/upload', requestOptions);

    if (!response.ok) {
        throw new Error('Error uploading file', { cause: await response.json() });
    }
}

export function UploadFiles() {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [progress, setProgress] = React.useState(0);
    const [message, setMessage] = React.useState('');

    React.useEffect(() => {}, []);

    const handleAddFile: React.ChangeEventHandler<HTMLInputElement> = event => {
        if (!event.target.files) return;

        const files: File[] = [];
        for (let i = 0; i < event.target.files?.length; i++) {
            files.push(event.target.files[i]);
        }

        console.log(files);
        setProgress(0);
        setSelectedFiles(files);
    };

    async function handleSubmit() {
        await uploadFile(selectedFiles).catch(() => {
            setProgress(0);
            setMessage('Could not upload the file!');
            setSelectedFiles([]);
        });
    }

    return (
        <FormControl>
            <Stack direction='row' spacing={1}>
                {/* <Button variant='outlined' component='label'>
                Upload File
            </Button> */}
                <Input id='file-input' type='file' onChange={handleAddFile} />
                <Button type='submit' variant='contained' onClick={handleSubmit} disabled={!selectedFiles.length}>
                    Submit
                </Button>
            </Stack>
            {selectedFiles.map((file, index) => (
                <div key={index}>
                    <p>{file.name}</p>
                </div>
            ))}
        </FormControl>
    );
}
