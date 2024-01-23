import React, { useEffect, useState } from 'react'
import axios from 'axios';

import {apiServerURL} from './helpers/ServerSettings'
// User Logger
import { UserLog } from  './UserActivityLogger'

let TagsTerrainLoaded = false;
export default function ApiDataLoader(props) {

	// console.log('ApiDataLoader!', props)

	// props: context. mode, loadVal, dataLoaded

	useEffect(() => {
		// console.log('ApiDataLoader get loading, cause we changed bruv ', props.loadVal)
		TagsTerrainLoaded = true;
		getApiData()
	}, [props.loadVal] ) // passing empty array makes sure it only loads on the first render

	const mode = (props.mode) ? props.mode : 'hashtag';

  	const tagButtons = [
			'kingsday',
			'valentinesday',
			'ramadan',
			'prank',
			// 'lol',
			// 'car',
			'travel',
			// 'cleaning',
			// 'beauty',
			// 'football',
			'foryou',
			// 'nederland',
		]

	const [dataLoaded, setDataLoaded] = useState(false)
	const [btnActive, setBtnActive] = useState()

	const setLoadingState = (curState) => {
		setDataLoaded(curState)
	}

	const loadData = (event) => {
		let btn      = event.target
		let btn_mode = btn.dataset.mode
		let btn_tag  = btn.dataset.tag
		// console.log('loadData', btn_tag)
		getApiData( {mode: btn_mode,  tag: btn_tag})
		// Set active
		let btn_i = tagButtons.indexOf(btn_tag)
		setBtnActive(btn_i)
	}

	const getApiData = ( reqData) => {
		setLoadingState(false)
		let mode2Load = (reqData) ? reqData.mode : mode
		let tag2Load = (reqData) ? reqData.tag : 'nederland'
		if(props.loadVal) {	tag2Load = props.loadVal }
		if(mode2Load == 'creator') { mode2Load = 'creatorgridindexed'}

		UserLog({'DataLoad': {mode:mode2Load,tag:tag2Load}})
		// console.log('getApiData, tag2Load:', tag2Load, 'mode2Load: ', mode2Load)

		// console.log('tag2Load', tag2Load, props.loadVal)
		let req = {
		    method: 'get',
		    url: apiServerURL + '?req=' + mode2Load + `/` + encodeURI(tag2Load),
		    withCredentials: false,
		    /*
		    params: {
		      access_token: SECRET_TOKEN,
		    },*/
		}
		axios(req)
		.then(response => {
			const gridData = response.data;// testGridData;// {'00.00': 10, '00.99': 10, '01.00': 11, '99.99': 100} //   response.data; //
			// if(gridData.length) {
				props.dataLoaded(gridData)
				setLoadingState(true)
			// }
			// this.setState ({users});
		})
  	}

  	// val to load set in props ?
  	useEffect(() => {
	  	if(props.loadVal) {
			// getApiData( {mode: mode,  tag: props.loadVal}) 
	  	}
  	}, [])

  	if(props.context && 'r3f' == props.context) {
  		return <></>
  	}

  	const wrapperClass = (props.wrapperClass) ?  props.wrapperClass : '' 
  	const extraButton =  (props.extraButton) ?  props.extraButton : null

	return <div id="tag-select-wrap" className={wrapperClass}>
		<header>
			<h3>Select a Hashtag</h3>
			{
				tagButtons.map((value, index) => {
					return (
						<button 
							key={index} 
							onClick={loadData} 
							data-mode={mode} 
							data-tag={value}
							className={
								(btnActive === index
								? 'btn-active'
								: ''
								)
							}
						>
							{value}
						</button>
					)
				})
			}
			{extraButton}
		</header>
	</div>
}