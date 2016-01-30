/**
 * Created by dmitriy on 21.01.16.
 */

var sObj = {};
var div;

function createList(id,obj){
    sObj=obj||{};
    div = document.getElementById(id);
    var fUl = document.createElement('ul');
    fUl.className = '123';
    fUl.dataset.index = '0';
    div.appendChild(fUl);
    var list = '';
    var position='';
    list = (function createHTML(object){
        var count = 1;
        var buf = '';
        for(var key in object){
            if(position)
                position += '_' + count;
            else position = '' + count;
            buf += '<li class = "folder" data-index="'+position+'">'+toggleButtonHTML(position) + elementIconHTML() + elementNameHTML(key) + nestedListHTML(position, createHTML(object[key])) + '</li>';
            position=position.slice(0,-2);
            count++;
        }
        return buf;
    })(sObj);
    fUl.innerHTML = list + addButtonHTML(0);
}

function toggle(id){
    var liParent = findElementByIndex(id, 'folder');
    var ulElement = findElement(liParent, 'nestedList');
    var toggleButtonElement = findElement(liParent, 'toggleButton');
    var elementImage = findElement(liParent, 'elementImage');
    if(ulElement.hidden){
        ulElement.hidden = false;
        toggleButtonElement.innerText = '-';
        elementImage.src = 'image/folderOpen.png';
    }
    else{
        ulElement.hidden = true;
        toggleButtonElement.innerText = '+';
        elementImage.src = 'image/folderClose.png';
    }
}

function add(id) {
    var text = prompt('Please write name for new folder','');
    var elementIndex;
    var element = findElementByIndex(id,'123');
    if (!text) {
        return;
    }
    if(text.length > 255){
        alert('Too long name');
        return;
    }
    if(checkName(element,text)) {
        var li = document.createElement('li');
        li.className = 'folder';
        element.insertBefore(li, element.lastElementChild);
        elementIndex = findIndexOfElement(li, 'folder').join('_');
        li.innerHTML = toggleButtonHTML(elementIndex) + elementIconHTML() + elementNameHTML(text) + nestedListHTML(elementIndex);
        li.dataset.index = elementIndex;
        saveNewElem(li, text);
    }
    else alert('Please choose another name');
}

function findIndexOfElement(elem, classOfElements){
    var liAdd = div.getElementsByClassName(classOfElements);
    var index = '';
    var count = 1;
    var curElem;
    var pElements = findAllParentElements(liAdd,elem);
    (function f(e){
        curElem = e.previousElementSibling;
        if(curElem){
            count++
        }
        else{
            index += '_'+count;
            count = 1;
            if(pElements.length)
                curElem = pElements.pop();
            else{
                return;
            }
        }
        f(curElem);
    })(elem);
    return index.slice(1).split('_').reverse();
}

function findElementByIndex(index, classOfElements){
    var elements = div.getElementsByClassName(classOfElements);
    var result;
    for(var i = 0; i < elements.length; i++){
        if(elements[i].dataset.index == index) {
            result = elements[i];
        }
    }
    return result;
}

function findAllParentElements(elements,childElem){
    var parentElements = [];
    for(var i = 0; i< elements.length; i++){
        if(elements[i].compareDocumentPosition(childElem) & 16)
            parentElements.push(elements[i]);
    }
    return parentElements;
}

function saveNewElem(elem,name){
    var allFolder = div.getElementsByClassName('folder');
    var allParentFolder = findAllParentElements(allFolder, elem);
    var key;
    (function save(obj){
        if(!allParentFolder.length){
            obj[name]={};
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

function checkName(element, text){
    var isOriginal = true;
    for(var i =0;i<element.childElementCount-1; i++){
        if(findElement(element.children[i], 'elementName').innerHTML==text){
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
    return '<li data-description="addButton" onclick="add(\''+index+'\')">Add</li>';
}

function toggleButtonHTML(index){
    return '<div data-description="toggleButton" class="button" onclick="toggle(\''+index+'\')">+</div>';
}

function elementIconHTML(){
    return '<img data-description="elementImage" src="image/folderClose.png" >';
}

function elementNameHTML(text){
    return '<span data-description="elementName" class="name">' + text + '</span>';

}

function nestedListHTML(index, HTML){
    var nestedElement = HTML || '';
    return '<ul class="123" data-index="'+index+'" data-description="nestedList" hidden="true">'+nestedElement+addButtonHTML(index)+'</ul>';
}