if not IsInToolsMode() then
    return
end

Timers:CreateTimer(1, function()
    -- Await until all game stuff initialized
    if(GameRules and GameRules:State_Get() >= DOTA_GAMERULES_STATE_PRE_GAME) then
        Init()
        return
    end
    return 1
end)

function Init()
    if(_G._debugToolsInit) then
        return
    end
    --[[
    Completely breaks datadriven...
    
    Convars:RegisterCommand("reload_kv", function(...)
        GameRules:Playtesting_UpdateAddOnKeyValues()
    end, "reload_kv", FCVAR_CHEAT)
    --]]

    Convars:RegisterCommand("droptempleitem", function(_, lootQuality, lootModifier)
        local lootQuality = tonumber(lootQuality)
        local isSoul = lootModifier == "soul" -- probably impossible without modifying DropTempleItem so unimplemented for now
        local isArti = lootModifier == "arti"

        DebugDropTempleItem(lootQuality, isSoul, isArti)
    end, "droptempleitem", FCVAR_CHEAT)
	
    Convars:RegisterCommand("loadhero", function(_, hero, steamid)
        DebugLoadSave(hero, steamid)
    end, "loadhero", FCVAR_CHEAT)
	
    local villageDummyPoint = Vector(-14972.935547, 14804.335938, 128.000000)
    
    CreateUnitByName("npc_dota_creature_tutorial_dummy", villageDummyPoint, false, nil, nil, DOTA_TEAM_NEUTRALS)

    _G._debugToolsInit = true

end

function DebugDropTempleItem(lootQuality, isSoul, isArti)
    if not IsInToolsMode() then -- just to be 100% safe
        return
    end
    if(lootQuality == nil) then
        return
    end

    COverthrowGameMode:DropTempleItem(PlayerResource:GetSelectedHeroEntity(0), 100, 2, lootQuality, isArti)
end

function DebugLoadSave(hero, steamid)
    if not IsInToolsMode() then -- just to be 100% safe
        return
    end
	
    if(hero == nil or DOTAGameManager:GetHeroIDByName("npc_dota_hero_"..hero) <= 0) then
        print("Hero is invalid or not specified")
        return
    end
	
    if(steamid == nil) then
        print("Steam id not specified")
        return
    end
	
    local request = CreateHTTPRequestScriptVM( "POST", "http://catze.eu/loadchar_v15_season_10.php" )
    request:SetHTTPRequestGetOrPostParameter("order", "loadchar")
    request:SetHTTPRequestGetOrPostParameter("pid", tostring(steamid))
    request:SetHTTPRequestGetOrPostParameter("hero", tostring(hero))
    print("Request", request:Send(function(result)
        local str = result.Body
        local target = string.byte(",")
        local commaIndex = -1
        for idx = 1, #str do
            if str:byte(idx) == target then
                commaIndex = idx
                break
            end
        end
        
        if(commaIndex == -1) then
            print("Can't find substring with steamid in save data")
            print("Save data: "..tostring(str))
            return
        end
        
        local saveDataWithFixedSteamId = PlayerResource:GetSteamAccountID(0)..string.sub(str, commaIndex, #str)
        		
        PlayerResource:GetSelectedHeroEntity(0).auto_loaded = nil
        
        local result = 
        {
            Body = saveDataWithFixedSteamId
        }
        
        COverthrowGameMode:LoadCharReply({}, result)
    end))
end