/**
 * Created by dmitriy on 21.01.16.
 */

var sObj = {};
var div;

function createList(id,obj){
    sObj=obj||{};
    div = document.getElementById(id);
    var fUl = document.createElement('ul');
    div.appendChild(fUl);
    var list = '';
    var position='';
    list = (function f(o){
     //   var count = 1;
        var buf = '';
        for(var i in o){
   //         position+='.'+count;
            buf += '<li class = "folder"><span onclick="showHide(this)">+</span>' + i + '<ul hidden="true">'+f(o[i])+'<li  type="none" onclick="add(this)">Add</li></ul></li>';
            position=position.slice(0,-2);
     //       count++;
        }
        return buf;
    })(sObj);
    fUl.innerHTML=list+'<li type="none" onclick="add(this)">Add</li>';
}

function showHide(context){
    var ElChil = context.parentElement.children[1];
    ElChil.hidden =!ElChil.hidden;
}

function add(context) {
    var text = prompt('Please write name for new folder');
    if (text) {
        if(checkName(context,text)) {
            var li = document.createElement('li');
            li.className = 'folder';
            li.innerHTML = '<span onclick="showHide(this)">+</span>' + text + '<ul hidden="true"><li   type="none" onclick="add(this)">Add</li></ul>';
            context.parentElement.insertBefore(li, context);
            saveNewElem(findIndexOfElement(li).slice(0, -1), text);
        }
        else alert('Please choose another name');
    }
}

function findIndexOfElement(elem){
    var liAdd = div.getElementsByClassName('folder');
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
    for(var i =0;i<element.parentElement.childElementCount-1; i++){
        element=element.previousElementSibling;
        if(element.childNodes[1].data==text){
            isOriginal = false;
            break;
        }
    }
    return isOriginal;
}