function CreateRequest()
{
    var Request = false;

    if (window.XMLHttpRequest)
    {
        //Gecko-совместимые браузеры, Safari, Konqueror
        Request = new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        //Internet explorer
        try
        {
             Request = new ActiveXObject("Microsoft.XMLHTTP");
        }    
        catch (CatchException)
        {
             Request = new ActiveXObject("Msxml2.XMLHTTP");
        }
    }
 
    if (!Request)
    {
        alert("Невозможно создать XMLHttpRequest");
    }
    
    return Request;
} 

/*
Функция посылки запроса к файлу на сервере
r_method  - тип запроса: GET или POST
r_path    - путь к файлу
r_args    - аргументы вида a=1&b=2&c=3...
r_handler - функция-обработчик ответа от сервера
*/
function SendRequest(r_method, r_path, r_args, r_handler)
{
    //Создаём запрос
    var Request = CreateRequest();
    
    //Проверяем существование запроса еще раз
    if (!Request)
    {
        return;
    }
    
    //Назначаем пользовательский обработчик
    Request.onreadystatechange = function()
    {
        //Если обмен данными завершен
        if (Request.readyState == 4)
        {
            //Передаем управление обработчику пользователя
            r_handler(Request);
        }
    }
    
    //Проверяем, если требуется сделать GET-запрос
    if (r_method.toLowerCase() == "get" && r_args.length > 0) r_path += "?" + r_args;
    
    //Инициализируем соединение
    Request.open(r_method, r_path, true);
    
    if (r_method.toLowerCase() != "get")
    {
        //Если это не GET-запрос
        
        //Устанавливаем заголовок
        Request.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=utf-8");
        //Посылаем запрос
        Request.send(r_args);
    }
    else
    {
        //Если это GET-запрос
        
        //Посылаем нуль-запрос
        Request.send(null);
    }
}

// возвращает cookie с именем name, если есть, если нет, то undefined
function getCookie(name) 
{
  var matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie(name, value, options) 
{
  options = options || {};

  var expires = options.expires;

  if (typeof expires == "number" && expires) {
    var d = new Date();
    d.setTime(d.getTime() + expires * 1000);
    expires = options.expires = d;
  }
  if (expires && expires.toUTCString) {
    options.expires = expires.toUTCString();
  }

  value = encodeURIComponent(value);

  var updatedCookie = name + "=" + value;

  for (var propName in options) {
    updatedCookie += "; " + propName;
    var propValue = options[propName];
    if (propValue !== true) {
      updatedCookie += "=" + propValue;
    }
  }

  document.cookie = updatedCookie;
}

function deleteCookie(name)
{
  setCookie(name, "", {
    expires: -1
  })
}

function onEntry()
{
    login = document.getElementById("ent_login").value;
    password = document.getElementById("ent_password").value;
    warning = document.getElementById("warning");

    SendRequest("POST", "/auth", "login="+login+"&password="+password, function(request) {

        response = JSON.parse(request.responseText);

        if(response.state == 'fail')
        {
           warning.textContent = "Неправильный логин или пароль!";
        }
        else
        {
            setCookie("sid", response.sid);

            window.location.replace("./lk.html");
        }

    });

}

function onReg()
{
    login = document.getElementById("reg_login").value;
    password  = document.getElementById("reg_password1").value;
    password2 = document.getElementById("reg_password2").value;
    warning = document.getElementById("warning");

    if(password != password2)
    {
        warning.textContent = "Ошибка, пароли не совпадают!";
        return;
    }

    if(password.length < 5 || password.length > 40)
    {
        warning.textContent = "Ошибка, пароль не может быть короче 5 символов или длиннее 40!";
        return;
    }

    if(login.length < 5 || login.length > 20)
    {
        warning.textContent = "Ошибка, логин не может быть короче 5 символов или длиннеe 20!";
        return;
    }

    SendRequest("POST", "/registration", "login="+login+"&password="+password, function(request) {

        response = JSON.parse(request.responseText);

        if(response.state == 'fail')
        {
            warning.textContent = "Ошибка, такой логин уже существует!";
        }
        else
        {
            warning.textContent = "Регистрация пройдена успешно!";
        }

    });

}

function onExit()
{
    if(!getCookie("sid"))
    {
        window.location.replace("/");
    }

    SendRequest("DELETE", "/auth", "sid="+getCookie("sid"), function(request)
    {

    });

    deleteCookie("sid");

    window.location.replace("/");

}


