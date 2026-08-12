import { Public_Sans } from 'next/font/google';
import localFont from 'next/font/local';
import { headers } from 'next/headers';
import { ThemeProvider } from '@/components/app/theme-provider';
import { ThemeToggle } from '@/components/app/theme-toggle';
import { cn } from '@/lib/shadcn/utils';
import { getAppConfig, getStyles } from '@/lib/utils';
import '@/styles/globals.css';

const publicSans = Public_Sans({
  variable: '--font-public-sans',
  subsets: ['latin'],
});

const commitMono = localFont({
  display: 'swap',
  variable: '--font-commit-mono',
  src: [
    {
      path: '../fonts/CommitMono-400-Regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-700-Regular.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/CommitMono-400-Italic.otf',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/CommitMono-700-Italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const hdrs = await headers();
  const appConfig = await getAppConfig(hdrs);
  const styles = getStyles(appConfig);
  const { pageTitle, pageDescription, companyName, logo, logoDark } = appConfig;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        publicSans.variable,
        commitMono.variable,
        'scroll-smooth font-sans antialiased'
      )}
    >
      <head>
        {styles && <style>{styles}</style>}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
      </head>
      <body className="overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen font-sans selection:bg-zinc-900 selection:text-zinc-100 dark:selection:bg-zinc-100 dark:selection:text-zinc-900 antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="fixed top-0 left-0 z-50 w-full flex flex-row items-center justify-between p-4 md:px-8 md:py-4 backdrop-blur-xl bg-zinc-50/70 dark:bg-zinc-950/70 border-b border-zinc-200/60 dark:border-zinc-800/60">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                Saira <span className="text-zinc-400 font-normal">Voice AI</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium hidden sm:inline-block">
                Learning & Literacy Assistant
              </span>
            </div>
          </header>

          {children}
          <div className="group fixed bottom-4 right-4 z-50">
            <ThemeToggle className="shadow-md border border-zinc-200 dark:border-zinc-800" />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
