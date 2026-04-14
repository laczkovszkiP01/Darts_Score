import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import style from './NotFound.module.css';

function NotFound() {
	return (
		<>
			<Navbar />
			<main className={style.container}>
				<section className={style.card}>
					<p className={style.code}>404</p>
					<h1>Az oldal nem található</h1>
					<p className={style.text}>
						Lehet, hogy rossz címet adtál meg, vagy az oldal már nem létezik.
					</p>
					<Link to="/" className={style.homeLink}>
						Vissza a főoldalra
					</Link>
				</section>
			</main>
		</>
	);
}

export default NotFound;