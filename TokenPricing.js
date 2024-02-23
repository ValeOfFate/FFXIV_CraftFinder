// Const URL
const apiUrl =     'https://universalis.app/api/v2//';
const apiUrlTest = 'https://universalis.app/api/v2/worlds';

var itemIDs = '39630, 39704';
var worldVal= 'North-America';
var numListings = '5'
var numEntries = '0'
var hq = true;
var dataSetUnsorted = {};
var mapValues = {};

// 5 Second Update Button
async  function Update() {
    const unsortedData = await getData(
        'https://universalis.app/api/v2/' 
        + worldVal + '/' + itemIDs 
        + '?listings=' + numListings 
        + '&entries=' + numEntries
        + '&hq=' + hq);
    const parsedData = await unsortedData.json();
    console.log(parsedData.items); 
    generateJSON(parsedData.items);
    console.log(dataSetUnsorted);
    loadMaps();
    loadTable('Data-Table', ['total', 'itemID'], parsedData.items);
}

function loadTable(tableID, fields, data) {
    //$('#' + tableId).empty(); //not really necessary
    var rows = '';
    $.each(data, function(index, item) {
        var row = '<tr>';
        $.each(fields, function(index, field) {
            row += '<td>' + item[field+''] + '</td>';
        });
        rows += row + '<tr>';
    });
    $('#' + tableID).html(rows);
}

async function getData(url) {

    let x = await fetch(url)
    return x;
}    

// Maps JSON values to an item name and ticket count based off of pre-scrubbed values
function mapJSON(data) {
    
}

// Generates a simplified JSON structure only including the required data
function generateJSON(data) {
    $.each(data, function(index, element) {
        $.each(element.listings, function(indexList, elementList) {
            console.log(elementList);
            dataSetUnsorted[elementList.listingID] = {'Item_ID': element.itemID,
                                                      'Item_Quan': elementList.quantity,
                                                      'Item_Price': elementList.total,
                                                      'Item_PPU': elementList.pricePerUnit,
                                                      'Retainer_Name': elementList.retainerName,
                                                      'World_Location': elementList.worldName};
            
        });
    });
}

function loadMaps() {
    fetch('./Items.json')
        .then((response) => response.json())
        .then((json) => console.log(json));
}
