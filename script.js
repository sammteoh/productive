const { HEADERS, getItems, addItem, addCategory, updateStatus, updateUrgent, sortBy, updateItems, deleteItem, updateItem } = require('./csvManager');

let categories = ["Life", "School"];

function renderButtons(containerId, categories) {
    const buttonContainer = document.getElementById(containerId);

    const itemInput = Object.assign(document.createElement('input'), {
        id: 'item-input',
        type: 'text',
        placeholder: 'Enter item.'
    });

    const categorySelect = document.createElement('select');
    categorySelect.id = 'category-select';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.toLowerCase();
        option.textContent = category;
        categorySelect.appendChild(option);
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
        if (itemInput.value == "" || categorySelect.value == "") {
            throw new Error("Invalid input.")
        }

        addItem(itemInput.value, categorySelect.value, dateSelect.value);
        sortBy("date");
        renderPage();
        itemInput.value = "";
    });


    buttonContainer.appendChild(itemInput);
    buttonContainer.appendChild(categorySelect);
    buttonContainer.appendChild(dateSelect);
    buttonContainer.appendChild(addButton);

}

function renderFullTable(category, containerId) {
    const container = document.getElementById(containerId);

    const categoryItems = getItems().filter(item => item.category == category.toLowerCase());

    const completeItems = categoryItems.filter(item => item.status == "complete");
    const incompleteItems = categoryItems.filter(item => item.status == "incomplete");

    const completeContainer = document.createElement('div');
    completeContainer.id = `${category.toLowerCase()}-complete-container`;

    const incompleteContainer = document.createElement('div');
    incompleteContainer.id = `${category.toLowerCase()}-incomplete-container`;

    container.appendChild(completeContainer);
    container.appendChild(incompleteContainer);

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
    const container = document.getElementById('container');
    container.innerHTML = "";

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'button-container';

    const tableContainer = document.createElement("div");
    tableContainer.id = "table-container";

    container.appendChild(buttonContainer);
    container.appendChild(tableContainer)

    renderButtons(buttonContainer.id, categories);

    categories.forEach(category => {
        const categoryContainer = document.createElement('div');
        categoryContainer.id = `${category.toLowerCase()}-container`;

        const categoryHeading = document.createElement('h2');
        categoryHeading.textContent = `${category.toUpperCase()}`;

        categoryContainer.appendChild(categoryHeading);

        tableContainer.appendChild(categoryContainer);

        renderFullTable(category, categoryContainer.id);
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