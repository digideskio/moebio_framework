function TableOperators(){};


TableOperators.getElementFromTable=function(table, i, j){
	if(table[i] == null) return null;
	return table[i][j];
}

TableOperators.getSubTable=function(table, x, y, width, height){
	if(table==null) return table;
	
	var nLists = table.length;
	if(nLists==0) return null;
	var result = new Table();
	
	if(width<=0) width = (nLists - x)+width;
	x = Math.min(x, nLists-1);
	width = Math.min( width, nLists-x );
	
	var nRows = table[0].length;
			
	if(nRows==0) return null;
			
	if(height<=0) height = (nRows-y)+height;
			
	y = Math.min(y, nRows-1);
	height = Math.min( height, nRows-y );
			
	var column;
	var newColumn;
	var i;
	var j;
	var element;
	for (i = x; i < x+width; i++) {
		column = table[i];
		newColumn = new List();
		newColumn.name = table[i].name;
		for (j = y; j < y+height; j++) {
			element = column[j];
			newColumn.push( element );
		}
		result.push(newColumn.getImproved());
	}
	return result.getImproved();
}

/**
 * transposes a table
 * @param  {Table} table to be transposed
 *
 * @param {Boolean} firstListAsHeaders removes first list of the table and uses it as names for the lists on the transposed table
 * @return {Table}
 * tags:matrixes
 */
TableOperators.transpose=function(table, firstListAsHeaders){
	if(table==null) return null;
	return table.getTransposed(firstListAsHeaders);
}

/**
 * divides the instances of a table in two tables: the training table and the test table
 * @param  {Table} table
 * @param  {Number} proportion proportion of training instances/test instances, between 0 and 1
 * 
 * @param  {Number} mode  0:random<br>1:random with seed<br>2:shuffle
 * @param {Number} seed seed for random numbers (mode 1)
 * @return {List} list containing the two tables
 * tags:ds
 */
TableOperators.trainingTestPartition = function(table, proportion, mode, seed){
	if(table==null || proportion==null) return;

	mode = mode||0;
  	seed = seed||0;

  var indexesTr = new NumberList();
  var indexesTe = new NumberList();

  var random = mode==1?new NumberOperators._Alea("my", seed, "seeds"):Math.random;

  if(mode==2) N_MOD = Math.floor(proportion/(1-proportion)*10);
  
  table[0].forEach(function(id, i){
  	if(mode==0 || mode==1){
  		if(random()<proportion){
	      indexesTr.push(i);
	    } else {
	      indexesTe.push(i);
	    }
  	} else {
	    if(i%N_MOD!=0){
	      indexesTr.push(i);
	    } else {
	      indexesTe.push(i);
	    }
	}
  });
  
  return new List( table.getSubListsByIndexes(indexesTr), table.getSubListsByIndexes(indexesTe) );
}

/**
 * tests a model
 * @param  {NumberTable} numberTable coordinates of points
 * @param  {List} classes list of values of classes
 * @param  {Function} model function that receives two numbers and returns a guessed class
 * 
 * @param  {Number} metric 0:error
 * @return {Number} metric value
 * tags:ds
 */
TableOperators.testClassificationModel = function(numberTable, classes, model, metric){
	if(numberTable==null || classes==null || model==null) return null;

	metric = metric||0;

	var i;
	var nErrors = 0;

	classes.forEach(function(clss, i){
		if(model(numberTable[0][i], numberTable[1][i])!=clss){
			nErrors++;
		}
	});

	return nErrors/classes.length;
}



TableOperators.getSubListsByIndexes=function(table, indexes){
	var newTable = new Table();
	newTable.name = table.name;
	var i;
	var list;
	var newList;
	for(i=0;table[i]!=null;i++){
		list = table[i];
		newList = instantiateWithSameType(list);
		for(j=0;indexes[j]!=null;j++){
			newList[j] = list[indexes[j]];
		}
		newTable[i] = newList.getImproved();
	}
	return newTable;
}

TableOperators.sortListsByNumberList=function(table, numberList, descending){
  if(descending==null) descending = true;

  var newTable = instantiate(typeOf(table));
  newTable.name = table.name;
  var nElements = table.length;
  var i;
  // only need to do the sort once, not for each column
  var indexList = numberList.clone();
  // save original index
  for(i=0; i < indexList.length; i++){
    indexList[i]=i;
  }
  indexList = ListOperators.sortListByNumberList(indexList, numberList, descending);
  // now clone and then move from original based on index
  for(i=0; i<nElements; i++){
    newTable[i] = table[i].clone();
    for(var j=0; j < indexList.length; j++){
      newTable[i][j] = table[i][indexList[j]];
    }
  }
  return newTable;
}

// old version replaced by above version Dec 1st, 2014
// - fixed bug where descending with 'false' value gets changed to 'true'
// - performance improvements for tables with lots of lists 
// TableOperators.sortListsByNumberList=function(table, numberList, descending){
// 	descending = descending || true;
	
// 	var newTable = instantiate(typeOf(table));
// 	newTable.name = table.name;
// 	var nElements = table.length;
// 	var i;
// 	for(i=0; i<nElements; i++){
// 		newTable[i] = ListOperators.sortListByNumberList(table[i], numberList, descending);
// 	}
// 	return newTable;
// }



/**
 * aggregates a table
 * @param  {Table} table to be aggregated
 * 
 * @param  {Number} nList list in the table used as basis to aggregation
 * @param  {Number} mode mode of aggregation, 0:picks first element 1:adds numbers, 2:averages
 * @return {Table} aggregated table
 * tags:aggregation
 */
TableOperators.aggregateTable=function(table, nList, mode){
	nList = nList==null?0:nList;
	if(table==null || table[0]==null || table[0][0]==null || table[nList]==null) return null;
	mode = mode==null?0:mode;
	
	var newTable = new Table();
	var i, j;
	var index;
	var notRepeated;
	
	newTable.name = table.name;

	for(j=0; table[j]!=null; j++){
		newTable[j] = new List();
		newTable[j].name = table[j].name;
	}
	
	switch(mode){
		case 0://leaves the first element of the aggregated subLists
			for(i=0; table[0][i]!=null; i++){
				notRepeated = newTable[nList].indexOf(table[nList][i])==-1;
				if(notRepeated){
					for(j=0; table[j]!=null; j++){
						newTable[j].push(table[j][i]);
					}
				}
			}
			break;
		case 1://adds values in numberLists
			for(i=0; table[0][i]!=null; i++){
				index = newTable[nList].indexOf(table[nList][i]);
				notRepeated = index==-1;
				if(notRepeated){
					for(j=0; table[j]!=null; j++){
						newTable[j].push(table[j][i]);
					}
				} else {
					for(j=0; table[j]!=null; j++){
						if(j!=nList && table[j].type=='NumberList'){
							newTable[j][index]+=table[j][i];
						}
					}
				}
			}
			break;
		case 2://averages values in numberLists
			var nRepetitionsList = table[nList].getElementsRepetitionCount(false);
			newTable = TableOperators.aggregateTable(table, nList, 1);

			for(j=0; newTable[j]!=null; j++){
				if(j!=nList && newTable[j].type=='NumberList'){
					newTable[j] = newTable[j].divide(nRepetitionsList[1]);
				}
			}
			
			newTable.push(nRepetitionsList[1]);
			break;
	}
	for(j=0; newTable[j]!=null; j++){
		newTable[j] = newTable[j].getImproved();
	}
	return newTable.getImproved();
}

/**
 * counts pairs of elements in same positions in two lists (the result is the adjacent matrix of the network defined by pairs)
 * @param  {Table} table with at least two lists
 * @return {NumberTable}
 * tags:
 */
TableOperators.getCountPairsMatrix = function(table){
	if(table==null || table.length<2 || table[0]==null || table[0][0]==null) return null;

	var list0 = table[0].getWithoutRepetitions();
	var list1 = table[1].getWithoutRepetitions();
	
	var matrix = new NumberTable(list1.length);

	list1.forEach(function(element1, i){
		matrix[i].name = String(element1);
		list0.forEach(function(element0, j){
			matrix[i][j] = 0;
		});
	});

	table[0].forEach(function(element0, i){
		element1 = table[1][i];
		matrix[list1.indexOf(element1)][list0.indexOf(element0)]++;
	});

	return matrix;
}


/**
 * filter a table selecting rows that have an element on one of its lists
 * @param  {Table} table
 * @param  {Number} nList list that could contain the element in several positions
 * @param  {Object} element
 * @return {Table}
 * tags:filter
 */
TableOperators.filterTableByElementInList=function(table, nList, element){
	if(table==null || !table.length>1 || nList==null) return;
	if(element==null) return table;


	var newTable = new Table();
	var i, j;

	newTable.name = table.name;

	for(j=0; table[j]!=null; j++){
		newTable[j] = new List();
	}

	for(i=0; table[0][i]!=null; i++){
		if(table[nList][i]==element){
			for(j=0; table[j]!=null; j++){
				newTable[j].push(table[j][i]);
			}
		}
	}

	for(j=0; newTable[j]!=null; j++){
		newTable[j] = newTable[j].getImproved();
	}

	return newTable;
}

TableOperators.mergeDataTablesInList=function(tableList){
	if(tableList.length<2) return tableList;
	
	var merged = tableList[0];
	
	for(var i=1; tableList[i]!=null; i++){
		merged = TableOperators.mergeDataTables(merged, tableList[i]);
	}
	
	return merged;
}

/**
 * creates a new table with an updated first List of elements and an added new numberList with the new values
 */
TableOperators.mergeDataTables=function(table0, table1){
	if(table1[0].length==0){
		var merged = table0.clone();
	 	merged.push(ListGenerators.createListWithSameElement(table0[0].length, 0));
	 	return merged;
	}
	
	var table = new Table();
	var list = ListOperators.concatWithoutRepetitions(table0[0], table1[0]);
	
	var nElements = list.length;
	
	var nNumbers0 = table0.length-1;
	var nNumbers1 = table1.length-1;
	
	var numberTable0 = new NumberTable();
	var numberTable1 = new NumberTable();
	
	var element;
	var index;
	
	var i, j;
	
	for(i=0; i<nElements; i++){
		index = table0[0].indexOf(list[i]);
		if(index>-1){
			for(var j=0; j<nNumbers0; j++){
				if(i==0){
					numberTable0[j] = new NumberList();
					numberTable0[j].name = table0[j+1].name;
				}
				numberTable0[j][i] = table0[j+1][index];
			}
		} else {
			for(j=0; j<nNumbers0; j++){
				if(i==0){
					numberTable0[j] = new NumberList();
					numberTable0[j].name = table0[j+1].name;
				}
				numberTable0[j][i] = 0;
			}
		}
		
		index = table1[0].indexOf(list[i]);
		if(index>-1){
			for(j=0; j<nNumbers1; j++){
				if(i==0){
					numberTable1[j] = new NumberList();
					numberTable1[j].name = table1[j+1].name;
				}
				numberTable1[j][i] = table1[j+1][index];
			}
		} else {
			for(j=0; j<nNumbers1; j++){
				if(i==0){
					numberTable1[j] = new NumberList();
					numberTable1[j].name = table1[j+1].name;
				}
				numberTable1[j][i] = 0;
			}
		}
	}
	
	table[0] = list;
	
	for(i=0;numberTable0[i]!=null;i++){
		table.push(numberTable0[i]);
	}
	for(i=0;numberTable1[i]!=null;i++){
		table.push(numberTable1[i]);
	}
	return table;
}

/**
 * From two DataTables creates a new DataTable with combined elements in the first List, and added values in the second 
 * @param {Object} table0
 * @param {Object} table1
 * @return {Table}
 */
TableOperators.fusionDataTables=function(table0, table1){
	var table = table0.clone();
	var index;
	var element;
	for(var i=0; table1[0][i]!=null; i++){
		element = table1[0][i];
		index = table[0].indexOf(element);
		if(index==-1){
			table[0].push(element);
			table[1].push(table1[1][i]);
		} else {
			table[1][index]+=table1[1][i];
		}
	}
	return table;
}

TableOperators.completeTable=function(table, nRows, value){
	value = value==null?0:value;
	
	var newTable = new Table();
	newTable.name = table.name;
	
	var list;
	var newList;
	var j;
	
	for(var i=0; i<table.length; i++){
		list = table[i];
		newList = list==null?ListOperators.getNewListForObjectType(value):instantiateWithSameType(list);
		newList.name = list==null?'':list.name;
		for(j=0; j<nRows; j++){
			newList[j] = (list==null || list[j]==null)?value:list[j];
		}
		newTable[i] = newList;
	}
	return newTable;
}

/**
 * filters a Table keeping the NumberLists
 * @param  {Table} table to filter
 * @return {NumberTable}
 * tags:filter
 */
TableOperators.getNumberTableFromTable=function(table){
	if(table==null || !table.length>0) return null;
	
	var i;
	var newTable = new NumberTable();
	newTable.name = table.name;
	for(i=0; table[i]!=null; i++){
		if(table[i].type=="NumberList") newTable.push(table[i]);
	}
	return newTable;
}

/**
 * calculates de information gain of all variables in a table and a supervised variable
 * @param  {Table} variablesTable
 * @param  {List} supervised
 * @return {NumberList}
 * tags:ds
 */
TableOperators.getVariablesInformationGain = function(variablesTable, supervised){
	if(variablesTable==null) return null;

	var igs = new NumberList();
	variablesTable.forEach(function(feature){
		igs.push(ListOperators.getInformationGain(feature, supervised));
	});
	return igs;
}

TableOperators.splitTableByCategoricList = function(table, list){
	if(table==null || list==null) return null;

	var childrenTable;
	var tablesList = new List();
	var childrenObject = {};
	var N = list.length;

	list.forEach(function(element, i){
		childrenTable = childrenObject[element];
		if(childrenTable==null){
			childrenTable = new Table()
			childrenObject[element]=childrenTable;
			tablesList.push(childrenTable);
			table.forEach(function(list, j){
				childrenTable[j] = new List();
				childrenTable[j].name = list.name;
			});
			childrenTable._element = element;
		}
		table.forEach(function(list, j){
			childrenTable[j].push(table[j][i]);
		});
	});

	return tablesList;
}

/**
 * builds a decision tree based on a variables table and a supervised variable
 * @param  {Table} variablesTable
 * @param  {List} supervised
 * @param {Object} supervisedValue main value in supervised list (associated with blue)
 * 
 * @param {Number} min_entropy minimum value of entropy on nodes (0.2 default)
 * @param {Number} min_size_node minimum population size associated with node (10 default)
 * @param {Number} min_info_gain minimum information gain by splitting by best feature (0.002 default)
 * @param {Boolean} generatePattern generates a pattern of points picturing proprtion of followed class in node
 * @return {Tree}
 * tags:ds
 */
TableOperators.buildDecisionTree = function(variablesTable, supervised, supervisedValue, min_entropy, min_size_node, min_info_gain, generatePattern){
	if(variablesTable==null || supervised==null || supervisedValue==null) return;

	min_entropy = min_entropy==null?0.2:min_entropy;
	min_size_node = min_size_node||10;
	min_info_gain = min_info_gain||0.002;

	var indexes = NumberListGenerators.createSortedNumberList(supervised.length);
	var tree = new Tree();

	TableOperators._buildDecisionTreeNode(tree, variablesTable, supervised, 0, min_entropy, min_size_node, min_info_gain, null, null, supervisedValue, indexes, generatePattern);

	return tree;
}


TableOperators._buildDecisionTreeNode = function(tree, variablesTable, supervised, level, min_entropy, min_size_node, min_info_gain, parent, value, supervisedValue, indexes, generatePattern){

	var entropy = ListOperators.getListEntropy(supervised, supervisedValue);
	

	if(entropy>=min_entropy){
		informationGains = TableOperators.getVariablesInformationGain(variablesTable, supervised);
		var maxIg = 0;
		var iBestFeature = 0;
		informationGains.forEach(function(ig, i){
			if(ig>maxIg){
				maxIg = ig;
				iBestFeature = i;
			}
		});
	}
	
	//c.l('informationGains', informationGains);
	


	var subDivide = entropy>=min_entropy && maxIg>min_info_gain && supervised.length>=min_size_node;

	var id = tree.nodeList.getNewId();
	var name = (value==null?'':value+':')+(subDivide?variablesTable[iBestFeature].name:'P='+supervised._biggestProbability+'('+supervised._mostRepresentedValue+')');
	var node = new Node(id,  name);
	
	


	tree.addNodeToTree(node, parent);

	if(parent==null){
		tree.informationGainTable = new Table();
		tree.informationGainTable[0] = variablesTable.getNames();
		if(informationGains){
			tree.informationGainTable[1] = informationGains.clone();
			tree.informationGainTable = tree.informationGainTable.getListsSortedByList(informationGains, false);
		}
	}

	node.entropy = entropy;
	node.weight = supervised.length;
	node.supervised = supervised;
	node.indexes = indexes;
	node.value = value;
	node.mostRepresentedValue = supervised._mostRepresentedValue;
	node.biggestProbability = supervised._biggestProbability;
	node.valueFollowingProbability = supervised._P_valueFollowing;
	node.lift = node.valueFollowingProbability/tree.nodeList[0].valueFollowingProbability;//Math.log(node.valueFollowingProbability/tree.nodeList[0].valueFollowingProbability)/Math.log(2);


	if(level<2){
		c.l('\nlevel', level);
		c.l('supervised.countElement(supervisedValue)', supervised.countElement(supervisedValue))
		c.l('entropy', entropy);
		c.l('value', value);
		c.l('name', name);
		c.l('supervised.name', supervised.name);
		c.l('supervised.length', supervised.length);
		c.l('supervisedValue', supervisedValue);
		c.l('supervised._biggestProbability, supervised._P_valueFollowing', supervised._biggestProbability, supervised._P_valueFollowing);
		c.l('node.valueFollowingProbability (=supervised._P_valueFollowing):', node.valueFollowingProbability)
		c.l('tree.nodeList[0].valueFollowingProbability', tree.nodeList[0].valueFollowingProbability);
		c.l('node.biggestProbability (=_biggestProbability):', node.biggestProbability);
		c.l('node.mostRepresentedValue:', node.mostRepresentedValue);
		c.l('node.mostRepresentedValue==supervisedValue', node.mostRepresentedValue==supervisedValue);
	}
	
	node._color = TableOperators._decisionTreeColorScale(1-node.valueFollowingProbability);

	// node._color = node.mostRepresentedValue==supervisedValue?
	// 	TableOperators._decisionTreeColorScale(1-node.biggestProbability)
	// 	:
	// 	TableOperators._decisionTreeColorScale(node.biggestProbability);

	
	if(generatePattern){
		var newCanvas = document.createElement("canvas");
		newCanvas.width = 150;
		newCanvas.height = 100;
		var newContext = newCanvas.getContext("2d");
		newContext.clearRect(0,0,150,100);

		TableOperators._decisionTreeGenerateColorsMixture(newContext, 150, 100, ['blue', 'red'],
			node.mostRepresentedValue==supervisedValue?
				[Math.floor(node.biggestProbability*node.weight), Math.floor((1-node.biggestProbability)*node.weight)]
				:
				[Math.floor((1-node.biggestProbability)*node.weight), Math.floor(node.biggestProbability*node.weight)]
		);

		
		var img = new Image();
		img.src = newCanvas.toDataURL();
		node.pattern = newContext.createPattern(img, "repeat");
	}



	if(!subDivide){
		return node;
	}

	node.bestFeatureName = variablesTable[iBestFeature].name;
	node.iBestFeature = iBestFeature;
	node.informationGain = maxIg;

	var expanded = variablesTable.concat([supervised, indexes]);

	var tables = TableOperators.splitTableByCategoricList(expanded, variablesTable[iBestFeature]);
	var childTable;
	var childSupervised;
	var newNode;

	tables.forEach(function(expandedChild){
		childTable = expandedChild.getSubList(0, expandedChild.length-3);
		childSupervised = expandedChild[expandedChild.length-2];
		childIndexes = expandedChild[expandedChild.length-1];
		TableOperators._buildDecisionTreeNode(tree, childTable, childSupervised, level+1, min_entropy, min_size_node, min_info_gain, node, expandedChild._element, supervisedValue, childIndexes, generatePattern);
	});

	node.toNodeList = node.toNodeList.getSortedByProperty('valueFollowingProbability', false);

	return node;
}
TableOperators._decisionTreeColorScale = function(value){
	var rr = value<0.5?Math.floor(510*value):255;
	var gg = value<0.5?Math.floor(510*value):Math.floor(510*(1-value));
	var bb = value<0.5?255:Math.floor(510*(1-value));

	return 'rgb('+rr+','+gg+','+bb+')';
}
TableOperators._decisionTreeGenerateColorsMixture = function(ctxt, width, height, colors, weights){
	//var imageData=context.createImageData(width, height);
	var x, y, i;//, rgb;
	var allColors = ListGenerators.createListWithSameElement(weights[0], colors[0]);

	for(i=1; colors[i]!=null; i++){
		allColors = allColors.concat( ListGenerators.createListWithSameElement(weights[i], colors[i]) );
	}

	for(x=0; x<width; x++){
		for(y=0; y<height; y++){
			i=(x+y*width)*4;
			ctxt.fillStyle = allColors.getRandomElement();
			ctxt.fillRect(x,y,1,1);
		}
	}

	//return imageData;
}