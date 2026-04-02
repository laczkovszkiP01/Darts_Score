import style from './ContentBoxType2.module.css';

function ContentBoxType2({cim, leftContent, rightContent, leftContentH4, rightContentH4, rightContentImage, leftContentImage}) {
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
                    <img src={rightContentImage} alt="" />
                </div>
            </div>
           
        </div>

);
}

export default ContentBoxType2;