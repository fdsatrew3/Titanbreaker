modifier_shadow_cleric_path_of_darkness_mana_shield_buff = class({
	IsHidden = function() 
        return false 
    end,
	IsPurgable = function() 
        return false 
    end,
    IsDebuff = function()
		return false
	end,
    GetTexture = function()
        return "fix/shadow_cleric_mana_shield"
    end
})

function modifier_shadow_cleric_path_of_darkness_mana_shield_buff:OnCreated()
    if(not IsServer()) then
        return
    end

    self.parent = self:GetParent()

    local particle = ParticleManager:CreateParticle("particles/shadow_cleric_mana_shield.vpcf", PATTACH_ABSORIGIN_FOLLOW, self.parent)
    ParticleManager:SetParticleControl(particle, 1, Vector(0, 0, 25))
    self:AddParticle(particle, false, false, 1, false, false)
end