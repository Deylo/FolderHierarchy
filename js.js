/**
 * Created by dmitriy on 21.01.16.
 */

var sObj = {};
var div;

function createList(id,obj){
    var list = '';
    var position='';
    var fUl = document.createElement('ul');
    var cash = {};
    var nameArray;

    sObj = obj || {};
    div = document.getElementById(id);
    fUl.dataset.indexNestedList = '0';
    div.appendChild(fUl);

    list = (function createHTML(object){
        var count = 1;
        var buf = '';
        for(var key in object){
            if(position)
                position += '_' + count;
            else position = '' + count;
            buf += '<li data-index-folder="' + position + '">' + toggleButtonHTML(position) + elementIconHTML(position) +
                   elementNameHTML(position, position) + nestedListHTML(position, createHTML(object[key])) + '</li>';
            cash[position] = key;
            position = position.slice(0,-2);
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

    console.log(cash);
}

function toggle(id){
    var ulElement = div.querySelector('[data-index-nested-list="' + id + '"]');
    var toggleButtonElement = div.querySelector('[data-index-toggle-button="' + id + '"]');
    var elementIcon = div.querySelector('[data-index-element-icon="' + id + '"]');
    if(ulElement.hidden){
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

function add(id) {
    var text = prompt('Please write name for new folder','');
    var elInd;
    var element = div.querySelector('[data-index-nested-list="' + id + '"]');
    var elementName;
    var displayedText = text;

    if (!text.trim()) {
        return;
    }
    if(text.search(/[*|\\:"<>?/]/i) != -1){
        alert("The folder name contains characters that are not permitted");
        return;
    }

    if(text.length > 255){
        alert('Too long name');
        return;
    }
    if(checkName(element,text)) {
        var li = document.createElement('li');
        element.insertBefore(li, element.lastElementChild);
        elInd = findIndexOfElement(li,id);
        li.innerHTML = toggleButtonHTML(elInd) + elementIconHTML(elInd) + elementNameHTML(elInd) + nestedListHTML(elInd);
        li.dataset.indexFolder = elInd;
        elementName = div.querySelector('[data-index-element-name="' + elInd + '"]');

        if(text.length > 15){
            displayedText = text.slice(0,15) + ' ...';
            elementName.title = text;
        }

        elementName.innerText = displayedText;
        saveNewElem(li, text);
    }
    else alert('Please choose another name');
}

function findIndexOfElement(elem,parentId){
    var index = '';
    var curIndex;
    var curElem = elem.previousElementSibling;

    if(!curElem) {
        index = parentId + '_' + 1;
        return index;
    }
    curIndex = curElem.dataset.indexFolder.split('_');
    curIndex[curIndex.length-1] ++;
    if(!index) index = '' + curIndex.join('_');
    else index += curIndex.join('_') + '_' + index;
    return index;
}

function saveNewElem(elem, name){
    var allFolder = div.querySelectorAll('[data-index-folder]');
    var allParentFolder = findAllParentElements(allFolder, elem);
    var key;
    (function save(obj){
        if(!allParentFolder.length){
            obj[name] = {};
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
    var isOriginal = true;
    for(var i = 0; i < element.childElementCount-1; i++){
        if(findElement(element.children[i], 'elementName').innerHTML == text){
            isOriginal = false;
            break;
        }
    }
    return isOriginal;
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

function addButtonHTML(index){
    return '<li data-description="addButton" data-index-add-button="' + index + '" onclick="add(\'' + index + '\')">Add</li>';
}

function toggleButtonHTML(index){
    return '<div data-description="toggleButton" data-index-toggle-button="' + index +
           '" class="button" onclick="toggle(\'' + index + '\')">+</div>';
}

function elementIconHTML(index){
    return '<img data-description="elementImage" data-index-element-icon="' + index + '" src="image/folderClose.png" >';
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
