shadow6 = class({})

function shadow6:Precache(context)
	PrecacheResource("particle", "particles/econ/items/silencer/silencer_ti6/silencer_last_word_status_ti6.vpcf", context)
	PrecacheResource("particle", "particles/units/heroes/hero_bane/bane_projectile.vpcf", context)
	PrecacheResource("particle", "particles/shadow_cleric_mana_shield.vpcf", context)
	PrecacheResource("particle", "particles/shadow_cleric_darkness_armor.vpcf", context)
	PrecacheResource("particle", "particles/shadow_cleric_darkness_armor.vpcf", context)
    -- class item
    PrecacheResource("model", "models/items/enigma/eidolon/enigma_seer_of_infinity_space_eidolon/enigma_seer_of_infinity_space_eidolon.vmdl", context)
end

function shadow6:OnSpellStart()
    local caster = self:GetCaster()
    local buffDuration = self:GetSpecialValueFor("duration")

    if(caster:HasModifier("modifier_shadow_cleric_path_of_darkness_buff_inner_cd") == false) then
        ApplyBuff({
            caster = caster,
            target = caster,
            ability = self,
            dur = buffDuration,
            buff = "modifier_shadow_cleric_path_of_darkness_buff"
        })

        local innerCd = self:GetSpecialValueFor("inner_cd") * GetInnerCooldownFactor(caster)
        caster:AddNewModifier(caster, self, "modifier_shadow_cleric_path_of_darkness_buff_inner_cd", { duration = innerCd})
    end

    if(self:GetLevel() >= 2) then
        ApplyBuff({
            caster = caster,
            target = caster,
            ability = self,
            dur = buffDuration,
            buff = "modifier_shadow_cleric_path_of_darkness_summons_buff"
        })
    end

    if(self:GetLevel() >= 3) then
        ApplyBuff({
            caster = caster,
            target = caster,
            ability = self,
            dur = self:GetSpecialValueFor("shadow_worms_mana_shield_duration"),
            buff = "modifier_shadow_cleric_path_of_darkness_mana_shield_buff"
        })
    end

    local dsClassItemModifier = caster:FindModifierByName("modifier_class_ds2")
    if(dsClassItemModifier) then
        local dsClassItemModifierAbility = dsClassItemModifier:GetAbility()
        if(dsClassItemModifierAbility) then
            ApplyBuff({
                caster = caster,
                target = caster,
                ability = self,
                dur = dsClassItemModifierAbility:GetSpecialValueFor("duration"),
                buff = "modifier_shadow_cleric_path_of_darkness_shadow_priest_form"
            })
        end
    end

    EmitSoundOn("Hero_Dark_Seer.Wall_of_Replica_Start", caster)
    EmitSoundOn("dark_seer_dkseer_respawn_04", caster)
end

function shadow6:OnProjectileHit(target, location)
    if(target == nil) then
        return true
    end

    DamageUnit({
        caster = self:GetCaster(),
        target = target,
        damage = 0,
        spelldamagefactor = self:GetSpecialValueFor("shadow_worms_spelldmg"),
        attributefactor = self:GetSpecialValueFor("shadow_worms_dmgfromstat"),
        shadowdmg = 1,
        fromsummon = 1,
        ignore_when_target_has_reflect = 1
    })

    return true
end