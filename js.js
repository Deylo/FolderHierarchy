/**
 * Created by dmitriy on 21.01.16.
 */
var path = {
    1 : '1.1/1.1.1/1.1.1.1/',
    2 : '2.1/2.1.1/2.1.1.1./2.1.1.1.1/',
    3 : '3.1/3.1.1/'
}

function createList(){
    for(var i in path){
        addToPage(path[i].split('/').slice(0,-1),i);
    }
}

function addToPage(arr,file){
    var i = 0;
    var isRoot=true;
    alert(i);
    var context=document.body;
    if(document.body.children.length===1) {
        var ul = document.createElement('ul');
        ul.innerHTML = '<li id="a" type="none" onclick="add(this)">Add</li>';
        context.appendChild(ul);
    }

    (function f(){
        var n =0;
        if(!i) {
            context = document.getElementById('a');

        }
        else{
            n = context.parentElement.getElementsByClassName('add').length;
            isRoot?context=context.parentElement.getElementsByClassName('add')[n-1]:context=context.parentElement.getElementsByClassName('add')[0];
            isRoot=false;
        }
        if(i===arr.length)
            add(context, file, true);
        else{
            add(context,arr[i++]);
            f();
        }
    })();
}

function func(context){
        var ElChil = context.parentElement.children[1];
        if (ElChil.hidden) {
            ElChil.hidden = false;
        }
        else ElChil.hidden = true;
}

function add(context,text,isFille){
        var buf='';
        text?this.text=text:this.text=prompt('Please write new fold');
        isFille?buf=this.text:buf='<span onclick="func(this)">+</span>'+this.text+'<ul hidden="true"><li class="add"  type="none" onclick="add(this)">Add</li></ul>';
    if (this.text) {
            var li = document.createElement('li');
            li.innerHTML =buf;
            var n = context.parentElement.children.length;
            context.parentElement.insertBefore(li, context.parentElement.children[n - 1]);
    }
}