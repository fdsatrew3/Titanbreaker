"use strict";

var playerChests;
var lastSelectedUnit;
var talents;
var talentpoints;
var playerheroingame = false;
var spectator = false;
var mythicslots = 11;
var stats_amount = 14;
var max_talents = 181; //145; //121;
var path_reset_toggle = false;
var temple_hero_reset_level_toggle = false;
var last_loot_table_panel = null;
var last_loot_table_panel_artifact = null;
var last_act_enter_item_panel_artifact = null;
var last_shop_item_panel = null;
var save_cooldown = 0;
var autosell = 0;
var autosellArti = 0;
var autosellSpecial = 0;
// var main_stats_detailed = false;

/*
OLD STATS UI
var hpPerStr = 10; //20;
var physDmgPerStr = 0.1;
var armorPerAgi = 0.04;
var asPerAgi = 0.05; //0.02;
var abilCritPerAgi = 0.05;
var manaPerInt = 1; //12; //12;
var abilDmgPerInt = 0.015;
var mresPerInt = 0.01;

function SetManaPerInt(args){
    manaPerInt = args.mana;
    $.Msg(manaPerInt);
}
*/

function EloOnClientCheckIn(args) {

    var payload = {
        modIdentifier: args.modID,
        steamID32: GetSteamID32(),
        matchID: args.matchID,
        schemaVersion: args.schemaVersion
    };

    //$.Msg('Sending: ', payload);

/*
	Valve removed AsyncWebRequest
    $.AsyncWebRequest('http://getdotastats.com/s2/api/s2_check_in.php',
        {
            type: 'POST',
            data: {payload: JSON.stringify(payload)},
            success: function (data) {
                $.Msg('GDS Reply: ', data)
            }
        }); */
}

function TableToggle() {
    //$.Msg("pressed");
    var p = Game.GetAllPlayerIDs().length;
    //$.Msg(p);
    if((p != 6 && p != 4) && !debug){
        return; //only react if we have 6 players
    }
    if (!tablevisible){
        tablevisible = true;
        $.FindChildInContext("#table").visible = true;
    }else{
        tablevisible = false;
        $.FindChildInContext("#table").visible = false;
    }
    
    if (!datafromserver){
        // request data and fill table
        datafromserver = true;    //disabled cuz of auto update
        SendValuesToServer(1);
        
    }
}

function LeaderboardToggle() {
    //$.Msg("pressed leader");
    if (!leaderboardvisible){
        leaderboardvisible = true;
        $.FindChildInContext("#leaderboard").visible = true;
    }else{
        leaderboardvisible = false;
        $.FindChildInContext("#leaderboard").visible = false;
    }
    
    if (!leaderboard_fromserver){
        // request data and fill table
        leaderboard_fromserver = true;   
        LoadLeaderboardFromServer();
    }
}

function LeaderboardToggleChallengeMode() {
    if ($.FindChildInContext("#leaderboardchallengemode").visible){
        $.FindChildInContext("#leaderboardchallengemode").visible = false;
    }else{
        $.FindChildInContext("#leaderboardchallengemode").visible = true;
    }

    if (!leaderboard_challenge_mode_fromserver){
        // request data and fill table
        leaderboard_challenge_mode_fromserver = true;   
        LoadLeaderboardChallengeModeFromServer();
    }
}

function ToggleInventory() {
    if (!inventoryvisible){
        UpdateInventory();
        inventoryvisible = true;
        $.FindChildInContext("#WeaponInventoryDisplay").visible = true;
    }else{
        inventoryvisible = false;
        $.FindChildInContext("#WeaponInventoryDisplay").visible = false;
    }
}

function PlayerInventoryLeft() {
    selectedHeroPlayerID = selectedHeroPlayerID - 1;
    if (selectedHeroPlayerID < 0){
        selectedHeroPlayerID = 4;
    }
    UpdateInventory();
    UpdateTalentTree(-1);
}

function PlayerInventoryRight() {
    selectedHeroPlayerID = selectedHeroPlayerID + 1;
    if (selectedHeroPlayerID > 4){
        selectedHeroPlayerID = 0;
    }
    UpdateInventory();
    UpdateTalentTree(-1);
}

function ToggleTalentTree() {
    if (!talenttreevisible){
        UpdateTalentTree(-1);
        talenttreevisible = true;
        $.FindChildInContext("#TalentTree").visible = true;
    }else{
        talenttreevisible = false;
        $.FindChildInContext("#TalentTree").visible = false;
    }
}

function ToggleRewards() {
    if (!rewardsvisible){
        rewardsvisible = true;
        $.FindChildInContext("#rewards").visible = true;
    }else{
        rewardsvisible = false;
        $.FindChildInContext("#rewards").visible = false;
    }
}

function ToggleQuestlog() {
    if (!rewardsvisible){
        rewardsvisible = true;
        $.FindChildInContext("#questlog").visible = true;
    }else{
        rewardsvisible = false;
        $.FindChildInContext("#questlog").visible = false;
    }
}

function ToggleGambling() {
    if (!gamblingvisible){
        gamblingvisible = true;
        $.FindChildInContext("#gambling").visible = true;
    }else{
        gamblingvisible = false;
        $.FindChildInContext("#gambling").visible = false;
    }
}

function MenuMoltenForgeResize(){
    var height = $.FindChildInContext("#gambling").style.height;
    $.Msg(height);
    if(height != null && height != "25.0%"){
        $.FindChildInContext("#gambling").style.height = "25.0%";
    }else{
        $.FindChildInContext("#gambling").style.height = "100.0%";
    }
}

function ToggleAggroMeter() {
    if ($.FindChildInContext("#aggrometerbars").visible){
        $.FindChildInContext("#aggrometerbars").visible = false;
    }else{
        $.FindChildInContext("#aggrometerbars").visible = true;
    }
}

function MoltenForgeMenuToggle(args) {
    if (args.open == 0){
        $.FindChildInContext("#gambling").visible = false;
    }else{
        $.FindChildInContext("#gambling").visible = true;
    }
}

function TeleporterMenu() {
    if ($.FindChildInContext("#teleportermenu").visible){
        $.FindChildInContext("#teleportermenu").visible = false;
    }else{
        $.FindChildInContext("#teleportermenu").visible = true;
    }
}

function QuestMenu() {
    if ($.FindChildInContext("#questmenu").visible){
        $.FindChildInContext("#questmenu").visible = false;
    }else{
        $.FindChildInContext("#questmenu").visible = true;
    }
}

function TeleporterUnlock(args){
    var panel = $.FindChildInContext("#teleporter"+args.value);
    if(panel != null){
        panel.visible = true;
    }
}

function TeleporterPressed(tp){
    GameEvents.SendCustomGameEventToServer( "tp_pressed", { "player_id": Players.GetLocalPlayer(), "tp": tp } );
}

function ToggleStash(isForward){
    GameEvents.SendCustomGameEventToServer( "toggle_stash", { "nr": Players.GetLocalPlayer(), "forward": isForward } );
}

function SetStashToggleNumber(args){
    var panel = $('#ToggleStashText');
    panel.text = args.nr;
}

function SaveHero(){
    if(save_cooldown <= 0){
        GameEvents.SendCustomGameEventToServer( "save_pressed", { "player_id": Players.GetLocalPlayer() } );
        save_cooldown = 30;
        SaveHeroTimer();
    }
}

function SaveHeroTimer(){
    if(save_cooldown > 0){
        $.Schedule(1, function(){
            var panel = $('#save_cooldown');
            panel.text = "CD: "+save_cooldown;
            save_cooldown = save_cooldown - 1;
            SaveHeroTimer();
        });
    }else{
        var panel = $('#save_cooldown');
        panel.text = "";
    }
}

function ToggleLootInformation() {
    if ($.FindChildInContext("#rewards").visible){
        $.FindChildInContext("#rewards").visible = false;
    }else{
        $.FindChildInContext("#rewards").visible = true;
    }
}

function ToggleLootTable() {
    if ($.FindChildInContext("#loottable").visible){
        $.FindChildInContext("#loottable").visible = false;
    }else{
        last_loot_table_panel = null;
        last_loot_table_panel_artifact = null;
        var panel = $.FindChildInContext("#loottable").visible = true;
        var items = $.FindChildInContext("#loottableitems");
        for (var i = items.GetChildCount()-1; i >= 0; i--) {
            var lastItem = items.GetChild(i);
            lastItem.DeleteAsync(0);
        }
        items = $.FindChildInContext("#loottableartifacts");
        for (var i = items.GetChildCount()-1; i >= 0; i--) {
            var lastItem = items.GetChild(i);
            lastItem.DeleteAsync(0);
        }
        //$.FindChildInContext("#loottableartifacts").Children() = null;
        GameEvents.SendCustomGameEventToServer( "request_droptable", { "player_id": Players.GetLocalPlayer() } );
    }
}

function ToggleDropTable() {
    if ($.FindChildInContext("#DropTableToggle").visible){
        $.FindChildInContext("#DropTableToggle").visible = false;
    }else{
        $.FindChildInContext("#DropTableToggle").visible = true;
    }
}

function TempleVote(args)
{ 
    $.Msg("vote difficulty");
    if(args == -1 || args == 1){
        GameEvents.SendCustomGameEventToServer( "temple_difficulty_change", { value: args} );
        $("#easierbutton").visible = true;
    }
}

function DifficultyModeClicked(args){
    RequestDifficultyMode(args);
}

function RequestDifficultyMode(args){
    GameEvents.SendCustomGameEventToServer( "temple_difficulty_mode_change", { value: args} );
}

function SetDifficultyMode(args){
    /*
    $.Msg("#DifficultyModeButton" + String(args));
    $("#DifficultyModeButton" + String(args)).style.borderWidth = "5px";
    $("#DifficultyModeButton" + String(args)).style.borderColor = "gold";
    $("#DifficultyMode" + String(args)).style.color = "gold";
    for (var i = 0; i <= 2; i++) {
        if(i != args){
            $.Msg(i);
            $("#DifficultyModeButton" + String(i)).style.borderWidth = "3px";
            $("#DifficultyModeButton" + String(i)).style.borderColor = "white";
            $("#DifficultyMode" + String(i)).style.color = "white";
        }
    }*/
}

function ToggleLeftMenu() {
    if ($.FindChildInContext("#LeftMenu").visible){
        $.FindChildInContext("#LeftMenu").visible = false;
    }else{
        $.FindChildInContext("#LeftMenu").visible = true;
    }
}

function ToggleInventoryMenu() {
    if ($.FindChildInContext("#inventorymenu").visible){
        $.FindChildInContext("#inventorymenu").visible = false;
    }else{
        $.FindChildInContext("#inventorymenu").visible = true;
    }
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min +1)) + min; 
}

function LeaderboardFillTemple(data) {
    //$.Msg("starting table fill");
    //$.Msg(data);
    $("#d11").text = "Player";
    $("#d12").text = "Hero";
    $("#d13").text = "Boss Kill Score";
    $("#d14").visible = false;

    data = String(data);
    //$.Msg(data);
    var info = data.split(",");
    //$.Msg(info.length);
    //$.Msg("split done");
    for (var i = 0; i < info.length-1; i++) {
        //$.Msg(info[i]);

        var row = 2+Math.floor(i/4);
        var cell = 1+(i%4);
        if(cell == 4){
            continue;
        }
        var c = "#d";
        c = c.concat(String(row));
        c = c.concat(String(cell));
        //$.Msg(c);
        //$.Msg(info[i]);
        //$.Msg(basepanel.FindChild(c).value);
        if(cell == 3){
            $(c).text = info[i].concat("  -  Lives left: ").concat(info[i+1]);
        }else{
            $(c).text = info[i]; 
        }
        
        if(cell == 2){
            $(c).text = "";
            var c = "#hero";
            c = c.concat(String(row-1));
            //$.Msg(im);
            //$.Msg(c);
            $(c).heroname="npc_dota_hero_" + info[i];
        }
        if(cell == 3){
            var c = "#d";
            cell = cell + 1;
            c = c.concat(String(row));
            c = c.concat(String(cell));
            $(c).visible = false;
        }
        //$.GetContextPanel().getElementById(c).value = info[i];
    }
}

function LeaderboardChallengeModeFillTemple(data) {
    //$.Msg("starting table fill");
    //$.Msg(data);
    $("#ch11").text = "Player";
    $("#ch12").text = "Hero";
    $("#ch13").text = "Boss Kill Score";
    $("#ch14").visible = false;

    data = String(data);
    //$.Msg(data);
    var info = data.split(",");
    //$.Msg(info.length);
    //$.Msg("split done");
    for (var i = 0; i < info.length-1; i++) {
        //$.Msg(info[i]);

        var row = 2+Math.floor(i/4);
        var cell = 1+(i%4);
        if(cell == 4){
            continue;
        }
        var c = "#ch";
        c = c.concat(String(row));
        c = c.concat(String(cell));
        //$.Msg(c);
        //$.Msg(info[i]);
        //$.Msg(basepanel.FindChild(c).value);
        if(cell == 3){
            $(c).text = info[i].concat("  -  Lives left: ").concat(info[i+1]);
        }else{
            $(c).text = info[i]; 
        }
        
        if(cell == 2){
            $(c).text = "";
            var im = "file://{images}/custom_game/heroicons/";
            im = im.concat(info[i]);
            im = im.concat(".png");
            var c = "#heroc";
            c = c.concat(String(row-1));
            //$.Msg(im);
            //$.Msg(c);
            $(c).SetImage(im);
        }
        if(cell == 3){
            var c = "#ch";
            cell = cell + 1;
            c = c.concat(String(row));
            c = c.concat(String(cell));
            $(c).visible = false;
        }
        //$.GetContextPanel().getElementById(c).value = info[i];
    }
}

function LeaderboardFill(data) {
    //$.Msg("starting table fill");
    //$.Msg(data);
    $("#leaderboardheader").text = "3vs3 Ranking  [wow.catze.eu for top 200]";
    if(ladder == 4){
        $("#leaderboardheader").text = "2vs2 Ranking  [wow.catze.eu for top 200]";
    }

    data = String(data);
    //$.Msg(data);
    var info = data.split(",");
    //$.Msg(info.length);
    //$.Msg("split done");
    for (var i = 0; i < info.length-1; i++) {
        //$.Msg(info[i]);

        var row = 2+Math.floor(i/4);
        var cell = 1+(i%4);
        var c = "#d";
        c = c.concat(String(row));
        c = c.concat(String(cell));
        //$.Msg(c);
        //$.Msg(info[i]);
        //$.Msg(basepanel.FindChild(c).value);
        $(c).text = info[i];
        //$.GetContextPanel().getElementById(c).value = info[i];
    }
}

function TableFill(data) {
    
    //$.Msg("starting table fill");
    //$.Msg(data);
    var basepanel = $.GetContextPanel();
    data = String(data);
    //$.Msg(data);
    var info = data.split(",");
    //$.Msg("split done");
    for (var i = 0; i < info.length-1; i++) {
        //$.Msg(info[i]);

        var row = 2+Math.floor(i/4);
        var player = row - 2;
        var cell = 1+(i%4);
        var c = "#c";
        c = c.concat(String(row));
        c = c.concat(String(cell));
        //$.Msg(c);
        //$.Msg(info[i]);
        //$.Msg(basepanel.FindChild(c).value);
        $(c).text = info[i];
        //$.GetContextPanel().getElementById(c).value = info[i];

        //cosmetics
        if (cell == 1){
            playerNames[Math.floor(i/4)] = info[i];
        }
        if (cell == 2){
            playerRatings[Math.floor(i/4)] = info[i];
        }
        if (cell == 3){
            playerWins[Math.floor(i/4)] = info[i];
        }
        //fill initial elo
        if (cell == 2){
            c = c.concat("old");
            if ($(c).text == ""){
                $(c).text = info[i];
            }
        }

        if(foundleaver && cell == 1 && idbyrow != null && leavingplayer == idbyrow[player]){
            $(c).text = info[i].concat("  [Leaver: -40 Elo]");
            $(c).SetHasClass( "ButtTextLeaver", true );
            $(c).SetHasClass( "ButtText", false );
        }
        if(foundleaver && cell == 1 && idbyrow != null && leavingplayer != idbyrow[player]){
            $(c).text = info[i].concat("   [safe to leave]");
            $(c).SetHasClass( "ButtTextSafeLeave", true );
            $(c).SetHasClass( "ButtText", false );
        }
    }

    //cosmetics
    for (var i = 0; i < playerRatings.length; i++) {
        if(playerRatings[i] != null){
            GameEvents.SendCustomGameEventToServer( "feedelotogame", { name: idbyrow[i], rating: playerRatings[i], wins: playerWins[i]} );
        }
    }
}

function TableFillEnd(data) {
    //$.Msg("starting table fill");
    //$.Msg(data);
    var basepanel = $.GetContextPanel();
    data = String(data);
    //$.Msg(data);
    var info = data.split(",");
    //$.Msg("split done");
    for (var i = 0; i < info.length-1; i++) {
        //$.Msg(info[i]);

        var row = 2+Math.floor(i/4);
        var cell = 1+(i%4);
        var c = "#c";
        c = c.concat(String(row));
        c = c.concat(String(cell));
        //$.Msg(c);
        //$.Msg(info[i]);
        //$.Msg(basepanel.FindChild(c).value);

        //var temp = $(c).text;
        //temp = temp.concat("->");
        //temp = temp.concat(info[i]);
        var temp = info[i];
        $(c).text = temp;
        //$.GetContextPanel().getElementById(c).value = info[i];

    }
}

function LeaverDetected(args) { //also table update
    foundleaver = true;
    var temp = GetRowByID(args.code);
    if (temp == -1){
        return;
    }
    //$.Msg("leaver row test");
    //$.Msg(GetRowByID(args.code));
    leavingplayer = args.code;
}

function SendEloResults(args) { //also table update
    var p = Game.GetAllPlayerIDs().length;
    $.Msg("try to send 1")
    ladder = p;
    //if(p != 6 && !debug){
    //    $.Msg("elo sending aborted, not 6 players");
    //    return; //only react if we have 6 players
    //}


    
    if (args.winningteam == 11 && !datafromserver){ // round 1 filling of table if player didnt open it
        //only update tables
        //$.Msg("loading new data from server, if not done yet");
        datafromserver = true;
        SendValuesToServer(1);
        return;
    }
    if (args.winningteam == 11){
        return;
    }
    if (args.winningteam == 10){
        //only update tables
        //$.Msg("loading new data from server");
        SendValuesToServer(1);
    }else{
        //send new data to server, either a end of round win or a leaver detection
        //$.Msg("send result event received in javascript, winning team");
        //$.Msg(String(args.winningteam));
        

        if(true || args.winningteam == 2 || args.winningteam == 3){
            SendValuesToServer(args.winningteam);
        }
    }
    
}

var temple_version = 2;

var tablevisible = false;
var datafromserver = false;
var leaderboardvisible = false;
var rewardsvisible = false;
var gamblingvisible = false;
var inventoryvisible = false;
var talenttreevisible = false;
var leaderboard_fromserver = false;
var leaderboard_challenge_mode_fromserver = false;

var debug = false;
var ladder = 0;
var foundleaver = false;
var leavingplayer = -1;

var playerNames = new Array(10);
var playerRatings = new Array(10);
var playerWins = new Array(10);
var idbyrow = new Array(10);
var season2gladiator = new Array(10);

function GetSteamID32(playerid) {
            var playerInfo = Game.GetPlayerInfo(playerid);

            var steamID64 = playerInfo.player_steamid,
                steamIDPart = Number(steamID64.substring(3)),
                steamID32 = String(steamIDPart - 61197960265728);

            return steamID32;
        }

function LoadLeaderboardFromServer()
{   
    $("#leaderboardheader").text = "Titanbreaker - Leaderboard";

    GameEvents.SendCustomGameEventToServer("getleaderboard", { });

	/*
	Valve removed AsyncWebRequest
    $.AsyncWebRequest('http://catze.eu/templetop10_season_5.php',
    {
        type: 'POST',
        data: { order: "getelo",
                players: String(ladder)
                },
        success: function (data) {
        $.Msg('GDS Reply: ', data)
        LeaderboardFillTemple(data);
        //return data;
    }
    }); */
}

function OnLeaderboardResponseFromServer(args)
{
    LeaderboardFillTemple(args.data);
}

function LoadLeaderboardChallengeModeFromServer()
{   
    ladder = Game.GetAllPlayerIDs().length;

    if (true){
        $("#leaderboardchallengemodeheader").text = "Titanbreaker Leaderboard";
		/*
	Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/templetop10_challenge_season_2.php',
        {
            type: 'POST',
            data: { order: "getelo",
                    players: String(ladder)
                    },
            success: function (data) {
            $.Msg('GDS Reply: ', data)
            LeaderboardChallengeModeFillTemple(data);
            //return data;
        }
        }); */
    }else{
        $("#leaderboardchallengemodeheader").text = "Titanbreaker Leaderboard";
		/*
	Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/templetop10_challenge.php',
        {
            type: 'POST',
            data: { order: "getelo",
                    players: String(ladder)
                    },
            success: function (data) {
            $.Msg('GDS Reply: ', data)
            LeaderboardChallengeModeFillTemple(data);
            //return data;
        }
        }); */
    }
}

function GetRowByID(playerid){
    var ids = Game.GetAllPlayerIDs();
    for (var i = 0; i < ids.length; i++) {
        if (ids[i] == playerid){
            return i;
        }
    }
    return -1;
}

function GetIDByRow(row){
    var ids = Game.GetAllPlayerIDs();
    for (var i = 0; i < ids.length; i++) {
        if (ids[i] == playerid){
            return i;
        }
    }
    return -1;
}

function SendValuesToServer(winningteam) //team 1 = 2, team 2 = 3, paramter = 1 means to get elo ratings from server, bigger than 90 means we had leaver
{   

    //$.Msg( "Elo Server connection");
    //$.Msg( "winning team");
    //$.Msg( winningteam);

    var team1ids = Game.GetPlayerIDsOnTeam(2);
    var team2ids = Game.GetPlayerIDsOnTeam(3);
    //$.Msg( "players team 1 ");
    //$.Msg( team1ids.length);
    //$.Msg( "ladder var ");
    ladder = Game.GetAllPlayerIDs().length;
    //$.Msg( ladder);
    if(team1ids.length != team2ids.length){
        //uneven players per team!
        return;
    }
    
    if(ladder != 4 && ladder != 6){
        //sth went wrong with ladder size
        return;
    }

    var leaver = false;
    //check for leaver reported
    if (winningteam > 90){
        //$.Msg( "Leaver detected in js sendvalue func");
        winningteam = winningteam - 100;
        foundleaver = true;
        leaver = true;
        //$.Msg( "leaver id");
        //$.Msg(winningteam);
    }
    
    var pid = [0, 0, 0, 0, 0, 0];
    var name = [0, 0, 0, 0, 0, 0];
    var win = [0, 0, 0, 0, 0, 0];
    var halfsize = ladder / 2;
    for (var i = 0; i < ladder; i++) {
        if (i < ladder/2){
            //$.Msg("real id");
            //$.Msg(team1ids[i]);
            pid[i] = GetSteamID32(team1ids[i]);
            name[i] = Players.GetPlayerName(team1ids[i]);
            if (!leaver && winningteam == 2){ //team 1 winning
                win[i] = 1;
            }
            if(leaver && team1ids[i] == winningteam){
                win[i] = 2;
                leavingplayer = team1ids[i];
                //$.Msg( "Leaving Player");
                //$.Msg(i);
            }
            idbyrow[i] = team1ids[i];
        }else{
            //$.Msg("real id");
            //$.Msg(team2ids[i-halfsize]);
            pid[i] = GetSteamID32(team2ids[i-halfsize]);
            name[i] = Players.GetPlayerName(team2ids[i-halfsize]);
            if (!leaver && winningteam == 3){ //team 1 winning
                win[i] = 1;
            }
            if(leaver && team2ids[i-halfsize] == winningteam){
                win[i] = 2;
                leavingplayer = team2ids[i-halfsize];
                //$.Msg( "Leaving Player");
                //$.Msg(i);
            }
            idbyrow[i] = team2ids[i-halfsize];
        }

        if (pid[i] == "10798882111488"){
            //$.Msg( "bot detected");
            return;
        }
        
        //$.Msg(name[i]);
        //$.Msg(pid[i]);
        //$.Msg(win[i]);
    }


    if (winningteam == 1){
        //$.Msg( "Request Elo from server call");
		/*
			Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/elosystemv2.php',
        {
            type: 'POST',
            data: { order: "getelo",
                    players: String(ladder),
                    leaver2: String(0),
                    pid1: String(pid[0]),
                    name1: String(name[0]),
                    win1: String(win[0]),
                    pid2: String(pid[1]),
                    name2: String(name[1]),
                    win2: String(win[1]),
                    pid3: String(pid[2]),
                    name3: String(name[2]),
                    win3: String(win[2]),
                    pid4: String(pid[3]),
                    name4: String(name[3]),
                    win4: String(win[3]),
                    pid5: String(pid[4]),
                    name5: String(name[4]),
                    win5: String(win[4]),
                    pid6: String(pid[5]),
                    name6: String(name[5]),
                    win6: String(win[5])
                    },
            success: function (data) {
            //$.Msg('GDS Reply: ', data)
            //$.Msg("before table fill");
            TableFill(data);
            //return data;
        }
        }); */
    }else{
        var penalty = 0;
        if(leaver){
            penalty = 1;
        }
        //$.Msg( "Insert Elo into server call");
        //$.Msg( String(penalty));
		/*
			Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/elosystemv2.php',
        {
            type: 'POST',
            data: { order: "setelo",
                    players: String(ladder),
                    leaver2: String(penalty),
                    pid1: String(pid[0]),
                    name1: String(name[0]),
                    win1: String(win[0]),
                    pid2: String(pid[1]),
                    name2: String(name[1]),
                    win2: String(win[1]),
                    pid3: String(pid[2]),
                    name3: String(name[2]),
                    win3: String(win[2]),
                    pid4: String(pid[3]),
                    name4: String(name[3]),
                    win4: String(win[3]),
                    pid5: String(pid[4]),
                    name5: String(name[4]),
                    win5: String(win[4]),
                    pid6: String(pid[5]),
                    name6: String(name[5]),
                    win6: String(win[5])
                    },
            success: function (data) {
            //$.Msg('GDS Reply: ', data)
            //TableFillEnd(data);
        }
        }); */
    }
    
}

function LoadSeasonRewards(args)
{   
    //$.Msg("LoadingSeasonRewards, js");

    ladder = Game.GetAllPlayerIDs().length;
    
    //var pid = new Array(ladder);
    var mydata = {};
    mydata['order'] = "getreward";
    mydata['players'] = String(ladder);

    for (var i = 0; i < ladder; i++) {
        var pid = GetSteamID32(Game.GetAllPlayerIDs()[i]);
        var key = 'pid'+i;
        mydata[key] = String(pid);
    }

    //$.Msg( "Request Season Reward from server");
    
    //2vs2
	/*
		Valve removed AsyncWebRequest
    $.AsyncWebRequest('http://catze.eu/getseasonreward.php',
    {
        type: 'POST',
        data: mydata,
        success: function (data) {
        $.Msg('GDS Reply for reward request: ', data)
        RewardsFromServerToPlayers(data);
    }
    }); */
}

function RewardsFromServerToPlayers(data)
{   
    var data2 = String(data);
    data2 = data2.substring(0, data2.length - 8);
    //$.Msg('function to pass server values to lua');
    $.Msg(data.length);
    GameEvents.SendCustomGameEventToServer( "feedrewardstoluaserver", { season: 2, playerids: data2} );
    //$.Msg('function to pass server values to lua 2');
}

function TempleAbilityStatsUpdate(args){
    var index = args.abilityindex;
    var name = args.abilityname;
    //$.Msg(index);
    //$.Msg(name);
    if(index != null && name != null){
        var panel = $('#dmg'+index);
        panel.style.height = String(args.damage)+'px';
        panel = $('#heal'+index);
        panel.style.height = String(args.healing)+'px';
        if(index != 6){
            panel = $('#ability'+index);
            panel.abilityname = args.abilityname;
        }
    }
}

//save load pve mode
function SaveChar(args)
{   
    //$.Msg("Save Char function, js");

    ladder = Game.GetAllPlayerIDs().length;
    
    //var pid = new Array(ladder);
    var mydata = {};
    mydata['order'] = "savechar";
    mydata['pid'] = String(args.playerid);
    mydata['name'] = args.pn;
    //mydata['name'] = Players.GetPlayerName(parseInt(args.playerid, 10));
    mydata['hero'] = String(args.hero);
    mydata['exp'] = String(args.exp);
    mydata['gold'] = String(args.gold);
    mydata['slot1'] = String(args.slot1);
    mydata['slot2'] = String(args.slot2);
    mydata['slot3'] = String(args.slot3);
    mydata['slot4'] = String(args.slot4);
    mydata['slot5'] = String(args.slot5);
    mydata['slot6'] = String(args.slot6);

    //mythic weapons
    mydata['mythic1'] = String(args.mythic1);
    mydata['mythic1stat1'] = String(args.mythic1stat1);
    mydata['mythic1stat2'] = String(args.mythic1stat2);
    mydata['mythic1stat3'] = String(args.mythic1stat3);
    mydata['mythic2'] = String(args.mythic2);
    mydata['mythic2stat1'] = String(args.mythic2stat1);
    mydata['mythic2stat2'] = String(args.mythic2stat2);
    mydata['mythic2stat3'] = String(args.mythic2stat3);
    mydata['mythic3'] = String(args.mythic3);
    mydata['mythic3stat1'] = String(args.mythic3stat1);
    mydata['mythic3stat2'] = String(args.mythic3stat2);
    mydata['mythic3stat3'] = String(args.mythic3stat3);
    mydata['mythic4'] = String(args.mythic4);
    mydata['mythic4stat1'] = String(args.mythic4stat1);
    mydata['mythic4stat2'] = String(args.mythic4stat2);
    mydata['mythic4stat3'] = String(args.mythic4stat3);
    mydata['mythic5'] = String(args.mythic5);
    mydata['mythic5stat1'] = String(args.mythic5stat1);
    mydata['mythic5stat2'] = String(args.mythic5stat2);
    mydata['mythic5stat3'] = String(args.mythic5stat3);
    mydata['mythic6'] = String(args.mythic6);
    mydata['mythic6stat1'] = String(args.mythic6stat1);
    mydata['mythic6stat2'] = String(args.mythic6stat2);
    mydata['mythic6stat3'] = String(args.mythic6stat3);
    mydata['mythic7'] = String(args.mythic7);
    mydata['mythic7stat1'] = String(args.mythic7stat1);
    mydata['mythic7stat2'] = String(args.mythic7stat2);
    mydata['mythic7stat3'] = String(args.mythic7stat3);
    mydata['mythic8'] = String(args.mythic8);
    mydata['mythic8stat1'] = String(args.mythic8stat1);
    mydata['mythic8stat2'] = String(args.mythic8stat2);
    mydata['mythic8stat3'] = String(args.mythic8stat3);

    mydata['bestdps'] = String(args.bestdps);
    mydata['besthps'] = String(args.besthps);

    mydata['ability1'] = String(args.ability1);
    mydata['ability2'] = String(args.ability2);
    mydata['ability3'] = String(args.ability3);
    mydata['ability4'] = String(args.ability4);
    mydata['ability5'] = String(args.ability5);
    mydata['aggro'] = String(args.aggro);

    var hardcore = 0;
    if(args.hardcore){
        hardcore = args.hardcore;
    }
    if (args.pn == ""){
        return;
    }

    //$.Msg("Save Char function, js");

    //$.Msg( mydata['mythic1'] );
    //$.Msg( mydata['mythic1stat1'] );
    //$.Msg( mydata['mythic1stat2'] );
    //$.Msg( mydata['mythic1stat3'] );
    //$.Msg( mydata['mythic2'] );
    //$.Msg( mydata['mythic2stat1'] );
    //$.Msg( mydata['mythic2stat2'] );
    //$.Msg( mydata['mythic2stat3'] );
    
    if(temple_version == 2){
        mydata['slot7'] = String(args.slot7);
        mydata['slot8'] = String(args.slot8);
        mydata['slot9'] = String(args.slot9);
        mydata['slot10'] = String(args.slot10);
        mydata['slot11'] = String(args.slot11);
        mydata['slot12'] = String(args.slot12);
        mydata['slot13'] = String(args.slot13);
        mydata['slot14'] = String(args.slot14);
        mydata['slot15'] = String(args.slot15);
        mydata['kills'] = String(args.kills);
        mydata['lives'] = String(args.lives);
        mydata['pathpoints'] = String(args.pathpoints);
        for (var i = 16; i <= 39; i++) {
            mydata['slot'+i] = String(args['slot'+i]);
        }
        $.Msg(mydata['slot16']);
        $.Msg(mydata['slot17']);
        if (hardcore == 1){
            /*
				Valve removed AsyncWebRequest
            $.AsyncWebRequest('http://catze.eu/savechar_v10_hardcore.php',
            {
                type: 'POST',
                data: mydata,
                success: function (data) {
                $.Msg('GDS Reply for save hardcore char: ', data)
                SaveCharReply(data);
            }
            }); */
        }else if(hardcore == 2){
			/*
				Valve removed AsyncWebRequest
            $.AsyncWebRequest('http://catze.eu/savechar_v10_challenge.php',
            {
                type: 'POST',
                data: mydata,
                success: function (data) {
                $.Msg('GDS Reply for save char: ', data)
                SaveCharReply(data);
            }
            }); */
        }else{
            if (true){
				/*
					Valve removed AsyncWebRequest
                $.AsyncWebRequest('http://catze.eu/savechar_v18_season_3.php',
                {
                    type: 'POST',
                    data: mydata,
                    success: function (data) {
                    $.Msg('GDS Reply for save char: ', data)
                    SaveCharReply(data);
                }
                }); */
            }else{
				/*
					Valve removed AsyncWebRequest
                $.AsyncWebRequest('http://catze.eu/savechar_v14.php',
                {
                    type: 'POST',
                    data: mydata,
                    success: function (data) {
                    $.Msg('GDS Reply for save char: ', data)
                    SaveCharReply(data);
                }
                }); */
            }
        }
    }else{
		/*
			Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/savechar.php',
        {
            type: 'POST',
            data: mydata,
            success: function (data) {
            $.Msg('GDS Reply for save char: ', data)
            SaveCharReply(data);
        }
        }); */
    } 
}

function SaveCharReply(args)
{ 
    //$.Msg("Saved Char, reply received");
    //$.Msg(args);
    GameEvents.SendCustomGameEventToServer( "savecharsuccess", { "player_id" : Players.GetLocalPlayer()} );
}

function LoadChar(args)
{   
    ladder = Game.GetAllPlayerIDs().length;
    
    //var pid = new Array(ladder);
    var mydata = {};
    mydata['order'] = "loadchar";
    mydata['pid'] = String(args.playerid);
    mydata['hero'] = String(args.hero);
    var hardcore = false;
    if(args.hardcore && args.hardcore == 1){
        hardcore = true;
    }
    //$.Msg( "Load Char sending");

    if(temple_version == 2){
        if (hardcore){
			/*
				Valve removed AsyncWebRequest
            $.AsyncWebRequest('http://catze.eu/loadchar_v8_hardcore.php',
            {
                type: 'POST',
                data: mydata,
                success: function (data) {
                //$.Msg('GDS Reply for load hardcore char: ', data)
                LoadCharReply(data);
            }
            }); */
        }else{
            if (true){//(Game.GetMapInfo()['map_display_name'] == "titanbreaker_season_2"){
				/*
					Valve removed AsyncWebRequest
                $.AsyncWebRequest('http://catze.eu/loadchar_v13_season_3.php',
                {
                    type: 'POST',
                    data: mydata,
                    success: function (data) {
                    //$.Msg('GDS Reply for load char: ', data)
                    LoadCharReply(data);
                }
                }); */
            }else{
				/*
					Valve removed AsyncWebRequest
                $.AsyncWebRequest('http://catze.eu/loadchar_v10.php',
                {
                    type: 'POST',
                    data: mydata,
                    success: function (data) {
                    //$.Msg('GDS Reply for load char: ', data)
                    LoadCharReply(data);
                }
                }); */
            }
        }

    }else{
		/*
			Valve removed AsyncWebRequest
        $.AsyncWebRequest('http://catze.eu/loadchar.php',
        {
            type: 'POST',
            data: mydata,
            success: function (data) {
            //$.Msg('GDS Reply for load char: ', data)
            LoadCharReply(data);
        }
        }); */
    } 
}

function LoadCharReply(data)
{ 
    //$.Msg("Loaded Char, reply received");
    var data2 = String(data);
    data2 = data2.substring(0, data2.length - 8);
    //$.Msg(data.length);
    GameEvents.SendCustomGameEventToServer( "loadchardata", { data: data2} );
}

function UpdateBossScore(args)
{ 
    var score = args.value;
    var kills = args.kills;
    var progress = args.progress;
    var msg = "Boss Kills: ";
    msg = msg.concat(String(kills));
    msg = msg.concat(" \nKill Score: ");
    msg = msg.concat(String(score));
    msg = msg.concat(" \nProgress: ");
    msg = msg.concat(String(progress));
    msg = msg.concat("%");
    $("#bossscore").text = msg;
}

function UpdateMythicDust(args)
{ 
    var dust = args.value;
    var msg = "Mythic Dust: ";
    msg = msg.concat(String(dust));
    $("#mythic_dust").text = msg;
}

function SellTempleItem1()
{   
    lasttempledrop = "";
    lasttempledropgold = 0.0;
    $("#sellvalue").text = "";
    $("#sellitemicon").SetImage("");
    GameEvents.SendCustomGameEventToServer( "selltempleitem", { "player_id" : Players.GetLocalPlayer(), "itemslot" : 1 } );
}

function SellTempleItem2()
{   
    $("#sellvalue2").text = "";
    $("#sellitemicon2").SetImage("");
    GameEvents.SendCustomGameEventToServer( "selltempleitem", { "player_id" : Players.GetLocalPlayer(), "itemslot" : 2 } );
}


function RemoveTempleHeroAbility()
{   
    GameEvents.SendCustomGameEventToServer( "removetempleheroability", { "player_id" : Players.GetLocalPlayer() } );
}

function SellMythicWeapon()
{   
    $.FindChildInContext("#WeaponDropDisplay").visible = false;
    GameEvents.SendCustomGameEventToServer( "sellmythicweapon", { "player_id" : Players.GetLocalPlayer() } );
}

function SellArtifact(index, sellValue)
{   
    GameEvents.SendCustomGameEventToServer( "sellmythicweapon", { "player_id" : Players.GetLocalPlayer(), "index" : index, "sellValue": sellValue } );
}

function EquipMythicWeapon(index)
{   
    //$.FindChildInContext("#WeaponDropDisplay").visible = false;
    GameEvents.SendCustomGameEventToServer( "equipmythicweapon", { "player_id" : Players.GetLocalPlayer(), "index" : index } );
}

function RecoverArtifact(slot)
{   
    //$.FindChildInContext("#WeaponDropDisplay").visible = false;
    GameEvents.SendCustomGameEventToServer( "recover_artifact", { "player_id" : Players.GetLocalPlayer(), "slot" : slot } );
}

var lasttempledrop = "";
var lasttempledropgold = 0.0;

function NewTempleDrop(args)
{ 
    //gold
    var value = "Gold: ";
    var chance = args.gold;
    if (chance < 1.0){
        chance = 1;
        //value = "Chance for 1 Gold: ";
        //chance = chance * 100.0;
        //chance = chance.toFixed(0);
        //value = value.concat((String)(chance));
        //value = value.concat("%");
    }
    chance = chance.toFixed(2);
    value = value.concat((String)(chance));
    $("#sellvalue").text = value;

    //image
    var im = "file://{images}/items/fixe/";
    im = im.concat(args.item);
    im = im.concat(".png");
    $("#sellitemicon").SetImage(im);

    //old item, move down
    //gold
    if (lasttempledropgold != 0.0){
        value = "Gold: ";
        chance = lasttempledropgold;
        if (chance < 1.0){
            chance = 1;
            //value = "Chance for 1 Gold: ";
            //chance = chance * 100.0;
            //chance = chance.toFixed(0);
            //value = value.concat((String)(chance));
            //value = value.concat("%");
        }
        chance = chance.toFixed(2);
        value = value.concat((String)(chance));
        $("#sellvalue2").text = value;

        //image
        var im = "file://{images}/items/fixe/";
        im = im.concat(lasttempledrop);
        im = im.concat(".png");
        $("#sellitemicon2").SetImage(im);
    }

    //save data
    lasttempledrop = args.item;
    lasttempledropgold = args.gold;
}


//inventory system
var inventory;
var hero_stats;
var runeword;
var pathword;
var runeword_id;
var pathword_id;
var main_stats;
var gold_stat;
var selectedHeroPlayerID = 0;

function GetItemTypeNameBySlot(slot){
    if(slot == 1){
        return "[Main Hand]";
    }
    if(slot == 2){
        return "[Off Hand]";
    }
    if(slot == 3){
        return "[Ring]";
    }
    if(slot == 4){
        return "[Head]";
    }
    if(slot == 5){
        return "[Chest]";
    }
    if(slot == 6){
        return "[Boots]";
    }
    if(slot == 7){
        return "[Shoulder]";
    }
    if(slot == 8){
        return "[Amulet]";
    }
    if(slot == 9){
        return "[Gloves]";
    }
    if(slot == 10){
        return "[Legs]";
    }
    if(slot == 11){
        return "[Cape]";
    }
    return "";
}

function NewWeaponDrop(args)
{ 
    //$.Msg("wpn drop");
    var player = args.playerid;
    $("#weapondroptype").text = GetItemTypeNameBySlot(args.slot);
    $("#weapondropname").text = args.itemname;

    $("#weapondropname").RemoveClass("WeaponHeaderEpic");
    $("#weapondropname").RemoveClass("WeaponHeaderLeg");
    $("#weapondropname").RemoveClass("WeaponHeaderIm");
    $("#weapondropname").RemoveClass("WeaponHeaderWhite");
    if(args.rarity == "epic"){
        $("#weapondropname").AddClass("WeaponHeaderEpic");
        $("#sellvalue3").text = "10 Gold";
    }
    if(args.rarity == "leg"){
        $("#weapondropname").AddClass("WeaponHeaderLeg");
        $("#sellvalue3").text = "100 Gold";
    }
    if(args.rarity == "im"){
        $("#weapondropname").AddClass("WeaponHeaderIm");
        $("#sellvalue3").text = "1000 Gold";
    }
    if(args.rarity == "aim"){
        $("#weapondropname").AddClass("WeaponHeaderAim");
        $("#sellvalue3").text = "2000 Gold";
    }
    if(args.rarity == "divi"){
        $("#weapondropname").AddClass("WeaponHeaderDivi");
        $("#sellvalue3").text = "3000 Gold";
    }

    //image
    var im = "file://{images}/items/fixe/";
    if(args.slot != 7){
        im = im.concat(args.item);
        im = im.concat(".png");
    }else{
        var suffix = args.item.substring(14, 17);
        im = im.concat(suffix);
        im = im.concat(".png");
    }
    $("#weapondropimage").SetImage(im);

    //text depends on item
    //1
    var text = "+ ";
    text = text.concat((String)(args.stat1));
    text = text.concat(args.stat1name);
    $("#weapondropstats1").text = text;
    //2
    text = "+ ";
    text = text.concat((String)(args.stat2));
    text = text.concat(args.stat2name);
    $("#weapondropstats2").text = text;
    //3
    if(args.attributes == 3){
        text = "+ ";
        text = text.concat((String)(args.stat3));
        text = text.concat(args.stat3name);
        $("#weapondropstats3").text = text;
    }else if(args.attributes == 2){
        text = "";
        $("#weapondropstats3").text = text;
    }else {
        text = "";
        $("#weapondropstats2").text = text;
        $("#weapondropstats3").text = text;
    }
    $("#weapondropilevel").text = args.ilevel;
    $.FindChildInContext("#WeaponDropDisplay").visible = true;
}

function DPSMeterReported(args){
    var aggro = new Array(5);
    aggro[0] = args.aggro1;
    aggro[1] = args.aggro2;
    aggro[2] = args.aggro3;
    aggro[3] = args.aggro4;
    aggro[4] = args.aggro5;
    var hero = new Array(5);
    hero[0] = args.playerid1;
    hero[1] = args.playerid2;
    hero[2] = args.playerid3;
    hero[3] = args.playerid4;
    hero[4] = args.playerid5;
    //var bar_width = $("#aggrometer").GetParent().actuallayoutwidth-15;
    var bar_width = 150;
    var stretch_factor;
    if(aggro[0] && aggro[0] > 0.0){
        stretch_factor = bar_width / aggro[0];
    }else{
        stretch_factor = bar_width;
    }
    for (var i = 1; i <= 5; i++) {
        var panel = $('#aggro'+i);
        var heroimage = $('#player'+i);
        if(i==1){
            panel.style.width = String(bar_width)+'px';
        }else{
            var finalWidth = stretch_factor*aggro[i-1];
            if(finalWidth < 1){
                finalWidth = 1;
            }
            panel.style.width = String(finalWidth)+'px';
        }
        heroimage.heroimagestyle = "icon";
        heroimage.heroname = hero[i-1];
        heroimage.hittest = false;
    }
}


function MonsterSpellcast(args)
{ 
    var panel = $('#monsterspells');
    var newNotification = $.CreatePanel('Panel', panel, '');
    newNotification.AddClass("MonsterSpellcastSpell");
    var title = $.CreatePanel('Label', newNotification, '');
    title.text = ""; // $.Localize( "DOTA_Tooltip_ability_".concat(args.ability));
    title.style.horizontalAlign = "center";
    title.style.color = "orange";
    var ability = $.CreatePanel('DOTAAbilityImage', newNotification, '');
    ability.abilityname = args.ability;
    ability.style.horizontalAlign = "center";
    ability.style.width = "64px";
    ability.style.height = "64px";

    $.Schedule(3, function(){
        newNotification.deleted = true;
        newNotification.DeleteAsync(0);
    });
}

function MonsterAffixDisplay(args)
{ 
    var monstertype = args.monstertype;
    var color = "lightgrey";
    var name_prefix = "";
    var duration = 3;
    var show_3d_model = true;
    if (monstertype == 2){
        color = "#33ff33";
        name_prefix = "[Champion] ";
        duration = 10;
        show_3d_model = true;
    }
    if (monstertype == 3){
        color = "#ff9933";
        name_prefix = "[Boss] ";
        duration = 5;
        show_3d_model = true;
    }
    if (monstertype == 4){
        color = "#33ccff";
        name_prefix = "[Titan] ";
        duration = 10;
        show_3d_model = true;
    }
    var panel = $('#monsterspells');
    var newNotification = $.CreatePanel('Panel', panel, '');
    newNotification.AddClass("MonsterSpellcastSpells");
    newNotification.style.borderColor = color;
    newNotification.style.flowChildren = "right";

    var leftPanel = $.CreatePanel('Panel', newNotification, '');
    var rightPanel = $.CreatePanel('Panel', newNotification, '');
    rightPanel.style.flowChildren = "down";

    //newNotification.style.width = "400px";
    var title = $.CreatePanel('Label', rightPanel, '');
    title.text = name_prefix; // + $.Localize( args.unit);
    title.style.horizontalAlign = "left";
    title.style.color = color;
    title.style.fontSize = "24px";
    //title.style.marginLeft = "5px";
    title.style.marginRight = "5px";

    var spellrow = $.CreatePanel('Panel', rightPanel, '');
    spellrow.style.flowChildren = "right";
    spellrow.style.horizontalAlign = "left";

    if(show_3d_model){
        //var previewPanel = $.CreatePanel("Panel", leftPanel, "HeroPreview");
        //previewPanel.BLoadLayoutFromString('<root><Panel><DOTAScenePanel style="width: 120px; height: 100px;" unit="'+args.unit+'"/></Panel></root>', false, false );
    }

    if(args.ability1 && args.ability1 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability1;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }
    if(args.ability2 && args.ability2 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability2;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }
    if(args.ability3 && args.ability3 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability3;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }
    if(args.ability4 && args.ability4 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability4;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }
    if(args.ability5 && args.ability5 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability5;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }
    if(args.ability6 && args.ability6 != ""){
        var ability = $.CreatePanel('DOTAAbilityImage', spellrow, '');
        ability.abilityname = args.ability6;
        ability.style.horizontalAlign = "center";
        ability.style.width = "64px";
        ability.style.height = "64px";
    }

    $.Schedule(duration, function(){
        newNotification.deleted = true;
        newNotification.DeleteAsync(0);
    });
}

function AddItemToSellList(args)
{ 
    var panel = $('#WeaponListStart');
    var lastNotification = panel.GetChild(panel.GetChildCount() - 1)
    //$.Msg("panels");
    //$.Msg(panel.GetChildCount());
    //create panels

    if(args.is_artifact == 1){
        var sell_list_index = args.sell_list_index;
        var newNotification = $.CreatePanel('Panel', panel, '');
        var title = $.CreatePanel('Label', newNotification, '');
        var itemtype = $.CreatePanel('Label', newNotification, '');
        var ilevel = $.CreatePanel('Label', newNotification, '');
        var image = $.CreatePanel('Image', newNotification, '');
        var stats1 = $.CreatePanel('Label', newNotification, '');
        var stats2;
        var stats3
        if(args.attributes >= 2){
            stats2 = $.CreatePanel('Label', newNotification, '');
        }
        if(args.attributes >= 3){
            stats3 = $.CreatePanel('Label', newNotification, '');
        }
        var sell_price = "0 Gold";
        if(args.rarity == "epic"){
            sell_price = "2 Gold";
        }else if(args.rarity == "leg"){
            sell_price = "5 Gold";
        }else if(args.rarity == "im"){
            sell_price = "25 Gold";
        }
        if(args.rarity == "aim"){
            sell_price = "50 Gold";
        }
        if(args.rarity == "divi"){
            sell_price = "100 Gold";
        }
        if(args.rarity == "myth"){
            sell_price = "500 Gold";
        }

        //set values
        newNotification.AddClass('WeaponDrop');

        //equip and sell button
        var equip_panel = $.CreatePanel('Panel', newNotification, '');
        equip_panel.AddClass("SellPanel");
        equip_panel.style.width = "100%";
        equip_panel.style.marginTop = "10px";
        var equip_button = $.CreatePanel('Button', equip_panel, '');
        equip_button.AddClass("SellButton");
        equip_button.style.width = "100%";
        var equip_button_text = $.CreatePanel('Label', equip_button, '');
        equip_button_text.AddClass("ButtTextBigGold");
        equip_button_text.style.width = "100%";
        var equip_button_text_2 = $.CreatePanel('Label', equip_button, '');
        equip_button_text_2.AddClass("ButtTextMediumGold");
        equip_button_text.text = "Equip";
        equip_button_text_2.text = "Replaces current";
        equip_button_text.style.color = "orange";
        equip_button_text_2.style.color = "red";
        //equip_button_text_2.style.textAlign = "center";
        equip_button.SetPanelEvent(
          "onmouseactivate", 
          function(){
            EquipMythicWeapon(sell_list_index);
            newNotification.deleted = true;
            newNotification.DeleteAsync(0);
          }
        )
        var sell_panel = $.CreatePanel('Panel', newNotification, '');
        sell_panel.AddClass("SellPanel");
        sell_panel.style.width = "100%";
        sell_panel.style.marginTop = "5px";
        var sell_button = $.CreatePanel('Button', sell_panel, '');
        sell_button.AddClass("SellButton");
        sell_button.style.width = "100%";
        var sell_button_text = $.CreatePanel('Label', sell_button, '');
        sell_button_text.AddClass("ButtTextBigGold");
        sell_button_text.style.width = "100%";
        var sell_button_text_2 = $.CreatePanel('Label', sell_button, '');
        sell_button_text_2.AddClass("ButtTextMediumGold");
        sell_button_text.text = "Sell";
        sell_button_text_2.text = sell_price;
        sell_button.SetPanelEvent(
          "onmouseactivate", 
          function(){
            SellArtifact(sell_list_index, -1);
            newNotification.deleted = true;
            newNotification.DeleteAsync(0);
          }
        )

        title.html = true;
        title.text = args.itemname;
        title.hittest = false;
        title.AddClass('WeaponHeaderWhite');
        //$.Msg(args.rarity);
        if(args.rarity == "epic"){
            title.AddClass('WeaponHeaderEpic');
        }else if(args.rarity == "leg"){
            title.AddClass('WeaponHeaderLeg');
        }else if(args.rarity == "im"){
            title.AddClass('WeaponHeaderIm');
        }else if(args.rarity == "aim"){
            title.AddClass('WeaponHeaderAim');
        }else if(args.rarity == "divi"){
            title.AddClass('WeaponHeaderDivi');
        }else if(args.rarity == "myth"){
            title.AddClass('WeaponHeaderMyth');
        }

        itemtype.html = true;
        itemtype.hittest = false;
        itemtype.AddClass('WeaponHeaderSmall');
        itemtype.text = GetItemTypeNameBySlot(args.slot);

        ilevel.html = true;
        ilevel.text = args.ilevel;
        ilevel.hittest = false;
        ilevel.AddClass('WeaponHeaderSmallYellow');

        image.hittest = false;
        image.AddClass('WeaponImageSmall');
        //$.Msg("wpn type " + args.weapontype);
        $.Msg(GetImagePathForArtifact(args.item, args.slot, args.rarity, args.weapontype));
        var im = GetImagePathForArtifact(args.item, args.slot, args.rarity, args.weapontype);
        image.SetImage(im);

        var text = "+ ";
        text = text.concat((String)(args.stat1));
        text = text.concat(args.stat1name);
        stats1.html = true;
        stats1.text = text;
        stats1.hittest = false;
        stats1.AddClass('WeaponStats');

        

        if(args.attributes >= 2){
            text = "+ ";
            text = text.concat((String)(args.stat2));
            text = text.concat(args.stat2name);
            stats2.html = true;
            stats2.text = text;
            stats2.hittest = false;
            stats2.AddClass('WeaponStats');
        }
        if(args.attributes >= 3){
            text = "+ ";
            text = text.concat((String)(args.stat3));
            text = text.concat(args.stat3name);
            stats3.html = true;
            stats3.text = text;
            stats3.hittest = false;
            stats3.AddClass('WeaponStats');
        }
    }else{
        //normal item
        var sell_list_index = args.sell_list_index;
        var newNotification = $.CreatePanel('Panel', panel, '');
        var title = $.CreatePanel('Label', newNotification, '');
        var image = $.CreatePanel('DOTAItemImage', newNotification, '');  //$.CreatePanel('Image', newNotification, '');
        image.style.horizontalAlign = "center";
        image.itemname = args.itemname;
        var sell_value = args.slot;
        var item_quality = args.rarity;
        if(sell_value <= 1){
            sell_value = 1;
            //sell_price = ("Chance for "+(String)(sell_value)).concat(" Gold");
        }
        var sell_price = ((String)(sell_value)).concat(" Gold");
        

        title.html = true;
        title.text = $.Localize( "#DOTA_Tooltip_ability_".concat(args.itemname));
        //title.fontWeight = "1800";
        title.hittest = false;
        title.style.horizontalAlign = "center";
        title.style.marginTop = "5px";
        title.style.marginBottom = "5px";


        /*title.AddClass('WeaponHeaderWhite');
        $.Msg(args.rarity);
        if(args.rarity == "epic"){
            title.AddClass('WeaponHeaderEpic');
        }else if(args.rarity == "leg"){
            title.AddClass('WeaponHeaderLeg');
        }else if(args.rarity == "im"){
            title.AddClass('WeaponHeaderIm');
        }
        if(args.rarity == "aim"){
            title.AddClass('WeaponHeaderAim');
        }*/
        
        /*
        if(item_quality == "6"){
            sell_price = "1000 Gold";
        }else if(item_quality == "5"){
            sell_price = "100 Gold";
        }else if(item_quality == "4"){
            sell_price = "10 Gold";
        }
        if(item_quality == "7"){
            sell_price = "2500 Gold";
        }
        */

        //set values
        newNotification.AddClass('WeaponDrop');

        //equip and sell button
        var equip_panel = $.CreatePanel('Panel', newNotification, '');
        equip_panel.AddClass("SellPanel");
        equip_panel.style.width = "100%";
        equip_panel.style.marginTop = "10px";
        var equip_button = $.CreatePanel('Button', equip_panel, '');
        equip_button.AddClass("SellButton");
        equip_button.style.width = "100%";
        var equip_button_text = $.CreatePanel('Label', equip_button, '');
        equip_button_text.AddClass("ButtTextBigGold");
        var equip_button_text_2 = $.CreatePanel('Label', equip_button, '');
        equip_button_text_2.AddClass("ButtTextMediumGold");
        equip_button_text.text = "Keep";
        equip_button_text_2.text = " ";
        //equip_button_text_2.style.textAlign = "center";
        equip_button.SetPanelEvent(
          "onmouseactivate", 
          function(){
            //EquipMythicWeapon(sell_list_index);
            newNotification.deleted = true;
            newNotification.DeleteAsync(0);
          }
        )
        var sell_panel = $.CreatePanel('Panel', newNotification, '');
        sell_panel.AddClass("SellPanel");
        sell_panel.style.width = "100%";
        sell_panel.style.marginTop = "5px";
        var sell_button = $.CreatePanel('Button', sell_panel, '');
        sell_button.AddClass("SellButton");
        sell_button.style.width = "100%";
        var sell_button_text = $.CreatePanel('Label', sell_button, '');
        sell_button_text.AddClass("ButtTextBigGold");
        var sell_button_text_2 = $.CreatePanel('Label', sell_button, '');
        sell_button_text_2.AddClass("ButtTextMediumGold");
        sell_button_text.text = "Sell";
        sell_button_text_2.text = sell_price;
        sell_button.SetPanelEvent(
          "onmouseactivate", 
          function(){
            SellArtifact(sell_list_index, sell_value);
            newNotification.deleted = true;
            newNotification.DeleteAsync(0);
          }
        )
        /*
        image.hittest = false;
        image.AddClass('WeaponImageSmall');
        var im = "file://{images}/items/fixe/";
        im = im.concat(args.itemname.substring(5, args.itemname.length));
        im = im.concat(".png");
        image.SetImage(im);
        */
    }
}

function PickupAllItemsOnGround(droppedOnly){
    GameEvents.SendCustomGameEventToServer( "pickupallitems", { "player_id": Players.GetLocalPlayer(), "droppedonly": droppedOnly} );
}

function MoveItemToStash(args){
    GameEvents.SendCustomGameEventToServer( "moveitemtostash", { "player_id": Players.GetLocalPlayer() } );
}

var blacksmithFilterTextField = $("#BlacksmithSearchBar");
var blacksmithItemsContainer = $("#blacksmithItemsList");
var previousBlacksmithFilterText = "";
var blacksmithFilterTickRate = 0.05;
var blacksmithFilterStarted = false;
var blacksmithKnownItems = [];

// Fix for tools mode (removes blacksmith items on every panorama reload to prevent out of memory)
if(Game.IsInToolsMode())
{
    blacksmithItemsContainer.RemoveAndDeleteChildren();
}

function ToggleBlacksmith() {
    $.FindChildInContext("#shopMain").visible = !$.FindChildInContext("#shopMain").visible;

    // Any existing item/ability panel (even hidden) causing heavy client lags when using lua SwapAbilities (thanks valve)
    // So we forced to destroy and recreate all item panels on tab open/close to fix lags for heroes with abilities switch (thanks valve)
    // I hope it will not destroy potato pc fps
    if(!$.FindChildInContext("#shopMain").visible) {
        blacksmithItemsContainer.RemoveAndDeleteChildren();
        blacksmithItemsContainer.shopItems = [];
    } else {
        for (const [_, itemData] of Object.entries(blacksmithKnownItems)) {
            AddItemToShop(itemData);
        }
    }
}

function AddItemsToShop(args){
    for (const [_, itemData] of Object.entries(args)) {
        blacksmithKnownItems.push(itemData);
    }

    if(!blacksmithFilterStarted)
    {
        $.Schedule(blacksmithFilterTickRate, TryApplyBlacksmithFilter);
        blacksmithFilterStarted = true;
    }
}

function TryApplyBlacksmithFilter()
{
    let currentFilterText = blacksmithFilterTextField.text.toLowerCase();

    var shopItems = blacksmithItemsContainer.shopItems;

    if(shopItems != undefined && shopItems.length > 0)
    {  
        if(currentFilterText != previousBlacksmithFilterText)
        {
            if(currentFilterText.length > 0)
            {
                for (const [_, itemPanel] of Object.entries(shopItems)) {
                    var isIncludedInFilterText = itemPanel.itemSearchText != undefined && itemPanel.itemSearchText.includes(currentFilterText) == true;
                    itemPanel.SetHasClass("Hidden", !isIncludedInFilterText);
                }
            } else
            {
                for (const [_, itemPanel] of Object.entries(shopItems)) {
                    itemPanel.SetHasClass("Hidden", false);
                }
            }

            
        previousBlacksmithFilterText = currentFilterText;
        }  
    }

    $.Schedule(blacksmithFilterTickRate, TryApplyBlacksmithFilter);
}

function AddItemToShop(args){ 
    var itemPanel = $.CreatePanel('Panel', blacksmithItemsContainer, '');
    itemPanel.BLoadLayoutSnippet("BlacksmithItem");

    let itemIcon = itemPanel.FindChildTraverse("itemIcon");
    itemIcon.itemname = args.item;

    let itemPrice = itemPanel.FindChildTraverse("itemPriceLabel");
    itemPrice.text = args.cost;

    let itemButton = itemPanel.FindChildTraverse("buyButton");
    itemButton.SetPanelEvent(
        "onmouseactivate", 
        function(){
            BuyNormalItem(args.item, args.rarity);
        }
    )

    var isRecipe = args.item.length >= 14 && args.item.slice(5, 11) == "recipe";
    var itemName = isRecipe ? args.item.replace("item_recipe", "item") : args.item;

    itemPanel.itemSearchText = ((isRecipe ? "recipe" : "") + $.Localize("#dota_tooltip_ability_" + itemName)).toLowerCase();

    if(blacksmithItemsContainer.shopItems == undefined)
    {
        blacksmithItemsContainer.shopItems = [];
    }

    blacksmithItemsContainer.shopItems.push(itemPanel);
}

function BuyNormalItem(item, rarity){
    GameEvents.SendCustomGameEventToServer( "buynormalitem", { "player_id": Players.GetLocalPlayer(), "item": item, "rarity": rarity } );
}

let autoSellItemsContainer = $("#autoSellItemsList");
let autoSellItemsPanels = {};

// Fix for tools mode (removes auto sell stash items on every panorama reload to prevent out of memory)
if(Game.IsInToolsMode())
{
    autoSellItemsContainer.RemoveAndDeleteChildren();
}

function ToggleAutoSellStash() {
    let autoSellStash = $.FindChildInContext("#autoSellStash");
    autoSellStash.visible = !autoSellStash.visible;

    // Any existing item/ability panel (even hidden) causing heavy client lags when using lua SwapAbilities (thanks valve)
    // So we forced to destroy and recreate all item panels on tab open/close to fix lags for heroes with abilities switch (thanks valve)
    // I hope it will not destroy potato pc fps
    if(!autoSellStash.visible) {
        autoSellItemsContainer.RemoveAndDeleteChildren();
    } else {
        for (const [_, itemData] of Object.entries(autoSellItemsPanels)) {
            AddAutoSellItemPanel(itemData);
        }
    }
}

function AddAutoSellItemPanel(args)
{
    var itemPanel = $.CreatePanel('Panel', autoSellItemsContainer, '');
    itemPanel.BLoadLayoutSnippet("BlacksmithItem");

    let itemIcon = itemPanel.FindChildTraverse("itemIcon");
    itemIcon.itemname = args.item.itemName;

    let itemPrice = itemPanel.FindChildTraverse("itemPriceLabel");
    itemPrice.text = args.item.gold;

    let itemButton = itemPanel.FindChildTraverse("buyButton");
    itemButton.SetPanelEvent(
        "onmouseactivate", 
        function()
        {
            GameEvents.SendCustomGameEventToServer("buyautosellstashitem", { "player_id": Players.GetLocalPlayer(), "key": args.key } );
        }
    )
}

function OnAutoSellStashItem(args)
{
    autoSellItemsPanels[args.key] = args;
}

function OnAutoSellStashItemBought(args)
{
    if(autoSellItemsPanels[args.key] != undefined) {
        autoSellItemsPanels[args.key].DeleteAsync(0);
        autoSellItemsPanels[args.key] = undefined;
    }
}

function AdditemToActEnterMsg(args){
    var panel = $('#actenteritems');
    //check if we need new row
    if(last_act_enter_item_panel_artifact == null || last_act_enter_item_panel_artifact.GetChildCount() % 9 == 8){
        var newRow = $.CreatePanel('Panel', panel, '');
        newRow.AddClass("TableRow");
        last_act_enter_item_panel_artifact = newRow;
    }
    panel = last_act_enter_item_panel_artifact;
    if(panel == null){
        return;
    }
    var newNotification = $.CreatePanel('DOTAItemImage', panel, '');
    newNotification.itemname = args.item;
}

function AddItemToDropTable(args)
{ 
    
    //var lastNotification = panel.GetChild(panel.GetChildCount() - 1)
    //$.Msg("panels");
    //$.Msg(panel.GetChildCount());
    //create panels
    var spectatorid = Game.GetLocalPlayerID();
    spectator = Players.IsSpectator(spectatorid);
    if(args.observer == 1 && !spectator){
        //return; //test for my observing
    }
    if(args.is_artifact == 1){
        var panel = $('#loottableartifacts');
        //check if we need new row
        if(last_loot_table_panel_artifact == null || last_loot_table_panel_artifact.GetChildCount() % 8 == 7){
            var newRow = $.CreatePanel('Panel', panel, '');
            newRow.AddClass("TableRow");
            last_loot_table_panel_artifact = newRow;
        }
        panel = last_loot_table_panel_artifact;
        if(panel == null){
            return;
        }
        var newNotification = $.CreatePanel('Panel', panel, '');
        var title = $.CreatePanel('Label', newNotification, '');
        var itemtype = $.CreatePanel('Label', newNotification, '');
        var image = $.CreatePanel('Image', newNotification, '');
        var stats1 = $.CreatePanel('Label', newNotification, '');
        var stats2 = $.CreatePanel('Label', newNotification, '');
        if(args.attributes >= 3){
            var stats3 = $.CreatePanel('Label', newNotification, '');
        }

        //set values
        newNotification.AddClass('WeaponDrop');

        title.html = true;
        title.text = args.itemname;
        title.hittest = false;
        title.AddClass('WeaponHeaderWhite');
        //$.Msg(args.itemname);
        if(args.rarity == "epic"){
            title.AddClass('WeaponHeaderEpic');
        }else if(args.rarity == "leg"){
            title.AddClass('WeaponHeaderLeg');
        }else if(args.rarity == "im"){
            title.AddClass('WeaponHeaderIm');
        }else if(args.rarity == "aim"){
            title.AddClass('WeaponHeaderAim');
        }else if(args.rarity == "divi"){
            title.AddClass('WeaponHeaderDivi');
        }else if(args.rarity == "myth"){
            title.AddClass('WeaponHeaderMyth');
        }

        itemtype.html = true;
        itemtype.hittest = false;
        itemtype.AddClass('WeaponHeaderSmall');
        itemtype.text = GetItemTypeNameBySlot(args.slot);

        image.hittest = false;
        image.AddClass('WeaponImageSmall');
        var im = "file://{images}/items/fixe/";
        im = im.concat(args.item);
        im = im.concat(".png");
        image.SetImage(im);

        var text = "  ";
        text = text.concat(args.stat1name);
        stats1.html = true;
        stats1.text = text;
        stats1.hittest = false;
        stats1.AddClass('WeaponStats');

        text = "  ";
        text = text.concat(args.stat2name);
        stats2.html = true;
        stats2.text = text;
        stats2.hittest = false;
        stats2.AddClass('WeaponStats');

        if(args.attributes >= 3){
            text = "  ";
            text = text.concat(args.stat3name);
            stats3.html = true;
            stats3.text = text;
            stats3.hittest = false;
            stats3.AddClass('WeaponStats');
        }
    }else{
        var panel = $('#loottableitems');
        //check if we need new row
        if(last_loot_table_panel == null || last_loot_table_panel.GetChildCount() % 8 == 7){
            var newRow = $.CreatePanel('Panel', panel, '');
            newRow.AddClass("TableRow");
            last_loot_table_panel = newRow;
        }
        panel = last_loot_table_panel;
        if(panel == null){
            return;
        }
        //normal item
        var newNotification = $.CreatePanel('DOTAItemImage', panel, '');
        newNotification.itemname = args.item;


        /* old stuff, manual creation of item display
        var newNotification = $.CreatePanel('Panel', panel, '');
        var title = $.CreatePanel('Label', newNotification, '');
        var image = $.CreatePanel('Image', newNotification, '');
        var item_quality = args.rarity;

        //set values
        newNotification.AddClass('WeaponDrop');
        title.AddClass('WeaponHeaderIm');
        title.text = $.Localize( "DOTA_Tooltip_ability_".concat(args.item));
        image.hittest = false;
        image.AddClass('WeaponImageSmall');
        var im = "file://{images}/items/fixe/";
        im = im.concat(args.item.substring(5, args.item.length));
        im = im.concat(".png");
        image.SetImage(im);
        
        newNotification.SetPanelEvent(
          "onmouseover", 
          function(){
            DOTAShowAbilityTooltip("DOTA_Tooltip_ability_".concat(args.item));
          }
        )
        newNotification.SetPanelEvent(
          "onmouseout", 
          function(){

          }
        )
        */
    }
    
}

function ShowWeaponDropToAll(args) //actually used to show other players what you got?!
{ 
    var panel = $('#WeaponListStart');
    var lastNotification = panel.GetChild(panel.GetChildCount() - 1)
    //$.Msg("panels");
    //$.Msg(panel.GetChildCount());
    //create panels

    //$.Msg(args.playerid);
    //$.Msg(Game.GetLocalPlayerID());
    if(args.playerid == Game.GetLocalPlayerID()){
        //$.Msg("abort");
        return;
    }
    
    var newNotification = $.CreatePanel('Panel', panel, '');
    var heroimage = $.CreatePanel('DOTAHeroImage', newNotification, '');
    var title = $.CreatePanel('Label', newNotification, '');
    var itemtype = $.CreatePanel('Label', newNotification, '');
    var ilevel = $.CreatePanel('Label', newNotification, '');
    var image = $.CreatePanel('Image', newNotification, '');
    var stats1 = $.CreatePanel('Label', newNotification, '');
    var stats2 = $.CreatePanel('Label', newNotification, '');
    var stats3;
    if(args.attributes >= 3){
        stats3 = $.CreatePanel('Label', newNotification, '');
    }

    //set values
    newNotification.AddClass('WeaponDrop');
    newNotification.SetPanelEvent(
      "onmouseactivate", 
      function(){
        newNotification.deleted = true;
        newNotification.DeleteAsync(0);
      }
    )
    //newNotification.hittest = false;

    title.html = true;
    title.text = args.itemname;
    title.hittest = false;
    title.AddClass('WeaponHeaderWhite');
    if(args.rarity == "epic"){
        title.AddClass('WeaponHeaderEpic');
    }else if(args.rarity == "leg"){
        title.AddClass('WeaponHeaderLeg');
    }else if(args.rarity == "im"){
        title.AddClass('WeaponHeaderIm');
    }else if(args.rarity == "aim"){
        title.AddClass('WeaponHeaderAim');
    }else if(args.rarity == "divi"){
        title.AddClass('WeaponHeaderDivi');
    }else if(args.rarity == "myth"){
        title.AddClass('WeaponHeaderMyth');
    }

    heroimage.heroimagestyle = "icon";
    heroimage.heroname = args.heroname;
    heroimage.hittest = false;
    heroimage.AddClass('HeroIcon');

    itemtype.html = true;
    itemtype.hittest = false;
    itemtype.AddClass('WeaponHeaderSmall');
    itemtype.text = GetItemTypeNameBySlot(args.slot);

    ilevel.html = true;
    ilevel.text = args.ilevel;
    ilevel.hittest = false;
    ilevel.AddClass('WeaponHeaderSmallYellow');

    image.hittest = false;
    image.AddClass('WeaponImageSmall');
    var im = GetImagePathForArtifact(args.item, args.slot, args.rarity, args.weapontype);

    image.SetImage(im);

    var text = "+ ";
    text = text.concat((String)(args.stat1));
    text = text.concat(args.stat1name);
    stats1.html = true;
    stats1.text = text;
    stats1.hittest = false;
    stats1.AddClass('WeaponStats');

    if(args.attributes >= 2){
        text = "+ ";
        text = text.concat((String)(args.stat2));
        text = text.concat(args.stat2name);
        stats2.html = true;
        stats2.text = text;
        stats2.hittest = false;
        stats2.AddClass('WeaponStats');
    }

    if(args.attributes >= 3){
        text = "+ ";
        text = text.concat((String)(args.stat3));
        text = text.concat(args.stat3name);
        stats3.html = true;
        stats3.text = text;
        stats3.hittest = false;
        stats3.AddClass('WeaponStats');
    }

    //hide extra details
    itemtype.visible = false;
    ilevel.visible = false;
    stats1.visible = false;
    stats2.visible = args.attributes >= 2;
    if(args.attributes >= 3){
        stats3.visible = false;
    }
    newNotification.SetPanelEvent(
      "onmouseover", 
      function(){
        newNotification.RemoveClass("WeaponDrop");
        newNotification.AddClass('Weapon');
        heroimage.heroimagestyle = "landscape";
        itemtype.visible = true;
        ilevel.visible = true;
        stats1.visible = true;
        if(args.attributes >= 2){
            stats2.visible = true;
        }
        if(args.attributes >= 3){
            stats3.visible = true;
        }
      }
    )
    newNotification.SetPanelEvent(
      "onmouseout", 
      function(){
        newNotification.RemoveClass("Weapon");
        newNotification.AddClass('WeaponDrop');
        heroimage.heroimagestyle = "icon";
        itemtype.visible = false;
        ilevel.visible = false;
        stats1.visible = false;
        if(args.attributes >= 2){
            stats2.visible = false;
        }
        if(args.attributes >= 3){
            stats3.visible = false;
        }
      }
    )

    //Delete after time
    $.Schedule(30, function(){
      //$.Msg('callback')
      if (newNotification.deleted)
        return;
      
      newNotification.DeleteAsync(0);
    });
}

function StartStatsUpdateTimer(time) {
    if(time > 0){
        $.Schedule(0.09, function(){
            var panel = $('#stats_update_timer');
            panel.style.width = String(384*(31-time)/30)+'px';
            StartStatsUpdateTimer(time-0.1);
        });
    }
}

function UpdateHeroStatistics(args)
{ 
    //$.Msg("call update hero stats");
    var player = args.playerid;
    if(hero_stats == null){
        return;
    }
    if(player == null){
        return;
    }
    if(player < 0){
        return;
    }
    if(hero_stats[player] == null){
        return;
    }
    var myid = Players.GetLocalPlayer();
    if(player == myid){
        StartStatsUpdateTimer(30);
    }
    
    //$.Msg(args.abil);
    //$.Msg(args.ele);
    //$.Msg(args.crit_chance);
    //$.Msg(args.crit_dmg);
    //$.Msg(args.cd);
    //$.Msg(args.aggro);
    //$.Msg(args.dps);
    //$.Msg(args.hps);
    //save item data
    hero_stats[player][0] = "+ ".concat((String)(parseInt((args.abil-1)*100))).concat("%");
    hero_stats[player][1] = "+ ".concat((String)(parseInt((args.ele-1)*100))).concat("%");
    hero_stats[player][2] = "+ ".concat(((String)(parseInt((args.crit_chance - 1)*100)))).concat("%");
    hero_stats[player][3] = "+ ".concat(((String)(parseInt((args.crit_dmg - 1)*100)))).concat("%");
    hero_stats[player][4] = "+ ".concat(((String)(parseInt((args.heal)*100)))).concat("%");
    hero_stats[player][5] = "".concat(((String)(parseInt(args.cd*100)))).concat("%");
    hero_stats[player][6] = "".concat((String)(parseInt(args.aggro*100))).concat("%");
    hero_stats[player][7] = "".concat((String)(parseInt(args.dps)));
    hero_stats[player][8] = "".concat((String)(parseInt(args.hps)));
    hero_stats[player][9] = "Peak: ".concat((String)(parseInt(args.bestdps)));
    hero_stats[player][10] = "Peak: ".concat((String)(parseInt(args.besthps)));
    hero_stats[player][11] = "".concat((String)(parseInt(args.sp)));
    //hero_stats[player][12] = "+ ".concat((String)(parseInt((args.multiplicative-1)*100))).concat("%");
    hero_stats[player][13] = "+ ".concat((String)(parseInt((args.abil*args.ele-1)*100))).concat("%");
    UpdateInventory();
}

function SetPathword(args)
{ 
    var player = args.playerid;
    var word = args.pathword;
    if(inventory == null){
        return;
    }
    if(player == null){
        return;
    }
    if(player < 0){
        return;
    }
    pathword[player] = word;
    UpdateInventory();
}

function NewWeaponEquipped(args)
{ 
    var player = args.playerid;
    var slot = args.slot;

    //$.Msg("eq new weapon");
    //$.Msg(player);
    //$.Msg(slot);
    //$.Msg(args.itemname);
    if(inventory == null){
        return;
    }
    if(player == null){
        return;
    }
    if(player < 0){
        return;
    }
    if(slot == null){
        return;
    }
    if(slot < 0){
        return;
    }
    if(inventory[player] == null){
        return;
    }
    if(inventory[player][slot] == null){
        return;
    }

    //save item data
    inventory[player][slot][0] = args.itemname;
    inventory[player][slot][1] = args.item;
    inventory[player][slot][2] = slot;
    inventory[player][slot][3] = args.rarity;
    inventory[player][slot][4] = args.attributes;
    inventory[player][slot][5] = args.stat1;
    inventory[player][slot][6] = args.stat2;
    inventory[player][slot][7] = args.stat3;
    inventory[player][slot][8] = args.stat1name;
    inventory[player][slot][9] = args.stat2name;
    inventory[player][slot][10] = args.stat3name;
    inventory[player][slot][11] = args.ilevel;
    inventory[player][slot][12] = args.weapontype;


    //are we looking at that hero?

    UpdateInventory();

    //$.Msg("Inventory Print");
    /*
    for (var i = 0; i <= 20; i++) {
        $.Msg("PLAYER " + i);
        if(inventory[i] != null){
            for (var j = 1; j <= 2; j++) {
                $.Msg("SLOT " + j);
                if(inventory[i][j] != null){
                    for (var k = 0; k <= 10; k++) {
                        $.Msg("ROW " + k + ": " + inventory[i][j][k]);
                    }
                }
            }
        }
    }
    */
}

function RuneWordEquipped(args)
{ 
    var player = args.playerid;
    var power = args.power;
    if(runeword == null){
        return;
    }
    if(player == null){
        return;
    }
    if(player < 0){
        return;
    }
    if(power == null){
        return;
    }
    if(power < 1){
        return;
    }
    var runetext = "+ " + ((String)(power)) + " ";
    var text = "#rune"+args.word;
    runetext = runetext + $.Localize( text );

    //save data
    runeword[player] = runetext;
    runeword_id[player] = args.word;

    UpdateInventory();

}

function SetDifficultyModeText(mode){
    /*
    if(mode.value == 0){
        $("#diffiMode").text = "Apprentice";
        $("#diffiMode").style.color = "lime;"
    }
    if(mode.value == 1){
        $("#diffiMode").text = "Normal";
        $("#diffiMode").style.color = "yellow;"
    }
    if(mode.value == 2){
        $("#diffiMode").text = "Legend";
        $("#diffiMode").style.color = "violet;"
    }*/
    //$.Msg(mode.value);
    SetDifficultyMode(mode.value);
}

function SetTempleDifficulty(args)
{ 
    SetDifficultyModeText(args);
    var value = "Monster Level: "
    var chance = Math.round(args.value*100)/100; //parseInt(args.value);
    value = value.concat((String)(chance));
    //value = value.concat("%");
    $("#diffi").text = value;

    chance = 0.00005*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 200.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#mythical").text = value;

    chance = 0.0005 * args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 100.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#divine").text = value;


    chance = 0.03 * args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 5.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#immortal").text = value;
    chance = 0.15 *args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 1.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#legendary").text = value;
    chance = 0.75 *args.value;
    if (chance > 100.0){
        chance = 100;
    }
    //$.Msg(args.value);
    if (args.value < 1.0){
        chance = 0.0;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#epic").text = value;
    chance = 3 * args.value;
    if (chance > 100.0){
        chance = 100;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#rare").text = value;
    chance = 10*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    chance = chance.toFixed(0);
    value = (String)(chance);
    value = value.concat("%");
    $("#common").text = value;
    chance = exp_scale(args.value, 100, 0.15);
    if (chance < 25){
        chance = 25;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#Exp").text = value;
}

function exp_scale(x, xp, exp){
    return x * x * xp * exp + x * xp * (1-exp);
}

function GetLocalPlayerSelectedUnit() {
    let selectedUnit = Players.GetQueryUnit(Game.GetLocalPlayerID())
    if(selectedUnit < 0) {
        selectedUnit = Players.GetLocalPlayerPortraitUnit()
    }
    return selectedUnit;
}

function onUnitChanged(args)
{   
    //$.Msg("unit changed");
    var unit = GetLocalPlayerSelectedUnit();
    
    //$.Msg(unit);
    if (unit != null){
        //$.Msg("unit selected");
        //find player id
        var id = -1;
        for (var i = 0; i < 20; i++) {
            var unit2 = Players.GetPlayerHeroEntityIndex(i);
            //$.Msg(unit2);
            if(unit == unit2){
                id = i;
                break;
            }
        }
        if(id != -1){
            selectedHeroPlayerID = id;
            UpdateInventory();
            UpdateTalentTree(-1);
            // OLD STATS UI
            //UpdateMainStatsUI();
        }
    }//else{
    //    $("#selectedid").text = "selected unit: " + unit2;
    //}

    if(unit > -1) {
        UpdateMainStatsUI(unit);
        FixPanoramaStats(unit)
    }
}

function PeriodicUpdateStart(args){
    playerheroingame = true;
}

function FixPanoramaStats(unitForUpdate, data)
{
	let selectedUnit = GetLocalPlayerSelectedUnit();
	
	if(selectedUnit != unitForUpdate)
	{
		return;
	}
	
	let fixedPanoramaStats = data == undefined ? CustomNetTables.GetTableValue("panorama_hero_stats", selectedUnit.toString()) : data;
	
	// Non hero or something broken
	if(fixedPanoramaStats == undefined)
	{
		if(manaContainer != undefined)
		{
			manaContainer.style.visibility = "visible";
		}
		if(customManaContainer != undefined)
		{
			customManaContainer.style.visibility = "collapse";
		}
		return;
	}
	
	if(manaContainer != undefined)
	{
		manaContainer.style.visibility = "collapse";
	}
	if(customManaContainer != undefined)
	{
		customManaContainer.style.visibility = "visible";
	}
		
	if(healthRegenLabel != undefined)
	{
		healthRegenLabel.text = "+" + fixedPanoramaStats["health_regeneration"].toFixed(1)
	}
	
	if(customManaLabel != undefined)
	{
		customManaLabel.text = fixedPanoramaStats["current_mana"].toFixed(0) + " / " + fixedPanoramaStats["max_mana"].toFixed(0)
	}
	
	if(customManaRegenLabel != undefined)
	{
		let manaRegen = fixedPanoramaStats["mana_regen"];
		customManaRegenLabel.text = manaRegen > 0 ? ("+" + manaRegen.toFixed(1)) : manaRegen.toFixed(1);
	}
	
	if(customManaProgressBar != undefined)
	{
		customManaProgressBar.value = fixedPanoramaStats["current_mana"] / fixedPanoramaStats["max_mana"];
	}
}

function PeriodicUpdate(args)
{
    //$.Msg("uiupdate");
    $.Schedule(1, PeriodicUpdate);
    onUnitChanged(null);
    UpdateInventory();
    /*find selected unit
    if(spectator){
        onUnitChanged(null);
        UpdateInventory();
    }else{
        if (!playerheroingame){
            return;
        }
        var unit = GetSelectedUnit();
        if(unit == null || unit == -1){
            return;
        }
        if(lastSelectedUnit == null){
            lastSelectedUnit = unit;
        }
        if(lastSelectedUnit != null && lastSelectedUnit != unit){
            //unit did change
            //$.Msg("changed");
            lastSelectedUnit = unit;
            var id = -1;
            for (var i = 0; i < 20; i++) {
                var unit2 = Players.GetPlayerHeroEntityIndex(i);
                if(unit == unit2){
                    id = i;
                    //$.Msg("unit " + unit2);
                    //$.Msg("index " + i);
                    break;
                }
            }
            if(id != -1){
                //test
                //if(inventory[id] != null && inventory[id][1] != null && inventory[id][1][1] != null){
                    //$("#itemname").text = inventory[id][1][1];
                //}
                //if(inventory[id] != null && inventory[id][1] != null && inventory[id][1][1] != null){
                    //$("#itemname2").text = inventory[id][2][1];
                //}
                selectedHeroPlayerID = id;
                UpdateInventory();
            }
        }
    }
    */
}

function GetRunewordImageByID(id){
    var path = "file://{images}/spellicons/";
    if(id == 1){
        return path+"luna_eclipse";
    }
    if(id == 2){
        return path+"keeper_of_the_light_spirit_form";
    }
    if(id == 3){
        return path+"dragon_knight_dragon_blood";
    }
    if(id == 4){
        return path+"antimage_spell_shield";
    }
    if(id == 5){
        return path+"chaos_knight_phantasm";
    }
    if(id == 6){
        return path+"legion_commander_moment_of_courage";
    }
    if(id == 7){
        return path+"oracle_purifying_flames";
    }
    if(id == 8){
        return path+"lone_druid_spirit_bear";
    }
    if(id == 9){
        return path+"mirana_starfall";
    }
    if(id == 10){
        return path+"ancient_apparition_ice_vortex";
    }
    if(id == 11){
        return path+"lycan_howl";
    }
    if(id == 12){
        return path+"luna_lunar_blessing";
    }
    if(id == 13){
        return path+"harpy_storm_chain_lightning";
    }
    if(id == 14){
        return path+"lycan_shapeshift";
    }
    if(id == 15){
        return path+"ursa_enrage";
    }
    if(id == 16){
        return path+"beastmaster_call_of_the_wild_boar";
    }
    if(id == 17){
        return path+"terrorblade_sunder";
    }
    if(id == 18){
        return path+"spectre_haunt";
    }
    if(id == 19){
        return path+"lina_fiery_soul";
    }
    if(id == 20){
        return path+"medusa_split_shot";
    }
    if(id == 21){
        return path+"lina_dragon_slave";
    }
    if(id == 22){
        return path+"phantom_lancer_doppelwalk";
    }
    if(id == 23){
        return path+"legion_commander_press_the_attack";
    }
    if(id == 24){
        return path+"pudge_flesh_heap";
    }
    if(id == 25){
        return path+"phantom_assassin_coup_de_grace";
    }
    if(id == 26){
        return path+"sven_great_cleave";
    }
    if(id == 27){
        return path+"queenofpain_shadow_strike";
    }
    if(id == 28){
        return path+"skeleton_king_bone_guard";
    }
    if(id == 29){
        return path+"visage_grave_chill";
    }
    if(id == 30){
        return path+"nevermore_requiem";
    }
    if(id == 31){
        return path+"venomancer_poison_sting";
    }
    if(id == 32){
        return path+"death_prophet_carrion_swarm";
    }
    if(id == 33){
        return path+"mirana_arrow";
    }
    if(id == 34){
        return path+"phoenix_fire_spirits";
    }
    if(id == 35){
        return path+"spirit_breaker_nether_strike";
    }
    if(id == 36){
        return path+"magnataur_skewer";
    }
    if(id == 37){
        return path+"147";
    }
    if(id == 38){
        return path+"158";
    }
    if(id == 39){
        return path+"159";
    }
    if(id == 40){
        return path+"162";
    }
    if(id == 41){
        return path+"145";
    }
    if(id == 42){
        return path+"152";
    }
    if(id == 43){
        return path+"161";
    }
    if(id == 44){
        return path+"155";
    }
    if(id == 45){
        return path+"156";
    }
    if(id == 46){
        return path+"146";
    }
    if(id == 47){
        return path+"148";
    }
    if(id == 48){
        return path+"154";
    }
    return "";
}

function GetImagePathForArtifact(item, slot, rarity, weapontype){
    var im = "file://{images}/items/";

    //high lvl special items (not all images available)
    if(item.substring(5, 8) == "gen"){
        if(slot != 8){
            return im.concat(("gen"+slot)+weapontype+".png");
        }
    }

    //amulets
    if(item.substring(5, 8) == "gen" && slot == 8){
        var code = Number(item.substring(9, 11));
        if(isNaN(code)){
            code = Number(item.substring(9+3, 11+3));
        }
        if(isNaN(code)){
            code = Number(item.substring(9+6, 11+6));
        }
        var final_code = 0;
        if(code <= 90){
            final_code = 6;
        }
        if(code <= 74){
            final_code = 5;
        }
        if(code <= 48 || code == 58 || code == 59){
            final_code = 4;
        }
        if(code <= 36 || code == 55 || code == 56){
            final_code = 3;
        }
        if(code <= 24 || code == 52 || code == 53){
            final_code = 2;
        }
        if(code <= 12 || code == 49 || code == 50){
            final_code = 1;
        }
        //$.Msg(item);
        //$.Msg(final_code);
        im = im.concat(("amu"+final_code));
        im = im.concat(".png");
        return im;
    }




    if(item.substring(5, 8) == "gen" && rarity == "myth" && slot != 8){
        //generated mythicals, same as divines for now
        im = im.concat(("ge2"+slot)+weapontype+".png");
        return im;
    }
    if(item.substring(5, 8) == "gen" && rarity == "divi"){
        //generated divines
        im = im.concat(("ge2"+slot)+weapontype);
    }
    if(item.substring(5, 8) == "gen" && slot != 7 && (rarity == "aim" || rarity == "epic" || rarity == "leg" || rarity == "im")){
        //generated aimos excect shoulder
        im = im.concat(("gen"+slot)+weapontype);
    }
    //new gloves legs cape
    if(item.substring(5, 8) == "gen" && slot >= 9){
        //generated aimos excect shoulder
        im = "file://{images}/items/fixe/" + "gen"+slot+weapontype;
    }
    if(item.substring(5, 8) == "gen" && slot == 7 && rarity == "aim"){
        //generated aimo shoulder, special, each suffix has its own image    aimo7gen
        var suffix = item.substring(8, 11);
        if(suffix == "aad"){
            suffix = "aaa";
        }
        im = im.concat(suffix);
    }
    if(item.substring(5, 8) != "gen"){
        //not generated
        im = im.concat(item);
    }
    if(item.substring(5, 11) == "class_"){
        //class quest items
        im = "file://{images}/custom_game/heroicons/" + item.substring(11);
    }
    im = im.concat(".png");
    //$.Msg("image path "+im);
    return im;
}

function UpdateInventory(args)
{   
    
    var player = selectedHeroPlayerID;
    if(inventory == null){
        return;
    }

    //playername
    $("#playername").text = Players.GetPlayerName(selectedHeroPlayerID);
    $("#playericon").heroname = Entities.GetUnitName( Players.GetPlayerHeroEntityIndex(selectedHeroPlayerID) );
    //update runeword
    //runeword_id[player] = 10;
    //runeword[player] = "asdf asdfasd sdfjsidfj sdfio sdfodf + w234 ";
    let runeWordText = $("#runewordtext");
    let runeWordImage = $("#runewordimage");

    if(runeword != null && runeword[player] != null){
        runeWordText.text = runeword[player];
        var image_path = GetRunewordImageByID(runeword_id[player])+".png";
        runeWordImage.SetImage(image_path);
        runeWordImage.style.visibility = "visible";
    }else{
        runeWordText.text = "Incomplete Rune Word: find more Artifacts with Rune Words";
        runeWordImage.SetImage("");
        runeWordImage.style.visibility = "collapse";
    }

    var max_runewords = 20;
    if(pathword != null && pathword[player] != null){
        //$.Msg(pathword[player]);
        var data = pathword[player].split(",");
        var words = (data.length - 1) / 2;
        //$.Msg(words);
        for (var i=0; i < max_runewords;i++){
            if(i < words){
                //$.Msg(i);
                $("#pathword"+i).text = data[i*2];
                var image_path = "file://{images}/spellicons/" + parseInt(data[(i*2)+1]) + ".png";
                $("#pathwordimage"+i).SetImage(image_path);
                //$.Msg(data[i*2]);
                //$.Msg($("#pathword"+i).text);
            }else{
                $("#pathword"+i).text = "";
                var image_path = "";
                $("#pathwordimage"+i).SetImage(image_path);
            }
        }
        //var image_path = "" +  + ".png";
        //$("#pathwordimage").SetImage(image_path);
        //$.Msg(pathword[player]);
    }else{
        /* pathwords got removed
        for (var i=0; i < max_runewords;i++){
            $("#pathword"+i).text = "";
            var image_path = "";
            $("#pathwordimage"+i).SetImage(image_path);
        }*/
    }
    //update slot after slot
    for (var slot = 1; slot <= mythicslots; slot++) {
        if(inventory[player] != null && inventory[player][slot] != null && inventory[player][slot][1] != null){
            $("#weapon"+slot+"type").text = GetItemTypeNameBySlot(slot);
            $("#weapon"+slot+"ilevel").text = inventory[player][slot][11];
            //var iname = inventory[player][slot][0].split(" of ");
            //$("#weapon"+slot).text = iname[0] + "\nof " + iname[1];
            $("#weapon"+slot).text = inventory[player][slot][0];
            $("#weapon"+slot).RemoveClass("WeaponHeaderEpic");
            $("#weapon"+slot).RemoveClass("WeaponHeaderLeg");
            $("#weapon"+slot).RemoveClass("WeaponHeaderIm");
            $("#weapon"+slot).RemoveClass("WeaponHeaderAim");
            $("#weapon"+slot).RemoveClass("WeaponHeaderDivi");
            $("#weapon"+slot).RemoveClass("WeaponHeaderMyth");
            $("#weapon"+slot).RemoveClass("WeaponHeaderWhite");
            if(inventory[player][slot][3] == "epic"){
                $("#weapon"+slot).AddClass("WeaponHeaderEpic");
            }
            if(inventory[player][slot][3] == "leg"){
                $("#weapon"+slot).AddClass("WeaponHeaderLeg");
            }
            if(inventory[player][slot][3] == "im"){
                $("#weapon"+slot).AddClass("WeaponHeaderIm");
            }
            if(inventory[player][slot][3] == "aim"){
                $("#weapon"+slot).AddClass("WeaponHeaderAim");
            }
            if(inventory[player][slot][3] == "divi"){
                $("#weapon"+slot).AddClass("WeaponHeaderDivi");
            }
            if(inventory[player][slot][3] == "myth"){
                $("#weapon"+slot).AddClass("WeaponHeaderMyth");
            }
            //image
            var im = GetImagePathForArtifact(inventory[player][slot][1], slot, inventory[player][slot][3], inventory[player][slot][12]);
            
            $("#weapon"+slot+"image").SetImage(im);

            //update stat after stat
            for (var attr = 1; attr <= 3; attr++) {
                var text = "+ ";
                if(inventory[player][slot][4] >= attr){
                    text = text.concat((String)(inventory[player][slot][4+attr]));
                    text = text.concat(inventory[player][slot][7+attr]);
                    $("#weapon"+slot+"stats"+attr).text = text;
                }else{
                    text = "";
                    $("#weapon"+slot+"stats"+attr).text = text;
                }
            }
        }else{
            //nothing equipped
            $("#weapon"+slot).RemoveClass("WeaponHeaderEpic");
            $("#weapon"+slot).RemoveClass("WeaponHeaderLeg");
            $("#weapon"+slot).RemoveClass("WeaponHeaderIm");
            $("#weapon"+slot).RemoveClass("WeaponHeaderAim");
            $("#weapon"+slot).RemoveClass("WeaponHeaderDivi");
            $("#weapon"+slot).RemoveClass("WeaponHeaderMyth");
            $("#weapon"+slot).RemoveClass("WeaponHeaderWhite");
            $("#weapon"+slot).AddClass("WeaponHeaderWhite");
            $("#weapon"+slot+"type").text = GetItemTypeNameBySlot(slot);
            $("#weapon"+slot).text = "";
            $("#weapon"+slot+"ilevel").text = "";
            var im = "file://{images}/items/fixe/";
            if(slot == 1){
                im = im.concat("noweapon");
            }
            if(slot == 2){
                im = im.concat("nooffhand");
            }
            if(slot == 3){
                im = im.concat("noring");
            }
            if(slot == 4){
                im = im.concat("nohead");
            }
            if(slot == 5){
                im = im.concat("nochest");
            }
            if(slot == 6){
                im = im.concat("noboots");
            }
            if(slot == 7){
                im = im.concat("noshoulder");
            }
            if(slot == 8){
                im = im.concat("noamulet");
            }
            if(slot == 9){
                im = "file://{images}/items/" + "nogloves";
            }
            if(slot == 10){
                im = "file://{images}/items/" + "nolegs";
            }
            if(slot == 11){
                im = "file://{images}/items/" + "nocape";
            }
            im = im.concat(".png");
            $("#weapon"+slot+"image").SetImage(im);
            //$.Msg("#weapon"+slot+"image");
            //update stat after stat
            for (var attr = 1; attr <= 3; attr++) {
                var text = "";
                $("#weapon"+slot+"stats"+attr).text = text;
            }
        }
    }
    /* OLD STATS UI
    if(main_stats != null){
        if(main_stats[player] != null){
            UpdateMainStatsUI();
        }
    } */
    // OLD GOLD UI
    //UpdateGoldUI();
    if(hero_stats == null){
        hero_stats = new Array(20);
        for (var i = 0; i < 20; i++) {
            hero_stats[i] = new Array(stats_amount);
            for (var j = 0; j < stats_amount; j++) {
                hero_stats[i][j] = "+ 0%";
                if(j == 5){
                    hero_stats[i][j] = "0%";
                }
                if(j == 6){
                    hero_stats[i][j] = "100%";
                }
                if(j == 7 || j == 8 || j == 11){
                    hero_stats[i][j] = "0";
                }
                if(j == 9 || j == 10){
                    hero_stats[i][j] = "Peak: 0";
                }
            }
        }
        return;
    }
    if(hero_stats[player] == null){
        return;
    }
    if(hero_stats[player][0] == null){
        return;
    }
    
    //update hero stats
    for (var attr = 1; attr <= stats_amount; attr++) {
        if($("#herostats"+attr) != null){
            //12 was multiplicative stat, removed atm
            $("#herostats"+attr).text = hero_stats[player][attr-1];
        }
    }
}

function SelectChest(args)
{  
    //$.Msg("press select chest");
    var myid = Players.GetLocalPlayer();
    if(playerChests != null){
        if(playerChests[myid] != null){
            $.Msg("first press");
            GameUI.SelectUnit( playerChests[myid], false )
        }else{
            $.Msg("2nd press");
            GameEvents.SendCustomGameEventToServer( "getmychest", { "player_id" : Players.GetLocalPlayer() } );
        }
    }
}

function SetMyChest(args)
{  
    //$.Msg("receive set");
    var myid = Players.GetLocalPlayer();
    if(playerChests != null){
        playerChests[myid] = args.chest;
        //GameUI.SelectUnit( null, false );
        $.Schedule(0.1, function(){
            SelectChest(args);
        });
    }
}

function OnAutoSellFiltersResponse(args)
{
    if(args.autosell != undefined)
    {
        for(let i = 0; i < autoSellOptions.length; i ++)
        {
            if(autoSellOptions[i].value == args.autosell)
            {
                autosell = i;
                SetAutoSellText(autosell);
                break;
            }
        }
    }

    if(args.autosellArti != undefined)
    {
        for(let i = 0; i < autoSellArtiOptions.length; i ++)
        {
            if(autoSellArtiOptions[i].value == args.autosellArti)
            {
                autosellArti = i;
                SetAutoSellArtiText(autosellArti);
                break;
            }
        }
    }

    if(args.autosellSpecial != undefined)
    {
        for(let i = 0; i < autoSellSpecialOptions.length; i ++)
        {
            if(autoSellSpecialOptions[i].value == args.autosellSpecial)
            {
                autosellSpecial = i;
                SetAutoSellSpecialText(autosellSpecial);
                break;
            }
        }
    }
}

var autoSellOptions = [
    {
        text: "Don't Auto Sell Items",
        value: 0
    },
    {
        text: "Auto Sell: Common Items and below",
        value: 2
    },
    {
        text: "Auto Sell: Uncommon Items and below",
        value: 4
    },
    {
        text: "Auto Sell: Rare Items and below",
        value: 6
    },
    {
        text: "Auto Sell: Epic Items and below",
        value: 8
    },
    {
        text: "Auto Sell: Legendary Items and below",
        value: 10
    },
    {
        text: "Auto Sell: Immortal Items and below",
        value: 12
    },
    {
        text: "Auto Sell: Divine Items and below",
        value: 14
    },
    {
        text: "Auto Sell: Mythical Items and below",
        value: 16
    }
];

function SetAutoSellItems(isForwardDirection) {
    autosell = autosell + (isForwardDirection ? 1 : -1);
    let autoSellOptionsLastIndex = autoSellOptions.length - 1;

    if(autosell < 0) {
        autosell = autoSellOptionsLastIndex;
    }

    if(autosell > autoSellOptionsLastIndex)
    {
        autosell = 0;
    }

    SetAutoSellText(autosell);

    GameEvents.SendCustomGameEventToServer( "setautosell", { "player_id": Players.GetLocalPlayer(), "index": autoSellOptions[autosell].value} );
}

function SetAutoSellText(autosellIndex)
{
    $("#autoselltext1").text = autoSellOptions[autosellIndex].text;
}

var autoSellArtiOptions = [
    {
        text: "Don't Auto Sell Artifacts",
        value: 0
    },
    {
        text: "Auto Sell: Epic Artifacts and below",
        value: 2
    },
    {
        text: "Auto Sell: Legendary Artifacts and below",
        value: 4
    },
    {
        text: "Auto Sell: Immortal Artifacts and below",
        value: 6
    },
    {
        text: "Auto Sell: Divine Artifacts and below",
        value: 8
    },
    {
        text: "Auto Sell: Mythical Artifacts and below",
        value: 10
    }
];

function SetAutoSellArtifacts(isForwardDirection) {
    autosellArti = autosellArti + (isForwardDirection ? 1 : -1);
    let autoSellOptionsLastIndex = autoSellArtiOptions.length - 1;

    if(autosellArti < 0) {
        autosellArti = autoSellOptionsLastIndex;
    }

    if(autosellArti > autoSellOptionsLastIndex)
    {
        autosellArti = 0;
    }

    SetAutoSellArtiText(autosellArti);

    GameEvents.SendCustomGameEventToServer( "setautosell", { "player_id": Players.GetLocalPlayer(), "indexArti": autoSellArtiOptions[autosellArti].value} );
}

function SetAutoSellArtiText(autosellIndex)
{
    $("#autoselltext2").text = autoSellArtiOptions[autosellIndex].text;
}

var autoSellSpecialOptions = [
    {
        text: "Don't Auto Sell Souls and Temple Shard",
        value: 0
    },
    {
        text: "Auto Sell: Temple Shard",
        value: 2
    },
    {
        text: "Auto Sell: All Souls and Temple Shard",
        value: 4
    }
];

function SetAutoSellSpecial(isForwardDirection) {
    autosellSpecial = autosellSpecial + (isForwardDirection ? 1 : -1);
    let autoSellOptionsLastIndex = autoSellSpecialOptions.length - 1;

    if(autosellSpecial < 0) {
        autosellSpecial = autoSellOptionsLastIndex;
    }

    if(autosellSpecial > autoSellOptionsLastIndex)
    {
        autosellSpecial = 0;
    }

    SetAutoSellSpecialText(autosellSpecial);
    
    GameEvents.SendCustomGameEventToServer( "setautosell", { "player_id": Players.GetLocalPlayer(), "indexSpecial": autoSellSpecialOptions[autosellSpecial].value} );
}

function SetAutoSellSpecialText(autosellSpecial)
{
    $("#autoselltext3").text = autoSellSpecialOptions[autosellSpecial].text;
}

function ToggleAutoSellFiltersVisibility()
{
    let autoSellFiltersContainer = $("#AutoSellFiltersContainer");
    let autoSellButtonLabel = $("#ShowAutoSellFiltersButtonLabel");
    let isHidden = autoSellFiltersContainer.style.visibility == "collapse";

    if(isHidden) {
        autoSellButtonLabel.text = "Hide Auto Sell Filters";
        autoSellFiltersContainer.style.visibility = "visible";
    } else
    {
        autoSellButtonLabel.text = "Show Auto Sell Filters";
        autoSellFiltersContainer.style.visibility = "collapse";
    }
}

function TalentPressed(args){
    //$.Msg("talent pressed " + args);
    if(Players.GetLocalPlayer() != selectedHeroPlayerID){
        return;
    }
    var a = parseInt(args);

    //$.Msg(Players.GetLocalPlayer());
    GameEvents.SendCustomGameEventToServer( "talentpressed", { "player_id": Players.GetLocalPlayer(), "talent": a } );
    //$.Msg(a);
}

function ToggleResetPathPressed(args){
    if(spectator){
        return;
    }
    if(path_reset_toggle){
        $("#resetpathbutton").text = "When saving with this setting, you keep your Path Points on next load.";
        $("#resetpathbutton").style.color = "LightGreen";
    }else{
        $("#resetpathbutton").text = "When saving with this setting, you reset your Path Points on next load. Resetting costs 100 Gold.";
        $("#resetpathbutton").style.color = "Orange";
    }
    path_reset_toggle = !path_reset_toggle;
    GameEvents.SendCustomGameEventToServer( "resetpathpressed", { "player_id": Players.GetLocalPlayer() } );
}

function ResetTempleHeroLevel(args){
    if(spectator){
        return;
    }
    if(!temple_hero_reset_level_toggle){
        $("#resettempleherolevel").text = "ENABLED, SETTING LEVEL TO 1 WHEN SAVING";
        $("#resettempleherolevel").style.color = "LightGreen";
    }else{
        $("#resettempleherolevel").text = "DISABLED";
        $("#resettempleherolevel").style.color = "Orange";
    }
    temple_hero_reset_level_toggle = !temple_hero_reset_level_toggle;
    GameEvents.SendCustomGameEventToServer( "resettempleherolevel", { "player_id": Players.GetLocalPlayer() } );
}


function GamblingPressed(args){
    //$.Msg("gambling pressed " + args);
    var a = parseInt(args);
    //$.Msg(a);
    GameEvents.SendCustomGameEventToServer( "gamblingpressed", { "player_id": Players.GetLocalPlayer(), "item": a } );
    //$.Msg(a);
}

function RefreshTalents(args){
    GameEvents.SendCustomGameEventToServer( "refreshtalents", { "player_id": Players.GetLocalPlayer() } );
    $("#refreshtalents").visible = false;
    $.Schedule(15, ShowRefreshTalents);
}

function TogglePathWord(args){
    GameEvents.SendCustomGameEventToServer( "togglepathword", { "player_id": Players.GetLocalPlayer() } );
}

function ShowRefreshTalents(){
    $("#refreshtalents").visible = true;
}

function ArtifactForging(args){
    //$.Msg("arti forging pressed " + args);
    var a = parseInt(args);
    //$.Msg(a);
    GameEvents.SendCustomGameEventToServer( "artifactforging", { "player_id": Players.GetLocalPlayer(), "item": a } );
    //$.Msg(a);
}

function TalentLeveled(args)
{ 
    var player = args.playerid;
    var level = args.level;
    var nr = args.talent;

    //$.Msg("talent leveled " + nr+" level "+level);
    if(talents == null){
        return;
    }
    talents[player][nr] = level;

    var panel = "#talent"+nr;
    //$.Msg(panel);
    if($(panel)){
        $(panel).text = String(level)+" / 3";
    }
    //$(panel).text = "fuck";
    UpdateTalentTree(nr);
}

function UpdateTalentTree(onlyUpdateThisTalent){ //-1 = all
    var player = selectedHeroPlayerID;
    if(selectedHeroPlayerID == null){
        return;
    }
    if(selectedHeroPlayerID < 0 ){
        return;
    }
    if(talents == null){
        return;
    }
    if(talents[player] == null){
        return;
    }
    //$("#playername2").text = Players.GetPlayerName(selectedHeroPlayerID);
    //$("#playericon2").heroname = Entities.GetUnitName( Players.GetPlayerHeroEntityIndex(selectedHeroPlayerID) );
    for (var i = 1; i < max_talents; i++) {
        if(onlyUpdateThisTalent == -1 || onlyUpdateThisTalent == i){
            var panel = "#talent"+String(i);
            var level = talents[player][i];
            if($(panel)){
                $(panel).text = String(level)+" / 3";
            }
        }
    }
}

function TalentPointUpdate(args)
{ 
    talentpoints = args.points;
    var panel = "#talentpoints";
    $(panel).text = "Unspent Path Points: "+talentpoints;
}

/* OLD STATS UI
function UpdateMainStatsUI(){
    if(selectedHeroPlayerID >= 0){
        var strDetails = "";
        var agiDetails = "";
        var intDetails = "";
        var str = main_stats[selectedHeroPlayerID][0];
        var agi = main_stats[selectedHeroPlayerID][1];
        var int = main_stats[selectedHeroPlayerID][2];
        var level = main_stats[selectedHeroPlayerID][3];
        if(main_stats_detailed){
            strDetails = ": +" + hpPerStr * str + " Health and +" + (str * physDmgPerStr).toFixed(1) + "% Physical Damage";
            agiDetails = ": +" + (asPerAgi * agi).toFixed(1) + " Attack Speed and +" + (agi * armorPerAgi).toFixed(1) + " Armor and +" + (agi * abilCritPerAgi).toFixed(1) + "% Crit Damage";
            var mres = int * mresPerInt;
            if(mres > 50){
                mres = 50
            }
            if(manaPerInt > 0){
                intDetails = ": +" + manaPerInt * int + " Mana and +" + (int * abilDmgPerInt).toFixed(1) + "% Ability Damage and +" + (mres).toFixed(1) + " Spell Resistance";
            }else{
                intDetails = ": +" + (int * abilDmgPerInt).toFixed(1) + "% Ability Damage and +" + (mres).toFixed(1) + " Spell Resistance";
            }
        }
        var strText = String(str) + " Strength" + strDetails;
        var agiText = String(agi) + " Agility" + agiDetails;
        var intText = String(int) + " Intellect" + intDetails;
        var levelText = "Level: " + String(level);
        $("#ui_str").text = strText;
        $("#ui_agi").text = agiText;
        $("#ui_int").text = intText;
        $("#ui_level").text = levelText;
    }
} */

/* OLD GOLD UI
function UpdateGoldUI(){
    if(selectedHeroPlayerID >= 0){
        $("#ui_gold").text = gold_stat[selectedHeroPlayerID] + " Gold";
    }
}
*/

/* OLD STATS UI
function MainStatsHover(args){
    if(args == 1){
        main_stats_detailed = true;
    }else{
        main_stats_detailed = false;
    }
    UpdateMainStatsUI();
} */

function TalentHovered(args){
    //text
    var panel = "#talenttooltiptext";
    var text = "#talent"+args;
    $(panel).text = $.Localize( text );
    //$.Msg($.Localize( text ));
    //image
    panel = "#talenttooltipimage";
    var im = "file://{images}/spellicons/";
    im = im.concat(args);
    im = im.concat(".png");
    $(panel).SetImage(im);
    panel = "#talenttooltip";

    //$.Msg(im);
    //position
    //$(panel).selectionpos_x( 30 );
    //$(panel).SetAttributeInt( "position", integer integer_2 )

    //visible
    $(panel).visible = true;
}

function TalentUnhovered(args){
    var panel = "#talenttooltiptext";
    var text = "";
    $(panel).text = $.Localize( text );
    panel = "#talenttooltip";
    $(panel).visible = false;
}

function ActEntered(args){
    var act = args.act;
    var panel = "#ActEntering";
    //$("#ActDescription2").text = "";
    if (act == 1){
        $("#ActEnteringText").text = "Entering Act I"
        $("#ActEnteringName").text = "The Wild Forest"
        $("#ActLoot").text = "Act Specials: Drops Artifact Mainhands";
        $("#ActDescription").text = "Villager Cain: Both of my daughters have disappeared last night. I need your help! Please find them!\n\nSearch the Wild Forest for signs of both daughters."
    }
    if (act == 2){
        $("#ActEnteringText").text = "Entering Act II"
        $("#ActEnteringName").text = "The Sandviper Desert"
        $("#ActLoot").text = "Act Specials: Drops Artifact Offhands";
        $("#ActDescription").text = "Farmer Pete: Three of my Llamas have been attacked and murdered by a giant cat. Now I only have one last Lama left. Please help me, don't let that cat take my last Lama!\n\nFind and slay the giant cat in the Sandviper Desert."
    }
    if (act == 3){
        $("#ActEnteringText").text = "Entering Act III"
        $("#ActEnteringName").text = "The Moonlight Riverlands"
        $("#ActLoot").text = "Act Specials: Drops Artifact Head Armor";
        $("#ActDescription").text = "Nabu: The tides are dark and full of terrors. These once peaceful Riverlands have become a stormy and dangerous place.\n\nStop all corrupted Monsters wreaking havoc in the Riverlands."
    }
    if (act == 4){
        $("#ActEnteringText").text = "Entering Act IV"
        $("#ActEnteringName").text = "The Shadowlands"
        $("#ActLoot").text = "Act Specials: Drops Artifact Chest Armor";
        $("#ActDescription").text = "Nabu: Dark creatures of the night reign here.\n\nDefeat all Monsters and bring light into these dire caverns."
    }
    if (act == 5){
        $("#ActEnteringText").text = "Entering Act V"
        $("#ActEnteringName").text = "Dragonsky"
        $("#ActLoot").text = "Act Specials: Drops Artifact Boots";
        $("#ActDescription").text = "Nabu: The Dragon Council and all Dragonlords have declared war against us.\n\nKill the Dragon Council and all Dragonlords to bring back peace to the Kingdom of Dragons."
    }
    if (act == 6){
        $("#ActEnteringText").text = "Entering Act VI"
        $("#ActEnteringName").text = "Highmountain"
        $("#ActLoot").text = "Act Specials: Drops Artifact Gloves";
        $("#ActDescription").text = "Nabu: Demonic forces are invading Highmountain. Even the Druids of Highmountain, once guardians of the Calm Tree, have turned evil.\n\nDestroy all evil and corrupted forces to safe the Calm Tree."
    }
    if (act == 7){
        $("#ActEnteringText").text = "Entering Act VII"
        $("#ActEnteringName").text = "The Tomb of Legends"
        $("#ActLoot").text = "Act Specials: Drops Artifact Legs";
        $("#ActDescription").text = "Farmer Pete: I have seen Tombs opening and dead creatures rising out of their graves. And our Bishop disappeared too!\n\nExamine the Tomb of Legends and destroy all escaped creatures."
    }
    if (act == 8){
        $("#ActEnteringText").text = "Entering Act VIII"
        $("#ActEnteringName").text = "The Molten Forge"
        $("#ActLoot").text = "Act Specials: Drops Artifact Capes";
        $("#ActDescription").text = "Nabu: Volcanic Lava Imps are preparing an attack on the Tree of Life.\n\nStop the Lava Imps before they do any harm."
    }
    if (act == 9){
        $("#ActEnteringText").text = "Entering Act IX"
        $("#ActEnteringName").text = "Mogushan Brawl Arena"
        $("#ActLoot").text = "Act Specials: Drops Artifact Head, Chest and Boots";
        $("#ActDescription").text = "Nabu: Mogushan once was hosting prestigious tournaments, but his Arena turned into a training ground for his evil fighter squad.\n\nPut an end to his plans to train a dangerous army of soldiers. Beat at least 5 Arena rounds!"
    }
    if (act == 10){
        $("#ActEnteringText").text = "Entering Act X"
        $("#ActEnteringName").text = "The Arcane Sanctum"
        $("#ActLoot").text = "Act Specials: Drops Artifact Gloves, Legs and Capes";
        $("#ActDescription").text = "Nabu: Forbidden elemental rituals are being prepared in this Arcane Sanctum.\n\nStop these rituals before the power of the Elements will be used against us."
    }
    if (act == 11){
        $("#ActEnteringText").text = "Entering Act XI"
        $("#ActEnteringName").text = "The Titan Temple"
        $("#ActLoot").text = "Act Specials: Drops Artifact Amulets";
        $("#ActDescription").text = "Nabu: All 10 Temple Gods reside here. Be careful, not many have returned from this place!"
    }
    if (act == 12){
        $("#ActEnteringText").text = "Entering Act XII"
        $("#ActEnteringName").text = "Jungle of Zul'Juru - Home of the Tree of Eternity"
        $("#ActLoot").text = "Act Specials: Drops Artifact Shoulders";
        $("#ActDescription").text = "Nabu: The Tree of Life lies behind this jungle.\n\nFight your way through the jungle and find and slay the King of the Jungle to save the Tree of Life!"
    }
    if (act == 13){
        $("#ActEnteringText").text = "Entering Act XIII"
        $("#ActEnteringName").text = "Castle Winterwall"
        $("#ActLoot").text = "Act Specials: Drops Artifact Rings";
        $("#ActDescription").text = "Nabu: An Arctic Invasion will soon hit Castle Winterwall.\n\nDefend the Castle and stay alive until all enemies are defeated! You can not abandon the Castle!"
    }
    var im = "file://{images}/act";
    im = im.concat(act);
    im = im.concat(".png");
    $("#ActEnteringImage").SetImage(im);
    //remove old item drops
    var items = $.FindChildInContext("#actenteritems");
    for (var i = items.GetChildCount()-1; i >= 0; i--) {
        var lastItem = items.GetChild(i);
        lastItem.DeleteAsync(0);
    }
    $(panel).visible = true;
    $.Schedule(120, ClearActEnterDisplay);
}

function ClearActEnterDisplay(){
    //$.Msg("clear");
    var panel = "#ActEntering";
    $(panel).visible = false;
}

function ShowTempleDifficultyPanel(args)
{ 
    if(args.value == 0){
        $.FindChildInContext("#selectdiffipanel").visible = false;
        return;
    }
    if($.FindChildInContext("#selectdiffipanel").visible){
        $.FindChildInContext("#selectdiffipanel").visible = false;
    }else{
        $.FindChildInContext("#selectdiffipanel").visible = true;
        CountdownSelection(args.value);
    }
    
    //$.FindChildInContext("#seq_bg").SetImage("file://{images}/custom_game/loading_screen/temple.png");
}

function CountdownSelection(time){
    if(time > 0){
        $.Schedule(1, function(){
            if(Game.IsGamePaused() == false) {
                time = time - 1;
            }
            if($("#TimeSelection") != null){
                $("#TimeSelection").text = "Time Remaining: ".concat((String)(time));
                CountdownSelection(time);
            }
        });
    }else{
        //$.FindChildInContext("#selectdiffipanel").visible = false;
    }
}

function SetTempleDifficultyLoader(args)
{ 
    var value = "Level: ";
    var chance = Math.round(args.value*100)/100; // * 100;
    var scalefactor = 1.25; //1.75*1.1;
    value = value.concat((String)(chance));
    //value = value.concat("%");
    //$.Msg($("#diffiselection"));
    if($("#diffiselection") != null){
        $("#diffiselection").text = value;
    }
    chance = args.value * 100;

    chance = 0.00005*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 100.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#mythical2").text = value;

    chance = 0.0005*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 100.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#divine2").text = value;

    chance = 0.03*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 5.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#immortal2").text = value;
    chance = 0.15*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 1.0){
        chance = 0.0;
    }
    chance = chance.toFixed(2);
    value = (String)(chance);
    value = value.concat("%");
    $("#legendary2").text = value;
    chance = 0.75*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    if (args.value < 1.0){
        chance = 0.0;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#epic2").text = value;
    chance = 3*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#rare2").text = value;
    chance = 10*args.value;
    if (chance > 100.0){
        chance = 100;
    }
    chance = chance.toFixed(0);
    value = (String)(chance);
    value = value.concat("%");
    $("#common2").text = value;
    chance = exp_scale(args.value, 100, 0.15); //(3 * args.value - 2) * 100;                 //exp_scale(args.value, 100);
    if (chance < 25){
        chance = 25;
    }
    chance = chance.toFixed(1);
    value = (String)(chance);
    value = value.concat("%");
    $("#Exp2").text = value;

    $("#hardmode").text = "";
    if (args.value == 2){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>";
    }
    if (args.value == 5){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>";
    }
    if (args.value == 10){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<";
    }
    if (args.value == 20){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Singularities for full clears<br>● All Teleporters unlocked from the start";
    }
    if (args.value == 50){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Singularities for full clears<br>● All Teleporters unlocked from the start<br>● [Ancient] Immortal Sets, remaining Souls and Temple Shards added to Immortal Drop Table";
    }
    if (args.value == 100){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Singularities for full clears<br>● All Teleporters unlocked from the start<br>● [Ancient] Immortal Sets, remaining Souls and Temple Shards added to Immortal Drop Table<br>● [Divine] Items can drop";
    }
    if (args.value == 200){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Singularities for full clears<br>● All Teleporters unlocked from the start<br>● [Ancient] Immortal Sets, remaining Souls and Temple Shards added to Immortal Drop Table<br>● [Divine] Items can drop<br>● [Mythical] Items and Artifacts can drop";
    }
    if (args.value >= 500){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Tier 2 Singularities for full clears<br>● All Teleporters unlocked from the start<br>● [Ancient] Immortal Sets, remaining Souls and Temple Shards added to Immortal Drop Table<br>● [Divine] Items can drop<br>● [Mythical] Items and Artifacts can drop<br>● Mythical Set Tokens can drop.<br>● 25% Healing Malus";
    }
    if (args.value >= 1000){
        $("#hardmode").text = "<br>● [Ancient] Legendaries added to Legendary Drop Table<br>● Immortal Items can drop<br>● Immortal Set Items added to Immortal Drop Table<br>● [Ancient] Immortals and Souls for first 3 rows added to Immortal Drop Table<br>● Tier 2 Singularities for full clears<br>● All Teleporters unlocked from the start<br>● [Ancient] Immortal Sets, remaining Souls and Temple Shards added to Immortal Drop Table<br>● [Divine] Items can drop<br>● [Mythical] Items and Artifacts can drop<br>● Mythical Set Tokens can drop.<br>● 50% Healing Malus";
    }

    //if (args.value < 10.0){
    //    $("#hardmode").text = "";
    //    $("#tipmessages").visible = true;
    //}else{
    //    $("#tipmessages").visible = false;
    //}
    /*
    if (args.value >= 10.0){
        $("#hardmode").text = "Advanced Mode:<br>Improved Monster (10%) and Boss (20%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>100% higher Boss Auto Attack Damage<br>Immortal Items can drop";
    }
    if (args.value >= 20.0){
        $("#hardmode").text = "Advanced Mode:<br>Improved Monster (10%) and Boss (20%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>100% higher Boss Auto Attack Damage<br>Immortal Items can drop<br>Artifact Chest Armor can drop";
    }
    if (args.value >= 30.0){
        $("#hardmode").text = "Hard Mode:<br>Improved Monster (10%) and Boss (20%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>100% higher Boss Auto Attack Damage<br>Harder Boss Abilities<br>More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop";
    }
    if (args.value >= 40.0){
        $("#hardmode").text = "Nightmare Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Artifact Chest Armor can drop<br>Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Artifact Chest Armor can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11";
    }
    if (args.value >= 50.0){
        $("#hardmode").text = "Hell Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Immortal Artifact Boots and Chest can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Head Items can drop<br>[Ancient] Immortal Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Mythic Dust can be obtained via Quests<br>Most Teleporters unlocked from start";
    }
    if (args.value >= 75.0){
        $("#hardmode").text = "Destruction Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Immortal Artifact Boots and Chest can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Head Items can drop<br>[Ancient] Immortal Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Mythic Dust can be obtained via Quests<br>Most Teleporters unlocked from start<br>Dreamshards can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11";
    }
    if (args.value >= 100.0){
        $("#hardmode").text = "Nemesis Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Immortal Artifact Boots and Chest can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Head Items can drop<br>[Ancient] Immortal Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Mythic Dust can be obtained via Quests<br>Most Teleporters unlocked from start<br>Dreamshards can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>[Ancient] Items can drop from Act 11 and 12 Bosses, Souls can drop in Arena and Act 11";
    }
    if (args.value >= 150.0){
        $("#hardmode").text = "Trauma Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Immortal Artifact Boots and Chest can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Head Items can drop<br>[Ancient] Immortal Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Mythic Dust can be obtained via Quests<br>Most Teleporters unlocked from start<br>Dreamshards can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>[Ancient] Items can drop from Act 11 and 12 Bosses, Souls can drop in Arena and Act 11<br>[Ancient] Artifact Helm, Chest and Boots can drop from Act 11 Bosses";
    }
    if (args.value >= 200.0){
        $("#hardmode").text = "Doom Mode:<br>Improved Monster (20%) and Boss (40%) Resistances<br>Increased Boss Health and Experience<br>Hard CC on Bosses lasts shorter<br>200% higher Boss Auto Attack Damage<br>Insane Boss Abilities<br>Even More Affixes on Monsters<br>Immortal Items and Immortal 2 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Chest Armor can drop<br>Immortal Artifact Rings can drop<br>Artifact drop chance increased from 25% to 50%<br>Immortal Artifact Boots and Chest can drop<br>Immortal 3 piece Set Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Immortal Artifact Head Items can drop<br>[Ancient] Immortal Items can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>Mythic Dust can be obtained via Quests<br>Most Teleporters unlocked from start<br>Dreamshards can drop in Act 7, 8, 9 (round 4 or higher), 10 and 11<br>[Ancient] Items can drop from Act 11 and 12 Bosses, Souls can drop in Arena and Act 11<br>[Ancient] Artifact Helm, Chest and Boots can drop from Act 11 Bosses<br>[Ancient] Artifact Mainhand, Offhand and Rings can drop from Act 11 Bosses";
    }
    */
}

function SetMainStats(args)
{   
    var id = args.id;
    main_stats[id][0] = args.str;
    main_stats[id][1] = args.agi;
    main_stats[id][2] = args.int;
    // OLD STATS UI
    // main_stats[id][3] = String(args.level) + "\n(" + String(args.levelPercentage) + "%)";
    main_stats[id][3] = args.level;
    main_stats[id][4] = args.levelPercentage;
    main_stats[id][5] = args.maxHpFromStr;
    main_stats[id][6] = args.regenFromStr;
    main_stats[id][7] = args.attackSpeedFromAgi;
    main_stats[id][8] = args.armorFromAgi;
    main_stats[id][9] = args.criticalStrikeDamageFromAgi;
    main_stats[id][10] = args.manaFromInt;
    main_stats[id][11] = args.abilityDamageFromInt;
    main_stats[id][12] = args.spellResistanceFromInt;
    main_stats[id][13] = args.resourceType;
    main_stats[id][14] = args.spellHaste;
    main_stats[id][15] = args.damageReduction;
    main_stats[id][16] = args.attackSpeed;
    main_stats[id][17] = args.blockFromStr;
    main_stats[id][18] = args.block;
}

let customXpContainer = undefined;
let customLevelLabel = undefined;
let customLevelProgressBar = undefined;
let customLevelProgressBlurBar = undefined;
let customStrAgiIntContainer = undefined;
let customStrLabel = undefined;
let customAgiLabel = undefined;
let customIntLabel = undefined;
let customStrStatsLabel = undefined;
let customStrModifierStatsLabel = undefined;
let customStrBonusLabel = undefined;
let customStrPrimaryBonusLabel = undefined;
let customAgiStatsLabel = undefined;
let customAgiModifierStatsLabel = undefined;
let customAgiBonusLabel = undefined;
let customAgiPrimaryBonusLabel = undefined;
let customIntStatsLabel = undefined;
let customIntModifierStatsLabel = undefined;
let customIntBonusLabel = undefined;
let customIntPrimaryBonusLabel = undefined;
let customSpellHasteLabel = undefined;
let customDamageReductionLabel = undefined;
let customBlockLabel = undefined;
let customManaRegenProgressBar = undefined;
let customManaRegenProgressBackgroundBar = undefined;
let customManaRegenProgressBarParticle = undefined;
let customManaRegenLabel = undefined;
let customManaLabel = undefined;
let customManaProgressBar = undefined;
let customBuffsContainer = undefined;
let customDebuffsContainer = undefined;
let customGoldLabel = undefined;
let customAttackSpeedLabel = undefined;
let customAttackSpeedUnitStatsLabel = undefined;
let healthRegenLabel = undefined;
let manaContainer = undefined;
let customManaContainer = undefined;

function OnTooltipVisible(object) {
    if(object.paneltype == "DOTATooltipNeutralItem") {
        FixDotaNeutralItemTooltip();
        return;
    }
	
    if(object.paneltype != "DOTATooltipUnitDamageArmor") {
        return;
    }

    InjectIntoDotaHeroStatsTooltip();

    UpdateMainStatsUI(GetLocalPlayerSelectedUnit(), true);
}

let neutralItemNameLabel = undefined;

function FixDotaNeutralItemTooltip()
{
	if(neutralItemNameLabel == undefined)
	{
		let dotaHudRoot = GetDotaHudRoot();
		let neutralItemsTooltip = dotaHudRoot.FindChildTraverse("NeutralItemTooltip");
		
		if(neutralItemsTooltip == undefined)
		{
			return;
		}
		
		let headerTextContainer = neutralItemsTooltip.FindChildrenWithClassTraverse("NeutralHeaderText");
		if(headerTextContainer == undefined || headerTextContainer.length != 1)
		{
			return;
		}
		
		headerTextContainer = headerTextContainer[0];
		if(headerTextContainer == undefined)
		{
			return;
		}
		
		neutralItemNameLabel = headerTextContainer.FindChildrenWithClassTraverse("NeutralName");
		if(neutralItemNameLabel == undefined || neutralItemNameLabel.length != 1)
		{
			neutralItemNameLabel = undefined;
			return;
		}
		
		neutralItemNameLabel = neutralItemNameLabel[0];
		if(neutralItemNameLabel == undefined)
		{
			return;
		}
		
		neutralItemNameLabel = neutralItemNameLabel;
		neutralItemNameLabel.html = true;
		
		let neutralItemSubtitleLabel = headerTextContainer.FindChildrenWithClassTraverse("NeutralSubtitle");
		if(neutralItemSubtitleLabel == undefined || neutralItemSubtitleLabel.length != 1)
		{
			return;
		}
		
		neutralItemSubtitleLabel = neutralItemSubtitleLabel[0];
		if(neutralItemSubtitleLabel == undefined)
		{
			return;
		}
		
		neutralItemSubtitleLabel.style.visibility = "collapse";
	}
	
	if(neutralItemNameLabel == undefined)
	{
		$.Msg("Valve break something or did major changes to UI (can't modify neutral item tooltip).");
		return;
	}
	
	var itemInSlot = Entities.GetItemInSlot(GetLocalPlayerSelectedUnit(), 16);
	
	if(itemInSlot > -1) 
	{
		neutralItemNameLabel.text = $.Localize("#DOTA_Tooltip_ability_"+Abilities.GetAbilityName(itemInSlot));
	}
}
	
function GetDotaHudRoot()
{
    return $.GetContextPanel().GetParent().GetParent().GetParent();
}

function InjectIntoDotaHeroStatsTooltip()
{
    let dotaHudRoot = GetDotaHudRoot();
    
    /*
    Seems dota recreate them every time...
    if(dotaHudRoot == null || dotaHudRoot._isDotaHeroStatsTooltipInjected) {
        return;
    } */

    // str/agi/int unit stats labels
    customStrStatsLabel = dotaHudRoot.FindChildTraverse("BaseStrengthLabel");
    customStrModifierStatsLabel = dotaHudRoot.FindChildTraverse("BonusStrengthLabel");
    customStrBonusLabel = dotaHudRoot.FindChildTraverse("StrengthDetails");
    customStrPrimaryBonusLabel = dotaHudRoot.FindChildTraverse("StrengthDamageLabel");

    customAgiStatsLabel = dotaHudRoot.FindChildTraverse("BaseAgilityLabel");
    customAgiModifierStatsLabel = dotaHudRoot.FindChildTraverse("BonusAgilityabel"); // intended typo
    customAgiBonusLabel = dotaHudRoot.FindChildTraverse("AgilityDetails");
    customAgiPrimaryBonusLabel = dotaHudRoot.FindChildTraverse("AgilityDamageLabel");

    customIntStatsLabel = dotaHudRoot.FindChildTraverse("BaseIntelligenceLabel");
    customIntModifierStatsLabel = dotaHudRoot.FindChildTraverse("BonusIntelligenceLabel");
    customIntBonusLabel = dotaHudRoot.FindChildTraverse("IntelligenceDetails");
    customIntPrimaryBonusLabel = dotaHudRoot.FindChildTraverse("IntelligenceDamageLabel");

    // Adds custom attack speed row to unit stats tooltip
    let attackContainer = dotaHudRoot.FindChildTraverse("AttackContainer");
    if(attackContainer != undefined) {
        if(attackContainer._customAttackSpeedLabel == undefined) {
            let dotaAttackSpeedLabel = attackContainer.FindChildTraverse("AttackSpeed");
            if(dotaAttackSpeedLabel != undefined) {
                dotaAttackSpeedLabel.style.visibility = "collapse";

                let dotaAttackSpeedLabelParent = dotaAttackSpeedLabel.GetParent();
                let customAttackSpeedRowLabel = $.CreatePanel("Label", dotaAttackSpeedLabelParent, '');
                customAttackSpeedRowLabel.SetHasClass("BaseValue", true);
                dotaAttackSpeedLabelParent.MoveChildAfter(customAttackSpeedRowLabel, dotaAttackSpeedLabel);
                attackContainer._customAttackSpeedLabel = customAttackSpeedRowLabel;
            }
        }
    }

    customAttackSpeedUnitStatsLabel = attackContainer._customAttackSpeedLabel;

    // Adds custom spell haste row to unit stats tooltip
    let manaRegenRow = dotaHudRoot.FindChildTraverse("ManaRegenRow");

    if(manaRegenRow != undefined) {
        if(manaRegenRow._customSpellHasteLabel == undefined) {
            let attackContainerParent = manaRegenRow.GetParent();
            let spellHasteRow = $.CreatePanel("Panel", attackContainerParent, '');
            spellHasteRow.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_hud_stats_row.xml', false, false);
            attackContainerParent.MoveChildAfter(spellHasteRow, manaRegenRow);
            
            let customSpellHasteRowLabel = spellHasteRow.FindChildTraverse("StatLabel");
            if(customSpellHasteRowLabel != undefined) {
                customSpellHasteRowLabel.text = "Spellhaste:";
            }
            customSpellHasteLabel = spellHasteRow.FindChildTraverse("StatValue");
            manaRegenRow._customSpellHasteLabel = customSpellHasteLabel
        }
    } else
    {
        $.Msg("Valve break something or did major changes to UI (can't add spell haste row).");
    }

    customSpellHasteLabel = manaRegenRow._customSpellHasteLabel;

    // Adds custom damage reduction row to unit stats tooltip
    let healthRegenRow = dotaHudRoot.FindChildTraverse("HealthRegenRow");

    if(healthRegenRow != undefined) {
        if(healthRegenRow._customDamageReductionLabel == undefined) {
            let defenseContainerParent = healthRegenRow.GetParent();
            let damageReductionRow = $.CreatePanel("Panel", defenseContainerParent, '');
            damageReductionRow.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_hud_stats_row.xml', false, false);
            defenseContainerParent.MoveChildAfter(damageReductionRow, healthRegenRow);
            
            let customDamageReductionRowLabel = damageReductionRow.FindChildTraverse("StatLabel");
            if(customDamageReductionRowLabel != undefined) {
                customDamageReductionRowLabel.text = "Damage Red.:";
            }
            customDamageReductionLabel = damageReductionRow.FindChildTraverse("StatValue");
            healthRegenRow._customDamageReductionLabel = customDamageReductionLabel;

            // new block label
            let blockRow = $.CreatePanel("Panel", defenseContainerParent, '');
            blockRow.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_hud_stats_row.xml', false, false);
            defenseContainerParent.MoveChildAfter(blockRow, healthRegenRow);
            
            let customBlockRowLabel = blockRow.FindChildTraverse("StatLabel");
            if(customBlockRowLabel != undefined) {
                customBlockRowLabel.text = "Block:";
            }
            customBlockLabel = blockRow.FindChildTraverse("StatValue");
            healthRegenRow._customBlockLabel = customBlockLabel;

            // Disables slow resist label added in 7.36
            let slowResistLabel = defenseContainerParent.FindChildTraverse("SlowResistRow");
            if(slowResistLabel != undefined) {
                slowResistLabel.style.visibility = "collapse";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't hide slow resist row).");
            }
            // Disables status resist label
            let statusResistLabel = defenseContainerParent.FindChildTraverse("StatusResistRow");
            if(statusResistLabel != undefined) {
                statusResistLabel.style.visibility = "collapse";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't hide status resist row).");
            }
        }
    } else
    {
        $.Msg("Valve break something or did major changes to UI (can't add damage reduction row).");
    }

    customDamageReductionLabel = healthRegenRow._customDamageReductionLabel;
    customBlockLabel = healthRegenRow._customBlockLabel;

    //dotaHudRoot._isDotaHeroStatsTooltipInjected = true;
}

function UpdateMainStatsUI(selectedPlayerUnit, isUnitStatsTooltip)
{
    let isHero = Entities.IsHero(selectedPlayerUnit);

    // Hide xp progress bar if not hero
    if(customXpContainer != undefined) {
        customXpContainer.SetHasClass("ShowXPBar", isHero);
    }

    // Update level label
    if(customLevelLabel != undefined) {
        customLevelLabel.text = isHero ? main_stats[selectedHeroPlayerID][3] : Entities.GetLevel(selectedPlayerUnit);
    }

    // Update xp progress bar
    if(isHero) {
        if(customLevelProgressBar != undefined) {
            customLevelProgressBar.value = main_stats[selectedHeroPlayerID][4];
        }

        if(customLevelProgressBlurBar != undefined) {
            customLevelProgressBlurBar.value = main_stats[selectedHeroPlayerID][4];
        }
    }

    // Hide str/agi/int if not hero
    if(customStrAgiIntContainer != undefined) {
        customStrAgiIntContainer.SetHasClass("ShowStrAgiInt", isHero);
    }

    let selectedUnitAttackSpeed = 0;
    if(isHero) {
        // Heroes attack speed can go over cap for attack speed based effects so we display it instead of dota provided attack speed
        selectedUnitAttackSpeed = main_stats[selectedHeroPlayerID][16].toFixed(0);
    } else
    {
        selectedUnitAttackSpeed = (Entities.GetAttackSpeed(selectedPlayerUnit) * 100).toFixed(0);
    }

    // Update str/agi/int
    if(isHero) {
        let str = main_stats[selectedHeroPlayerID][0].toFixed();
        let agi = main_stats[selectedHeroPlayerID][1].toFixed();
        let int = main_stats[selectedHeroPlayerID][2].toFixed();

        if(customStrLabel != undefined) {
            customStrLabel.text = str;
            customStrLabel.SetHasClass("BigNumber", str >= 10000);
        }

        if(customAgiLabel != undefined) {
            customAgiLabel.text = agi;
            customAgiLabel.SetHasClass("BigNumber", agi >= 10000);
        }

        if(customIntLabel != undefined) {
            customIntLabel.text = int;
            customIntLabel.SetHasClass("BigNumber", int >= 10000);
        }

        // Units stats tooltip
        if(isUnitStatsTooltip != undefined) {
            if(customStrStatsLabel != undefined) {
                customStrStatsLabel.text = str;
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change str value in unit stats tooltip).");
            }
    
            if(customStrModifierStatsLabel != undefined) {
                customStrModifierStatsLabel.text = "";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change str modifier value in unit stats tooltip).");
            }
    
            if(customStrBonusLabel != undefined) {
                let regenFromStr = (main_stats[selectedHeroPlayerID][6]).toFixed(1);
                let blockFromStr = (main_stats[selectedHeroPlayerID][17]).toFixed(0);
                customStrBonusLabel.text = "= " + main_stats[selectedHeroPlayerID][5].toFixed() + " Max Health, " + regenFromStr + " Health Regeneration and " + blockFromStr + " Damage Block.";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change str bonuses label in unit stats tooltip).");
            }
    
            if(customStrPrimaryBonusLabel != undefined) {
                customStrPrimaryBonusLabel.text = "";
                customStrPrimaryBonusLabel.style.visibility = "collapse";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change str primary bonus label in unit stats tooltip).");
            }
    
            if(customAgiStatsLabel != undefined) {
                customAgiStatsLabel.text = agi;
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change agi value label in unit stats tooltip).");
            }
    
            if(customAgiModifierStatsLabel != undefined) {
                customAgiModifierStatsLabel.text = "";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change agi modifier label in unit stats tooltip).");
            }
    
            if(customAgiBonusLabel != undefined) {
                let totalCritDmg = (main_stats[selectedHeroPlayerID][9] * 100).toFixed(1)
                customAgiBonusLabel.text = "= " + main_stats[selectedHeroPlayerID][7].toFixed(0) + " Attack Speed, " + main_stats[selectedHeroPlayerID][8].toFixed(0) + " Armor and " + totalCritDmg + "% Critical Strike Damage";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change agi bonuses label in unit stats tooltip).");
            }
    
            if(customAgiPrimaryBonusLabel != undefined) {
                customAgiPrimaryBonusLabel.text = "";
                customAgiPrimaryBonusLabel.style.visibility = "collapse";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change agi primary bonuses label in unit stats tooltip).");
            }
    
            if(customIntStatsLabel != undefined) {
                customIntStatsLabel.text = int;
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change int value label in unit stats tooltip).");
            }
    
            if(customIntModifierStatsLabel != undefined) {
                customIntModifierStatsLabel.text = "";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change int modifier label in unit stats tooltip).");
            }
    
            if(customIntBonusLabel != undefined) {
                let intDetails = "";
                let totalAbDmg = (main_stats[selectedHeroPlayerID][11] * 100).toFixed(1);
                let totalSpellResistance = main_stats[selectedHeroPlayerID][12].toFixed(1);

                if(main_stats[selectedHeroPlayerID][13] == undefined) {
                    intDetails = "= " + main_stats[selectedHeroPlayerID][10].toFixed() + " Max Mana, " + totalAbDmg + "% Ability Damage and " + totalSpellResistance + " Spell Resistance";
                }else{
                    intDetails = "= " + totalAbDmg + "% Ability Damage,  " + totalSpellResistance + " Spell Resistance";
                }

                customIntBonusLabel.text = intDetails;
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change int bonuses label in unit stats tooltip).");
            }
    
            if(customIntPrimaryBonusLabel != undefined) {
                customIntPrimaryBonusLabel.text = "";
                customIntPrimaryBonusLabel.style.visibility = "collapse";
            } else
            {
                $.Msg("Valve break something or did major changes to UI (can't change int primary bonuses label in unit stats tooltip).");
            }
        }
    }
    
    // Update attack speed label in hero stats tooltip
    if(isUnitStatsTooltip != undefined) {
        if(customAttackSpeedUnitStatsLabel != undefined) {
            customAttackSpeedUnitStatsLabel.text = selectedUnitAttackSpeed;
        } else
        {
           $.Msg("Valve break something or did major changes to UI (can't change attack speed label in unit stats tooltip).");
        }
    }
    
    // Update attack speed label in hero stats region
    if(customAttackSpeedLabel != undefined) {
        customAttackSpeedLabel.text = selectedUnitAttackSpeed;
    } else
    {
       $.Msg("Valve break something or did major changes to UI (can't change attack speed label in hero stats region).");
    }

    // Update unit stats spellhaste row
    if(customSpellHasteLabel != undefined) {
        let spellHasteValue = 0;
        if(isHero) {
            spellHasteValue = (main_stats[selectedHeroPlayerID][14] * 100).toFixed(1);
        }
        customSpellHasteLabel.text = spellHasteValue + "%";
    }

    // Update unit stats damage reduction row
    if(customDamageReductionLabel != undefined) {
        let damageReductionValue = 0;
        if(isHero) {
            damageReductionValue = (100 - (main_stats[selectedHeroPlayerID][15] * 100)).toFixed(1);
        }
        customDamageReductionLabel.text = damageReductionValue + "%";
    }

    // Update unit stats block row
    if(customBlockLabel != undefined) {
        let blockValue = 0;
        if(isHero) {
            blockValue = (main_stats[selectedHeroPlayerID][18]).toFixed(0);
        }
        customBlockLabel.text = blockValue;
    }

    // Modify mana progress bar color to match resource type
    if(customManaRegenProgressBar != undefined && customManaRegenProgressBarParticle != undefined 
        && customManaRegenLabel != undefined && customManaRegenProgressBackgroundBar != undefined) {
        let resourceType = main_stats[selectedHeroPlayerID][13];

        let isEnergySupported = false;

        if(!isHero) {
            resourceType = undefined;
        }
        /*
            undefined - mana (blue, default)
            1 - rage (red)
            2 - energy? (purple)
            3 - corruption (green)
            4 - energy?, dazzle only (purple)
            5 - focus (orange)
        */
        if(resourceType == 1) {
            customManaRegenProgressBar.style.backgroundColor = "gradient( linear, 0% 0%, 100% 100%, from( #771919 ), color-stop( .43, #811717), to( #7d0707 ) )";
            customManaRegenProgressBackgroundBar.style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( #410404 ), color-stop( 0.43, #630c0c ), to( #5e0808 ) )";
            customManaRegenProgressBarParticle.style.hueRotation = "243deg";
            customManaRegenLabel.style.color = "#ff0000";
            isEnergySupported = true;
        }

        if(resourceType == 2 || resourceType == 4) {
            customManaRegenProgressBar.style.backgroundColor = "gradient( linear, 0% 0%, 100% 100%, from( #ab44e6 ), color-stop( .43, #853baf), to( #5a1781 ) )";
            customManaRegenProgressBackgroundBar.style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( #402152 ), color-stop( 0.43, #38174b ), to( #340d4a ) )";
            customManaRegenProgressBarParticle.style.hueRotation = "190deg";
            customManaRegenLabel.style.color = "#ac5cda";
            isEnergySupported = true;
        }

        if(resourceType == 3) {
            customManaRegenProgressBar.style.backgroundColor = "gradient( linear, 0% 0%, 100% 100%, from( #1a3d1c ), color-stop( .43, #0b360d), to( #065c0b ) )";
            customManaRegenProgressBackgroundBar.style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( #132a14 ), color-stop( 0.43, #09160a ), to( #053008 ) )";
            customManaRegenProgressBarParticle.style.hueRotation = "20deg";
            customManaRegenLabel.style.color = "#10ff1e";
            isEnergySupported = true;
        }

        if(resourceType == 5) {
            customManaRegenProgressBar.style.backgroundColor = "gradient( linear, 0% 0%, 100% 100%, from( #f06509 ), color-stop( .43, #d77e43), to( #994a15 ) )";
            customManaRegenProgressBackgroundBar.style.backgroundColor = "gradient( linear, 0% 0%, 100% 100%, from( #5e2b09 ), color-stop( .43, #754626), to( #5e2e0e ) )";
            customManaRegenProgressBarParticle.style.hueRotation = "270deg";
            customManaRegenLabel.style.color = "#ff9500";
            isEnergySupported = true;
        }

        if(resourceType == undefined || !isEnergySupported) {
            customManaRegenProgressBar.style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( #2b4287 ), color-stop( 0.2, #4165ce ), color-stop( .5, #4a73ea), to( #2b4287 ) )";
            customManaRegenProgressBackgroundBar.style.backgroundColor = "gradient( linear, 0% 0%, 0% 100%, from( #101932 ), color-stop( 0.2, #172447 ), color-stop( .5, #162244), to( #101932 ) )";
            customManaRegenProgressBarParticle.style.hueRotation = "50deg";
            customManaRegenLabel.style.color = "#83C2FE";
        }
    }

    // Update gold label
    if(customGoldLabel != null) {
        customGoldLabel.text = gold_stat[selectedHeroPlayerID];
    }
}

let pingHeroLevelCd = false;

function PingHeroLevel()
{
    if(!GameUI.IsAltDown() || pingHeroLevelCd) {
        return;
    }

    // Most likely this will always produce english string if possible...
    let targetPlayerUnit = GetLocalPlayerSelectedUnit();
    let targetPlayerUnitName = undefined;

    if(targetPlayerUnit > -1) {
        targetPlayerUnitName = $.Localize("#" + Entities.GetUnitName(targetPlayerUnit));
    } else {
        targetPlayerUnitName = undefined;
    }

    GameEvents.SendCustomGameEventToServer("pingherolevel", { 
        "player_id" : Game.GetLocalPlayerID(), 
        "target_player_unit_entindex": targetPlayerUnit,
        "target_player_unit_name" : targetPlayerUnitName
    });

    pingHeroLevelCd = true;

    $.Schedule(2, function() {
        pingHeroLevelCd = false;
    })
}

function InjectIntoDotaUI()
{
    let dotaHudRoot = GetDotaHudRoot();
    
    if(dotaHudRoot == null) {
        return;
    }

    let dotaXpContainer = dotaHudRoot.FindChildTraverse("xp");

    // Replaces dota level/xp circle with custom one
    if(dotaXpContainer != undefined) {
        dotaXpContainer.style.visibility = "collapse";

        if(dotaXpContainer._customXpContainer == undefined) {
            let dotaXpContainerParent = dotaXpContainer.GetParent();

            customXpContainer = $.CreatePanel('Panel', dotaXpContainerParent, '');
            customXpContainer.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_xp_container.xml', false, false);
            dotaXpContainerParent.MoveChildAfter(customXpContainer, dotaXpContainer);

            customXpContainer.SetPanelEvent("onactivate", function() {
                PingHeroLevel();
            });

            dotaXpContainer._customXpContainer = customXpContainer;
        } else
        {
            customXpContainer = dotaXpContainer._customXpContainer;
        }

        customLevelLabel = customXpContainer.FindChildTraverse("LevelLabel");
        customLevelProgressBar = customXpContainer.FindChildTraverse("CircularXPProgress");
        customLevelProgressBlurBar = customXpContainer.FindChildTraverse("CircularXPProgressBlur");
    } else
    {
        $.Msg("Valve break something or did major changes to UI (can't replace xp bar).");
    }

    let dotaStrAgiIntContainer = dotaHudRoot.FindChildTraverse("stragiint");

    // Replaces str/agi/int labels with custom ones
    if(dotaStrAgiIntContainer != undefined) {
        dotaStrAgiIntContainer.style.visibility = "collapse";
        
        if(dotaStrAgiIntContainer._customStrAgiIntContainer == undefined) {
            let dotaStrAgiIntContainerParent = dotaStrAgiIntContainer.GetParent();

            customStrAgiIntContainer = $.CreatePanel('Panel', dotaStrAgiIntContainerParent, '');
            customStrAgiIntContainer.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_str_agi_int_container.xml', false, false);
            dotaStrAgiIntContainerParent.MoveChildAfter(customStrAgiIntContainer, dotaStrAgiIntContainer);

            dotaStrAgiIntContainer._customStrAgiIntContainer = customStrAgiIntContainer;
        } else
        {
            customStrAgiIntContainer = dotaStrAgiIntContainer._customStrAgiIntContainer;
        }

        customStrLabel = customStrAgiIntContainer.FindChildTraverse("StrengthSumLabel");
        customAgiLabel = customStrAgiIntContainer.FindChildTraverse("AgilitySumLabel");
        customIntLabel = customStrAgiIntContainer.FindChildTraverse("IntelligenceSumLabel");
    } else
    {
        $.Msg("Valve break something or did major changes to UI (can't replace str/agi/int labels).");
    }

    // Hides aghs/shard display because its unused and adds filler to make ui not look weird
    let aghsShardContainer = dotaHudRoot.FindChildTraverse("AghsStatusContainer");

    if(aghsShardContainer != undefined) {
        aghsShardContainer.style.visibility = "collapse";

        let filler = undefined
        if(aghsShardContainer._fillerPanel == undefined) {
            let aghsShardContainerParent = aghsShardContainer.GetParent();

            filler = $.CreatePanel('Panel', aghsShardContainerParent, '');
            aghsShardContainerParent.MoveChildAfter(filler, aghsShardContainer);

            aghsShardContainer._fillerPanel = filler;
        } else
        {
            filler = aghsShardContainer._fillerPanel;
        }

        filler.style.width = "5px;"
        filler.style.height = "62px";
    } else
    {
        $.Msg("Valve break something or did major changes to UI (can't hide aghs/shard display).");
    }
	
    healthRegenLabel = dotaHudRoot.FindChildTraverse("HealthRegenLabel");

    if(healthRegenLabel == undefined) {
        $.Msg("Valve break something or did major changes to UI (can't find health regen label).");
    }

    // Replaces dota mana bar with custom that support values more than short (server side values stored in int)
    manaContainer = dotaHudRoot.FindChildTraverse("ManaContainer");

    if(manaContainer != undefined) {
        if(manaContainer._customManaContainer == undefined) {
            let manaContainerParent = manaContainer.GetParent();
            
            customManaContainer = $.CreatePanel('Panel', manaContainerParent, '');
            customManaContainer.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_hud_mana.xml', false, false);
            manaContainerParent.MoveChildAfter(customManaContainer, manaContainer);
            
            manaContainer._customManaLabel = customManaContainer.FindChildTraverse("ManaLabel");
            manaContainer._customManaRegenProgressBar = customManaContainer.FindChildTraverse("ManaProgress_Left");
            manaContainer._customManaRegenProgressBarParticle = customManaContainer.FindChildTraverse("ManaBurner");
            manaContainer._customManaRegenProgressBackgroundBar = customManaContainer.FindChildTraverse("ManaProgress_Right");
            manaContainer._customManaRegenLabel = customManaContainer.FindChildTraverse("ManaRegenLabel");
            manaContainer._customManaProgressBar = customManaContainer.FindChildTraverse("ManaProgress");
            
            customManaLabel = manaContainer._customManaLabel;
            customManaRegenProgressBar = manaContainer._customManaRegenProgressBar;
            customManaRegenProgressBarParticle = manaContainer._customManaRegenProgressBarParticle;
            customManaRegenProgressBackgroundBar = manaContainer._customManaRegenProgressBackgroundBar;
            customManaRegenLabel = manaContainer._customManaRegenLabel;
            customManaProgressBar = manaContainer._customManaProgressBar;
            
            manaContainer._customManaContainer = customManaContainer;
        } 
        else
        {
            customManaLabel = manaContainer._customManaLabel;
            customManaRegenProgressBar = manaContainer._customManaRegenProgressBar;
            customManaRegenProgressBarParticle = manaContainer._customManaRegenProgressBarParticle;
            customManaRegenProgressBackgroundBar = manaContainer._customManaRegenProgressBackgroundBar;
            customManaRegenLabel = manaContainer._customManaRegenLabel;
            customManaProgressBar = manaContainer._customManaProgressBar;
            
            customManaContainer = manaContainer._customManaContainer;
        }
    } else {
        $.Msg("Valve break something or did major changes to UI (can't find mana bar container).");
    }
	
    // Replaces dota buffs container with custom one that support multiple rows
    let buffsContainer = dotaHudRoot.FindChildTraverse("buffs");

    if(buffsContainer != undefined) {
        buffsContainer.style.visibility = "collapse";
        
        if(buffsContainer._customBuffsContainer == undefined) {
            let buffsContainerParent = buffsContainer.GetParent();

            customBuffsContainer = $.CreatePanel('Panel', buffsContainerParent, '');
            customBuffsContainer.SetHasClass("customBuffs", true);
            customBuffsContainer.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_buff_list.xml', false, false);
            buffsContainerParent.MoveChildAfter(customBuffsContainer, buffsContainer);

            buffsContainer._customBuffsContainer = customBuffsContainer;
        } else
        {
            customBuffsContainer = buffsContainer._customBuffsContainer;
        }
    } else {
        $.Msg("Valve break something or did major changes to UI (can't find buffs container).");
    }

    // Replaces dota debuffs container with custom one that support multiple rows
    let debuffsContainer = dotaHudRoot.FindChildTraverse("debuffs");

    if(debuffsContainer != undefined) {
        debuffsContainer.style.visibility = "collapse";
        
        if(debuffsContainer._customDebuffsContainer == undefined) {
            let debuffsContainerParent = debuffsContainer.GetParent();

            customDebuffsContainer = $.CreatePanel('Panel', debuffsContainerParent, '');
            customDebuffsContainer.SetHasClass("customDebuffs", true);
            customDebuffsContainer.BLoadLayout('file://{resources}/layout/custom_game/dota_hud/dota_buff_list.xml', false, false);
            debuffsContainerParent.MoveChildAfter(customDebuffsContainer, debuffsContainer);

            debuffsContainer._customDebuffsContainer = customDebuffsContainer;
        } else
        {
            customDebuffsContainer = debuffsContainer._customDebuffsContainer;
        }
    } else {
        $.Msg("Valve break something or did major changes to UI (can't find debuffs container).");
    }

    // Replaces dota current gold label with custom one
    let shopButton = dotaHudRoot.FindChildTraverse("ShopButton");

    if(shopButton != undefined) {
        let shopLabel = shopButton.FindChildTraverse("GoldLabel");

        if(shopLabel != undefined) {
            shopLabel.style.visibility = "collapse";
        
            if(shopLabel._customGoldLabel == undefined) {   
                customGoldLabel = $.CreatePanel('Label', shopButton, '');
                customGoldLabel.SetHasClass("MonoNumbersFont", true);
                customGoldLabel.SetHasClass("ShopButtonValueLabel", true);
                customGoldLabel.style.opacity = "1";
                shopButton.MoveChildAfter(customGoldLabel, shopLabel);
    
                shopLabel._customGoldLabel = customGoldLabel;
            } else
            {
                customGoldLabel = shopLabel._customGoldLabel;
            }
        } else
        {
            $.Msg("Valve break something or did major changes to UI (can't find gold label).");
        }
    } else {
        $.Msg("Valve break something or did major changes to UI (can't find gold label).");
    }

    // Hides facets and innate ability ui
    let talentsTree = dotaHudRoot.FindChildTraverse("StatBranch");
    if(talentsTree != undefined) {
        let parent = talentsTree.GetParent();
        let childsCount = parent.GetChildCount();

        for(let i = 0; i < childsCount; i++) {
            let child = parent.GetChild(i);

            if(child == undefined) {
                break;
            }

            if(child.paneltype === "DOTAInnateDisplay") {
                child.style.visibility = "collapse";
                break;
            }
        }
    }
    
    // Attack speed label
    let statsRegion = dotaHudRoot.FindChildTraverse("stats");
    if(statsRegion != undefined) {
        customAttackSpeedLabel = dotaHudRoot.FindChildTraverse("AttackSpeedLabelBase");
    }
	
    // Hides new neutral item buttons
    let neutralItemContainer = dotaHudRoot.FindChildTraverse("inventory_neutral_craft_holder");
    if(neutralItemContainer != undefined) {
        neutralItemContainer.style.visibility = "collapse";
    }
}

function SetUIStats(args)
{   
    //$.Msg(args);
    //$.Msg(args.id);
    var identifier = "#att" + (String)(args.id);
   //$.Msg(identifier);
    $(identifier).text = args.name + ": " + args.amount;
}

function SetGold(args)
{   
    var id = args.id;
    gold_stat[id] = args.gold;
}

function RegisterKeyBind(keyBind, callback) {
    let uniqueCommandName = "+" + "titanbreaker_" + keyBind + "_" + Date.now();
    Game.AddCommand(uniqueCommandName, callback, "", 0);
    Game.CreateCustomKeyBind(keyBind, uniqueCommandName);
}

var isServerSendedDataForReconnectedPlayer = false;

function OnPlayerConnectedResponse()
{
    // Server responded so stop spam until next time
    isServerSendedDataForReconnectedPlayer = true;
}

function TrySendReconnectEvent()
{
    // Spamming server every 1s until he sends our data back...
    if(!isServerSendedDataForReconnectedPlayer)
    {
        GameEvents.SendCustomGameEventToServer("playerconnected", { "player_id" : Players.GetLocalPlayer() });
        $.Schedule(1, TrySendReconnectEvent);  
    } else
    {
        //$.Msg("We finally got response!");
    }
}


function FillRuneWords(args)
{
	if(args["scalings"] == undefined || args["bonusPerRunePower"] == undefined
	|| args["minRunePower"] == undefined || args["maxRunePower"] == undefined)
	{
		throw new Error("Invalid rune words list message");
		return;
	}
	
	let container = $("#RuneWordsContainer");
	container.RemoveAndDeleteChildren();
	
	for (const [runeWordIndex, runeWordData] of Object.entries(args["scalings"])) {
		let runeWordImage = GetRunewordImageByID(runeWordIndex);
		if(runeWordImage == undefined || runeWordImage.length < 1) {
		    break;
		}
		
		let runeWordPanel = $.CreatePanel('Panel', container, '');
		runeWordPanel.BLoadLayoutSnippet("RuneWordContainer");
		runeWordPanel.FindChildTraverse("RuneWordImage").SetImage(runeWordImage + ".png");
		
		let runeText = $.Localize("#rune" + runeWordIndex).split("\n\n");
		runeWordPanel.FindChildTraverse("RuneWordHeader").text = runeText[1]; 
		runeWordPanel.FindChildTraverse("RuneWordDescription").text = runeText[0]; 
		
		let runeWordDetails = runeWordPanel.FindChildTraverse("RuneWordDetails");
		let runeWordDetailsText = "";
		let newLineSymbol = "<br>";
		
		let bonusPerRunePower = (Math.round(args["bonusPerRunePower"][runeWordIndex]*100)/100);
		runeWordDetailsText += "Bonus per Rune Power = " + bonusPerRunePower + newLineSymbol + newLineSymbol;
		
		let minValue = args["minRunePower"];
		let maxValue = args["maxRunePower"];
		
		let runeWordsExamplesText = "";
		for (const [runePower, runePowerValue] of Object.entries(runeWordData)) {
			runeWordsExamplesText += "Rune Power " + runePower + " = " + runePowerValue + newLineSymbol;
		}
		
		// Update formula here for example math...
		let randomPossibleRunePowerValue = Math.floor(Math.random() * (maxValue - minValue + 1) + minValue);
		let randomPossibleRunePowerValueForDisplay = Math.round(randomPossibleRunePowerValue * 100) / 100;
		let randomPossibleRunePowerActualBonus = randomPossibleRunePowerValue * bonusPerRunePower;
		let randomPossibleRunePowerActualBonusForDisplay = Math.round(randomPossibleRunePowerActualBonus * 100) / 100;
		
		runeWordDetailsText += "Example for Rune Power " + randomPossibleRunePowerValueForDisplay + ": " + newLineSymbol;
		runeWordDetailsText += randomPossibleRunePowerValueForDisplay + " * " + bonusPerRunePower + " = " + randomPossibleRunePowerActualBonusForDisplay + newLineSymbol;
		runeWordDetailsText += "Final value rounded up (min value is 1):" + newLineSymbol;
		runeWordDetailsText += randomPossibleRunePowerActualBonusForDisplay + " = " + Math.max(1, Math.floor(randomPossibleRunePowerActualBonus + 0.5)) + newLineSymbol;
		
		runeWordDetailsText += newLineSymbol + "Possible bonuses from this Rune Word:";
		runeWordDetailsText += newLineSymbol + runeWordsExamplesText;
		runeWordDetailsText = runeWordDetailsText.substring(0, runeWordDetailsText.length - newLineSymbol.length);
		
		runeWordDetails.SetPanelEvent("onmouseover", function() { 
		    $.DispatchEvent("DOTAShowTextTooltip", runeWordDetails, runeWordDetailsText);
		});
		runeWordDetails.SetPanelEvent("onmouseout", function() { 
		    $.DispatchEvent("DOTAHideTextTooltip", runeWordDetails);
		});
	}
}

function ShowPossibleRuneWords()
{
    $("#RuneWordsContainer").ToggleClass("Hidden");
}

function OpenDiscordURL()
{
    $.DispatchEvent("ExternalBrowserGoToURL", $.GetContextPanel(), "https://discord.gg/as8MzdJ");
}

function OnHeroStatsValuesResponse(args)
{
    let hpPerLevel = args["bonusMaxHpPerLvl"].toFixed();
    let channelSpellhasteCap = ((args["channelSpellhasteCap"]-1)*100).toFixed();
    $("#ChannelSpellHasteLabel").text = "Half of Spellhaste increases the tick rate of Channeled Abilities\nbut only up to " + channelSpellhasteCap + "%.";
    $("#MaxHealthPerLvlLabel").text = "+" + hpPerLevel + " Max Health per Hero Level";
}

(function () {
    //$.Msg("Elo StatCollection Client Loaded");

    //GameEvents.Subscribe("statcollection_client", EloOnClientCheckIn);
    GameEvents.Subscribe("send_elo_result", SendEloResults);
    GameEvents.Subscribe("send_leaver_detected", LeaverDetected);
    GameEvents.Subscribe("getseasonrewards", LoadSeasonRewards);
    GameEvents.Subscribe("report_boss_score", UpdateBossScore);
    GameEvents.Subscribe("report_drop_chance", SetTempleDifficulty);
    GameEvents.Subscribe("savechar", SaveChar);
    GameEvents.Subscribe("loadchar", LoadChar);
    GameEvents.Subscribe("lasttempledrop", NewTempleDrop);
    GameEvents.Subscribe("lasttempleweapondrop", NewWeaponDrop);
    GameEvents.Subscribe("lasttempleweapondropshow", ShowWeaponDropToAll);
    GameEvents.Subscribe("additemtoselllist", AddItemToSellList);
    GameEvents.Subscribe("templeweaponequip", NewWeaponEquipped);
    GameEvents.Subscribe("runewordequip", RuneWordEquipped);
    GameEvents.Subscribe("setmychest", SetMyChest);
    GameEvents.Subscribe("updateinventory", PeriodicUpdateStart);
    GameEvents.Subscribe("talentleveled", TalentLeveled);
    GameEvents.Subscribe("talentpoints", TalentPointUpdate);
    GameEvents.Subscribe("actentered", ActEntered);
    GameEvents.Subscribe("report_dps_meter", DPSMeterReported);
    GameEvents.Subscribe("mythic_dust_update", UpdateMythicDust);
    GameEvents.Subscribe("templeherostatistics", UpdateHeroStatistics);
    GameEvents.Subscribe("additemtodroptable", AddItemToDropTable);
    GameEvents.Subscribe("additemtoactenter", AdditemToActEnterMsg);
    GameEvents.Subscribe("temple_ability_stats", TempleAbilityStatsUpdate);
    GameEvents.Subscribe("tp_unlocked", TeleporterUnlock);
    GameEvents.Subscribe("toggle_menu", TeleporterMenu);
    GameEvents.Subscribe("molten_forge_menu", MoltenForgeMenuToggle);
    GameEvents.Subscribe("temple_difficulty_update", SetTempleDifficultyLoader);
    GameEvents.Subscribe("temple_show_difficulty_panel", ShowTempleDifficultyPanel); //now used to toggle
    GameEvents.Subscribe("report_monster_spellcast", MonsterSpellcast);
    GameEvents.Subscribe("report_monster_affixes", MonsterAffixDisplay);
    GameEvents.Subscribe("pathword", SetPathword);
    GameEvents.Subscribe("toggle_stash_set_number", SetStashToggleNumber);
    GameEvents.Subscribe("set_main_stats", SetMainStats);
    GameEvents.Subscribe("stats", SetUIStats);
    // OLD STATS UI
    //GameEvents.Subscribe("set_mana_per_int", SetManaPerInt);
    GameEvents.Subscribe("temple_difficulty_mode_update", SetDifficultyModeText);
    GameEvents.Subscribe("set_gold", SetGold);
    GameEvents.Subscribe("additemstoshop", AddItemsToShop);
    GameEvents.Subscribe("getautosellresponse", OnAutoSellFiltersResponse);
    GameEvents.Subscribe("getleaderboardresponse", OnLeaderboardResponseFromServer);
    GameEvents.Subscribe("getherostatsvaluesresponse", OnHeroStatsValuesResponse);
    GameEvents.Subscribe("auto_sell_stash_item", OnAutoSellStashItem);
    GameEvents.Subscribe("buyautosellstashitemresponse", OnAutoSellStashItemBought);
    GameEvents.Subscribe("setrunewordslist", FillRuneWords);

    //Game.AddCommand( "+UPressed", ToggleInventory, "", 0 );
    //Game.AddCommand( "+OPressed", ToggleTalentTree, "", 0 );
    //Game.AddCommand( "+JPressed", ToggleGambling, "", 0 );
    //Game.AddCommand( "+KPressed", TeleporterMenu, "", 0 );
    //Game.AddCommand( "+NPressed", ToggleAggroMeter, "", 0 );
    //Game.AddCommand( "+LPressed", ToggleLootInformation, "", 0 );
    
    RegisterKeyBind("U", ToggleInventory);
    RegisterKeyBind("O", ToggleTalentTree);
    RegisterKeyBind("K", TeleporterMenu);
    RegisterKeyBind("N", ToggleAggroMeter);
	
    /*
        dota_player_update_query_unit - support for seperate/query unit hud or whatever it named minority of players using
        dota_player_update_selected_unit - support for default hud that majority of players using
    */
    GameEvents.Subscribe('dota_player_update_query_unit', onUnitChanged);
    GameEvents.Subscribe("dota_player_update_selected_unit", onUnitChanged);

    //GameEvents.SendCustomGameEventToServer( "gamemode_vote", { "player_id" : Players.GetLocalPlayer(), "mode_id" : wins } );
    $.FindChildInContext("#table").visible = false;
    $.FindChildInContext("#leaderboard").visible = false;
    //$.FindChildInContext("#leaderboardchallengemode").visible = false;
    //$.FindChildInContext("#rewards").visible = false;
    $.FindChildInContext("#questlogingame").visible = false;
    $.FindChildInContext("#FlowPanel4").visible = false;
    $.FindChildInContext("#teleportermenu").visible = false;
    $.FindChildInContext("#questmenu").visible = false;
    ladder = Game.GetAllPlayerIDs().length;
    for (var i = 0; i < ladder; i++) {
        season2gladiator = 0;
    }

    playerChests = new Array(10);

    selectedHeroPlayerID = Players.GetLocalPlayer();
    selectedHeroPlayerID = 0;

    //initialize inventory system
    inventory = new Array(20);
    for (var i = 0; i < 20; i++) {
        inventory[i] = new Array(mythicslots+1);
        for (var j = 1; j < mythicslots+1; j++) {
            inventory[i][j] = new Array(13);
        }
    }
    for (var i = 1; i < 9; i++) {
        var panel = $.FindChildInContext("#teleporter"+i);
        panel.visible = false;
    }
    //hero stats
    hero_stats = new Array(20);
    for (var i = 0; i < 20; i++) {
        hero_stats[i] = new Array(stats_amount);
        for (var j = 0; j < stats_amount; j++) {
            hero_stats[i][j] = "+ 0%";
            if(j == 5){
                hero_stats[i][j] = "0%";
            }
            if(j == 6){
                hero_stats[i][j] = "100%";
            }
            if(j == 7 || j == 8 || j == 11){
                hero_stats[i][j] = "0";
            }
            if(j == 9 || j == 10){
                hero_stats[i][j] = "Peak: 0";
            }
        }
    }
    runeword = new Array(20);
    runeword_id = new Array(20);
    pathword = new Array(10);
    pathword_id = new Array(10);
    main_stats = new Array(10);
    gold_stat = new Array(10);
    //talents
    talents = new Array(10);
    for (var i = 0; i < 10; i++) {
        gold_stat[i] = 0;
        talents[i] = new Array(max_talents);
        for (var j = 1; j <= max_talents; j++) {
            talents[i][j] = 0;
        }
        /* OLD STATS UI
        main_stats[i] = new Array(5);
        for (var j = 0; j < 5; j++) {
            main_stats[i][j] = 0;
        }
        */
        main_stats[i] = new Array(18);
        for (var j = 0; j <= 18; j++) {
            main_stats[i][j] = 0;
        }
    }

    //disable pvp top bar
    if (true){//(Game.GetMapInfo()['map_display_name'] == "beginner_hero_level_1_to_9" || Game.GetMapInfo()['map_display_name'] == "expert_hero_level_10_or_higher"){
       $.FindChildInContext("#FlowPanel").visible = false;
       $.FindChildInContext("#DropTableToggle").visible = false;
        //$.FindChildInContext("#FlowPanel2").visible = false;
        //$.FindChildInContext("#FlowPanel3").visible = false;
        $.FindChildInContext("#questlogingame").visible = true;
    }else{
        $.FindChildInContext("#selectdiffipanel").visible = false;
    }

    $.FindChildInContext("#WeaponDropDisplay").visible = false;
    $.FindChildInContext("#WeaponInventoryDisplay").visible = false;
    $.FindChildInContext("#TalentTree").visible = false;
    $.FindChildInContext("#shopMain").visible = false;
    $.FindChildInContext("#talenttooltip").visible = false;
    $.FindChildInContext("#gambling").visible = false;
    $.FindChildInContext("#ActEntering").visible = false;
    $.FindChildInContext("#aggrometerbars").visible = false;
    $.FindChildInContext("#rewards").visible = false;
    $.FindChildInContext("#loottable").visible = false;
    $.FindChildInContext("#selectdiffipanel").visible = false;
    $.FindChildInContext("#autoSellStash").visible = false;
    //$.FindChildInContext("#StatBranchBG").visible = false;
    //$("#StatBranch").visible = false;
        
    var spectatorid = Game.GetLocalPlayerID();
    spectator = Players.IsSpectator(spectatorid);
    //spectator = true;
    $.Msg('Obs State: ', spectator);
    if (spectator){
        selectedHeroPlayerID = 0;
        playerheroingame = true;
    }
    PeriodicUpdate();
	
    CustomNetTables.SubscribeNetTableListener( "panorama_hero_stats", function (tableName, key, data) 
    {
    	FixPanoramaStats(key, data);
    });
	
    //ShowTempleDifficultyPanel(10000); //todo disable
    //DisableTalentTree();

    GameEvents.Subscribe("playerconnectedresponse", OnPlayerConnectedResponse);
    // Tries inform server that some guy connected first time or reconnected (spams server until he finally processed request)...
    $.Schedule(1, TrySendReconnectEvent);


    // Override dota hero stats tooltip and fill it with custom values
    $.RegisterForUnhandledEvent('TooltipVisible', OnTooltipVisible);
    
    // Always run it last since it may fail one day
    InjectIntoDotaUI();
})();

function DisableTalentTree(){
    var ui = $.FindChildInContext("#lower_hud");
    $.Msg(ui);
    var newUI = $.GetContextPanel();
    $.Msg(newUI);
    newUI = newUI.GetParent();
    $.Msg(newUI);
    newUI = newUI.GetParent();
    $.Msg(newUI);
    newUI = newUI.GetParent();
    $.Msg(newUI);
    newUI = newUI.FindChildTraverse("HUDElements");
    $.Msg(newUI);
    //FindChildTraverse("lower_hud").FindChildTraverse("center_with_stats").FindChildTraverse("center_block");
    //Use this line if you want to keep 4 ability minimum size, and only use 160 if you want ~2 ability min size
    //newUI.FindChildTraverse("AbilitiesAndStatBranch").style.minWidth = "284px";
    newUI.FindChildTraverse("AbilitiesAndStatBranch").style.minWidth = "160px";
    newUI.FindChildTraverse("StatBranch").style.visibility = "collapse";
    //you are not spawning the talent UI, fuck off (Disabling mouseover and onactivate)
    //We also don't want to crash, valve plz
    newUI.FindChildTraverse("StatBranch").SetPanelEvent("onmouseover", function(){});
    newUI.FindChildTraverse("StatBranch").SetPanelEvent("onactivate", function(){});
    //Fuck that levelup button
    newUI.FindChildTraverse("level_stats_frame").style.visibility = "collapse";
    $.Msg(newUI);
    $.Msg("disabled talent tree");
}