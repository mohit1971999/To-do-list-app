var http = require("http");
var fs = require("fs");

function readFile(file_name, file_type, response){
    fs.readFile(file_name, function(err, data){
        if(err)
        {
            console.log("error");
        }
        else{
            response.writeHead(200, {'Content-type':file_type});
            response.write(data);
            response.end();
        }
    });
}

function receptionist(request, response)
{
    console.log(request.url, request.method);
    var path = request.url;
    var method = request.method;
    if(method === "GET")
    {
        if(path === "/")
        {
            readFile('./index.html', 'text/html', response);
        }
        else if(path === "/js/script.js")
        {
            readFile('.' + path, 'text/javascript', response);
        }
        else if(path === "/css/style.css")
        {
            readFile('.' + path, 'text/css', response);
        }
        else if(path === "/tasks")
        {
            readTasks(function(all_tasks){
                response.write(all_tasks);
                response.end();
            })
        }
        else{
            response.writeHead(200);
            response.end();
        }
    }
    else if(method === "POST"){
        if(path === "/tasks")
        {
            readJSONBody(request, function(data){
                readTasks(function(all_tasks){
                    if(all_tasks.length === 0)
                    {
                        all_tasks = [];
                    }
                    else{
                        all_tasks = JSON.parse(all_tasks);
                    }
                    all_tasks.push(data);
                    writeTasks(JSON.stringify(all_tasks), function(){
                        response.end();
                    });
                });
            });
        }
        else if(path === '/update')
        {
            readJSONBody(request, function(data){
                updateTask(data, function(all_tasks){
                    writeTasks(JSON.stringify(all_tasks), function(){
                        response.end();
                    })
                })
            })
        }
        else if(path === '/remove')
        {
            readJSONBody(request, function(data){
                removeTask(data, function(all_tasks){
                    writeTasks(JSON.stringify(all_tasks), function(){
                        response.end();
                    });
                });
            });
        }
    }
}

function readJSONBody(request, callback){
    var body = '';
    request.on('data', function(chunk){
        body += chunk;
    });

    request.on('end', function(){
        var data = JSON.parse(body);
        callback(body);
    });
}

function writeTasks(data, callback){
    fs.writeFile('./data file/task_list.txt', data, function(err, data){
        if(err)
            throw err;
        else{
            callback();
        }
    });
}

function readTasks(callback){
    fs.readFile('./data file/task_list.txt', function(err, data){
        if(err)
            throw err;
        callback(data);
    });
}

function removeTask(data, callback){
    var task = JSON.parse(data).text;
    readTasks(function(all_tasks){
        all_tasks = JSON.parse(all_tasks);
        var l = all_tasks.length;
        var i;
        for(i = 0;i<l;i++)
        {
            var task_name = JSON.parse(all_tasks[i]).text;
            if(task_name === task)
            {
                all_tasks.splice(i, 1);
                callback(all_tasks);
                break;
            }
        }
    });
}

function updateTask(data, callback){
    var task = JSON.parse(data).text;
    readTasks(function(all_tasks){
        all_tasks = JSON.parse(all_tasks);
        var l = all_tasks.length;
        var i;
        for(i = 0;i<l;i++)
        {
            var task_name = JSON.parse(all_tasks[i]).text;
            if(task_name === task)
            {
                all_tasks[i] = data;
                callback(all_tasks);
                break;
            }
        }
    })
}
var server_setup = http.createServer(receptionist);
server_setup.listen(8080);
console.log("Server is running");