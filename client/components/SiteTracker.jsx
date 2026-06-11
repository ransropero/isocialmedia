'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackSiteVisit } from '@/services/api';

export default function SiteTracker({ children }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isFirstRun = useRef(true);
    const lastPathname = useRef(null);

    useEffect(() => {
        if (!pathname) return;
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/api') || pathname.startsWith('/admin')) return;
        if (searchParams?.get('preview') === 'true') return;

        if (lastPathname.current === pathname && !isFirstRun.current) return;
        lastPathname.current = pathname;
        isFirstRun.current = false;

        const track = async () => {
            try {
                const source = searchParams?.get('utm_source') || searchParams?.get('ref') || 'direct';
                await trackSiteVisit(pathname, source, document.referrer || '');
            } catch (err) {
                console.error('Failed to track site visit', err);
            }
        };

        track();
    }, [pathname, searchParams]);

    return <>{children}</>;
}
