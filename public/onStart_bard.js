butt = document.getElementsByClassName('bbutton')
for(i=0; i < butt.length; i++)
{
	butt[i].rank = 0;
}

//button = 0;
function createWindow(event)
{
    if(document.getElementsByClassName('window').length != 0) return;

    button = event.target;
    link = document.querySelector('link[rel=import]');
    needs_id = '#b'+button.name.replace('bard','')+'rank'+button.rank;
    content = link.import.querySelector(needs_id);
    try
    {
        if(!content.className == 'window') return;
    }
    catch(err)
    {
        return;
    }
    content = content.cloneNode(true);
    //content.id = 'currentWindow';

    divtable = document.querySelector('.bard table');

    //content.style.left = (divtable.offsetLeft+button.parentNode.offsetLeft+button.parentNode.offsetWidth) + 'px';
    //content.style.top  = (divtable.offsetTop+button.parentNode.parentNode.offsetTop) + 'px';

    wwidth   = screen.availWidth; 
    wheight  = screen.availHeight; 
    buttRect = button.getBoundingClientRect();

    if(wwidth >= 900)
    {
        content.style.left   = buttRect.right + 'px';
        content.style.top    = buttRect.top + 'px';
        content.style.bottom = 'auto';

        divbody = document.querySelector('body');
        divbody.appendChild(content);

        if(buttRect.top+content.offsetHeight >= wheight-20)
        {
            content.style.top    = 'auto';
            content.style.bottom = '0px';
        }
    }
    else
    {
        content.style.bottom   = '0px';
        content.style.width   = '100%';
        content.style.height   = '30vh';
        content.style.overflow = 'auto';

        divbody = document.querySelector('body');
        divbody.appendChild(content);
    }
    for (i = 0; i<init_func.length; i++)
    {
        try
        {
            init_func[i]();
        }
        catch(err)
        {

        }
    }   
}

function deleteWindow(event)
{
	try
	{
		document.body.getElementsByClassName('window')[0].remove();
	}
	catch(err)
	{

	}
}

var count;
count_text = document.getElementById('skill_count');

function OK()
{
    a = parseInt(document.getElementById('skill').value);
    D = parseInt(document.getElementById('weapon_damage').value);
    MD = parseInt(document.getElementById('magical_damage').value);
    H = parseInt(document.getElementById('heal').value);
    count = a+3;
    count_text.textContent = count;

    for(i = 0; i < butt.length; i++)
    {
        butt[i].rank=0;
        butt[i].style.borderColor = "darkslategray";
        butt[i].style.filter = "grayscale(90%)";
    }
    leftclick(0);
    leftclick(1);
    leftclick(2);

    tableSuperviser();
}
function tableSuperviser()
{
    rangToPoint = [0, 1, 3, 6];
    pointToOpen = [0, 5, 11, 18, 25, 32, 39, 46, 53, 60];

    trs = document.querySelectorAll('.bard table tr');
    buttonRows = [];

    for(i=0; i < trs.length; i++)
    {
        buttonRows[i] = trs[i].querySelectorAll('button');
    }

    sumPoint = 0;
    for(i = 0; i < buttonRows.length; i++)
    {
        sumPointRow = 0;
        for(j = 0; j < buttonRows[i].length; j++)
        {
            sumPointRow += rangToPoint[buttonRows[i][j].rank];
            if(sumPoint < pointToOpen[i])
            {
                buttonRows[i][j].style.borderColor = "darkslategray";
                buttonRows[i][j].style.filter = "grayscale(90%) brightness(0.25)";
                count += rangToPoint[buttonRows[i][j].rank];
                buttonRows[i][j].rank=0;
                buttonRows[i][j].disabled = true;
            }
            else
            {
                if(buttonRows[i][j].disabled == true)
                {
                    buttonRows[i][j].style.borderColor = "darkslategray";
                    buttonRows[i][j].style.filter = "grayscale(90%)";
                    buttonRows[i][j].disabled = false;
                }
            }
        }
        sumPoint += sumPointRow;
    }

    count_text.textContent = count;
}
tableSuperviser();