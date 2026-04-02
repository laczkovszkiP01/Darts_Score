import ContentBox from "../../components/ContentBox/ContentBox";
import Navbar from "../../components/Navbar/Navbar";
import style from './Home.module.css'; 
import dartsImage1 from "../../assets/images/darts.avif";
import ContentBoxType2 from "../../components/ContentBoxType2/ContentBoxType2";
import dartsImage2 from "../../assets/images/darts_nyilak.jpg";
import dartsImage3 from "../../assets/images/dartstabla.jpg";
import GameTypesSection from "../../components/GameTypesSection/GameTypesSection";
import TipsSection from "../../components/TipsSection/TipsSection";
import DartPartsSection from "../../components/DartPartsSection/DartPartsSection";
import ScrollToTop from "../../components/ScrollToTop/ScrollToTop";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <div className={style.home}>
        <Navbar />
        <div className={style.container}>
          <div className={style.row}>
            <h1>Üdvözöllek a Darts Score oldalán</h1>
            <p>Számold pontosan a pontjaidat, tudd meg a szabályokat és fejleszd a játékod!</p>
          </div>
        </div>
        <ContentBox cim="A Dartsról" leftContentImage={dartsImage1} rightContent="A darts egy precíziós sport, amelyben a játékosok három nyilat dobnak egy kör alakú táblába, és minden körben a lehető legjobb pontszámot próbálják elérni. A játék nemcsak pontosságot, hanem taktikai gondolkodást is igényel, mert a különböző kiszállási szabályok és pontlevonási helyzetek miatt mindig meg kell tervezni a következő dobásokat. A leggyakoribb játékmódok közé tartozik a 301 és az 501, ahol a cél a pontos 0 pont elérése a szabályoknak megfelelő befejezéssel."/>
        <ContentBoxType2 cim="A Dartshoz szükséges eszközök" leftContentH4="Darts Nyíl" leftContentImage={dartsImage2} rightContentH4="Darts Tábla" rightContentImage={dartsImage3} />
        <GameTypesSection />
        <DartPartsSection />
        <TipsSection />
        <Footer />
        <ScrollToTop />
    </div>
    );
}

export default Home;