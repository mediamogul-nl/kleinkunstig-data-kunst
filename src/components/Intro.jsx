import React, {useState, useEffect}  from 'react'

export default function Intro() {
	// Add body Class
	useEffect(() => {
		document.body.classList.add("start-page");
		return () => { document.body.classList.remove("start-page"); };
	}, []);	
}