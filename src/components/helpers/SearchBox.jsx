import { useRef, useEffect  } from 'react'
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
// User Logger
import { UserLog } from  './../UserActivityLogger'

// console.log(ReactSearchAutocomplete)

function SearchBox({optionsArray, callBack}) {

	useEffect(() => {
	// console.log('This is SearchBox')
    // this.input.value = '';

	}, [])


	// note: the id field is mandatory
	let items = [];
	// Convert to items array with id, name props ?
	if(optionsArray[0] && typeof optionsArray[0]!== 'object') {
		items = []
		let item_i = 0;
		for(let val of optionsArray) {
			items.push({id: item_i, name: val})
			item_i++;
		}
	}

	// onSearch will have as the first callback parameter
	// the string searched and for the second the results.
	const handleOnSearch = (string, results) => {
		UserLog({Searching:string})
		// console.log('handleOnSearch', string, results)
	}

	// the item hovered
	const handleOnHover = (result) => {
		// console.log('handleOnHover', result)
	}

	// the item selected
	const handleOnSelect = (item) => {
		UserLog({SearchResultClicked:item})		
		// console.log('handleOnSelect', item)
		callBack(item)
	}

	const handleOnFocus = () => {
		UserLog({SearchBox:'focussed'})		
		// console.log('Focused')
	}

	const formatResult = (item) => {
		return (
			<>
				<span className="search-option">{item.name}</span>
			</>
		)
	}

	return (
		<div className="search-box-wrap">
			<ReactSearchAutocomplete
				items={items}
				onSearch={handleOnSearch}
				onHover={handleOnHover}
				onSelect={handleOnSelect}
		        // ref={el => this.input = el}
				onFocus={handleOnFocus}
				inputProps={{defaultValue: ''}}
				autoFocus
				formatResult={formatResult}
			/>
		</div>
	)
}

export default SearchBox