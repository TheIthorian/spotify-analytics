import * as React from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';

import {
    AppBar,
    Box,
    Button,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import { Dashboard, QuestionMark, Upload } from '@mui/icons-material';
import Link from 'next/link';

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
                    <NavigationDrawer />
                    <Typography variant='h6' component='div' sx={{ flexGrow: 1, marginLeft: 1 }}>
                        <Link href='/'>{i18n.appTitle}</Link>
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

function NavigationDrawer() {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type === 'keydown' && ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')) {
            return;
        }

        setIsOpen(open);
    };

    return (
        <>
            <Button onClick={toggleDrawer(true)}>{<MenuIcon />}</Button>
            <Drawer anchor='left' open={isOpen} onClose={toggleDrawer(false)}>
                <Box role='presentation' onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
                    <Box height={50}></Box>
                    <List>
                        <ListItem key='Home'>
                            <Link href='/'>
                                <ListItemButton sx={{ paddingRight: 5 }}>
                                    <ListItemIcon>
                                        <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                                            <Dashboard />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary='Dashboard' />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                        <ListItem key='Uploads'>
                            <Link href='/upload'>
                                <ListItemButton sx={{ paddingRight: 5 }}>
                                    <ListItemIcon>
                                        <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                                            <Upload />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary='Uploads' />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    </List>
                    <Divider />

                    <List>
                        <ListItem key='Help'>
                            <Link href='/help'>
                                <ListItemButton sx={{ paddingRight: 5 }}>
                                    <ListItemIcon>
                                        <IconButton size='large' edge='start' color='inherit' aria-label='menu' sx={{ mr: 2 }}>
                                            <QuestionMark />
                                        </IconButton>
                                    </ListItemIcon>
                                    <ListItemText primary='Help' />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </>
    );
}
