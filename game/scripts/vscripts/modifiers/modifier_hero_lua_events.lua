modifier_hero_lua_events = class({
    IsHidden = function()
        return false
    end,
    IsPurgable = function()
        return false
    end,
    IsDebuff = function()
        return false
    end,
    DeclareFunctions = function()
        return 
        {
            MODIFIER_EVENT_ON_ABILITY_FULLY_CAST
        }
    end,
    GetAttributes = function()
        return MODIFIER_ATTRIBUTE_PERMANENT
    end,
    RemoveOnDeath = function()
        return false
    end
})

function modifier_hero_lua_events:OnCreated(kv)
    self.parent = self:GetParent()
end

function modifier_hero_lua_events:OnAbilityFullyCast(kv)
    if(kv.unit ~= self.parent) then
        return
    end
    COverthrowGameMode:GlobalOnAbilityFullyCast(self.parent, kv.ability, kv.target)
end
