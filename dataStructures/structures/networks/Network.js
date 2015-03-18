Network.prototype = new DataModel();
Network.prototype.constructor=Network;


/**
* Network
* @constructor
*/
function Network () {
	this.type="Network";
	
	this.nodeList=new NodeList();
	this.relationList=new RelationList();
}

/**
 * get nodeList property
 * @return {NodeList}
 * tags:
 */
Network.prototype.getNodes=function(){
	return this.nodeList;
}

/**
 * get relationList property
 * @return {RelationList}
 * tags:
 */
Network.prototype.getRelations=function(){
	return this.relationList;
}

/**
 * get nodes ids property
 * @return {StringList}
 * tags:
 */
Network.prototype.getNodesIds=function(){
	return this.nodeList.getIds();
}



/**
 * building methods
 */

Network.prototype.addNode=function(node){
	this.nodeList.addNode(node);
}
Network.prototype.getNodeWithName=function(name){
	return this.nodeList.getNodeWithName(name);
}
Network.prototype.getNodeWithId=function(id){
	return this.nodeList.getNodeWithId(id);
}

Network.prototype.createRelation = function(node0, node1, id, weight, content){
	this.addRelation(new Relation(id, id, node0, node1, weight, content));
}

Network.prototype.addRelation=function(relation){
 	this.relationList.addNode(relation);
 	relation.node0.nodeList.addNode(relation.node1);
 	relation.node0.relationList.addNode(relation);
 	relation.node0.toNodeList.addNode(relation.node1);
 	relation.node0.toRelationList.addNode(relation);
 	relation.node1.nodeList.addNode(relation.node0);
 	relation.node1.relationList.addNode(relation);
 	relation.node1.fromNodeList.addNode(relation.node0);
 	relation.node1.fromRelationList.addNode(relation);
}

Network.prototype.connect=function(node0, node1, id, weight, content){
	id = id || (node0.id+"_"+node1.id);
	weight = weight || 1;
	var relation = new Relation(id, id, node0, node1, weight);
	this.addRelation(relation);
	relation.content = content;
	return relation;
}



/**
 * removing methods
 */

Network.prototype.removeNode=function(node){
	this.removeNodeRelations(node)
	this.nodeList.removeNode(node);
}

Network.prototype.removeNodeRelations=function(node){
	for(var i=0; node.relationList[i]!=null; i++){
		this.removeRelation(node.relationList[i]);
		i--;
	}
}

Network.prototype.removeNodes=function(){
  this.nodeList.deleteNodes();
  this.relationList.deleteNodes();
}
Network.prototype.removeRelation=function(relation){
	this.relationList.removeElement(relation);
	relation.node0.nodeList.removeNode(relation.node1);
	relation.node0.relationList.removeRelation(relation);
	relation.node0.toNodeList.removeNode(relation.node1);
	relation.node0.toRelationList.removeRelation(relation);
	relation.node1.nodeList.removeNode(relation.node0);
	relation.node1.relationList.removeRelation(relation);
	relation.node1.fromNodeList.removeNode(relation.node0);
	relation.node1.fromRelationList.removeRelation(relation);
}

/**
 * transformative method, removes nodes without a minimal number of connections
 * @param  {Number} minDegree minimal degree
 * @return {Number} number of nodes removed
 * tags:transform
 */
Network.prototype.removeIsolatedNodes=function(minDegree){
	var i;
	var nRemoved = 0;
	minDegree = minDegree==null?1:minDegree;
	
	for(i=0; this.nodeList[i]!=null; i++){
		if(this.nodeList[i].getDegree()<minDegree){
			this.nodeList[i]._toRemove = true;
			// this.removeNode(this.nodeList[i]);
			// nRemoved++;
			// i--;
		}
	}

	for(i=0; this.nodeList[i]!=null; i++){
		if(this.nodeList[i]._toRemove){
			this.removeNode(this.nodeList[i]);
			nRemoved++;
			i--;
		}
	}

	return nRemoved;
}



Network.prototype.clone = function(nodePropertiesNames, relationPropertiesNames, idsSubfix, namesSubfix){
	var newNetwork = new Network();
	var newNode, newRelation;
	var i;

	idsSubfix = idsSubfix==null?'':String(idsSubfix);
	namesSubfix = namesSubfix==null?'':String(namesSubfix);

	this.nodeList.forEach(function(node){
		newNode = new Node(idsSubfix+node.id, namesSubfix+node.name);
		if(idsSubfix!='') newNode.basicId = node.id;
		if(namesSubfix!='') newNode.basicName = node.name;
		if(nodePropertiesNames){
			nodePropertiesNames.forEach(function(propName){
				if(node[propName]!=null) newNode[propName] = node[propName];
			});
		}
		newNetwork.addNode(newNode);
	});

	this.relationList.forEach(function(relation){
		newRelation = new Relation(idsSubfix+relation.id, namesSubfix+relation.name, newNetwork.nodeList.getNodeById(idsSubfix+relation.node0.id), newNetwork.nodeList.getNodeById(idsSubfix+relation.node1.id));
		if(idsSubfix!='') newRelation.basicId = relation.id;
		if(namesSubfix!='') newRelation.basicName = relation.name;
		if(relationPropertiesNames){
			relationPropertiesNames.forEach(function(propName){
				if(relation[propName]!=null) newRelation[propName] = relation[propName];
			});
		}
		newNetwork.addRelation(newRelation);
	});

	return newNetwork;
}


Network.prototype.getReport=function(){
	return "network contains "+this.nodeList.length+" nodes and "+this.relationList.length+" relations";
}

Network.prototype.destroy=function(){
	delete this.type;
	this.nodeList.destroy();
	this.relationList.destroy();
	delete this.nodeList;
	delete this.relationList;
}