import List from "src/dataTypes/lists/List";
import NumberList from "src/dataTypes/numeric/NumberList";
import StringList from "src/dataTypes/strings/StringList";
import DateList from "src/dataTypes/dates/DateList";
import IntervalList from "src/dataTypes/numeric/IntervalList";
import Table from "src/dataTypes/lists/Table";
import NetworkEncodings from "src/operators/structures/NetworkEncodings";
import ListGenerators from "src/operators/lists/ListGenerators";
import ListConversions from "src/operators/lists/ListConversions";

/**
 * @classdesc Table Encodings
 *
 * @namespace
 * @category basics
 */
function TableEncodings() {}
export default TableEncodings;

TableEncodings.ENTER = String.fromCharCode(13);
TableEncodings.ENTER2 = String.fromCharCode(10);
TableEncodings.ENTER3 = String.fromCharCode(8232);

TableEncodings.SPACE = String.fromCharCode(32);
TableEncodings.SPACE2 = String.fromCharCode(160);

TableEncodings.TAB = "	";
TableEncodings.TAB2 = String.fromCharCode(9);


/**
 * Decode a String in format CSV into a Table
 * @param {String} csv CSV formatted text
 *
 * @param {Boolean} first_row_header first row is header (default: false)
 * @param {String} separator separator character (default: ",")
 * @param {Object} value_for_nulls Object to be placed instead of null values
 * @param {Boolean} listsToStringList if true (default value), converts lists that are not StringLists, NumberLists… (probably because they contain strings and numbers) into StringLists
 * @return {Table} resulting Table
 * tags:decoder
 */
TableEncodings.CSVtoTable = function(csvString, firstRowIsHeader, separator, valueForNulls, listsToStringList) {
  if(csvString==null) return null;
  

  //valueForNulls = valueForNulls == null ? "" : valueForNulls;
  listsToStringList = listsToStringList==null?false:listsToStringList;
  
  if(csvString.indexOf("\n")==-1 && csvString.indexOf(",")==-1 && csvString.indexOf(";")==-1 ){

    if(csvString.indexOf("http:/")===0 || csvString.indexOf("https:/")===0 || csvString.indexOf("fttp:/")===0 || csvString.indexOf("fttps:/")===0){
      throw new Error("The provided string seems to be a url, not a csv<br><br>Use <b>CSVLoader</b> to upload and decode csv files");
    } else {
      throw new Error("the provided string doesn't seem to be a csv, it contains no enters or chomas");
    }

  }

  var i, j;
  firstRowIsHeader = firstRowIsHeader == null ? false : firstRowIsHeader;

  if(csvString == null) return null;
  if(csvString === "") return new Table();

  csvString = csvString.replace(/\$/g, "");

  //var blocks = csvString.split("\"");
  

  //var blocks = csvString.split(/'|"/);

  var blocks = csvString.split("\"");


  for(i = 1; blocks[i] != null; i += 2) {
    blocks[i] = blocks[i].replace(/\n|\r/g, "*ENTER*");
  }
  csvString = blocks.join("\""); //TODO: create a general method for replacements inside "", apply it to chomas

  // var enterChar = TableEncodings.ENTER2;
  // var lines = csvString.split(enterChar);
  // if(lines.length == 1) {
  //   enterChar = TableEncodings.ENTER;
  //   lines = csvString.split(enterChar);
  //   if(lines.length == 1) {
  //     enterChar = TableEncodings.ENTER3;
  //     lines = csvString.split(enterChar);
  //   }
  // }

  var lines = csvString.split(/\n|\r/g);


  if(lines.length==1 && firstRowIsHeader){
    throw new Error("CSV contains only one line and firstRowIsHeader is true, a Table can't be build");
  }

  separator = separator==null?",":separator;

  var table = new Table();
  var comaCharacter = separator;

  if(csvString == null || csvString === "" || csvString == " " || lines.length === 0) return null;

  var startIndex = 0;
  var headerContent;
  if(firstRowIsHeader) {
    startIndex = 1;
    headerContent = lines[0].split(comaCharacter);
  }

  var element;
  var cellContent;
  var numberCandidate;
  var cellContents;
  //var actualIndex;


  var k;
  i = 0;

  for(k = startIndex; k < lines.length; k++) {
    //console.log(k, "lines[k].length", lines[k].length);

    if(lines[k].length < 2){
      continue;
    }

    cellContents = NetworkEncodings.replaceChomasInLine(lines[k], separator).split(comaCharacter); //TODO: will be obsolete (see previous TODO)
    //actualIndex = firstRowIsHeader ? i : i;

    // console.log('    √ i, actualIndex, cellContents.length, cellContents', i, actualIndex, cellContents.length, cellContents);
    // console.log(lines[k]);
    // console.log('-');
    // console.log(cellContents);
    // console.log('');
    //if(k>5) return null;

    for(j = 0; j < cellContents.length; j++) {
      table[j] = table[j] == null ? new List() : table[j];

      if(firstRowIsHeader && i === 0) {
        table[j].name = ( headerContent[j] == null ? "" : TableEncodings._removeQuotes(headerContent[j]) ).trim();
      }
      
      

      cellContent = cellContents[j].replace(/\*CHOMA\*/g, separator).replace(/\*ENTER\*/g, "\n");

      cellContent = cellContent === '' ? valueForNulls : cellContent;

      if(cellContent!=null) {
        cellContent = String(cellContent);
        numberCandidate = Number(cellContent.replace(',', '.'));
        element = (numberCandidate || (numberCandidate === 0 && cellContent !== '')) ? numberCandidate : cellContent;
        if(typeof element == 'string') element = TableEncodings._removeQuotes(element);
      } else {
        element = null;
      }
      
      table[j][i] = element;

      //if(j===0) console.log('   table[0][actualIndex]= ['+element+']');
    }

    i++;
  }

  //console.log('table[0].length',table[0].length);

  for(i = 0; table[i] != null; i++) {
    table[i] = table[i].getImproved();
    if(listsToStringList && table[i].type=="List") table[i] = ListConversions.toStringList(table[i]);
  }

  table = table.getImproved();

  return table;
};

/**
 * @ignore
 */
TableEncodings._removeQuotes = function(string) {
  if(string.length === 0) return string;
  if((string.charAt(0) == "\"" || string.charAt(0) == "'") && (string.charAt(string.length - 1) == "\"" || string.charAt(string.length - 1) == "'")) string = string.substr(1, string.length - 2);
  return string;
};


/**
 * Encode a Table into a String in format CSV
 * @param {Table} Table to be encoded
 *
 * @param {String} separator character (default: ",")
 * @param {Boolean} first row as List names (default: false)
 * @return {String} resulting String in CSV format
 * tags:encoder
 */
TableEncodings.TableToCSV = function(table, separator, namesAsHeaders) {
  separator = separator || ",";
  var i;
  var j;
  var list;
  var type;
  if(table == null) return null;
  var lines = ListGenerators.createListWithSameElement(table[0].length, "");
  var addSeparator;
  for(i = 0; table[i] != null; i++) {
    list = table[i];
    type = list.type;
    addSeparator = i != table.length - 1;
    for(j = 0; j < list.length; j++) {
      if(list[j] !== null){
        switch(type) {
          case 'NumberList':
            lines[j] += list[j];
            break;
          default:
            lines[j] += "\"" + list[j] + "\"";
            break;
        }
      }
      if(addSeparator) lines[j] += separator;
    }
  }

  var headers = '';
  if(namesAsHeaders) {
    for(i = 0; table[i] != null; i++) {
      list = table[i];
      headers += "\"" + list.name + "\"";
      if(i != table.length - 1) headers += separator;
    }
    headers += '\n';
  }

  return headers + lines.getConcatenated("\n");
};

/**
 * Encode a Table into a JSON String in a format that preserves key attributes
 * @param {Table} Table to be encoded
 *
 * @return {String} resulting String in JSON format
 * tags:encoder
 */
TableEncodings.TableToJSONString = function(table) {
  if(table == null) return '';
  var array = table.slice(0);
  var names = table.getNames();
  var types = table.getTypes();
  var obj = {
    data:array,
    name:table.name,
    type:table.type,
    handle:table.handle,
    names:names,
    types:types
    };
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return JSON.stringify({"error":"cannot convert."});
  }
}

/**
 * Decode a JSON String representation of a Table
 * @param {String} json formatted text
 *
 * @return {Table} resulting Table
 * tags:decoder
 */
TableEncodings.JSONStringToTable = function(json) {
  if(json == null || json.length == 0) return new Table();
  var obj,i;
  try {
    obj = JSON.parse(json);
  } catch(err) {
    return null;
  }
  var table = Table.fromArray(obj.data);
  table.name = String(obj.name);
  table.type = obj.type;
  table.handle = obj.handle;
  if(obj.types && obj.types.length > 0)
    for(i=0; i < obj.types.length; i++){
      if(table[i]){
        switch(obj.types[i]){
          case 'StringList':
            table[i] = StringList.fromArray(table[i],false);
            break;
          case 'NumberList':
            table[i] = NumberList.fromArray(table[i],false);
            break;
          case 'DateList':
            table[i] = DateList.fromArray(table[i],false);
            break;
          case 'IntervalList':
            table[i] = IntervalList.fromArray(table[i],false);
            break;
          case 'List':
          default:
        }
      }
    }
  else{
    // No types defined. Get improved versions of lists
    for(i=0;i<table.length;i++){
      table[i] = table[i].getImproved();
      // sometimes numbers get encoded as strings
      if(table[i].type == 'StringList'){
        var bAllNumbers=true;
        for(var j=0;bAllNumbers && j<table[i].length;j++){
          bAllNumbers = !isNaN(table[i][j]) && table[i][j].trim() !== '';
        }
        if(bAllNumbers)
          table[i] = ListConversions.toNumberList(table[i]);
      }
    }
  }
  if(obj.names)
    for(i=0; i < obj.names.length; i++){
      if(table[i]) table[i].name = String(obj.names[i]);
    }
  return table;
}

