import style from './ContentBox.module.css';

function ContentBox({cim, bal, jobb, balH4, jobbH4, balKep}) {
    return (
        <div className={style.container}>
            <h2>{cim}</h2>
            <div className={style.row}>
                 <div className={style.left}>
                    <h4>{balH4}</h4>
                    <p>{bal}</p>
                    <img src={balKep} alt="Bal oldali kép" />
                </div>
                <div className={style.right}>
                    <h4>{jobbH4}</h4>
                    <p>{jobb}</p>
                </div>
            </div>
           
        </div>

);
}

export default ContentBox;