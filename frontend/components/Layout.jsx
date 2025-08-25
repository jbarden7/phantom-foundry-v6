import Navbar from './Navbar';
export default function Layout({children}){
  return (
    <>
      <Navbar />
      <main className="container">{children}</main>
      <footer className="footer">© Phantom Foundry — UI 2025 Refresh</footer>
    </>
  );
}
