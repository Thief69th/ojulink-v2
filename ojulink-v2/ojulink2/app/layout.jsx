import './globals.css'

export const metadata = {
  title: { default:'OJU Link', template:'%s — OJU Link' },
  description:'Create your bio link page. Share all your links in one place.',
  metadataBase: new URL('https://ojulink.online'),
}
export const viewport = { width:'device-width', initialScale:1, themeColor:'#ffffff' }

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>
        {children}
        <script dangerouslySetInnerHTML={{ __html:`
          (function(){
            try {
              const t = localStorage.getItem('oju_theme');
              const sys = window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
              document.documentElement.setAttribute('data-theme', t||sys);
            } catch(e){}
          })();
        ` }} />
      </body>
    </html>
  )
}
