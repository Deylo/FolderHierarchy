
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
    div.className = 'mainDiv';
    fUl.dataset.indexNestedList = '0';
    div.appendChild(fUl);

    list = (function createHTML(object){
        var buf = '';
        var count = 1;

        for(var key in object){
            index += '_' + count;

            if(object[key] == 'file')
                buf += '<li data-index-folder="' + index + '">'  + elementIconHTML(index, true) +
                    elementNameHTML(index, true, index) + '</li>';
            else
                buf += '<li data-index-folder="' + index + '">' + toggleButtonHTML(index) + elementIconHTML(index, false) +
                    elementNameHTML(index, false, index) + nestedListHTML(index, createHTML(object[key])) + '</li>';

            cash[index] = key;
            index = index.replace(/_\d+\b/,'');
            count++;
        }
        return buf;
    })(sObj);

    fUl.innerHTML = list;
    nameArray = div.getElementsByClassName('name');

    for(var i = 0; i < nameArray.length; i++){
        if (cash[nameArray[i].textContent].length > 15) {
            nameArray[i].title = cash[nameArray[i].textContent];
            nameArray[i].textContent = cash[nameArray[i].textContent].slice(0,15) + ' ...';
            continue;
        }
        nameArray[i].textContent = cash[nameArray[i].textContent];
    }

    var hh = div.querySelectorAll('[data-index-nested-list]');
    var ss;
    for(var i = 1; i < hh.length; i++){
        if(hh[i].childElementCount) {
            ss = div.querySelector('[data-index-toggle-button="' + hh[i].dataset.indexNestedList + '"]');
            ss.classList.remove('unvisible');
        }
    }

    sortList(true);
    ownContextMenu();
}

function toggle(index, needOpen){
    var ulElement = div.querySelector('[data-index-nested-list="' + index + '"]');
    var toggleButtonElement = div.querySelector('[data-index-toggle-button="' + index + '"]');
    var elementIcon = div.querySelector('[data-index-element-icon="' + index + '"]');

    if(ulElement.hidden || needOpen){
        ulElement.hidden = false;
        toggleButtonElement.textContent = '-';
        elementIcon.src = 'img/folderOpen.png';
    }
    else{
        ulElement.hidden = true;
        toggleButtonElement.textContent = '+';
        elementIcon.src = 'img/folderClose.png';
    }
}

function add(index, isFile) {
    var elementName;
    var li;
    var elInd;
    var toggleButton;
    var displayedText = '';
    var text = '';
    var element = div.querySelector('[data-index-nested-list="' + index + '"]');

    if(isFile)
        text = prompt('Please write name for new file', '');
    else
        text = prompt('Please write name for new folder', '');

    text = text.trim().replace(/\s+/g,' ');
    displayedText = text;

    if(!checkName(element,text))
        return;

    toggleButton = div.querySelector('[data-index-toggle-button="' + index + '"]');
    if(toggleButton){
        toggleButton.classList.remove('unvisible');
    }

    li = document.createElement('li');
    element.appendChild(li);
    elInd = findElementIndex(index);

    if(isFile)
        li.innerHTML = elementIconHTML(elInd, true) + elementNameHTML(elInd, true);
    else
        li.innerHTML = toggleButtonHTML(elInd) + elementIconHTML(elInd, false) + elementNameHTML(elInd, false) + nestedListHTML(elInd);

    li.dataset.indexFolder = elInd;
    elementName = div.querySelector('[data-index-element-name="' + elInd + '"]');

    if(text.length > 15){
        displayedText = text.slice(0,15) + ' ...';
        elementName.title = text;
    }

    elementName.textContent = displayedText;
    sortList(false, index);
    saveNewElem(li, text, true, false, isFile);
}

function findElementIndex(parentIndexUl){
    var parentUl = div.querySelector('[data-index-nested-list="' + parentIndexUl + '"]');

    for(var i = 1;; i++){
        if(!parentUl.querySelector('[data-index-folder="' + parentIndexUl + '_' + i + '"]'))
            break;
    }
    return parentIndexUl + '_' + i;

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
        key = div.querySelector('[data-index-element-name="' + allParentFolder.shift().dataset.indexFolder + '" ]').textContent;
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
    if(text.search(/[*|\\:"<>?/]/) != -1){
        alert('The folder name contains characters that are not permitted ( * / | \\ : " < > ? )');
        return false;
    }

    if(text.length > 255){
        alert('Too long name');
        return false;
    }
    for(var i = 0; i < element.childElementCount; i++){
        if(div.querySelector('[data-index-element-name="' + element.children[i].dataset.indexFolder + '" ]').textContent == text){
            correctName = false;
            alert('The name is already exist');
            break;
        }
    }
    return correctName;
}

function sortList(sortAll, index){
    var allUl;

    if(sortAll) {
        allUl = div.querySelectorAll('[data-index-nested-list]');
        for(var i =0; i< allUl.length; i++){
            sortCurrentLevel(allUl[i].dataset.indexNestedList);
        }
    }
    else
        sortCurrentLevel(index);

    function sortCurrentLevel(currentIndex) {
        var elemLi, parentUl, nameElement;
        var elementIndex = '';
        var cash = {};
        var elemNames = [];
        var folderNames = [];
        var fileNames = [];

        parentUl = div.querySelector('[data-index-nested-list="' + currentIndex + '"]');
        for (var i = 1; ; i++) {
            elementIndex = '' + currentIndex + '_' + i;
            elemLi = div.querySelector('[data-index-folder="' + elementIndex + '"]');

            if (!elemLi)
                break;
            nameElement = elemLi.querySelector('[data-index-element-name="' + elementIndex + '"]');

            if (nameElement.dataset.description == 'fileName')
                fileNames.push(nameElement.textContent.toLowerCase());
            else
                folderNames.push(nameElement.textContent.toLowerCase());

            cash[nameElement.textContent.toLowerCase()] = elemLi;
        }

        if(i == 1)
            return;
        fileNames.sort();
        folderNames.sort();
        elemNames = folderNames.concat(fileNames);

        for (var i = 0; i < elemNames.length; i++) {
            parentUl.appendChild(cash[elemNames[i]]);
        }
    }
}

function ownContextMenu(){

    div.oncontextmenu = function(event){
        var contextDiv;
        var backgroundDiv;

        var createFolder = {};
        var deleteElement = {};
        var renameElement = {};
        var createFile = {};

        if(event.target == event.currentTarget){
            contextDiv = document.createElement('div');
            backgroundDiv = document.createElement('div');

            createFolder.elementName = 'Create folder';
            createFolder.func = function () {
                add(0);
            };
            addNewElementToContextmenu(createFolder);

            createFile.elementName = 'Create file';
            createFile.func = function () {
                add(0, true);
            };
            addNewElementToContextmenu(createFile);

            createBackgroundDiv();
            createContextDiv();

        }

        if(!event.target.dataset.indexElementName)
            return false;

        contextDiv = document.createElement('div');
        backgroundDiv = document.createElement('div');

        createBackgroundDiv();
        createContextDiv();

        if(event.target.dataset.description == 'folderName') {
            createFolder.elementName = 'Create folder';
            createFolder.func = function () {
                var index = event.target.dataset.indexElementName;
                add(index);
                toggle(index, true);
            };
            addNewElementToContextmenu(createFolder);

            createFile.elementName = 'Create file';
            createFile.func = function () {
                var index = event.target.dataset.indexElementName;
                add(index, true);
                toggle(index, true);
            };
            addNewElementToContextmenu(createFile);
        }
        deleteElement.elementName = 'Delete';
        deleteElement.func = function(){
            var toggleButton;
            var nestedList;
            var parentIndex = '';
            var index = event.target.dataset.indexElementName;
            var liFolder = div.querySelector('[data-index-folder="' + index + '"]');
            var nameFolder = event.target.innerHTML;

            saveNewElem(liFolder, nameFolder, false, false);
            liFolder.remove();
            parentIndex = index.replace(/_\d+\b/,'');
            nestedList = div.querySelector('[data-index-nested-list="' + parentIndex + '"]');
            toggleButton = div.querySelector('[data-index-toggle-button="' + parentIndex + '"]');

            if(toggleButton && !nestedList.childElementCount){
                toggleButton.classList.add('unvisible');
                div.querySelector('[data-index-element-icon="' + parentIndex + '"]').src = 'img/folderClose.png';
            }
        };
        addNewElementToContextmenu(deleteElement);

        renameElement.elementName = 'Rename';
        renameElement.func = function(){
            var indexElementName = event.target.dataset.indexElementName;
            var nestedList = div.querySelector('[data-index-nested-list="' + indexElementName.replace(/_\d+\b/,'') + '"]');
            var liFolder = div.querySelector('[data-index-folder="' + indexElementName + '"]');
            var nameFolder = event.target.innerHTML;
            var newName = prompt('Please write new name', '');

            newName = newName.replace(/\s+/g,' ');
            if(checkName(nestedList, newName)){
                saveNewElem(liFolder, nameFolder, false, newName);
                event.target.innerHTML = newName;
            }
        };
        addNewElementToContextmenu(renameElement);

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

function toggleButtonHTML(index){
    return '<div data-description="toggleButton" data-index-toggle-button="' + index +
           '" class="button unvisible" onclick="toggle(\'' + index + '\')">+</div>';
}

function elementIconHTML(index, isFile){
    var src = '';
    var description = '';
    if(isFile) {
        src = 'img/file.png';
        description = 'fileImage';
    }
    else {
        src = 'img/folderClose.png';
        description = 'folderImage';
    }

    return '<img  data-description="' + description + '" data-index-element-icon="' + index + '" src="' + src + '" >';
}

function elementNameHTML(index, isFile, text){
    var description = '';

    if(isFile)
        description = 'fileName';
    else
        description = 'folderName';
    return '<span data-description="' + description + '" data-index-element-name="' + index + '" class="name">' + text + '</span>';
}

function nestedListHTML(index, HTML){
    var nestedElement = HTML || '';
    return '<ul data-index-nested-list="' + index + '" data-description="nestedList" hidden="true">'+
           nestedElement + '</ul>';
}
