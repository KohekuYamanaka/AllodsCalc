sid = getCookie("sid");

if(!sid)
{
	window.location.replace("./entrance.html");
}

SendRequest("PROPFIND", "/build", "sid="+sid, function(request) {

	try
	{
    	response = JSON.parse(request.responseText);
	}
	catch(err)
	{
		window.location.replace("./entrance.html");
	}

    if(response.state == 'fail' || !response.state)
    {
    	window.location.replace("./entrance.html");
    }
    builds_names = response.builds;

    for(i=0; i < builds_names.length; i++)
    {
    	builds_names[i] = /[^\.]*/.exec(builds_names[i])[0];
    }

	table = document.querySelector(".builds_table tbody");
	build_container = document.querySelector(".build_container");

	for(i = 0; i < builds_names.length; i++)
	{
		tr        = document.createElement('tr');
		td_name   = document.createElement('td');
		td_open_delete   = document.createElement('td');

		td_name.textContent = builds_names[i];

		if(builds_names[i].length > 30)
		{
			td_name.textContent = builds_names[i].substr(0,27)+"...";
		}

		button_open   = document.createElement('button');
		button_delete = document.createElement('button');
		
		button_open.textContent = "Открыть";
		button_delete.textContent = "Удалить";

		button_open.className += "form_button";
		button_delete.className += "form_button";
		
		(function(tr,i)
		{

			button_open.onclick = function()
			{
				SendRequest("GET", "/build", "sid="+sid+"&name="+builds_names[i], function(request) {

					response = JSON.parse(request.responseText);

					if(response.state == 'success')
					{
						build_container.innerHTML = response.build;

					}
				});
			}

			button_delete.onclick = function()
			{
				SendRequest("DELETE", "/build", "sid="+sid+"&name="+builds_names[i], function(request) {

					response = JSON.parse(request.responseText);

					if(response.state == 'success')
					{
						table.removeChild(tr);
					}
				});
			}

		})(tr,i);

		td_open_delete.appendChild(button_open);
		td_open_delete.appendChild(button_delete);
		tr.appendChild(td_name);
		tr.appendChild(td_open_delete);
		table.appendChild(tr);
	}
    
    console.log(response);

});
