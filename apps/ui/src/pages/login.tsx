import { CONFIG } from '@/config';
import {
    Avatar,
    Box,
    Button,
    Card,
    Checkbox,
    Container,
    CssBaseline,
    FormControlLabel,
    Grid,
    Link,
    TextField,
    Typography,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import React from 'react';
import { useRouter } from 'next/router';

export default function Login() {
    const [password, setPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const router = useRouter();

    async function handleLogin() {
        console.log(`username: ${username}, password: ${password}`);

        const loginResponse = await fetch(CONFIG.AUTH_BASE + '/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (loginResponse.ok) {
            const body = await loginResponse.json();
            localStorage.setItem('jwt', body.token);
        }
        router.push('/');
    }

    return (
        <Container component='main' maxWidth='xs' sx={{ mb: 20 }}>
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component='h1' variant='h5'>
                    Sign in
                </Typography>
                <Box component='form' onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin='normal'
                        required
                        fullWidth
                        id='email'
                        label='Email Address'
                        name='email'
                        // autoComplete='email'
                        autoFocus
                        onChange={e => setUsername(e.target.value)}
                    />
                    <TextField
                        margin='normal'
                        required
                        fullWidth
                        name='password'
                        label='Password'
                        type='password'
                        id='password'
                        // autoComplete='current-password'
                        onChange={e => setPassword(e.target.value)}
                    />
                    <FormControlLabel control={<Checkbox value='remember' color='primary' />} label='Remember me' />
                    <Button fullWidth variant='contained' sx={{ mt: 3, mb: 2 }} onClick={handleLogin}>
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item xs>
                            <Link href='#' variant='body2'>
                                Forgot password?
                            </Link>
                        </Grid>
                        <Grid item>
                            <Link href='#' variant='body2'>
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}
