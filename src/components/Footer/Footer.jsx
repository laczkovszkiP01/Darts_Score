import style from './Footer.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={style.footer}>
      <p>Minden jog fenntartva. &copy; {currentYear} Darts Számláló</p>
    </footer>
  );
}

export default Footer;
