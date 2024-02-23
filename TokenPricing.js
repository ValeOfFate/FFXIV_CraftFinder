// Const URL
const apiUrl =     'https://universalis.app/api/v2//';
const apiUrlTest = 'https://universalis.app/api/v2/worlds';
const tableLabels = ['ID', 'Item Name', 'World', 'Retainer', 'Total Price', 'Quantity', 'Price/Unit', 'Import Amount', 'Cost/Import']

var itemIDs = '';
var worldVal= 'North-America';
var numListings = '5'
var numEntries = '0'
var langCode = 'en';
var hq = true;
var itemListings = {};
var mapVals = {};

var activeProcessing = false;

async function Startup() {

    activeProcessing = true;

    // Maps loading
    const mapRequest = await loadMaps();
    const parsedMaps = await mapRequest.json();
    mapVals = parsedMaps;
    
    // Loads IDs to call for listing info
    loadIDs(parsedMaps);
    
    // Unsorted Data loading
    const unsortedData = await getData(
        'https://universalis.app/api/v2/' 
        + worldVal + '/' + itemIDs 
        + '?listings=' + numListings 
        + '&entries=' + numEntries
        + '&hq=' + hq);
    const parsedData = await unsortedData.json();
    
    // Turns Data into a condensed unsorted JSON object
    generateJSON(parsedData.items);
    
    // Maps data
    mapJSON(itemListings, parsedMaps);
    formatJSON(itemListings);
    
    // Parse the chart to obtain JSON in sorted order
    var sortedJSON = sortData();

    // Print out the current table
    loadTable('Data-Table', ['Item_ID', 'Map_Name', 'World_Location','Retainer_Name', 'Item_Price', 'Item_Quan', 'Item_PPU', 'Map_Imports', 'Cost_PerImport'], sortedJSON);

    activeProcessing = false;
}

// Updates based on current vals
async  function Update() {

    // Only works if an update isnt currently occuring
    if (activeProcessing == false) {

        // Sets itself as currently updating
        activeProcessing = true;

        // Resets the item json
        itemListings = {};

        worldVal = $("#region").val();
        langCode =  $("#lang").val();
        numListings =  $("#entries").val();

        // Unsorted Data loading
        const unsortedData = await getData(
            'https://universalis.app/api/v2/' 
            + worldVal + '/' + itemIDs 
            + '?listings=' + numListings 
            + '&entries=' + numEntries
            + '&hq=' + hq);
        const parsedData = await unsortedData.json();
        
        // Turns Data into a condensed unsorted JSON object
        generateJSON(parsedData.items);
        
        // Maps data
        mapJSON(itemListings, mapVals);
        formatJSON(itemListings);
        
        // Parse the chart to obtain JSON in sorted order
        var sortedJSON = sortData();

        // Print out the current table
        loadTable('Data-Table', ['Item_ID', 'Map_Name', 'World_Location','Retainer_Name', 'Item_Price', 'Item_Quan', 'Item_PPU', 'Map_Imports', 'Cost_PerImport'], sortedJSON);
        activeProcessing = false;
        console.log("Processing");
    }

    
    

}
// Returns sorted data as JSON (Note: Changes formatting)
function sortData() {

    // Convert ItemListings into array for ease of sorting
    var sortedData = [];
    $.each(itemListings, function(index, data) {
        sortedData.push([index, [data]]);
    })
    
    // Creates custom function to use Cost_PerImport as sorting case
    sortedData.sort(function (a, b) {
    
        // Value Weights
        var a1st = -1;
        var b1st =  1;
        var equal = 0;
    
        // Compare to get a proper weight
        if (b[1][0].Cost_PerImport < a[1][0].Cost_PerImport) {
            return b1st;
        }
        else if (a[1][0].Cost_PerImport < b[1][0].Cost_PerImport) {
            return a1st;
        }
        else {
            return equal;
        }
    });

    // Parse the chart to obtain JSON in sorted order
    return JSON.parse(JSON.stringify(sortedData));
}

function loadTable(tableID, fields, data) {
    $('#' + tableID).empty(); //not really necessary
    var rows = '';
    var row = '<tr>';
    $.each(tableLabels, function(index, label) {
        row += '<th>' + label + '' + '</th>'
    })
    row += '</tr>'
    rows += row;
    $.each(data, function(index, item) {
        var row = '<tr>';
        $.each(fields, function(index, field) {
            if (field == 'Map_Imports') {
                row += '<td>' + item[1][0].Item_Map.Imports+'' + '</td>';
            }
            else if (field == 'Map_Name') {
                row += '<td>' + item[1][0].Item_Map[langCode]+'' + '</td>';
            }
            else {
                row += '<td>' + item[1][0][field+''] + '</td>';
            }
        });
        rows += row + '<tr>';
    });
    $('#' + tableID).html(rows);
}

// Gets data request from the Universalis API
async function getData(url) {

    try {
    let x = await fetch(url)
    return x;
    } catch (error) {
        console.log(error);
    }
}    

// Gets maps request from Github
async function loadMaps() {
        let maps = await fetch('https://raw.githubusercontent.com/ValeOfFate/FFXIV_CraftFinder/main/Items.json')
        return maps;
}


// Generates a simplified JSON structure only including the required data
function generateJSON(data) {
    $.each(data, function(index, element) {
        $.each(element.listings, function(indexList, elementList) {
            // console.log(elementList);
            itemListings[elementList.listingID] = {'Item_ID': element.itemID,
            'Item_Quan': elementList.quantity,
            'Item_Price': elementList.total,
            'Item_PPU': elementList.pricePerUnit,
            'Retainer_Name': elementList.retainerName,
            'World_Location': elementList.worldName};
            
        });
    });
}

// Maps JSON values to an item name and ticket count based off of pre-scrubbed values
function mapJSON(data, maps) {
    $.each(data, function(index, element) {
        element.Item_Map = maps[element.Item_ID];
    });
}

function formatJSON(data) {
    $.each(data, function(index, element) {
        element.Cost_PerImport = (Math.floor(element.Item_Price / (element.Item_Quan * element.Item_Map.Imports)))
    })
}

function loadIDs(maps) {
    $.each(maps, function(index, element) {
        itemIDs += ', ' + index; 
    });
}