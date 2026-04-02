import style from './ContentBox.module.css';

function ContentBox({cim, leftContent, rightContent, leftContentH4, rightContentH4, leftContentImage}) {
    return (
        <div className={style.container}>
            <h2>{cim}</h2>
            <div className={style.row}>
                 <div className={style.left}>
                    <h4>{leftContentH4}</h4>
                    <p>{leftContent}</p>
                    <img src={leftContentImage} alt="" />
                </div>
                <div className={style.right}>
                    <h4>{rightContentH4}</h4>
                    <p>{rightContent}</p>
                </div>
            </div>
           
        </div>

);
}

export default ContentBox;