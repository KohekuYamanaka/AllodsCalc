function leftclick(i){
	if (butt[i].rank==0) 
	{
		butt[i].style.borderColor = "yellow";
		butt[i].rank=1;
		butt[i].style.filter = "grayscale(0%)";
		count = count - 1;
		count_text.textContent = count;
	}
	else if (butt[i].rank==1)
	{
		butt[i].style.borderColor = "orange";
		butt[i].rank=2;
		count = count - 2;
		count_text.textContent = count;
	}
	else if (butt[i].rank==2)
	{
		butt[i].style.borderColor = "red";
		butt[i].rank=3;
		count = count - 3;
		count_text.textContent = count;
	}
	else if (butt[i].rank==3)
	{
		butt[i].style.borderColor = "darkslategray";
		butt[i].rank=0;
		butt[i].style.filter = "grayscale(90%)";
		count = count + 6;
		count_text.textContent = count;
		if(i < 3)
		{
			leftclick(i);	
		}
	}
	if (count < 0)
	{
		count_text.style.color = "red";
	}
	else
	{
		count_text.style.color = "white";
	}

	tableSuperviser();

	deleteWindow(null);
	evt = {target: butt[i]};
	createWindow(evt);
}

function saveBuild()
{
	sid = getCookie("sid");
	warning = document.querySelector("#warning");
	name = document.querySelector("#build_name").value;

	if(name.length < 1)
	{
		warning.textContent = "Введите имя!";
		setTimeout(function(){warning.textContent = "";}, 2500);
		return;
	}

	if(!/^[^\\^\/^\.]*$/.test(name))
	{
		warning.textContent = "Недопустимые символы!";
		setTimeout(function(){warning.textContent = "";}, 2500);
		return;
	}

	if(!sid)
	{
		warning.textContent = "Сначала авторизируйтесь!";
		setTimeout(function(){warning.textContent = "";}, 2500);
		return;
	}

	build_data = encodeURIComponent(document.querySelector(".warrior").outerHTML);

	SendRequest("POST", "/build", "sid="+sid+"&name="+name+"&build_data="+build_data, function(request) {

	try
	{
    	response = JSON.parse(request.responseText);
	}
	catch(err)
	{
		warning.textContent = "Сначала авторизируйтесь!";
		setTimeout(function(){warning.textContent = "";}, 2500);
		return;
	}

    if(response.state == 'fail' || !response.state)
    {
    	if(response.error == 'Invalid session id')
    	{
    		warning.textContent = "Сначала авторизируйтесь!";
    	}
    	else
    	{
    		warning.textContent = "Ошибка!";
   		}
    }
    else
    {
    	warning.textContent = "Сохранено";
    }

    setTimeout(function(){warning.textContent = "";}, 2500);

});

}