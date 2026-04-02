import { useState, useEffect } from 'react';
import style from './ScrollToTop.module.css';

function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 100) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <button
          className={style.scrollButton}
          onClick={scrollToTop}
          title="Ugrás a tetejére"
        >
          ⬆
        </button>
      )}
    </>
  );
}

export default ScrollToTop;
