/**
 * Created by dmitriy on 21.01.16.
 */


function func(context){
        var fElChil = context.parentElement.children[1];
        if (fElChil.hidden) {
            fElChil.hidden = false;
        }
        else fElChil.hidden = true;
}

function add(context){
        var text = prompt('Please write new fold');
        if (text) {
            var li = document.createElement('li');
            li.innerHTML = '<span onclick="func(this)">+</span>'+text+'<ul hidden="true"><li  type="none" onclick="add(this)">Add</li></ul>';
            var n = context.parentElement.children.length;
            context.parentElement.insertBefore(li, context.parentElement.children[n - 1]);
    }
}