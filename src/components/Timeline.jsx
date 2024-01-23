import { useState, useRef, useEffect  } from 'react'

import { DAY_FRAMER } from './helpers/VisualsDataExchange'
import { FRAME_DATES } from './constants/frameDates'

let CUR_DAY = -1
function DaySetter() {
	return ;
}


function PlayBtn() {
	const [playing, setPlaying] = useState( DAY_FRAMER.speed )

	let label = (playing) ? 'pause' : 'play'

	const playBtn = useRef()

	useEffect(() => {
		setPlaying(DAY_FRAMER.speed)
	}, [ DAY_FRAMER.speed ] )

	const togglePlay = () => {
		let new_speed = 0
		if(!playing) {
			new_speed = DAY_FRAMER.speedDefault
		}
		DAY_FRAMER.speed = new_speed
		setPlaying(!playing)
	}

	return(
		<button id="play-pause-btn" className={label} onClick={togglePlay} ref={playBtn}>{label}</button>
	)
}
function FrameSetter({frame, timelineCallback}) {

	const [curFrame, setCurFrame] = useState( frame )
	
	useEffect(() => {
		console.log('updagng frame', DAY_FRAMER.day, CUR_DAY)
		setCurFrame(DAY_FRAMER.day)
	}, [ frame ] )


	const ChangeDayFrame = (e) => {
	}

	// return (	)
}
export default function Timeline() {

	const [curDay, setCurDay] = useState(0);
		// const updateDayFrame = (deltaTime, callbackArgs) => {	}
	let frame_i         = 0

	const timelineRange = useRef()
	
	const updateDayFrame = () => {
		frame_i++;
		if(
			DAY_FRAMER.speed > 0
			&&
			frame_i%DAY_FRAMER.speed == 0
		) {
			let newFrame = DAY_FRAMER.day + 1
			newFrame = (newFrame < DAY_FRAMER.maxFrames) ? newFrame : 0 
			DAY_FRAMER.day = newFrame
			CUR_DAY = DAY_FRAMER.day
			setCurDay(newFrame)
			timelineRange.current.value = newFrame
		}
		requestAnimationFrame( updateDayFrame )
	}
	useEffect(() => {
		// console.log('Timeline, useEffect', DAY_FRAMER)
		if(!DAY_FRAMER.started) {
			DAY_FRAMER.started = true
			requestAnimationFrame( updateDayFrame )
		}
	}, []);


	const setFrameFromTimeline = (val) => {
		let new_val = parseInt( timelineRange.current.value ) - 1
		if(new_val < DAY_FRAMER.maxFrames) {
			DAY_FRAMER.speed = 0 // Pause the timeline
			DAY_FRAMER.day = new_val
			// setCurFrame(new_val)
			setCurDay(new_val)
			timelineRange.current.value = new_val
			// console.log('ChangeDayFrame:new_val', new_val, CUR_DAY )
		}
	}
	const curFrameDate = () => {
		let dayI = curDay + 1
		return <div id="day-info"><span id="day-no">Dag <em>{dayI}</em></span> <span id="day-date">{ FRAME_DATES[curDay] }</span></div>
	}

	return (
		<div id="timeline-wrap">			
			<PlayBtn />
			<div id="frame-setter">
				<input ref={timelineRange} onChange={setFrameFromTimeline} type="range" id="set-framer" min="1" max="100" defaultValue={curDay} step="1" />
			</div>
			{curFrameDate()} 
			{/*<FrameSetter frame={curDay} timelineCallback={setFrame} />*/}
		</div>
	)
}