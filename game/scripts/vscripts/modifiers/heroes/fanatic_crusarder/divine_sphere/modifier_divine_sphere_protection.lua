modifier_divine_sphere_protection = class({
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
            MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PHYSICAL,
            MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_MAGICAL,
            MODIFIER_PROPERTY_ABSOLUTE_NO_DAMAGE_PURE,
            MODIFIER_EVENT_ON_TAKEDAMAGE
        }
    end
})

function modifier_divine_sphere_protection:OnCreated()
    self:OnRefresh()
    
    if(not IsServer()) then
    	return
    end
    
    self.parent = self:GetParent()
    self.ability = self:GetAbility()
    
    local parentOrigin = self.parent:GetAbsOrigin()
    
    local particle = ParticleManager:CreateParticle("particles/units/heroes/hero_warlock/warlock_shadow_word_buff_c.vpcf", PATTACH_OVERHEAD_FOLLOW, self.parent)
    ParticleManager:SetParticleControlEnt(particle, 0, self.parent, PATTACH_POINT_FOLLOW, "attach_overhead", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 1, self.parent, PATTACH_POINT_FOLLOW, "attach_overhead", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 2, self.parent, PATTACH_POINT_FOLLOW, "attach_overhead", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 3, self.parent, PATTACH_POINT_FOLLOW, "attach_overhead", parentOrigin, true)
    self:AddParticle(particle, false, false, 1, false, false)
    
    particle = ParticleManager:CreateParticle("particles/econ/events/ti6/teleport_start_ti6_lvl3_rays.vpcf", PATTACH_CUSTOMORIGIN, self.parent)
    ParticleManager:SetParticleControlEnt(particle, 0, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 1, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    self:AddParticle(particle, false, false, 1, false, false)
        
    particle = ParticleManager:CreateParticle("particles/econ/items/omniknight/hammer_ti6_immortal/omniknight_pur_ti6_immortal_beams.vpcf", PATTACH_CUSTOMORIGIN, self.parent)
    ParticleManager:SetParticleControlEnt(particle, 0, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 1, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 2, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    ParticleManager:SetParticleControlEnt(particle, 3, self.parent, PATTACH_POINT_FOLLOW, "attach_hitloc", parentOrigin, true)
    self:AddParticle(particle, false, false, 1, false, false)
end

function modifier_divine_sphere_protection:OnRefresh()
    self.ability = self:GetAbility()
    	
    if(not IsServer()) then
    	return
    end
    self.radius = self.ability:GetSpecialValueFor("radius")
    
    self:StartIntervalThink(self.ability:GetSpecialValueFor("hammertime"))
end

function modifier_divine_sphere_protection:OnIntervalThink()
    local enemies = FindNearbyEnemies(self.parent, self.parent:GetAbsOrigin(), self.radius)
    
    local projectile = {
        Target = nil,
        Source = self.parent,
        Ability = self.ability,
        EffectName = "particles/hammer_throw_2.vpcf",
        bDodgeable = true,
        bProvidesVision = true,
        iMoveSpeed = 750,
        iVisionRadius = 300,
        iVisionTeamNumber = self.parent:GetTeamNumber(),
        iSourceAttachment = DOTA_PROJECTILE_ATTACHMENT_HITLOCATION
    }
    
    for _, enemy in pairs(enemies) do
    	projectile.Target = enemy
    	ProjectileManager:CreateTrackingProjectile(projectile)
    end
    
    EmitSoundOn("Hero_LegionCommander.PreAttack", self.parent)
end

function modifier_divine_sphere_protection:OnTakeDamage(kv)
    if(kv.unit ~= self.parent) then
        return
    end
    
    DivineSphereTakeDamage({
    	DamageTaken = kv.damage,
    	unit = kv.unit,
    	ability = self.ability,
    	caster = self.parent
    })
end

function modifier_divine_sphere_protection:GetAbsoluteNoDamagePhysical()
    return self:GetStackCount()
end

function modifier_divine_sphere_protection:GetAbsoluteNoDamageMagical()
    return self:GetStackCount()
end

function modifier_divine_sphere_protection:GetAbsoluteNoDamagePure()
    return self:GetStackCount()
end