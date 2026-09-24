const { HEADERS, getItems, getLists, addItem, updateStatus, updateUrgent, sortBy, updateItems, deleteItem, deleteList, updateItem, addList } = require('./csvManager');

let lists = getLists();

function renderButtons(containerId) {
    // Adding a new item button container
    const buttonContainer = document.getElementById(containerId);

    const addItemButtonContainer = document.createElement('div');

    const itemInput = Object.assign(document.createElement('input'), {
        id: 'item-input',
        type: 'text',
        placeholder: 'Enter item.'
    });

    const listSelect = document.createElement('select');
    listSelect.id = 'list-select';

    lists.forEach(list => {
        const option = document.createElement('option');
        option.value = list.name.toLowerCase();
        option.textContent = list.name;
        listSelect.appendChild(option);
    });

    const dateSelect = Object.assign(document.createElement('input'), {
        id: 'date-input',
        type: 'date',
    });

    const addButton = Object.assign(document.createElement('button'), {
        id: 'add-button',
        type: 'button',
        textContent: 'Add'
    });


    addButton.addEventListener('click', () => {
        if (itemInput.value == "" || listSelect.value == "") {
            throw new Error("Invalid input.")
        }

        addItem(itemInput.value, listSelect.value, dateSelect.value);
        sortBy("date");
        renderPage();
        itemInput.value = "";
    });

    // Adding a new list button container
    const addListButtonContainer = document.createElement('div');

    const listInput = Object.assign(document.createElement('input'), {
        id: 'list-input',
        type: 'text',
        placeholder: 'Enter list.'
    });

    const addListButton = Object.assign(document.createElement('button'), {
        id: 'add-list-button',
        type: 'button',
        textContent: 'Add'
    });

    addListButton.addEventListener('click', () => {
        if (listInput.value == "") {
            throw new Error("Invalid input.")
        }

        addList(listInput.value);
        lists = getLists();
        renderPage();
        listInput.value = "";
    });


    addItemButtonContainer.appendChild(itemInput);
    addItemButtonContainer.appendChild(listSelect);
    addItemButtonContainer.appendChild(dateSelect);
    addItemButtonContainer.appendChild(addButton);

    addListButtonContainer.appendChild(listInput);
    addListButtonContainer.appendChild(addListButton);

    buttonContainer.appendChild(addItemButtonContainer);
    buttonContainer.appendChild(addListButtonContainer);

}

function renderFullTable(list, containerId) {
    const container = document.getElementById(containerId);

    const listItems = getItems().filter(item => item.list == list.name.toLowerCase());

    const completeItems = listItems.filter(item => item.status == "complete");
    const incompleteItems = listItems.filter(item => item.status == "incomplete");

    const completeContainer = document.createElement('div');
    completeContainer.id = `${list.name.toLowerCase()}-complete-container`;

    const completeToggleBtn = document.createElement('button');
    completeToggleBtn.textContent = `Hide Completed (${completeItems.length})`

    completeToggleBtn.addEventListener('click', () => {
        const isHidden = completeContainer.style.display === "none";

        if (isHidden) {
            completeContainer.style.display = "block";
            completeToggleBtn.textContent = `Hide Completed (${completeItems.length})`
        } else {
            completeContainer.style.display = "none";
            completeToggleBtn.textContent = `Show Completed (${completeItems.length})`
        }
    })

    const incompleteContainer = document.createElement('div');
    incompleteContainer.id = `${list.name.toLowerCase()}-incomplete-container`;

    container.appendChild(incompleteContainer);
    container.appendChild(completeContainer);
    container.appendChild(completeToggleBtn);       

    renderTable(completeItems, completeContainer.id);
    renderTable(incompleteItems, incompleteContainer.id);
}

function renderTable(tableItems, containerId) {
    const table = document.createElement("table");

    const headerRow = document.createElement("tr");

    const container = document.getElementById(containerId);
    
    HEADERS.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    const deleteHeader = document.createElement('th');
    headerRow.appendChild(deleteHeader);

    table.appendChild(headerRow);

    tableItems.forEach(item => {
        const row = document.createElement('tr');

        HEADERS.forEach(header => {
            const cell = document.createElement('td');
            const value = item[header];

            if (header == "status") {
                const checkStatusInput = document.createElement("input");
                checkStatusInput.type = "checkbox";
                checkStatusInput.checked = (item.status === "complete");

                checkStatusInput.addEventListener('change', (e) => {
                    updateStatus(item.id);
                    sortBy("date");
                    renderPage();
                });

                cell.appendChild(checkStatusInput);
            } else if (header == "urgent") {
                const checkUrgentInput = document.createElement("input");
                checkUrgentInput.type = "checkbox";
                checkUrgentInput.checked = (item.urgent === "urgent");

                checkUrgentInput.addEventListener('change', (e) => {
                    updateUrgent(item.id);
                    sortBy('date');
                    renderPage();
                });

                cell.appendChild(checkUrgentInput);    
            } else if (header == "name" || header == "date") {
                cell.textContent = value
                
                cell.addEventListener('click', function makeEditable() {
                    if (cell.querySelector('input')) return;

                    const input = document.createElement('input');
                    input.type = (header === "date") ? "date" : "text";
                    input.value = value

                    cell.textContent = "";
                    cell.appendChild(input);
                    input.focus();

                    const saveChange = () => {
                        const newValue = input.value.trim();
                        if (newValue !== value) {
                            updateItem(item.id, header, newValue);
                            sortBy("date");
                        }
                        renderPage();
                    };

                    input.addEventListener('blur', saveChange);
                    input.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter') {
                            input.blur();
                        }
                    });
                });

            } else {
                cell.textContent = value;
            }

            row.appendChild(cell);
        })

        const deleteCell = document.createElement('td');
        const deleteButton = document.createElement('button');

        deleteButton.textContent = 'x';
        deleteButton.addEventListener('click', () => {
            deleteItem(item.id);
            renderPage();
        });

        deleteCell.appendChild(deleteButton);
        row.appendChild(deleteCell);

        table.appendChild(row);
    })

    container.innerHTML = "";
    container.appendChild(table);
}

function renderPage() {
    let lists = getLists();
    const container = document.getElementById('container');
    container.innerHTML = "";

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'button-container';

    const tableContainer = document.createElement("div");
    tableContainer.id = "table-container";

    container.appendChild(buttonContainer);
    container.appendChild(tableContainer)

    renderButtons(buttonContainer.id);

    lists.forEach(list => {
        const listContainer = document.createElement('div');
        listContainer.id = `${list.name.toLowerCase()}-container`;

        const listHeading = document.createElement('h2');
        listHeading.textContent = `${list.name.toUpperCase()}`;

        const deleteButton = document.createElement('button');
        
        deleteButton.textContent = 'x';
        deleteButton.addEventListener('click', () => {
            deleteList(list.id);
            renderPage();
        });

        listContainer.appendChild(listHeading);
        listContainer.appendChild(deleteButton);

        tableContainer.appendChild(listContainer);

        renderFullTable(list, listContainer.id);
    });
}

renderPage();


/*
plans:
- input box next to my "add" button. if i try to add blank shows an error - DONE
- all my items should show up in a table on the side - DONE
- make it two tables, incomplete and complete - DONE
- have an interactive checkbox - DONE
- make it so that i can create a template every time

- add a category
- add a due date
- every time you add a category, a new "compelte and incomplete" table set is created
- urgent? yes/no

- edit an item in place (edit the name, date, etc.)
- clear the completed tasks
- show and hide the completed table
- option to create a bunch of different lists
- instead of 'category', make lists with each their own category
- different views
*/