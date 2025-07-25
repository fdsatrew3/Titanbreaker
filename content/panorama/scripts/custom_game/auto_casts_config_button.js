let AUTO_CASTS_CONFIG_WINDOW = undefined;

function GetDotaHudRoot()
{
    return $.GetContextPanel().GetParent().GetParent().GetParent();
}

function ToggleAutoCastsConfigWindow()
{
	$.Msg("Test?");
	
	let configWindow = GetAutoCastsConfigWindow();
	
	if(configWindow == undefined)
	{
		return;
	}
	
	configWindow.ToggleClass("Hidden");
}

function GetAutoCastsConfigWindow()
{
	if(AUTO_CASTS_CONFIG_WINDOW == undefined)
	{
		AUTO_CASTS_CONFIG_WINDOW = GetDotaHudRoot().FindChildTraverse("AutoCastsConfigWindowContainer");	
		$.Msg(AUTO_CASTS_CONFIG_WINDOW);
		if(AUTO_CASTS_CONFIG_WINDOW[0] != undefined)
		{
			AUTO_CASTS_CONFIG_WINDOW = AUTO_CASTS_CONFIG_WINDOW[0];
		} else
		{
			AUTO_CASTS_CONFIG_WINDOW = undefined;
		}
	}	

	return AUTO_CASTS_CONFIG_WINDOW;
}