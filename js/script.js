var task = document.getElementById("task");
var tasks = document.getElementById("tasks");
var task_list = document.getElementById("task_list");

task.addEventListener("keydown", function(event){
    if(event.keyCode == 13)
    {
        event.preventDefault();
        var task_name = task.value;
        insertTaskInList(task_name);
        task.value = '';
        var dataToSend = {text:task_name,
                            completed:'false'};
        //Ajax HTTP request for sending task when created.
        var request = new XMLHttpRequest();
        request.open("POST", "/tasks");
        request.send(JSON.stringify(dataToSend));
    }
});

window.addEventListener("load", function(event){
    var request = new XMLHttpRequest();
    request.open("GET", "/tasks");
    request.send();
    request.addEventListener("load", function(){
        if(request.responseText != '')
        {
            var data = JSON.parse(request.responseText);
            if(data.length!=0)
            { 
                data.forEach(function(item){
                    item = JSON.parse(item);
                    insertTaskInList(item.text);
                });
            }
        }   
    });
});

function insertTaskInList(text)
{
    var x = document.createElement("li");
    x.style.padding = "5px";
    //var y = document.createElement("label");
    //y.setAttribute("for", "id"+i);
    x.innerHTML = text;
    var div2 = document.createElement("div");
    div2.style.display = "inline";
    div2.style.float = "right";
    var z = document.createElement("input");
    z.type = "checkbox";
    z.addEventListener("change", function(){
        if(z.checked){
            x.style.textDecoration = "line-through";
            var dataToSend = {text:x.innerText, completed:true};
        }
        else{
            x.style.textDecoration = "none";
            var dataToSend = {text:x.innerText, completed:false};
        }

        var request = new XMLHttpRequest();
        request.open("POST", "/update");
        request.send(JSON.stringify(dataToSend));
    });
    var closeIcon = document.createElement("button");
    closeIcon.innerHTML = '<i class="fas fa-times"></i>';
    closeIcon.addEventListener("click", function(){
        closeIcon.parentNode.parentNode.parentNode.removeChild(x);
        var dataToSend = {text:x.innerText, completed:true};
        var req = new XMLHttpRequest();
        req.open("POST", "/remove");
        req.send(JSON.stringify(dataToSend));
    });
    div2.appendChild(z);
    div2.appendChild(closeIcon);
    //x.appendChild(y);
    x.appendChild(div2);
    x.style.border = "2px solid #606060";
    x.style.margin = '5px';
    x.style.fontSize = "20px";
    task_list.appendChild(x);
}