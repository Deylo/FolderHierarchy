/**
 * Created by dmitriy on 21.01.16.
 */

var sObj = {};
var div;

function addButtonHtml(index){
    return '<li data-description="addButton" onclick="add('+index+')">Add</li>';
}
function toggleButtonHTML(index ){
    return '<div data-description="toggleButton" class="button" onclick="toggle('+index+')">+</div>';
}

function createList(id,obj){
    sObj=obj||{};
    div = document.getElementById(id);
    var fUl = document.createElement('ul');
    fUl.className = '123';
    fUl.dataset.index = '0';
    div.appendChild(fUl);
    var list = '';
    var position='';
    list = (function f(o){
        var count = 1;
        var buf = '';
        for(var i in o){
            if(position)
                position += '.' + count;
            else position = '' + count;
            buf += '<li class = "folder" data-index="'+position+'">'+toggleButtonHTML(position)+'<img data-description="elementImage" src="image/folderClose.png" ><span data-description="elementName" class="name">' + i + '</span><ul class="123" data-index="'+position+'" data-description="nestedList" hidden="true">'+f(o[i])+addButtonHtml(position)+'</ul></li>';
            position=position.slice(0,-2);
            count++;
        }
        return buf;
    })(sObj);
    fUl.innerHTML = list + addButtonHtml(0);
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
    var text = prompt('Please write name for new folder');
    var elementIndex;
    var folderIndex;
    var element = findElementByIndex(id,'123');
    if (text) {
        if(checkName(element,text)) {
            var li = document.createElement('li');
            li.className = 'folder';
            element.insertBefore(li, element.lastElementChild);
            elementIndex = findIndexOfElement(li,'folder').join('.');
            folderIndex = elementIndex.slice(0,-2);
            li.innerHTML = toggleButtonHTML(elementIndex) + '<img data-description="elementImage" src="image/folderClose.png" ><span data-description="elementName" class="name">' + text + '</span><ul class="123" data-index="'+elementIndex+'" data-description="nestedList" hidden="true">'+addButtonHtml(elementIndex)+'</ul>';
            li.dataset.index = elementIndex;
            saveNewElem(folderIndex, text);
        }
        else alert('Please choose another name');
    }
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
            index += '.'+count;
            count = 1;
            if(pElements.length)
                curElem = pElements.pop();
            else{
                return;
            }
        }
        f(curElem);
    })(elem);
    return index.slice(1).split('.').reverse();
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

function saveNewElem(path,name){
    var count = 1 ;
    var p = path[0];
    var iter = 0;
    (function f(o,ind){
        iter++;
        count = 1;
        if(iter-1 == path.length) {
            o[name] = {};
            return;
        }
        for (var i in o ){
            if(count == ind) {
                p = path[iter];
                f(o[i], p);
                return;
            }
            else count ++;
        }
    })(sObj,p);
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