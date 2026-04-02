import style from './GameTypesSection.module.css';
import gameTypeImage from "../../assets/images/501.webp";

function GameTypesSection() {
  return (
    <section className={style.section}>
      <div className={style.container}>
        <h2>Játéktípusok</h2>
        <div className={style.content}>
          <div className={style.imageContainer}>
            <img src={gameTypeImage} alt="501 játék" />
          </div>
          <div className={style.textContainer}>
            <h4>501</h4>
            <p>
              Az 501 az egyik legnépszerűbb játékmód, ahol a játékosok 501 pontról indulnak,
              és minden dobás után a pontjaik csökkennek. A cél, hogy pontosan 0-t érjenek el.
            </p>
            <h4>301</h4>
            <p>
              Az 301 játékmód hasonló az 501-hez, de a játékosok 301 pontról indulnak.
              A cél, hogy pontosan 0-t érjenek el.
            </p>
          </div>
        </div>

        <div className={style.outSection}>
          <h3>Kiszállási szabályok</h3>
          <div className={style.outCards}>
            <div className={style.outCard}>
              <h4>Single out</h4>
              <p>
                Bármelyik dobással le lehet zárni a játékot, ha pontosan 0 pontra érkezel.
                Ez a lazább, egyszerűbb befejezési szabály.
              </p>
            </div>
            <div className={style.outCard}>
              <h4>Double out</h4>
              <p>
                A játékot csak dupla mezővel vagy dupla 25-tel lehet befejezni.
                Ha nem dupla mezőn éred el a 0-t, az kör bust lesz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GameTypesSection;
