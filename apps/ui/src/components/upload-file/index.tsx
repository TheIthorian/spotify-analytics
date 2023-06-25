import { CONFIG } from '@/config';
import { Clear } from '@mui/icons-material';
import { Button, Divider, FormControl, IconButton, Input, List, ListItem, ListItemButton, ListItemText, Stack } from '@mui/material';
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

    return await response.json();
}

export function UploadFiles({ onSubmit }: { onSubmit: () => void }) {
    const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
    const [progress, setProgress] = React.useState(0);
    const [message, setMessage] = React.useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    function handleRemoveFileItem(filename: string) {
        const newSelectedFiles = selectedFiles.filter(file => file.name !== filename);
        setSelectedFiles(newSelectedFiles);

        const inputElement = fileInputRef.current?.firstElementChild as HTMLInputElement;
        if (!inputElement?.files) return;

        const dt = new DataTransfer();

        const { files } = inputElement;
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.name !== filename) dt.items.add(file); // here you exclude the file. thus removing it.
        }

        inputElement.files = dt.files; // Assign the updates list
    }

    function clearFileInput() {
        const inputElement = fileInputRef.current?.firstElementChild as HTMLInputElement;
        if (!inputElement) return;

        inputElement.files = new DataTransfer().files;
        setSelectedFiles([]);
    }

    async function handleSubmit() {
        console.log('handleSubmit.uploadFile');
        await uploadFile(selectedFiles).catch(() => {
            setProgress(0);
            setMessage('Could not upload the file!');
            setSelectedFiles([]);
        });

        console.log('handleSubmit.onSubmit');
        clearFileInput();
        await onSubmit();
    }

    return (
        <>
            <FormControl>
                <Stack direction='row' spacing={1}>
                    {/* <Button variant='outlined' component='label'>
                Upload File
            </Button> */}
                    <Input ref={fileInputRef} id='file-input' type='file' onChange={handleAddFile} inputProps={{ multiple: true }} />
                    <Button type='submit' variant='contained' onClick={handleSubmit} disabled={!selectedFiles.length}>
                        Submit
                    </Button>
                </Stack>
            </FormControl>
            <StagedFileList files={selectedFiles} onRemoveItem={handleRemoveFileItem} />
        </>
    );
}

function StagedFileList({ files, onRemoveItem }: { files: File[]; onRemoveItem: (filename: string) => void }) {
    if (!files.length) return null;

    return (
        <List sx={{ width: '100%' }} aria-label='contacts'>
            {files.map((file: File) => (
                <React.Fragment key={file.name}>
                    <ListItem disablePadding>
                        <ListItemButton>
                            <ListItemText primary={file.name} />
                            <IconButton edge='end' aria-label='delete' onClick={() => onRemoveItem(file.name)}>
                                <Clear />
                            </IconButton>
                        </ListItemButton>
                    </ListItem>
                    <Divider />
                </React.Fragment>
            ))}
        </List>
    );
}
