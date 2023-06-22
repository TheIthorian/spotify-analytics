import * as React from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const i18n = {
    login: 'Login',
    appTitle: 'Spotify Analytics',
};

export function Nav() {
    const [auth, setAuth] = React.useState(false);

    const handleLogin = (authData: boolean) => {
        setAuth(authData);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position='static'>
                <Toolbar>
                    <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                        {i18n.appTitle}
                    </Typography>
                    <UserProfileButton auth={auth} handleLogin={handleLogin} />
                </Toolbar>
            </AppBar>
        </Box>
    );
}

function UserProfileButton({ auth, handleLogin }: { auth: boolean; handleLogin: (authData: boolean) => void }) {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLogout = () => {
        handleLogin(false);
        handleClose();
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    if (!auth) {
        return (
            <Button color='inherit' onClick={() => handleLogin(true)}>
                Login
            </Button>
        );
    }

    return (
        <div>
            <IconButton
                size='large'
                aria-label='account of current user'
                aria-controls='menu-appbar'
                aria-haspopup='true'
                onClick={handleMenu}
                color='inherit'
            >
                <AccountCircle />
            </IconButton>
            <Menu
                id='menu-appbar'
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={() => handleLogout()}>Log out</MenuItem>
            </Menu>
        </div>
    );
}
