function TableOperators(){};


TableOperators.getElementFromTable=function(table, i, j){
	if(table[i] == null) return null;
	return table[i][j];
}

TableOperators.getSubTable=function(table, x, y, width, height){
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
 * transposes the table
 * @param  {Table} table to be transposed
 * @return {Table}
 * tags:matrixes
 */
TableOperators.transpose=function(table){
	if(table==null) return null;
	return table.getTransposed();
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
	descending = descending || true;
	
	var newTable = instantiate(typeOf(table));
	newTable.name = table.name;
	var nElements = table.length;
	var i;
	for(i=0; i<nElements; i++){
		newTable[i] = ListOperators.sortListByNumberList(table[i], numberList, descending);
	}
	return newTable;
}



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

	c.log('list0.length, list1.length', list0.length, list1.length);
	c.log('matrix --> ', matrix);

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
 * From two DataTables creates a new DataTable with combined elements in the first List, and additoned values in the second 
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
 * 
 * @param {Number} min_entropy minimum value of entropy on nodes
 * @param {Number} min_size_node minimum population size associated with node
 * @param {Number} min_info_gain minimum information gain by splitting by best feature
 * @param {Object} valueFollowing main value in supervised list (associated with blue)
 * @return {Tree}
 * tags:ds
 */
TableOperators.buildDecisionTree = function(variablesTable, supervised, min_entropy, min_size_node, min_info_gain, valueFollowing){
	if(variablesTable==null || supervised==null) return;
	min_entropy = min_entropy==null?0.2:min_entropy;
	min_size_node = min_size_node||0;
	min_info_gain = min_info_gain||0;

	var tree = new Tree();

	TableOperators._buildDecisionTreeNode(tree, variablesTable, supervised, 0, min_entropy, min_size_node, min_info_gain, null, null, valueFollowing);

	return tree;
}


TableOperators._buildDecisionTreeNode = function(tree, variablesTable, supervised, level, min_entropy, min_size_node, min_info_gain, parent, value, valueFollowing){
	var entropy = ListOperators.getListEntropy(supervised);


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

	var subDivide = entropy>=min_entropy && maxIg>min_info_gain && supervised.length>=min_size_node;

	var id = tree.nodeList.getNewId();
	var name = (value==null?'':value+':')+(subDivide?variablesTable[iBestFeature].name:'P='+supervised._biggestProbability+'('+supervised._mostRepresentedValue+')');
	var node = new Node(id,  name);
	
	tree.addNodeToTree(node, parent);

	node.entropy = entropy;
	node.weight = supervised.length;
	node.supervised = supervised;
	node.value = value;
	node.mostRepresentedValue = supervised._mostRepresentedValue;
	node.biggestProbability = supervised._biggestProbability;

	node._color = node.mostRepresentedValue==valueFollowing?
		TableOperators._decisionTreeColorScale(1-node.biggestProbability)
		:
		TableOperators._decisionTreeColorScale(node.biggestProbability);

	if(!subDivide){
		return node;
	}

	node.bestFeatureName = variablesTable[iBestFeature].name;
	node.iBestFeature = iBestFeature;
	node.informationGain = maxIg;

	var expanded = variablesTable.concat([supervised]);

	var tables = TableOperators.splitTableByCategoricList(expanded, variablesTable[iBestFeature]);
	var childTable;
	var childSupervised;
	var newNode;


	tables.forEach(function(expandedChild){
		childTable = expandedChild.getSubList(0, expandedChild.length-2);
		childSupervised = expandedChild[expandedChild.length-1];
		TableOperators._buildDecisionTreeNode(tree, childTable, childSupervised, level+1, min_entropy, min_size_node, min_info_gain, node, expandedChild._element, valueFollowing);
	});

	return node;
}
TableOperators._decisionTreeColorScale = function(value){
	var rr = value<0.5?Math.floor(510*value):255;
	var gg = value<0.5?Math.floor(510*value):Math.floor(510*(1-value));
	var bb = value<0.5?255:Math.floor(510*(1-value));

	return 'rgb('+rr+','+gg+','+bb+')';
}
