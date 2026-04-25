import styles from './ContentBoxType2.module.css';


function ContentBoxType2({cim,bal,jobb,balH4,jobbH4,jobbKep,balKep,}) 
{
    return (
        <div className={styles.container}>

            <h2>{cim}</h2>

            <div className={styles.row}>

                <div className={styles.left}>

                    <h4>{balH4}</h4>
                    <p>{bal}</p>
                    <img src={balKep} alt="Darts nyíl" />

                </div>

                <div className={styles.right}>

                    <h4>{jobbH4}</h4>
                    <p>{jobb}</p>
                    
                    <img src={jobbKep} alt="Darts tábla" />
                </div>
            </div>
        </div>
    );
}

export default ContentBoxType2;