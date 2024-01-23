import React, {useState, useEffect}  from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Link
} from "react-router-dom";

import Intro from './components/Intro'
import PhoneTotal from './components/PhoneTotal.jsx'
import CalendarView from './components/CalendarView'

// User Logger
import { UserLog } from  './components/UserActivityLogger'



export default function App() {

	UserLog({started: 'app'})

	return (
	<BrowserRouter>  	
  		<div id="app-wrap">
  			<aside>
	  			<nav>
	  				<Link to="/calendar">Kalender</Link>
	  				<Link to="/phone">Telefoon</Link>
  				</nav>
  			</aside>
  			<main>
	  			<Routes>
	  				<Route
		  				path="/"
		  				element={<Intro />}
	  				/>
	  				<Route
		  				path="/phone"
		  				element={<PhoneTotal />}
	  				/>
	  				<Route
		  				path="/calendar"
		  				element={<CalendarView />}
	  				/>
  				</Routes>
			</main>
		</div>
	</BrowserRouter>  	
  );

}