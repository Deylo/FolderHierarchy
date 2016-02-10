
var sObj = {};
var div;

function createList(id,obj){
    var nameArray;
    var list = '';
    var cash = {};
    var index = 0;
    var fUl = document.createElement('ul');

    sObj = obj || {};
    div = document.getElementById(id);
    fUl.dataset.indexNestedList = '0';
    div.appendChild(fUl);

    list = (function createHTML(object){
        var buf = '';
        var count = 1;

        for(var key in object){
            index += '_' + count;

            if(object[key] == 'file')
                buf += '<li data-index-folder="' + index + '">'  + elementIconHTML(index, true) +
                    elementNameHTML(index, index) + '</li>';
            else
                buf += '<li data-index-folder="' + index + '">' + toggleButtonHTML(index) + elementIconHTML(index) +
                    elementNameHTML(index, index) + nestedListHTML(index, createHTML(object[key])) + '</li>';

            cash[index] = key;
            index = index.slice(0,-2);
            count++;
        }
        return buf;
    })(sObj);

    fUl.innerHTML = list + addButtonHTML(0);
    nameArray = div.getElementsByClassName('name');

    for(var i = 0; i < nameArray.length; i++){
        if (cash[nameArray[i].innerText].length > 15) {
            nameArray[i].title = cash[nameArray[i].innerText];
            nameArray[i].innerText = cash[nameArray[i].innerText].slice(0,15) + ' ...';
            continue;
        }
        nameArray[i].innerText = cash[nameArray[i].innerText];
    }
    ownContextMenu();
}

function toggle(index, needOpen){
    var ulElement = div.querySelector('[data-index-nested-list="' + index + '"]');
    var toggleButtonElement = div.querySelector('[data-index-toggle-button="' + index + '"]');
    var elementIcon = div.querySelector('[data-index-element-icon="' + index + '"]');

    if(ulElement.hidden || needOpen){
        ulElement.hidden = false;
        toggleButtonElement.innerText = '-';
        elementIcon.src = 'image/folderOpen.png';
    }
    else{
        ulElement.hidden = true;
        toggleButtonElement.innerText = '+';
        elementIcon.src = 'image/folderClose.png';
    }
}

function add(index, isFile) {
    var elementName;
    var li;
    var elInd;
    var displayedText = '';
    var text = '';
    var element = div.querySelector('[data-index-nested-list="' + index + '"]');

    if(isFile)
        text = prompt('Please write name for new file', '');
    else
        text = prompt('Please write name for new folder', '');

    text = text.trim().replace(/\s+/,' ');
    displayedText = text;

    if(!checkName(element,text))
        return;

    li = document.createElement('li');
    element.insertBefore(li, element.lastElementChild);
    elInd = findElementIndex(li,index);

    if(isFile)
        li.innerHTML = elementIconHTML(elInd, true) + elementNameHTML(elInd);
    else
        li.innerHTML = toggleButtonHTML(elInd) + elementIconHTML(elInd) + elementNameHTML(elInd) + nestedListHTML(elInd);

    li.dataset.indexFolder = elInd;
    elementName = div.querySelector('[data-index-element-name="' + elInd + '"]');

    if(text.length > 15){
        displayedText = text.slice(0,15) + ' ...';
        elementName.title = text;
    }

    elementName.innerText = displayedText;
    saveNewElem(li, text, true, false, isFile);
}

function findElementIndex(elem, parentIndex){
    var index = '';
    var curIndex;
    var curElem = elem.previousElementSibling;

    if(!curElem) {
        index = parentIndex + '_' + 1;
        return index;
    }
    curIndex = curElem.dataset.indexFolder.split('_');
    curIndex[curIndex.length-1] ++;
    if(!index) index = '' + curIndex.join('_');
    else index += curIndex.join('_') + '_' + index;
    return index;
}

function saveNewElem(elem, name, saveEl, newName, isFile){
    var allFolder = div.querySelectorAll('[data-index-folder]');
    var allParentFolder = findAllParentElements(allFolder, elem);
    var key;
    var nName = newName || '';

    (function save(obj){
        if(!allParentFolder.length){
            if(saveEl) {
                if(isFile)
                    obj[name] = 'file';
                else
                    obj[name] = {};
                return;
            }
            if(nName)
                obj[nName] = obj[name];
            delete obj[name];
            return;
        }
        key = findElement(allParentFolder.shift(), 'elementName').innerText;
        for(var k in obj){
            if(k == key){
                save(obj[k]);
            }
        }
    })(sObj);
    console.log(sObj);
}

function findAllParentElements(elements, childElem){
    var parentElements = [];
    for(var i = 0; i < elements.length; i++){
        if(elements[i].compareDocumentPosition(childElem) & 16)
            parentElements.push(elements[i]);
    }
    return parentElements;
}

function checkName(element, text){
    var correctName = true;

    if (!text) {
        return false;
    }
    if(text.search(/[*|\\:"<>?/]/i) != -1){
        alert('The folder name contains characters that are not permitted ( * / | \\ : " < > ? )');
        return false;
    }

    if(text.length > 255){
        alert('Too long name');
        return false;
    }
    for(var i = 0; i < element.childElementCount-1; i++){
        if(findElement(element.children[i], 'elementName').innerHTML == text){
            correctName = false;
            alert('The name is already exist');
            break;
        }
    }
    return correctName;
}

function findElement(parentElement, description){
    var elem;
    for(var i = 0; i < parentElement.childElementCount; i++){
        if( parentElement.children[i].dataset.description == description) {
            elem = parentElement.children[i];
            break;
        }
    }
    return elem;
}

function ownContextMenu(){

    div.oncontextmenu = function(event){
        if(!event.target.dataset.indexElementName)
            return false;
        var contextDiv = document.createElement('div');
        var backgroundDiv = document.createElement('div');

        var createFolder = {};
        var deleteElement = {};
        var renameElement = {};
        var createFile = {};

        createBackgroundDiv();
        createContextDiv();

        createFolder.elementName = 'Create folder';
        createFolder.func = function(){
            var index = event.target.dataset.indexElementName;
            add(index);
            toggle(index, true);
        };
        addNewElementToContextmenu(createFolder);

        createFile.elementName = 'Create file';
        createFile.func = function(){
            var index = event.target.dataset.indexElementName;
            add(index,true);
            toggle(index, true);
        };
        addNewElementToContextmenu(createFile);

        deleteElement.elementName = 'Delete';
        deleteElement.func = function(){
            var liFolder = div.querySelector('[data-index-folder="' + event.target.dataset.indexElementName + '"]');
            var nameFolder = event.target.innerHTML;
            saveNewElem(liFolder, nameFolder, false, false);
            liFolder.remove();
        };
        addNewElementToContextmenu(deleteElement);

        renameElement.elementName = 'Rename';
        renameElement.func = function(){
            var indexElementName = event.target.dataset.indexElementName;
            var nestedList = div.querySelector('[data-index-nested-list="' + indexElementName.slice(0,-2) + '"]');
            var liFolder = div.querySelector('[data-index-folder="' + indexElementName + '"]');
            var nameFolder = event.target.innerHTML;
            var newName = prompt('Please write new name', '');

            newName = newName().replace(/\s+/,' ');
            if(checkName(nestedList, newName)){
                saveNewElem(liFolder, nameFolder, false, newName);
                event.target.innerHTML = newName;
            }
        };
        addNewElementToContextmenu(renameElement, contextDiv, backgroundDiv);

        return false;

        function createBackgroundDiv() {
            backgroundDiv.className = 'background';
            backgroundDiv.onclick = function () {
                removeContextmenu();
            };
            backgroundDiv.oncontextmenu = function () {
                removeContextmenu();
                return false;
            };
            document.body.appendChild(backgroundDiv);
        }

        function createContextDiv() {
            contextDiv.className = 'contextMenu';
            if (screen.width - (event.clientX + 100) >= 0)
                contextDiv.style.left = event.clientX + 'px';
            else contextDiv.style.right = '0px';
            if (screen.width - (event.clientY + 100) >= 0)
                contextDiv.style.top = event.clientY + 'px';
            else contextDiv.style.bottom = '0px';
            document.body.appendChild(contextDiv);
        }

        function addNewElementToContextmenu(obj){
            var elem = document.createElement('div');
            elem.innerHTML = obj.elementName;
            elem.onclick = function(){
                obj.func();
                removeContextmenu();

            };
            elem.oncontextmenu = function(){
                obj.func();
                removeContextmenu();
                return false;
            };
            contextDiv.appendChild(elem);
        }

        function removeContextmenu() {
            document.body.removeChild(contextDiv);
            document.body.removeChild(backgroundDiv);
        }
    }
}

function addButtonHTML(index){
    return '<li data-description="addButton" data-index-add-button="' + index + '" onclick="add(\'' + index + '\')">Add</li>';
}

function toggleButtonHTML(index){
    return '<div data-description="toggleButton" data-index-toggle-button="' + index +
           '" class="button" onclick="toggle(\'' + index + '\')">+</div>';
}

function elementIconHTML(index, isFile){
    var src = '';
    var description = '';
    if(isFile) {
        src = 'image/file.png';
        description = 'fileImage';
    }
    else {
        src = 'image/folderClose.png';
        description = 'folderImage';
    }

    return '<img data-description="' + description + '" data-index-element-icon="' + index + '" src="' + src + '" >';
}

function elementNameHTML(index, text){
    var name = text || '';
    return '<span data-description="elementName" data-index-element-name="' + index + '" class="name">' + name + '</span>';
}

function nestedListHTML(index, HTML){
    var nestedElement = HTML || '';
    return '<ul data-index-nested-list="' + index + '" data-description="nestedList" hidden="true">'+
           nestedElement + addButtonHTML(index) + '</ul>';
}
