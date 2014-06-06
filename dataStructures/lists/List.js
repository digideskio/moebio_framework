List.prototype = new DataModel();
List.prototype.constructor=List;

/**
* List is an Array with a type property
* @param comma separated values to add to List
* @constructor
*/
function List () {
	DataModel.apply(this);
	var array=new Array();
	var i;
	for(i=0; i<arguments.length; i++){
	 	array.push(arguments[i]);
   	}
   	array=List.fromArray(array);
   	//
   	return array;
}

List.fromArray=function(array){ //TODO: clear some of these method declarations
	array.type="List";
	array.name=array.name||"";
	
	array.setType=List.prototype.setType;
	array.setArray=List.prototype.setArray;
	array._constructor=List;
	
   	array.getImproved=List.prototype.getImproved;
   	array.getTypeOfElements=List.prototype.getTypeOfElements; //TODO: redundant?
   	array.getTypes=List.prototype.getTypes;
   	array.getType=List.prototype.getType;
   	array.getWithoutRepetitions=List.prototype.getWithoutRepetitions;
   	array.getElementsRepetitionCount=List.prototype.getElementsRepetitionCount;
   	array.countOccurrences=List.prototype.countOccurrences;
   	array.getMostRepeatedElement = List.prototype.getMostRepeatedElement;
   	array.getMin=List.prototype.getMin;
   	array.getMax=List.prototype.getMax;
   	array.indexesOf=List.prototype.indexesOf;
   	array.indexOfElements=List.prototype.indexOfElements;
   	array.indexOfByPropertyValue=List.prototype.indexOfByPropertyValue;
   	array.getFirstElementByName=List.prototype.getFirstElementByName;
   	array.getFirstElementByPropertyValue=List.prototype.getFirstElementByPropertyValue;
   	array.add=List.prototype.add;
   	array.multiply=List.prototype.multiply;
   	array.getSubList = List.prototype.getSubList;
   	array.getSubListByIndexes = List.prototype.getSubListByIndexes;
   	array.getElementNumberOfOccurrences = List.prototype.getElementNumberOfOccurrences;
   	array.getPropertyValues = List.prototype.getPropertyValues;
   	array.getRandomElement = List.prototype.getRandomElement;
   	array.containsElement = List.prototype.containsElement;
	array.indexOfElement = List.prototype.indexOfElement;
   	//sorting:
   	array.sortIndexed=List.prototype.sortIndexed;
   	array.sortNumericIndexed=List.prototype.sortNumericIndexed;
   	array.sortNumeric=List.prototype.sortNumeric;
   	array.sortNumericIndexedDescending=List.prototype.sortNumericIndexedDescending;
   	array.sortNumericDescending=List.prototype.sortNumericDescending;
   	array.sortOnIndexes=List.prototype.sortOnIndexes;
   	array.getReversed = List.prototype.getReversed;
   	array.getSortedByProperty = List.prototype.getSortedByProperty;
   	array.getSorted = List.prototype.getSorted;
   	array.getSortedByList = List.prototype.getSortedByList;
   	//filter:
   	array.getFilteredByPropertyValue = List.prototype.getFilteredByPropertyValue;
   	//conversion
   	array.toNumberList=List.prototype.toNumberList;
   	array.toStringList=List.prototype.toStringList;
   	//
   	array.clone=List.prototype.clone;
   	array.toString=List.prototype.toString;
   	array.getNames=List.prototype.getNames;
   	array.applyFunction=List.prototype.applyFunction;
   	array.getWithoutElementAtIndex=List.prototype.getWithoutElementAtIndex;
   	array.getWithoutElements=List.prototype.getWithoutElements;
   	array.getWithoutElementsAtIndexes=List.prototype.getWithoutElementsAtIndexes;
   	array.getFilteredByFunction=List.prototype.getFilteredByFunction;
   	array._concat=Array.prototype.concat;
   	array.concat=List.prototype.concat;
   	
   	//transformations
   	array.pushIfUnique=List.prototype.pushIfUnique;
   	array.removeElement=List.prototype.removeElement;
   	array.removeElementAtIndex=List.prototype.removeElementAtIndex;
   	array.removeElementsAtIndexes=List.prototype.removeElementsAtIndexes;
   	array.removeElements=List.prototype.removeElements;
   	array.removeRepetitions=List.prototype.removeRepetitions;
   	array.replace = List.prototype.replace;
   	array._splice=Array.prototype.splice;
   	array.splice=List.prototype.splice;

   	array.isList = true;
   	
   	array.destroy=List.prototype.destroy;	
   	

   	return array;
}
//

/**
 * improve a List (refining type)
 * @return {List}
 * tags:
 */
List.prototype.getImproved=function(){
	if(this.length==0) return this;
	var typeOfElements = this.getTypeOfElements();
	//c.log('List.prototype.getImproved | typeOfElements: ['+typeOfElements+']');
	if(typeOfElements=="" || typeOfElements=="undefined") return this;
	
	switch(typeOfElements){
		case "number":
			var newList = NumberList.fromArray(this);
			break;
		case "string":
			var newList = StringList.fromArray(this);
			break;
		case "Rectangle":
			return this;
		case "Date":
			var newList = DateList.fromArray(this);
			break;
		case "List":
		case "Table":
			var newList = Table.fromArray(this);
			break;
		case "NumberList":
			var newList = NumberTable.fromArray(this);
			break;
		case "Point":
			var newList = Polygon.fromArray(this);
			break;
		case "Polygon":
			var newList = PolygonList.fromArray(this);
			break;
	}
	if(newList!=null){
		newList.name = this.name;
		return newList;
	}
	return this;
}
List.prototype.getTypeOfElements=function(){
	var typeOfElements = typeOf(this[0]);
	for(var i=1;this[i]!=null;i++){
		if(typeOf(this[i])!=typeOfElements) return "";
	}
	return typeOfElements;
}
List.prototype.getTypes=function(){
	var types = new StringList();
	for(i=0;this[i]!=null;i++){
		types[i] =  typeOf(this[i]);
	}
	return types;
}
List.prototype.toString=function(){
	var i;
	var str="[";
	for(i=0; i<this.length-1; i++){
		str+=this[i]+", "
	}
	str+=this[this.length-1]+"]";
	return str;
}

/**
 * return a list of names (if any) of elements of the list
 * @return {StringList}
 * tags:
 */
List.prototype.getNames=function(){
	var stringList = new StringList();
	for(i=0;this[i]!=null;i++){
		stringList[i] = this[i].name;
	}
	return stringList;
}

/**
 * reverse the list
 * @return {List}
 * tags:sort
 */
List.prototype.getReversed=function(){

	c.log('*');
	c.log('List.prototype.getReversed | this:', this);

	var newList = instantiateWithSameType(this);
	for(var i=0; this[i]!=null; i++){
		newList.unshift(this[i]);
	}
	return newList;
}

/**
 * return a sub-list, params could be: tw numbers, an interval or a NumberList
 * @return {[type]} [description]
 */
List.prototype.getSubList=function(){
	if(arguments[0].isList){
		return this.getSubListByIndexes(arguments[0]);
	} else if(arguments.length>2){
		return this.getSubListByIndexes(arguments);
	} else if(typeOf(arguments[0])=='number'){
		if(typeOf(arguments[1])!=null && typeOf(arguments[1])=='number'){
			interval = new Interval(arguments[0], arguments[1]);
		} else {
			interval = new Interval(arguments[0],  this.length-1);
		}
	} else {
		interval = arguments[0];
	}
	
	var newInterval = new Interval(Math.max(Math.min(Math.floor(interval.x), this.length), 0), Math.max(Math.min(Math.floor(interval.y), this.length-1), 0));
	var newList;
	
	if(this.type=="NumberList"){
		newList = NumberList.fromArray(this.slice(interval.x, interval.y+1), false);
		newList.name = this.name;
		return newList;
	} else if(this.type=="StringList"){
		newList = StringList.fromArray(this.slice(interval.x, interval.y+1), false);
		newList.name = this.name;
		return newList;
	}
	
	if(this.type=='List' || this.type=='Table'){
		newList = new List();
	} else {
		newList =  instantiate(typeOf(this));
	}
	
	for(var i=newInterval.x; i<=newInterval.y; i++){
		newList.push(this[i]);
	}
	newList.name = this.name;
	if(this.type=='List' || this.type=='Table') return newList.getImproved();
	return newList;
}

List.prototype.getSubListByIndexes=function(){//TODO: merge with getSubList
	if(this.length<1) return this;
	var indexes;
	if(typeOf(arguments[0])=='number'){
		indexes = arguments;
	} else {
		indexes = arguments[0];
	}

	if(this.type=='List'){
		var newList = new List();
	} else {
		newList =  instantiate(typeOf(this));
	}
	if(indexes.length==0) return newList;
	newList.name = this.name;
	var nElements = this.length;
	var nPositions = indexes.length;
	var i;
	for(i=0; i<nPositions; i++){
		if(indexes[i]<nElements){
			newList.push(this[indexes[i]]);
		}
	}

	if(this[0].type!=null) c.log('••••••• this.type, newList[0].type, newList[1].type', this.type, this[0].type, this[1].type);

	if(this.type=='List' || this.type=='Table') return newList.getImproved();
	return newList;
}

List.prototype.getElementNumberOfOccurrences=function(element){
	var nOccurrences = 0;
	var from = 0;
	var index = this.indexOf(element, from);
	while(index>-1){
		nOccurrences++;
		from = index+1;
		index = this.indexOf(element, from);
	}
	return nOccurrences;
}


List.prototype.clone=function(){
	var clonedList= instantiateWithSameType(this);
  	for(var i=0; this[i]!=null; i++){
    	clonedList.push(this[i]);
  	}
  	clonedList.name = this.name;
  	return clonedList;
}

/**
 * create a new List without repeating elements
 * @return {List}
 * tags:filter
 */
List.prototype.getWithoutRepetitions=function(){
	newList = instantiateWithSameType(this);
	newList.name = this.name;
	for(i=0; this[i]!=null; i++){
		if(newList.indexOf(this[i])==-1) newList.push(this[i]);
	}
	return newList;
}


List.prototype.countOccurrences=function(){//TODO: more efficient
	var occurrences = new NumberList();
	for(var i=0; this[i]!=null; i++){
		occurrences[i] = this.indexesOf(this[i]).length;
	}
	return occurrences;
}

List.prototype.getElementsRepetitionCount=function(sortListsByOccurrences){
	var obj;
	var elementList= new List();
	var numberList = new NumberList();
	var nElements = this.length;
	var index;
	
	for(i=0; i<nElements; i++){
		obj = this[i];
		index = elementList.indexOf(obj);
		if(index!=-1){
			numberList[index]++;
		} else {
			elementList.push(obj);
			numberList.push(1);
		}
	}
	
	var table = new Table();
	table.push(elementList);
	table.push(numberList);
	var indexArray=numberList.sortNumericIndexed();
	if(sortListsByOccurrences!=undefined?sortListsByOccurrences:true){
		var j;
		for(j=0; j<table.length; j++){
			table[j]=table[j].clone().sortOnIndexes(indexArray);
		}
	}
	
	return table;
}

List.prototype.getMostRepeatedElement = function(){//TODO: this method should be more efficient
	return ListOperators.countElementsRepetitionOnList(this, true)[0][0];
}


List.prototype.getMin=function(){
	if(this.length==0) return null;
	var min=this[0];	
	var i;
	for(i=1; i<this.length; i++){
		min=Math.min(min, this[i]);
	}
	return min;
}

List.prototype.getMax=function(){
	if(this.length==0) return null;
	var max=this[0];	
	var i;
	for(i=1; i<this.length; i++){
		max=Math.max(max, this[i]);
	}
	return max;
}

List.prototype.add=function(value){
	if(value.constructor==Number){
		var i;
		var array = instantiateWithSameType(this);
		for(i=0; i<this.length; i++){
			array.push(this[i]+value);
		}
		return array;
	}
}

List.prototype.getRandomElement=function(){
	return this[Math.floor(this.length*Math.random())];
}


List.prototype.containsElement=function(element){//TODO: test if this is faster than indexOf
	var i;
	for(i=0; this[i]!=null; i++){
		if(this[i]==element) return true;
	}
	return false;
}

List.prototype.indexOfElement=function(element){//TODO: test if this is faster than indexOf
	var i;
	for(i=0; this[i]!=null; i++){
		if(this[i]==element) return i;
	}
	return -1;
}




List.prototype.getPropertyValues=function(propertyName, valueIfNull){
	var newList = new List();
	newList.name = propertyName;
	var val;
	for(var i=0; this[i]!=null; i++){
		val = this[i][propertyName]
  		newList[i] = (val==null?valueIfNull:val);
	}
	return newList.getImproved();
}

List.prototype.sortIndexed=function() {
	var index = new Array();
	var i;
	for(i=0; i<this.length; i++){
  		index.push({index:i, value:this[i]});
	}
	var comparator = function(a, b) {
  		var array_a = a.value;
  		var array_b = b.value;;

  		return array_a < array_b ? -1 : array_a > array_b ? 1 : 0;
	}
	index=index.sort(comparator);
	var result = new NumberList();
	for(i=0; i<index.length; i++){
  		result.push(index[i].index);
	}
	return result;
}

// List.prototype.sortNumericIndexed=function() {
// 	var index = new Array();
// 	var i;
// 	for(i=0; i<this.length; i++){
//   		index.push({index:i, value:this[i]});
// 	}
// 	var comparator = function(a, b) {
//   		var array_a = a.value;
//   		var array_b = b.value;;

//   		return array_a - array_b;
// 	}
// 	index=index.sort(comparator);
// 	var result = new NumberList();
// 	for(i=0; i<index.length; i++){
//   		result.push(index[i].index);
// 	}
// 	return result;
// }

// List.prototype.sortNumeric=function(descendant){
// 	var comparator;
// 	if(descendant){
// 		var comparator=function(a, b){
// 			return b - a;
// 		}
// 	} else {
// 		var comparator=function(a, b){
// 			return a - b;
// 		}
// 	}
// 	return this.sort(comparator);
// }

List.prototype.sortOnIndexes=function(indexes){
	var result = instantiateWithSameType(this);
	result.name=this.name;
	var i;
	for(i=0; this[i]!=null; i++){
  		if(indexes[i]!=-1) result.push(this[indexes[i]]);
	}
	return result;
}

// List.prototype.sortNumericIndexedDescending=function() {
// 	var index = new Array();
// 	var i;
// 	for(i=0; i<this.length; i++){
//   		index.push({index:i, value:this[i]});
// 	}
// 	var comparator = function(a, b) {
//   		var array_a = a.value;
//   		var array_b = b.value;
//   		return array_b - array_a;
// 	}
// 	index=index.sort(comparator);
// 	var result=new NumberList();
// 	for(i=0; i<index.length; i++){
//   		result.push(index[i].index);
// 	}
// 	return result;
// }

// List.prototype.sortNumericDescending=function(){
// 	var comparator=function(a, b){
// 		return b - a;
// 	}
// 	return this.sort(comparator);
// }

// List.prototype.sortOnNumberList=function(list){//TODO: this.data??? check this method
// 	return new List(this.data.sortOnNumberList(list.getData));
// }

List.prototype.getSortedByProperty=function(propertyName, ascending){
	ascending = ascending==null?true:ascending;
	
	var comparator;
	if(ascending){
		comparator=function(a, b){
			return a[propertyName] - b[propertyName];	
		}
	} else {
		comparator=function(a, b){
			return b[propertyName] - a[propertyName];
		}
	}
	return this.clone().sort(comparator);
}

List.prototype.getSorted=function(ascending){
	ascending = ascending==null?true:ascending;
	
	var comparator;
	if(ascending){
		comparator=function(a, b){
			return a > b?1:-1;	
		}
	} else {
		comparator=function(a, b){
			return a > b?-1:1;
		}
	}
	return this.clone().sort(comparator);
}

List.prototype.getSortedByList=function(list, ascending){
	ascending = ascending==null?true:ascending;
	
	var pairsArray = [];
	
	for(var i=0; this[i]!=null; i++){
		pairsArray[i] = [this[i], list[i]];
	}
	
	var comparator;
	if(ascending){
		comparator=function(a, b){
			return a[1]<b[1]?-1:1;
		}
	} else {
		comparator=function(a, b){
			return a[1]<b[1]?1:-1;
		}
	}
	
	pairsArray = pairsArray.sort(comparator);
	
	var newList = instantiateWithSameType(this);
	newList.name = this.name;
	
	for(i=0; this[i]!=null; i++){
		newList[i] = pairsArray[i][0];
	}
	
	return newList;
}

List.prototype.indexesOf=function(element){
	var index = this.indexOf(element);
	var numberList = new NumberList();
	while(index!=-1){
		numberList.push(index);
		index = this.indexOf(element, index+1);
	}
	return numberList;
}

List.prototype.indexOfElements=function(elements){
	var numberList = new NumberList();
	for(var i=0; elements[i]!=null; i++){
		numberList[i] = this.indexOf(elements[i]);
	}
	return numberList;
}

/**
 * returns the first element (or index) of an element in the with a given name
 * @param  {[type]} name        [description]
 * @param  {[type]} returnIndex [description]
 * @return {[type]}             [description]
 */
List.prototype.getFirstElementByName=function(name, returnIndex){
	for(var i=0; this[i]!=null; i++){
		if(this[i].name == name) return returnIndex?i:this[i];
	}
	return null;
}

List.prototype.getFirstElementByPropertyValue=function(propertyName, value){
	for(var i=0; this[i]!=null; i++){
		if(this[i][propertyName]==value) return this[i];
	}
	return returnIndex?-1:null;
}

List.prototype.indexOfByPropertyValue=function(propertyName, value){
	for(var i=0; this[i]!=null; i++){
		if(this[i][propertyName]==value) return i;
	}
	return -1;
}


List.prototype.getFilteredByPropertyValue = function(propertyName, propertyValue){
	var newList = new List();
	newList.name = this.name;
	var i;
	for(i=0;this[i]!=null;i++){
		if(this[i][propertyName]==propertyValue) newList.push(this[i]);
	}
	return newList.getImproved();
}

List.prototype.toNumberList=function(){
	var numberList = new NumberList();
	numberList.name = this.name;
	var i;
	for(i=0;this[i]!=null;i++){
		numberList[i]=Number(this[i]);
	}
	return numberList;
}

List.prototype.toStringList=function(){
	var i;
	var stringList = new StringList();
	stringList.name = this.name;
	for(i=0;this[i]!=null;i++){
		if(typeof this[i] == 'number'){
			stringList[i]=String(this[i]);
		} else {
			stringList[i]=this[i].toString();
		}
	}
	return stringList;
}

List.prototype.applyFunction=function(func){ //TODO: to be tested!
	var newList = new List();
	newList.name = this.name;
	var i;
	for(i=0;this[i]!=null;i++){
		newList[i] = func(this[i]);
	}
	return newList.getImproved();
}


//filtering

List.prototype.getWithoutElementsAtIndexes=function(indexes){ //[!] This DOESN'T transforms the List
	var i;
	if(this.type=='List'){
		var newList = new List();
	} else {
		newList =  instantiate(typeOf(this));
	}
	for(i=0; i<this.length; i++){
	 	if(indexes.indexOf(i)==-1){
	 		newList.push(this[i]);
	 	}	
	}
	if(this.type=='List') return newList.getImproved();
	return newList;
}

List.prototype.getWithoutElementAtIndex=function(index){
	if(this.type=='List'){
		var newList = new List();
	} else {
		var newList =  instantiateWithSameType(this);
	}
	for(var i=0; this[i]!=null; i++){
	 	if(i!=index){
	 		newList.push(this[i]);
	 	}
	}
	newList.name = this.name;
	if(this.type=='List') return newList.getImproved();
	return newList;
}

List.prototype.getWithoutElements=function(list){
	if(this.type=='List'){
		var newList = new List();
	} else {
		var newList =  instantiateWithSameType(this);
	}
	for(var i=0; this[i]!=null; i++){
	 	if(list.indexOf(this[i])==-1){
	 		newList.push(this[i]);
	 	}
	}
	newList.name = this.name;
	if(this.type=='List') return newList.getImproved();
	return newList;
}


List.prototype.getFilteredByFunction=function(func){
	var newList =  instantiateWithSameType(this);
	for(var i=0; this[i]!=null; i++){
	 	if(func(this[i])){
	 		newList.push(this[i]);
	 	}
	}
	newList.name = this.name;
	if(this.type=='List') return newList.getImproved();
	return newList;
}

List.prototype.concat=function(){
	if(arguments[0].type==this.type){
		if(this.type == "NumberList"){
			return NumberList.fromArray(this._concat.apply(this, arguments), false);
		} else if(this.type == "StringList"){
			return StringList.fromArray(this._concat.apply(this, arguments), false);
		} else if(this.type == "NodeList"){ //[!] concat breaks the getNodeById in NodeList
			return NodeList.fromArray(this._concat.apply(this, arguments), false);
		} else if(this.type == "DateList"){
			return DateList.fromArray(this._concat.apply(this, arguments), false);
		}
	}
	return List.fromArray(this._concat.apply(this, arguments)).getImproved();
}


////transformations

List.prototype.pushIfUnique=function(element){
	if(this.indexOf(element)!=-1) return; //TODO: implement equivalence
	this.push(element);
}

List.prototype.removeElements=function(elements){//TODO: make it more efficient (avoiding the splice method)
	for(var i=0; i<this.length; i++){
	    if(elements.indexOf(this[i])>-1){
	    	this.splice(i, 1);
	    	i--;
	    }
	}
}

List.prototype.removeElement=function(element){
	var index = this.indexOf(element);
	if(index!=-1) this.splice(index, 1);
}

List.prototype.removeElementAtIndex=function(index){
	this.splice(index, 1);
}

List.prototype.removeElementsAtIndexes=function(indexes){
	indexes = indexes.sort(function(a,b){return a-b});
	
	for(var i=0; indexes[i]!=null; i++){
		this.splice(indexes[i]-i, 1);
	}
}

List.prototype.removeRepetitions=function(){
	for(var i=0; this[i]!=null; i++){
	 	if(this.indexOf(this[i], i+1)!=-1){
	 		this.splice(i,1);
	 	}
	}
}

List.prototype.replace=function(elementToFind, elementToInsert){
	var l = this.length;
	for(var i=0; i<l; i++){
	 	if(this[i]==elementToFind) this[i] = elementToInsert;
	}
}


List.prototype.splice=function(){//TODO: replace
	switch(this.type){
		case 'NumberList':
			return NumberList.fromArray(this._splice.apply(this, arguments))
			break;
		case 'StringList':
			return StringList.fromArray(this._splice.apply(this, arguments))
			break;
		case 'NodeList':
			return NodeList.fromArray(this._splice.apply(this, arguments))
			break;
		case 'DateList':
			return DateList.fromArray(this._splice.apply(this, arguments))
			break;
	}
	return List.fromArray(this._splice.apply(this, arguments)).getImproved();
}

List.prototype.destroy=function(){
	for(var i=0; this[i]!=null; i++){
		delete this[i];
	}
}


