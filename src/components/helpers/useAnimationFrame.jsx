import {useRef, useEffect  } from 'react'

export default function useAnimationFrame( callback, ...args ) {
	// Use useRef for mutable variables that we want to persist
	// without triggering a re-render on their change
	const requestRef      = useRef();
	const previousTimeRef = useRef();

	const animate = time => {
		if (previousTimeRef.current != undefined) {
			const deltaTime = time - previousTimeRef.current;
			callback(deltaTime, args)
		}
		previousTimeRef.current = time;
		requestRef.current = requestAnimationFrame(animate);
	}

	useEffect(() => {
		// console.log('useAnimationFrame!', args[0])
		requestRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(requestRef.current);
	}, [args]); // Make sure the effect runs only once, or when args change

	return requestRef.current
}
