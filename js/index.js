var net = require('net');
var serialport = require('serial-node');
var config = require('./config.json');
var fs = require('fs');
var j = require('jquery');

var part_number = document.querySelector('#part_number').value;
var work_order = document.querySelector('#work_order').value;
var select_input = document.querySelector('#template');
var textarea_input = document.querySelector('#output');
var port;

fs.readdir(config.folder, (err, dir) => {
        for (var i = 0, path; path = dir[i]; i++) {
            var option = document.createElement("option");
            option.text = path.split(".")[0];
            option.value = path;
            select_input.appendChild(option)
        }
});

switch (config.option){
    case "tcp":
        port = openTCPconnection(config.tcp);
        break;
    case "serialport":
        port = openSerialConnection(config.serialport);
        break;    
    }	  

function inputEnter(e){
    if(e.keyCode === 13){
        e.preventDefault(); // Ensure it is only this code that rusn
        newtext = textarea_input.value.replace("#"+e.target.id+"#", e.target.value);
        textarea_input.value = newtext;

        switch (e.target.id){
            case "part_number":
                $('#work_order').focus();
                break;
            case "work_order":
                $('#print').focus();
                break;            
        }	  
    }    
}

function openTCPconnection(tcp_settings){
    var client = new net.Socket();
    client.connect(tcp_settings.port, tcp_settings.host, function () {
        connectonMessage(' label-success', 'conectado');
        console.log('Connected');       
    });

    client.on('error', function (ex) {
        alert(ex);
        connectonMessage(' label-danger', 'no hay conexión');
    });

    client.on('data', function (data) {
        console.log('Received: ' + data);        
    });

    client.on('close', function () {
        console.log('Connection closed');
    });
    return client;
}

function openSerialConnection(serial_settings){
    myPort = new serialport();
    var list=myPort.list();
    var foo=mapArraysIntoObjects(list)
    if (foo[serial_settings.port]){
        myPort.use(serial_settings.port,{        
        baudRate: parseInt(serial_settings.baudRate),
        dataBits: parseInt(serial_settings.dataBits),
        parity: serial_settings.parity,
        stopBits: parseInt(serial_settings.stopBits),
     });  

    myPort.open();
    myPort.connecting=true;
    connectonMessage(' label-success', 'conectado');
}
else{
    connectonMessage(' label-danger', 'no hay conexión');
}
        
    return myPort;
}

function getTemplate(){
    cleanInputs();
    if (select_input.value!="N/A")
    {
        replace();
        $('#part_number').focus();
        $("#print").prop('disabled', false)
    }
    else{
        $("#print").prop('disabled', true)
        textarea_input.value = "";
        textarea_input.text = "";        
    }
}

function replace(){
    fs.readFile(config.folder+'/'+select_input.value, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
    }
    textarea_input.value = data;
    });
}

function print(event) {
    $(".form-control").prop('disabled', true);
        var spinner = $("#spinner");
        spinner.fadeIn(); 
        event.preventDefault();    
        try{
            port.write(formatString(textarea_input.value));
            cleanInputs();
            document.querySelector('#part_number').focus();
        }
        catch(err){
            alert(err);
        }
        $(".form-control").prop('disabled', false);
        $("#spinner").hide(); 
}

function formatString(txt){
    var textRows = txt.split(/\r\n|\r|\n/).length;
    var result = txt.replace(/(\n)+/g, '\\x09') + '\\x0D';
    switch (textRows){
        case 3:
        break;
        case 4:
            result = config.formats.four.command+result;
        break;
    }
    return result;
}

function cleanInputs(){
    document.querySelector('#part_number').value="";
    document.querySelector('#part_number').text="";
    document.querySelector('#work_order').value="";
    document.querySelector('#work_order').text="";
    replace();
    $(".form-control").prop('disabled', false); 
    $("#spinner").hide();      
}


function mapArraysIntoObjects(array) {
       return array.reduce(function (acc, cur) {
           acc[cur] = cur;
           return acc;
       }, {});
   }

function connectonMessage(className, msg){
    document.querySelector('#connection_msg').className += className;
    document.querySelector('#connection_msg').innerHTML = msg;
}