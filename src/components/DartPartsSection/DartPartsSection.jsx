import style from './DartPartsSection.module.css';
import dartImage from '../../assets/images/nyil.png';

function DartPartsSection() {
  return (
    <section className={style.section}>
      <div className={style.container}>
        <h2>A darts nyíl részei</h2>
        <div className={style.content}>
          <div className={style.imageContainer}>
            <img src={dartImage} alt="Darts nyíl" />
          </div>
          <div className={style.textContainer}>
            <div className={style.partItem}>
              <h4>Nyél / Shaft</h4>
              <p>
                A nyíl hátsó része, amely a tollat tartja. Ez befolyásolja az egyensúlyt és a repülést.
              </p>
            </div>
            <div className={style.partItem}>
              <h4>Főtő / Barrel</h4>
              <p>
                A nyíl középső, megfogható része. Ez adja a súly nagy részét, és a fogás érzete itt a legfontosabb.
              </p>
            </div>
            <div className={style.partItem}>
              <h4>Csúcs / Tip</h4>
              <p>
                Ez az a rész, amely a táblába érkezik. Lehet acélhegyű vagy soft tip, attól függően, milyen táblán játszol.
              </p>
            </div>
            <div className={style.partItem}>
              <h4>Toll / Flight</h4>
              <p>
                A hátsó stabilizáló elem, amely segít a nyílnak egyenesen repülni és megtartani a megfelelő irányt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DartPartsSection;