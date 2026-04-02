import style from './TipsSection.module.css';

function TipsSection() {
  return (
    <section className={style.section}>
      <div className={style.container}>
        <h2>Tippek és trükkök</h2>
        <div className={style.content}>
          <div className={style.tipBox}>
            <h4>Pozíció</h4>
            <p>
              A stabil testtartás és megfelelő lábtartás elengedhetetlen. 
              A súly legyen a vezető lábon.
            </p>
          </div>
          <div className={style.tipBox}>
            <h4>Dobástechnika</h4>
            <p>
              A mozdulat legyen természetes, a kar egyenesen haladjon előre, 
              a csukló végén pedig egy kis „flip" adja meg a pontosságot.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TipsSection;
