let id = 0;

const fs = require('fs');

const fileData = fs.readFileSync('data.csv', 'utf-8');

const lines = fileData.trim().split(/\r?\n/);

const HEADERS = ['id', 'name', 'status', 'urgent', 'category', 'date'];

let items = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const obj = {};

    HEADERS.forEach((header, index) => {
        obj[header] = values[index];
    });

    id++;
    return obj;
})

function getItems() {

    updateItems();

    return items;
}

function addItem(name, category, date=null, status="incomplete", urgent="nonurgent") {
    const item = {id: id, name: name, status: status, urgent: urgent, category: category, date: date};

    items.push(item);

    id++;
    const row = Object.values(item).join(',') + '\n';
    fs.appendFileSync('data.csv', row, 'utf-8');

}

function deleteItem(id) {
    items = items.filter(item => item.id != id);

    const rows = items.map(item => Object.values(item).join(',')).join('\n');
    fs.writeFileSync('data.csv', HEADERS + '\n' + rows + '\n', 'utf-8');
}

function addCategory(name) {
    categories.push(name);
}

function deleteAll() {
    items = [];
    fs.writeFileSync('data.csv', HEADERS + '\n', 'utf-8');
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

    const rows = items.map(item => Object.values(item).join(',')).join('\n');

    fs.writeFileSync('data.csv', HEADERS + '\n' + rows + '\n', 'utf-8');
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

    const rows = items.map(item => Object.values(item).join(',')).join('\n');

    fs.writeFileSync('data.csv', HEADERS + '\n' + rows + '\n', 'utf-8');
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

    const rows = items.map(item => Object.values(item).join(',')).join('\n');

    fs.writeFileSync('data.csv', HEADERS + '\n' + rows + '\n', 'utf-8');
}

function updateItems() {
    const updatedFileData = fs.readFileSync('data.csv', 'utf-8');

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

module.exports = {
    HEADERS,
    getItems,
    addItem,
    addCategory,
    deleteAll,
    updateStatus,
    updateUrgent,
    sortBy,
    updateItems,
    deleteItem
}