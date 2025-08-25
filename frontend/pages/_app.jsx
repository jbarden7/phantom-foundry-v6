import '../styles/globals.css';
import ModeBanner from '../components/ModeBanner';
import Navbar from '../components/Navbar';

export default function App({ Component, pageProps }) {
  return (
    <>
      <ModeBanner />
      <Component {...pageProps} />
    </>
  );
}
