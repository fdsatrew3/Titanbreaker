let LIVES_LABEL = undefined;

function PortraitClicked() {
    Players.PlayerPortraitClicked($.GetContextPanel().GetAttributeInt("player_id", -1), GameUI.IsControlDown(), GameUI.IsAltDown());
}

function PortraitClicked() {
    Players.PlayerPortraitClicked($.GetContextPanel().GetAttributeInt("player_id", -1), GameUI.IsControlDown(), GameUI.IsAltDown());
}

function GetLivesAmount(playerId)
{
    let playerHero = Players.GetPlayerHeroEntityIndex(playerId)

    if(playerHero < 0) {
        return 0;
    }


    for(let i = 0; i <= Entities.GetNumBuffs(playerHero); i++) {
        let buffName = Buffs.GetName(playerHero, i);
        if(buffName == "modifier_pvelives") {
            return Buffs.GetStackCount(playerHero, i)
        }
    }

    return 0;
}

function AutoUpdateLivesLabel()
{
    let playerId = $.GetContextPanel().GetAttributeInt("player_id", -1);
    if(playerId > -1 && LIVES_LABEL != undefined) {
        let totalLives = GetLivesAmount(playerId);
        LIVES_LABEL.text = totalLives;
        LIVES_LABEL.SetHasClass("Hidden", totalLives == 0);
    }

    $.Schedule(1, function() {
        AutoUpdateLivesLabel();
    })
}

(function() {
    LIVES_LABEL = $.GetContextPanel().FindChildTraverse("LivesLabel")
    AutoUpdateLivesLabel();
})();