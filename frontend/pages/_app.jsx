import '../public/globals.css';
import ModeBanner from '../components/ModeBanner';

export default function App({ Component, pageProps }) {
  return (
    <>
      <ModeBanner />
      <Component {...pageProps} />
    </>
  );
}
