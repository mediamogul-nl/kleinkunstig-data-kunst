import { useState, useMemo, useRef, useEffect  } from 'react'

const visualDesc = {
	DayBoxes: {
		name: 'Dag Pieken',
		desc: <div>
			<p>Dit grid bestaat uit 10 bij 10 vormen die zijn geplaatst op de telefoonhoes. Elke dag van de 100 dagen heeft dus een vorm. </p>
			<p>De hoogte van elke vorm wordt bepaalt door hoe vaak de gekozen hashtag trending was op de corresponderende dag.</p>
			<p>Linksboven is dag 1, rechtsonder is dag 100.</p>
		</div>
	},
	DayHeightMap: {
		name: 'Tijdstippen Terrein',
		desc: <div>
			<p>De data is 100 dagen lang 100 keer per dag binnengehaald.</p>
			<p>Dit terrein-grid bestaat uit 100 punten die corresponderen met een tijdstip op de dag, het grid wordt per dag aangepast.</p>
			<p>De hoogte van elk punt op het grid wordt bepaald door hoe vaak een hashtag trending was op dat moment van de dag.</p>
			<p>Linksboven is de start van de dag, 00:00, en rechtsonder het eind, ongeveer 23:57.</p>
		</div>
	},
	DiamondsGrid: {
		name: 'Diamantjes grid',
		desc: <div>
			<p>Dit grid bestaat uit 100 of 10.000 diamantjes. Ze hebben verschillende kleuren, elke kleur vertegenwoordigd een geselecteerde categorie video's.</p>
			<p>Hoe populairder een categorie op een dag was, hoe meer diamantjes die kleur hebben.</p>
		</div>
	},
	PopSocket: {
		name: 'PopSocket',
		desc: <div>
			<p>De grootte van de gekozen vorm op de popsocket wordt bepaald door hoe vaak een hashtag op die dag is trending was,
			of hoeveel volgers een account op die dag had.</p>
		</div>
	},
	BigSingleShape: {
		name: 'Bling',
		desc: <div>
			<p>De grootte van de gekozen vorm wordt bepaald door hoe vaak een hashtag op die dag is trending was,
			of hoeveel volgers een account op die dag had.</p>
		</div>
	},
	CreatorHeightmap: {
		name: 'TrendBerg',
		desc: <div>
			<p>Deze visual laat het aantal volgers zien die de gekozen account had op elk moment dat een video van hen op de trending pagina kwam.</p>
			<p>Sommige accounts zijn enorm gegroeid in de 100 dagen, sommige zijn het ongeveer hetzelfde gebleven en sommige accounts hebben volgers verloren in die periode.</p>
			<p>Linksboven is dag 1, rechtsonder is dag 100</p>
		</div>
	},
	DiamondsRing: {
		name: 'Rand versieringen',
		desc: <div>
			<p>100 vormpjes zijn geplaatst langs de rand van de telefoon.</p>
			<p>De grootte van elk vormpje wordt bepaald door hoe vaak een hashtag op die dag trending was, of hoeveel volgers een account op die dag had.</p>
			<p>Dag 1 start linksboven, en de dagen erna zijn met de klok mee rondom geplaatst.</p>
		</div>
	},
}

 
export default function VisualsInfo({visualData}) {
	const curVisType = visualData.visType

	if(visualDesc.hasOwnProperty(curVisType)) {
		const descData = visualDesc[curVisType]
		return (
			<div id="visual-desc-wrap">
				<i className={curVisType}></i>
				<h2>{descData.name}</h2>
				{descData.desc}
			</div>
		)
	}
}