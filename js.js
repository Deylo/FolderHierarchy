function createList(id,obj){
    var namesArray;
    var list = '';
    var cash = {};
    var nestedLists = [];
    var index = 0;
    var mainUl = document.createElement('ul');
    var sObj = {};
    var mainDiv;

    sObj = obj || {};
    mainDiv = document.getElementById(id);
    mainDiv.dataset.description = 'mainDiv';
    mainUl.dataset.index = '0';
    mainUl.dataset.description = 'nestedList';
    mainDiv.appendChild(mainUl);

    list = (function createHTML(object){
        var buf = '';
        var count = 1;

        for(var key in object){
            index += '_' + count;

            if(object[key] == 'file')
                buf += listElementHTML(index, true, index);
            else
                buf += listElementHTML(index, false, index, createHTML(object[key]));

            cash[index] = key;
            index = index.replace(/_\d+\b/,'');
            count++;
        }
        return buf;
    })(sObj);

    mainUl.innerHTML = list;
    namesArray = mainDiv.getElementsByClassName('name');

    for(var i = 0; i < namesArray.length; i++){
        if (cash[namesArray[i].textContent].length > 15) {
            namesArray[i].title = cash[namesArray[i].textContent];
            namesArray[i].textContent = cash[namesArray[i].textContent].slice(0,15) + ' ...';
            continue;
        }
        namesArray[i].textContent = cash[namesArray[i].textContent];
    }

    nestedLists = mainDiv.querySelectorAll('[data-index][data-description="nestedList"]');
    for(var i = 1; i < nestedLists.length; i++){
        if(nestedLists[i].childElementCount) {
            mainDiv.querySelector('[data-description="toggleButton"][data-index="' + nestedLists[i].dataset.index + '"]').classList.remove('unvisible');
        }
    }

    sortList(true);
    checkMainDivHeight();
    initializeMainDivEvent();

    function toggle(index, needOpen){
        var ulElement = mainDiv.querySelector('[data-index="' + index + '"][data-description="nestedList"]');
        var toggleButtonElement = mainDiv.querySelector('[data-index="' + index + '"][data-description="toggleButton"]');
        var elementIcon = mainDiv.querySelector('[data-index="' + index + '"][data-description$="Image"]');

        if(ulElement.hidden || needOpen){
            ulElement.hidden = false;
            toggleButtonElement.src = 'img/minus.png';
            elementIcon.src = 'img/folderOpen.png';
        }
        else{
            ulElement.hidden = true;
            toggleButtonElement.src = 'img/plus.png';
            elementIcon.src = 'img/folderClose.png';
        }

        checkMainDivHeight();
    }

    function add(parentIndex, isFile) {
        var elementName;
        var li;
        var elementIndex;
        var toggleButton;
        var displayedText = '';
        var text = '';
        var element = mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description="nestedList"]');

        if(isFile)
            text = prompt('Please write name for new file', '');
        else
            text = prompt('Please write name for new folder', '');

        if(!text)
            return;

        text = text.trim().replace(/\s+/g,' ');
        displayedText = text;

        if(!checkName(element,text))
            return;

        toggleButton = mainDiv.querySelector('[data-description="toggleButton"][data-index="' + parentIndex + '"]');
        if(toggleButton){
            toggleButton.classList.remove('unvisible');
            toggle(parentIndex, true);
        }

        li = document.createElement('li');
        elementIndex = findElementIndex(parentIndex);
        element.appendChild(li);

        if(isFile)
            li.outerHTML = listElementHTML(elementIndex, true);
        else
            li.outerHTML = listElementHTML(elementIndex, false);
        li = element.querySelector('[data-index="' + elementIndex + '"][data-description="listElement"]');
        elementName = mainDiv.querySelector('[data-index="' + elementIndex + '"][data-description$="Name"]');

        if(text.length > 15){
            displayedText = text.slice(0,15) + ' ...';
            elementName.title = text;
        }

        elementName.textContent = displayedText;

        sortList(false, parentIndex);
        checkMainDivHeight();
        saveNewElem(li, text, true, false, isFile);
    }

    function findElementIndex(parentIndex){
        var parentUl = mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description="nestedList"]');

        for(var i = 1;; i++){
            if(!parentUl.querySelector('[data-index="' + parentIndex + '_' + i + '"][data-description="listElement"]'))
                break;
        }
        return parentIndex + '_' + i;

    }

    function saveNewElem(elem, name, saveEl, newName, isFile){
        var key;
        var index;
        var nName = newName || '';
        var allFolder = mainDiv.querySelectorAll('[data-index][data-description="listElement"]');
        var allParentFolder = findAllParentElements(allFolder, elem);

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
            index = allParentFolder.shift().dataset.index;
            key = mainDiv.querySelector('[data-index="' + index + '" ][data-description$="Name"]').textContent;
            for(var k in obj){
                if(k == key){
                    save(obj[k]);
                }
            }
        })(sObj);
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
        var index = '';

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
            index = element.children[i].dataset.index;
            if(mainDiv.querySelector('[data-index="' + index + '" ][data-description$="Name"]').textContent == text){
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
            allUl = mainDiv.querySelectorAll('[data-index][data-description="nestedList"]');
            for(var i =0; i< allUl.length; i++){
                sortCurrentLevel(allUl[i].dataset.index);
            }
        }
        else
            sortCurrentLevel(index);

        function sortCurrentLevel(currentIndex) {
            var elemLi, parentUl, nameElement, elementIndex, i;
            var cash = {};
            var elemNames = [];
            var folderNames = [];
            var fileNames = [];

            parentUl = mainDiv.querySelector('[data-index="' + currentIndex + '"][data-description="nestedList"]');
            
            for (i = 1; ; i++) {
                elementIndex = '' + currentIndex + '_' + i;
                elemLi = mainDiv.querySelector('[data-index="' + elementIndex + '"][data-description="listElement"]');

                if (!elemLi)
                    break;
                nameElement = elemLi.querySelector('[data-index="' + elementIndex + '"][data-description$="Name"]');

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

            for (i = 0; i < elemNames.length; i++) {
                parentUl.appendChild(cash[elemNames[i]]);
            }
        }
    }

    function initializeMainDivEvent(){
        var currentElement = null;

        mainDiv.onmouseover = function(e){
            var target = e.target;
            var description = target.dataset.description;

            if(currentElement || description == 'nestedList' || description == 'toggleButton')
                return;

            while(target != e.currentTarget ){
                if(description == 'listElement')
                    break;
                target = target.parentNode;
            }
            if(target == e.currentTarget)
                return;

            currentElement = target;
            currentElement.classList.add('highlight');
        };
        mainDiv.onmouseout = function(e){
            var relatedTarget = e.relatedTarget;
            var description;

            if (!currentElement )
                return;

            if (relatedTarget) {
                description = e.relatedTarget.dataset.description;
                while (relatedTarget) {
                    if (relatedTarget == currentElement)
                        return;
                    if(description == 'listElement' || description == 'nestedList' || description == 'toggleButton')
                        break;
                    relatedTarget = relatedTarget.parentElement;
                }
            }
            currentElement.classList.remove('highlight');
            currentElement = null;
        };
        mainDiv.ondblclick = function(e){
            var index = e.target.dataset.index;
            var nestedList;

            if(index == 0)
                return;

            nestedList = mainDiv.querySelector('[data-index="' + index + '"][data-description="nestedList"]');

            if(nestedList && nestedList.firstElementChild)
                    toggle(index);
        };
        mainDiv.onclick = function(e){

            if(e.target.dataset.description != 'toggleButton')
                return;

            toggle(e.target.dataset.index);
        };
        mainDiv.oncontextmenu = function(event){
            var contextDiv;
            var backgroundDiv;
            var index = '';

            var createFolder = {};
            var deleteElement = {};
            var renameElement = {};
            var createFile = {};

            event.preventDefault();

            if(event.target == mainDiv){
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

            index = event.target.dataset.index;

            if(!index || event.target.dataset.description == 'nestedList')
                return;

            contextDiv = document.createElement('div');
            backgroundDiv = document.createElement('div');

            if(mainDiv.querySelector('[data-index="' + index + '"][data-description="folderName"]')) {
                createFolder.elementName = 'Create folder';
                createFolder.func = function () {
                    add(index);
                };
                addNewElementToContextmenu(createFolder);

                createFile.elementName = 'Create file';
                createFile.func = function () {
                    add(index, true);
                };
                addNewElementToContextmenu(createFile);
            }

            deleteElement.elementName = 'Delete';
            deleteElement.func = function(){
                var toggleButton;
                var nestedList;
                var parentIndex;
                var liFolder = mainDiv.querySelector('[data-index="' + index + '"][data-description="listElement"]');
                var nameFolder = mainDiv.querySelector('[data-index="' + index + '"][data-description$="Name"]').innerHTML;

                saveNewElem(liFolder, nameFolder, false, false);
                liFolder.remove();
                checkMainDivHeight();
                parentIndex = index.replace(/_\d+\b/,'');
                nestedList = mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description="nestedList"]');
                toggleButton = mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description="toggleButton"]');

                if(toggleButton && !nestedList.childElementCount){
                    toggleButton.classList.add('unvisible');
                    mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description$="Image"]').src = 'img/folderClose.png';
                }
            };
            addNewElementToContextmenu(deleteElement);

            renameElement.elementName = 'Rename';
            renameElement.func = function(){
                var parentIndex = index.replace(/_\d+\b/,'');
                var nestedList = mainDiv.querySelector('[data-index="' + parentIndex + '"][data-description="nestedList"]');
                var liFolder = mainDiv.querySelector('[data-index="' + index + '"][data-description="listElement"]');
                var nameFolder = mainDiv.querySelector('[data-index="' + index + '"][data-description$="Name"]').innerHTML;
                var newName = prompt('Please write new name', '');

                if(!newName)
                    return;

                newName = newName.trim().replace(/\s+/g,' ');

                if(checkName(nestedList, newName)){
                    saveNewElem(liFolder, nameFolder, false, newName);
                    mainDiv.querySelector('[data-index="' + index + '"][data-description$="Name"]').innerHTML = newName;
                    sortList(index);
                }
            };
            addNewElementToContextmenu(renameElement);

            createBackgroundDiv();
            createContextDiv();

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
                document.body.appendChild(contextDiv);

                if (screen.availWidth - (event.clientX + contextDiv.offsetWidth) >= 0)
                    contextDiv.style.left = event.clientX + 'px';
                else contextDiv.style.right = '0px';

                if (screen.availHeight - (event.clientY + contextDiv.offsetHeight) >= 0)
                    contextDiv.style.top = event.clientY + 'px';
                else contextDiv.style.bottom = '0px';

                contextDiv.onclick = function(e){
                    removeContextmenu();
                };
                contextDiv.oncontextmenu = function(e){
                    removeContextmenu();
                    e.preventDefault();
                }
            }

            function addNewElementToContextmenu(obj){
                var elem = document.createElement('div');

                elem.className = 'contextElement';
                elem.innerHTML = obj.elementName;
                elem.onclick = function(){
                    obj.func();
                };
                elem.oncontextmenu = function(){
                    obj.func();
                };
                elem.onmouseenter = function(){
                    elem.classList.add('highlight');
                };
                elem.onmouseleave = function(){
                    elem.classList.remove('highlight');
                };
                contextDiv.appendChild(elem);
            }

            function removeContextmenu() {
                document.body.removeChild(contextDiv);
                document.body.removeChild(backgroundDiv);
            }
        }
    }

    function checkMainDivHeight(){
        var isMaxHeightSet = false;


        if(mainDiv.offsetHeight > 300 && !isMaxHeightSet) {
            mainDiv.classList.add('maxHeightMainDiv');
            isMaxHeightSet = true;
        }
        else {
            mainDiv.classList.remove('maxHeightMainDiv');
            isMaxHeightSet = false;
        }
    }

    function listElementHTML(index, isFile, text, HTML){
        var buf = '';

        if(isFile)
            buf = elementIconHTML(index, true) + elementNameHTML(index, true, text);
        else
            buf = toggleButtonHTML(index) + elementIconHTML(index, false) +
                elementNameHTML(index, false, text) + nestedListHTML(index, HTML);

        return '<li data-description="listElement" data-index="' + index + '">' + buf + '</li>';
    }

    function toggleButtonHTML(index){
        return '<img data-description="toggleButton" data-index="' + index + '" class="button unvisible" src="img/plus.png">';
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

        return '<img  data-description="' + description + '" data-index="' + index + '" src="' + src + '" >';
    }

    function elementNameHTML(index, isFile, text){
        var description = '';

        if(isFile)
            description = 'fileName';
        else
            description = 'folderName';
        return '<span data-description="' + description + '" data-index="' + index + '" class="name">' + text + '</span>';
    }

    function nestedListHTML(index, HTML){
        var nestedElement = HTML || '';
        return '<ul data-index="' + index + '" data-description="nestedList" hidden="true">'+
            nestedElement + '</ul>';
    }
}

