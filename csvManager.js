let item_id = 0;
let list_id = 0;

const ITEM_FILE = 'items.csv';
const LIST_FILE = 'lists.csv';

const fs = require('fs');

const itemFileData = fs.readFileSync(ITEM_FILE, 'utf-8');
const listFileData = fs.readFileSync(LIST_FILE, 'utf-8');

const lines = itemFileData.trim().split(/\r?\n/);
const listLines = listFileData.trim().split(/\r?\n/);

const HEADERS = ['id', 'name', 'status', 'urgent', 'list', 'date'];
const LIST_HEADERS = ['id', 'name'];

function readCsv(filename, headers) {
    if (!fs.existsSync(filename)) {
        fs.writeFileSync(filename, headers.join(',') + '\n', 'utf-8');
        return [];
    }

    const fileData = fs.readFileSync(filename, 'utf-8');
    const lines = fileData.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    return lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const obj = {};
        headers.forEach((header, index) => {
            obj[header] = values[index]
        });
        return obj;
    });
}

let items = readCsv(ITEM_FILE, HEADERS);
let lists = readCsv(LIST_FILE, LIST_HEADERS);

function getItems() {
    updateItems();
    return items;
}

function getLists() {
    updateLists();
    return lists;
}

function writeToFile() {
    const rows = items.map(item => Object.values(item).join(',')).join('\n');
    fs.writeFileSync(ITEM_FILE, HEADERS + '\n' + rows + '\n', 'utf-8');    
}

function addItem(name, list, date=null, status="incomplete", urgent="nonurgent") {
    const item = {id: item_id, name: name, status: status, urgent: urgent, list: list, date: date};

    items.push(item);
    item_id++;

    const row = Object.values(item).join(',') + '\n';
    fs.appendFileSync(ITEM_FILE, row, 'utf-8');
}

function addList(name) {
    const list = {id: list_id, name: name};

    lists.push(list);
    list_id++;

    const row = Object.values(list).join(',') + '\n';
    fs.appendFileSync(LIST_FILE, row, 'utf-8');
}

function deleteItem(id) {
    items = items.filter(item => item.id != id);

    writeToFile();
}

function deleteList(id) {
    lists = lists.filter(list => list.id != id);

    const rows = lists.map(item => Object.values(item).join(',')).join('\n');
    fs.writeFileSync(LIST_FILE, LIST_HEADERS + '\n' + rows + '\n', 'utf-8');    
}

function updateStatus(id) {
    items.forEach(item => {
        if (item.id == id) {
            if (item.status == "complete") {
                item.status = "incomplete";
            } else {
                item.status = "complete";
            }      
        }
    })

    writeToFile();
}

function updateUrgent(id) {
    items.forEach(item => {
        if (item.id == id) {
            if (item.urgent == "urgent") {
                item.urgent = "nonurgent";
            } else {
                item.urgent = "urgent";
            }      
        }
    })

    writeToFile();
}

function sortBy(option) {
    items.sort((a, b) => {
        if (a.urgent !== b.urgent) {
            return a.urgent === 'urgent' ? -1 : 1;
        }

        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        return new Date(a.date) - new Date(b.date);
    });

    writeToFile();
}

function updateItem(id, field, newValue) {
    items.forEach(item => {
        if (item.id == id) {
            item[field] = newValue;
        }
    });

    writeToFile();
}

function updateItems() {
    const updatedFileData = fs.readFileSync(ITEM_FILE, 'utf-8');

    const updatedLines = updatedFileData.trim().split(/\r?\n/);

    items = updatedLines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const obj = {};

        HEADERS.forEach((header, index) => {
            obj[header] = values[index];
        });

        return obj;
    })
}

function updateLists() {
    const updatedFileData = fs.readFileSync(LIST_FILE, 'utf-8');

    const updatedLines = updatedFileData.trim().split(/\r?\n/);

    lists = updatedLines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        const obj = {};

        LIST_HEADERS.forEach((header, index) => {
            obj[header] = values[index];
        });

        return obj;
    })
}

module.exports = {
    HEADERS,
    getItems,
    getLists,
    addItem,
    updateStatus,
    updateUrgent,
    sortBy,
    updateItems,
    deleteItem,
    deleteList,
    updateItem,
    addList,
}