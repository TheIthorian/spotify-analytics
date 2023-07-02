import { Link as MuiLink } from '@mui/material';
import NextLink from 'next/link';

export function Link({ href, target, children }: { href: string; children: React.ReactNode; target?: string }) {
    const rel = target === '_blank' ? 'noreferrer' : undefined;

    return (
        <MuiLink href={href} component={NextLink} target={target} rel={rel}>
            {children}
        </MuiLink>
    );
}
