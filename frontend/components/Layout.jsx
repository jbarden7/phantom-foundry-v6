import Navbar from './Navbar';
import SettingsSidebar from './SettingsSidebar';
export default function Layout({children}){
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
      <SettingsSidebar />
      <footer className="footer">© Phantom Foundry — UI 2025</footer>
    </>
  );
}
