--[[
    HOW TO ADD SUPPORT FOR NEW HERO:
    1. Define and implement function that will return next ability for autocasts based on caster, ability, target (if exists)
    2. Setup tables entries in OnCreated for that hero and function from 1)
	
    HOW TO ADD SUPPORT FOR NEW HERO SUMMON:
    1. Define and implement function that will return next ability for autocasts based on caster, ability, target (if exists)
    2. Setup tables entries in OnCreated for that summon and function from 1)
	
	* Summon will try always cast his abilities on owner last attack/cast target
	* Summon will don't care if he can die
	* Summon will ignore enemies with damage reflection
--]]

modifier_auto_casts = class({
    IsHidden = function()
        return true
    end,
    IsPurgable = function()
        return false
    end,
    IsPurgeException = function()
        return false
    end,
    IsDebuff = function()
        return false
    end,
    DeclareFunctions = function()
        return 
        {
            MODIFIER_EVENT_ON_ABILITY_FULLY_CAST,
            MODIFIER_EVENT_ON_ABILITY_END_CHANNEL,
            MODIFIER_EVENT_ON_ORDER,
            --MODIFIER_EVENT_ON_ATTACK_LANDED
        }
    end,
    GetAttributes = function()
        return MODIFIER_ATTRIBUTE_PERMANENT
    end,
    RemoveOnDeath = function()
        return false
    end
})

--[[
function modifier_auto_casts:OnAttackLanded(kv)
	if(self.parent ~= kv.attacker) then
		return
	end
	
	--print("!!!!!!!!!!!!!!!!!!!!!!!!!! OnAttackLanded !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
end --]]

function modifier_auto_casts:OnCreated()
    if(not IsServer()) then
        return
    end
    self.parent = self:GetParent()
    self.parentName = self.parent:GetUnitName()
    self.abilitiesWithAutoCasts = {}
    self.abilitiesWithAutoCastsCount = 0
    -- Add entry here [heroName, functionName] for heroName autocasts support + implementation of functionName somewhere here in modifier_auto_casts scope
    self.autoCastsImplementations = {
        ["npc_dota_hero_oracle"] = "GetNextAbilityForOracleAutoCasts",
        ["npc_dota_hero_pugna"] = "GetNextAbilityForPugnaAutoCasts",
        ["npc_dota_hero_grimstroke"] = "GetNextAbilityForGrimstrokeAutoCasts",
        ["npc_dota_hero_warlock"] = "GetNextAbilityForWarlockAutoCasts",
        ["npc_dota_hero_shadow_shaman"] = "GetNextAbilityForShadowShamanAutoCasts",
        ["npc_dota_hero_lina"] = "GetNextAbilityForLinaAutoCasts",
        ["npc_dota_hero_invoker"] = "GetNextAbilityForInvokerAutoCasts",
        ["npc_dota_hero_dark_seer"] = "GetNextAbilityForDarkSeerAutoCasts",
        ["npc_dota_hero_omniknight"] = "GetNextAbilityForOmniknightAutoCasts",
        ["npc_dota_hero_crystal_maiden"] = "GetNextAbilityForCrystalMaidenAutoCasts",
        ["npc_dota_hero_furion"] = "GetNextAbilityForNatureProphetAutoCasts",
        ["npc_dota_hero_witch_doctor"] = "GetNextAbilityForWitchDoctorAutoCasts",
        ["npc_dota_hero_silencer"] = "GetNextAbilityForSilencerAutoCasts",
        ["npc_dota_hero_enchantress"] = "GetNextAbilityForEnchantressAutoCasts",
        ["npc_dota_hero_phantom_assassin"] = "GetNextAbilityForPhantomAssassinAutoCasts",
        ["npc_dota_hero_juggernaut"] = "GetNextAbilityForJuggernautAutoCasts",
        ["npc_dota_hero_riki"] = "GetNextAbilityForRikiAutoCasts",
        ["npc_dota_hero_bounty_hunter"] = "GetNextAbilityForBountyHunterAutoCasts",
        ["npc_dota_hero_windrunner"] = "GetNextAbilityForWindRunnerAutoCasts",
        ["npc_dota_hero_bloodseeker"] = "GetNextAbilityForBloodseekerAutoCasts",
        ["npc_dota_hero_drow_ranger"] = "GetNextAbilityForDrowRangerAutoCasts",
        ["npc_dota_hero_dazzle"] = "GetNextAbilityForDazzleAutoCasts",
        ["npc_dota_hero_vengefulspirit"] = "GetNextAbilityForVengefulSpiritAutoCasts",
        ["npc_dota_hero_sven"] = "GetNextAbilityForSvenAutoCasts",
        ["npc_dota_hero_axe"] = "GetNextAbilityForAxeAutoCasts",
        ["npc_dota_hero_legion_commander"] = "GetNextAbilityForLegionCommanderAutoCasts",
        ["npc_dota_hero_beastmaster"] = "GetNextAbilityForBeastmasterAutoCasts",
        ["npc_dota_hero_ursa"] = "GetNextAbilityForUrsaAutoCasts",
        ["npc_dota_hero_pudge"] = "GetNextAbilityForPudgeAutoCasts",
        ["npc_dota_hero_skeleton_king"] = "GetNextAbilityForWraithKingAutoCasts",
        ["npc_dota_hero_mars"] = "GetNextAbilityForMarsAutoCasts",
        ["npc_dota_hero_dragon_knight"] = "GetNextAbilityForDragonKnightAutoCasts",
        ["npc_dota_hero_phantom_lancer"] = "GetNextAbilityForPhantomLancerAutoCasts",
        ["npc_dota_hero_terrorblade"] = "GetNextAbilityForTerrorbladeAutoCasts",
        ["npc_dota_hero_antimage"] = "GetNextAbilityForAntimageAutoCasts",
        ["npc_dota_hero_brewmaster"] = "GetNextAbilityForBrewmasterAutoCasts",
        ["npc_dota_hero_sniper"] = "GetNextAbilityForSniperAutoCasts",
        -- Summons
        ["npc_dota_creature_waterelemental"] = "GetNextAbilityForCrystalMaidenPetAutoCasts",
    }

    -- List of abilities that can be casted while running, but actually will do more harm than good
    self.cantBeCastedWhileRunning = {
        -- Prevent pointless Phantom Assassin E spam
        ["Fatal_Throw"] = true,
        -- Eventually will kill player because tries constantly spam q w e combos even when player running away (Juggernaut)
        ["deadly1"] = true,
        ["deadly2"] = true,
        ["deadly3"] = true,
        -- Eventually will kill player? (RIki)
        ["hawk1"] = true,
        ["hawk2"] = true,
        -- Eventually will kill player? (Bounty Hunter)
        ["combat1"] = true,
        ["combat2"] = true,
        ["combat3"] = true,
        -- Eventually will kill player? (Windrunner)
        ["wind1"] = true,
        ["wind2"] = true,
        ["wind7"] = true,
        -- Eventually will kill player? (Bloodseeker)
        ["Ghost1"] = true,
        ["Ghost2"] = true,
        ["Ghost3"] = true,
        ["Ghost5"] = true,
        -- Eventually will kill player? (Drow ranger)
        ["Focussed_Shot"] = true,
        ["Inspiring_Shot"] = true,
        ["Mindfreezing_Shot"] = true,
        -- Eventually will kill player? (Dazzle)
        ["Feral2"] = true,
        ["Feral3"] = true,
        ["Feral4"] = true,
        -- Eventually will kill player? (Sven)
        ["frostdk1"] = true,
        ["frostdk2"] = true,
        -- Eventually will kill player? (Axe)
        ["Wounding_Strike"] = true,
        --["Mortal_Swing"] = true,
        ["Concussive_Blow"] = true,
        ["Knee_Breaker"] = true,
        -- Eventually will kill player? (Legion Commander)
        ["Retri2"] = true,
        -- Eventually will kill player? (Beastmaster)
        ["fury1"] = true,
        ["fury4"] = true,
        -- Eventually will kill player? (Ursa)
        ["bear1"] = true,
        -- Eventually will kill player? (Pudge)
        ["unholy_1"] = true,
        ["unholy_2"] = true,
        -- Eventually will kill player? (Wraith King)
        ["Corrupting_Strike"] = true,
        -- Eventually will kill player? (Mars)
        ["mars1"] = true,
        -- Eventually will kill player? (Dragon Knight)
        ["Protect1"] = true,
        ["Protect2"] = true,
        -- Eventually will kill player? (Phantom Lancer)
        ["pala1"] = true,
        -- Eventually will kill player? (Terrorblade)
        ["terror1"] = true,
        -- Eventually will kill player? (Antimage)
        ["dh1"] = true,
        -- Eventually will kill player? (Antimage)
        ["beast1"] = true,
        ["Hunter_Assassinate"] = true,
    }
	
    -- List of abilities that move hero and must ignore moving check
    self.movementAbilities = 
    {
        -- Phantom Assassin E
        ["Fatal_Throw"] = true,
    }
	
    -- List of heroes that must keep auto attacking last enemy after every auto cast
    self.mustAutoAttackAfterAutoCast = 
    {
        ["npc_dota_hero_juggernaut"] = true,
        ["npc_dota_hero_phantom_assassin"] = true,
        ["npc_dota_hero_windrunner"] = true,
        ["npc_dota_hero_riki"] = true,
        ["npc_dota_hero_bloodseeker"] = true,
        ["npc_dota_hero_dazzle"] = true,
        ["npc_dota_hero_axe"] = true,
        ["npc_dota_hero_legion_commander"] = true,
        ["npc_dota_hero_beastmaster"] = true,
        ["npc_dota_hero_ursa"] = true,
        ["npc_dota_hero_skeleton_king"] = true,
        ["npc_dota_hero_mars"] = true,
        ["npc_dota_hero_dragon_knight"] = true,
        ["npc_dota_hero_phantom_lancer"] = true,
        ["npc_dota_hero_terrorblade"] = true,
        ["npc_dota_hero_bounty_hunter"] = true,
        ["npc_dota_hero_sven"] = true,
        ["npc_dota_hero_antimage"] = true,
        ["npc_dota_hero_sniper"] = true
    }
	
    -- List of summon abilities that can be casted by timer
    self.summonAbilitiesForAutoCast = 
    {
        ["Ice_Bolt_Pet"] = true
    }
	
    self:DetermineIfMustAutoAttackAfterAutoCast()
    self:ToggleAllSummonAutoCasts()
end

function modifier_auto_casts:OnOrder(kv)
    if(kv.unit ~= self.parent) then
        return
    end
    
    if(kv.order_type == DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO and kv.ability ~= nil) then
        -- Inverted because called before state set
        if(kv.ability:GetAutoCastState() == false) then
            self.abilitiesWithAutoCasts[kv.ability] = true
            self.abilitiesWithAutoCastsCount = self.abilitiesWithAutoCastsCount + 1
            self:DetermineSummonsAutoCastsAbility(kv.ability)
        else
            self.abilitiesWithAutoCasts[kv.ability] = nil
            self.abilitiesWithAutoCastsCount = math.max(self.abilitiesWithAutoCastsCount - 1, 0)
        end
        
        --print("self.abilitiesWithAutoCastsCount", self.abilitiesWithAutoCastsCount)
        
        if(self.abilitiesWithAutoCastsCount < 1) then
            self:StartIntervalThink(-1)
        else
            self:StartIntervalThink(0.05)
        end
    end
    
    if(self:IsOrderFromAutoCast()) then
        return
    end
    
    -- This orders breaks queue...
    if(kv.order_type == DOTA_UNIT_ORDER_CONTINUE) then
        return
    end
    
    if(kv.order_type == DOTA_UNIT_ORDER_CAST_TOGGLE) then
        return
    end
    
    if(kv.order_type == DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO) then
        return
    end
    
    if(kv.order_type == DOTA_UNIT_ORDER_CAST_TOGGLE_ALT) then
        return
    end
    
    if(kv.order_type == DOTA_UNIT_ORDER_ATTACK_TARGET) then
        -- Special case. Some heroes must spam auto attacks too for their abilities to work. If player decide change target it breaks auto casting for that heroes
        self:SetLastAutoCastTarget(kv.target)
        return
    end
    
    if(self:IsOrderPreventAutoCastOfAbilities(kv.order_type)) then
    	--print("PAUSE AUTOCASTS")
        self:SetLastAutoCastTarget(nil)
    	self:SetIsAutoCastsPaused(true)
    else
    	--print("NO PAUSE AUTOCASTS")
    	self:SetIsAutoCastsPaused(false)
    end
    
    --print("self._setIsAutoCastsPaused", self._setIsAutoCastsPaused)
end

function modifier_auto_casts:IsOrderPreventAutoCastOfAbilities(orderType)
    return orderType == DOTA_UNIT_ORDER_MOVE_TO_POSITION or orderType == DOTA_UNIT_ORDER_MOVE_TO_TARGET 
        or orderType == DOTA_UNIT_ORDER_ATTACK_MOVE or orderType == DOTA_UNIT_ORDER_ATTACK_TARGET
        or orderType == DOTA_UNIT_ORDER_EJECT_ITEM_FROM_STASH or orderType == DOTA_UNIT_ORDER_PING_ABILITY
        or orderType == DOTA_UNIT_ORDER_MOVE_TO_DIRECTION or orderType == DOTA_UNIT_ORDER_PATROL
        or orderType == DOTA_UNIT_ORDER_MOVE_RELATIVE or orderType == DOTA_UNIT_ORDER_DROP_ITEM_AT_FOUNTAIN
        or orderType == DOTA_UNIT_ORDER_TAUNT or orderType == DOTA_UNIT_ORDER_STOP
        or orderType == DOTA_UNIT_ORDER_HOLD_POSITION or orderType == DOTA_UNIT_ORDER_TRAIN_ABILITY
        or orderType == DOTA_UNIT_ORDER_DROP_ITEM or orderType == DOTA_UNIT_ORDER_GIVE_ITEM
        or orderType == DOTA_UNIT_ORDER_MOVE_ITEM or orderType == DOTA_UNIT_ORDER_GLYPH
        or orderType == DOTA_UNIT_ORDER_RADAR or orderType == DOTA_UNIT_ORDER_SET_ITEM_COMBINE_LOCK
        or orderType == DOTA_UNIT_ORDER_PICKUP_ITEM or orderType == DOTA_UNIT_ORDER_SET_ITEM_MARK_FOR_SELL
end

function modifier_auto_casts:OnAbilityFullyCast(kv)
    if(kv.unit ~= self.parent) then
        return
    end
    
    self:_OnAbilityFinishedCasting(kv.ability, kv.target, false)
end

function modifier_auto_casts:OnAbilityEndChannel(kv)
    if(kv.unit ~= self.parent) then
        return
    end
    
    self:_OnAbilityFinishedCasting(kv.ability, kv.target, true)
end

-- target can be nil
function modifier_auto_casts:_OnAbilityFinishedCasting(ability, target, isChannel)
    -- Must consider only auto casts ability that no castable while running for auto casts queue
    -- Abilities that castable while running handled by OnIntervalThink
    if(self:IsAbilityCanBeAutoCastedWhileRunning(ability)) then
    	return
    end
    		
    --print("== _OnAbilityFinishedCasting ===")
    --print("Finished cast of ", ability:GetAbilityName(), " just now")
    
    if(target ~= nil) then
        self:SetLastAutoCastTarget(target)
    end
    
    self:TryAutoAttackAfterAutoCast(target)
    
    -- In very rare cases this modifier timer can perfectly align with cast time of abilities and send auto casts orders while player casting cast time ability and this breaking queue
    if(isChannel == true) then
        if(self:IsAutocastsAbility(ability)) then
        	self:SetIsAutoCastFailed(false)
        end
        --print("Channel thing", "ability", ability:GetAbilityName())
        self:_OnIntervalThinkInternal(true)
    else
        -- This called before dota internal do caster:SetChanneling(true) in MODIFIER_EVENT_ON_ABILITY_FULLY_CAST so ignore it for channel abilities
        if(ability:GetChannelTime() < 0.01) then
            if(self:IsAutocastsAbility(ability)) then
                self:SetIsAutoCastFailed(false)
            end
            --print("Non Channel thing", "ability", ability:GetAbilityName())
            self:_OnIntervalThinkInternal(true)
        end
    end
end

function modifier_auto_casts:TryAutoAttackAfterAutoCast(target)
    if(target ~= nil and self:IsMustAutoAttackAfterAutoCast() and self.parent:GetAttackTarget() ~= target and self.parent:IsAttacking() == false and target:GetTeamNumber() ~= self.parent:GetTeamNumber()) then
    	--print("!!!!! MoveToTargetToAttack !!!!")
		--[[
    	ExecuteOrderFromTable({
    		UnitIndex = self.parent:entindex(),
    		OrderType = DOTA_UNIT_ORDER_ATTACK_TARGET,
    		TargetIndex = target:entindex(),
    		Queue = false
    	})
		--]]
    	self.parent:MoveToTargetToAttack(target)
    end
end

function modifier_auto_casts:OnIntervalThink()
    -- Use wrapper cuz valve might one day add args or consider return value from this function and silently break everything...
    self:_OnIntervalThinkInternal()
end

function modifier_auto_casts:_OnIntervalThinkInternal(ignoreCurrentActiveAbility)   
    --print("== _OnIntervalThinkInternal ===")
    --print("ignoreCurrentActiveAbility", ignoreCurrentActiveAbility)
		
    local ignoreCurrentActiveAbilityInternal = false
    if(ignoreCurrentActiveAbility == true or self:IsAutoCastFailed() == true) then
    	ignoreCurrentActiveAbilityInternal = true
    end
    
    local lastAutoCastTarget = self:GetLastAutoCastTarget()
    local abilityToAutoCast = nil
    
	-- Get last attack/cast target from summon owner (if parent is summon)
	--print("self.parent.owner", self.parent.owner)
	if self.parent.owner ~= nil and self:IsUnitSupportAutoCasts(self.parentName) then
		if(self._autoCastsSummonOwnerModifier == nil) then
			self._autoCastsSummonOwnerModifier = self.parent.owner:FindModifierByName("modifier_auto_casts")
		end

		if(self._autoCastsSummonOwnerModifier ~= nil) then
			--print("self._autoCastsSummonOwnerModifier", self._autoCastsSummonOwnerModifier:GetParent())
			--print("self._autoCastsSummonOwnerModifier:GetLastAutoCastTarget()", self._autoCastsSummonOwnerModifier:GetLastAutoCastTarget())
			self:SetLastAutoCastTarget(self._autoCastsSummonOwnerModifier:GetLastAutoCastTarget())
		end
	end
	
    --print("START pairs(self.abilitiesWithAutoCasts)")
    for ability, _ in pairs(self.abilitiesWithAutoCasts) do
		--print("Checking", ability:GetAbilityName())
		--print("self:IsAbilityCanBeAutoCastedWhileRunning(ability)", self:IsAbilityCanBeAutoCastedWhileRunning(ability))
		--print("ignoreCurrentActiveAbilityInternal", ignoreCurrentActiveAbilityInternal)
		--print("self:IsSummonsAutoCastsAbility(ability)", self:IsSummonsAutoCastsAbility(ability))
		
    	--print("= PAIR ITERATION: ability", ability, "name", ability:GetAbilityName())
        -- Always try abilities that support casting while running or when player just finished current auto cast
        if(self:IsAbilityCanBeAutoCastedWhileRunning(ability) or ignoreCurrentActiveAbilityInternal == true or self:IsSummonsAutoCastsAbility(ability) == true) then		
    		abilityToAutoCast = self:GetNextAbilityForAutoCast(self.parent, ability, lastAutoCastTarget, ignoreCurrentActiveAbilityInternal)
    		--print("lastAutoCastTarget", lastAutoCastTarget)
			--print("Checking ", ability:GetAbilityName(), " result = ", abilityToAutoCast)
						
    		if(abilityToAutoCast ~= nil) then
    			--print("BREAK WITH", abilityToAutoCast:GetAbilityName())
    			break
    		end
        end
    end
    --print("END pairs(self.abilitiesWithAutoCasts)")
    
	--print("abilityToAutoCast", abilityToAutoCast)
	
    if(abilityToAutoCast == nil) then
    	if(ignoreCurrentActiveAbilityInternal == true) then
    		--print("Failed autocast. Set flag")
    		self:SetIsAutoCastFailed(true)
    		self:TryAutoAttackAfterAutoCast(lastAutoCastTarget)
    	end
    else
    	self:PerformAutoCastOfAbility(abilityToAutoCast, lastAutoCastTarget)
    end
end

function modifier_auto_casts:SetIsAutoCastsPaused(state)
    self._setIsAutoCastsPaused = state
end

function modifier_auto_casts:IsAutoCastsPaused()
    if(self._setIsAutoCastsPaused ~= nil) then
    	return self._setIsAutoCastsPaused
    end
    
    return false
end

function modifier_auto_casts:SetIsAutoCastFailed(state)
    self._setIsAutoCastFailed = state
end

function modifier_auto_casts:IsAutoCastFailed()
    if(self._setIsAutoCastFailed == nil) then
    	return false
    end
    
    return true
end

function modifier_auto_casts:PerformAutoCastOfAbility(abilityToAutoCast, target)
	local caster = self.parent
	local autoCastOrder = self:GetAutoCastOrderForAbility(abilityToAutoCast)
    
--[[
	if(self.parent:IsRealHero() == false) then
		--print("caster", caster:GetUnitName())
		--print("autoCastOrder", autoCastOrder)
		--print("target", target)
		--print("abilityToAutoCast", abilityToAutoCast:GetAbilityName())
	end 
--]]
		
    --print("autoCastOrder", autoCastOrder)
	
    -- Unsupported behavior or something wrong, too bad
    if(autoCastOrder == nil) then
        return nil
    end
		
    --print("self:IsAutoCastsPaused()", self:IsAutoCastsPaused())
    --print("self._setIsAutoCastsPaused", self._setIsAutoCastsPaused)
	--print("self:IsSummonsAutoCastsAbility(abilityToAutoCast)", self:IsSummonsAutoCastsAbility(abilityToAutoCast))
	
	-- Summon don't care about his own death
	if(self:IsSummonsAutoCastsAbility(abilityToAutoCast) == false) then
		if(self:IsAbilityCanBeAutoCastedWhileRunning(abilityToAutoCast) == false and self:IsAutoCastsPaused() == true) then
			self:SetIsAutoCastFailed(false)
			return
		end
	else
		-- Summon care about his owner death
		if(target ~= nil and COverthrowGameMode:HasDamageReflect(target)) then
			--print("Damage reflect?")
			return
		end
	end
	
    --print("==========================")
    --print("caster", caster:GetUnitName())
    --print("autoCastOrder", autoCastOrder)
    --print("target", target)
    --print("abilityToAutoCast", abilityToAutoCast:GetAbilityName())
    --print("ability:GetAutoCastState()", abilityToAutoCast:GetAutoCastState())
    --print("ability:GetLevel() > 0", abilityToAutoCast:GetLevel())
    --print("ability._autoCastCaster:GetMana()", abilityToAutoCast._autoCastCaster:GetMana())
    --print("ability:GetManaCost(-1)", abilityToAutoCast:GetManaCost(-1))
    --print("ability:IsActivated()", abilityToAutoCast:IsActivated())
    --print("ability:GetCooldownTimeRemaining()", abilityToAutoCast:GetCooldownTimeRemaining())
    --print("self:IsAbilityReadyForAutoCast(abilityToAutoCast)", self:IsAbilityReadyForAutoCast(abilityToAutoCast))
    
    --print("target", target)
    	
    if(autoCastOrder == DOTA_UNIT_ORDER_CAST_NO_TARGET) then
    
        self:SetIsOrderFromAutoCast(true)
    
        ExecuteOrderFromTable({
            UnitIndex = caster:entindex(),
            OrderType = DOTA_UNIT_ORDER_CAST_NO_TARGET,
            AbilityIndex = abilityToAutoCast:GetEntityIndex(), 
            Queue = false
        })
    
        self:SetIsOrderFromAutoCast(false)
    	
    	--print("Send no target order with ", abilityToAutoCast:GetAbilityName())
    end
    
    if(autoCastOrder == DOTA_UNIT_ORDER_CAST_TARGET and target) then
    
        self:SetIsOrderFromAutoCast(true)
    
        ExecuteOrderFromTable({
            UnitIndex = caster:entindex(),
            OrderType = DOTA_UNIT_ORDER_CAST_TARGET,
            AbilityIndex = abilityToAutoCast:GetEntityIndex(), 
            Queue = false,
            TargetIndex = target:entindex()
        })
    
        self:SetIsOrderFromAutoCast(false)
    	
    	--print("Send target order with ", abilityToAutoCast:GetAbilityName())
    end
    
    if(autoCastOrder == DOTA_UNIT_ORDER_CAST_POSITION) then
        local position = abilityToAutoCast:GetCursorPosition()
        -- Hopefully this will be enough to detect default(Vector) == ability never casted
        if(math.abs(position.x) + math.abs(position.y) < 0.01) then
            if(target ~= nil) then
                position = target:GetAbsOrigin()
            else
                -- Nothing can be done, too bad
                return
            end
        end
    
        self:SetIsOrderFromAutoCast(true)
    
        ExecuteOrderFromTable({
            UnitIndex = caster:entindex(),
            OrderType = DOTA_UNIT_ORDER_CAST_POSITION,
            AbilityIndex = abilityToAutoCast:GetEntityIndex(), 
            Queue = false,
            Position = position
        })
    
        self:SetIsOrderFromAutoCast(false)
    	
    	--print("Send position order with ", abilityToAutoCast:GetAbilityName())
    end
end

function modifier_auto_casts:ToggleAllSummonAutoCasts()
	if(self.parent:IsRealHero()) then
		return
	end

	local summonEntIndex = self.parent:entindex()
	
	for i = 0, self.parent:GetAbilityCount() - 1 do
		local ability = self.parent:GetAbilityByIndex(i)
		if(ability ~= nil and bit.band(COverthrowGameMode:GetAbilityBehaviorSafe(ability), DOTA_ABILITY_BEHAVIOR_AUTOCAST) == DOTA_ABILITY_BEHAVIOR_AUTOCAST) then
			ExecuteOrderFromTable({
				UnitIndex = summonEntIndex,
				OrderType = DOTA_UNIT_ORDER_CAST_TOGGLE_AUTO,
				AbilityIndex = ability:entindex(),
				Queue = false
			})
		end
	end
end

function modifier_auto_casts:DetermineIfMustAutoAttackAfterAutoCast()
    if(self.mustAutoAttackAfterAutoCast[self.parentName] == true) then
        self._isAutoAttackAfterAutoCasts = true
        return
    end
    
    self._isAutoAttackAfterAutoCasts = false
end

function modifier_auto_casts:IsMustAutoAttackAfterAutoCast()
    return self._isAutoAttackAfterAutoCasts
end

function modifier_auto_casts:DetermineSummonsAutoCastsAbility(ability)
	if(ability == nil) then
		return
	end
	
	if(self.summonAbilitiesForAutoCast[ability:GetAbilityName()] ~= nil) then
		ability._autoCastsSummonsAutoCastsAbility = true
	end
end

function modifier_auto_casts:IsSummonsAutoCastsAbility(ability)
	if(ability._autoCastsSummonsAutoCastsAbility == nil) then
		return false
	end
	
	return ability._autoCastsSummonsAutoCastsAbility
end

function modifier_auto_casts:IsAutocastsAbility(ability)
    if(ability == nil) then
        return false
    end
    
    return self.abilitiesWithAutoCasts[ability] ~= nil
end

-- Target can be nil
function modifier_auto_casts:GetNextAbilityForAutoCast(caster, ability, target, ignoreCurrentActiveAbility)
    --print("=== CheckAbilityAutoCast ===")
    --print("ability", ability:GetAbilityName())
    -- Caster dead...
    if(caster:IsAlive() == false) then
        return
    end
    if(target ~= nil) then
        -- Ignore dead guys
        if(target:IsNull() or target:IsAlive() == false) then
    		--print("Dead target return")
            self:SetLastAutoCastTarget(nil)
            return
        end
        -- Check for too far enemies (2500+)
        local casterPosition = caster:GetAbsOrigin()
        local targetPosition = target:GetAbsOrigin()
        local dx = casterPosition.x - targetPosition.x
        local dy = targetPosition.y - targetPosition.y
        local distanceToTargetSqr = dx * dx + dy * dy
        if(distanceToTargetSqr >= 6250000) then
    		--print("Distance return")
            return
        end
    end
    -- Waiting for silence
    if(caster:IsSilenced()) then
    		--print("Silenced return")
        return
    end
    -- Waiting for stun
    if(caster:IsStunned()) then
    		--print("Stunned return")
        return
    end
    
    --print("ability", ability:GetAbilityName())
    --print("ignoreCurrentActiveAbility", ignoreCurrentActiveAbility)
    --print("caster:IsChanneling()", caster:IsChanneling())
    
    -- Waiting for channel
    if(caster:IsChanneling() and ignoreCurrentActiveAbility) then
    		--print("IsChanneling return")
        return
    end
    
    local currentCastingAbility = nil
    
    if(ignoreCurrentActiveAbility ~= true) then
        currentCastingAbility = caster:GetCurrentActiveAbility()
    end
    	
    -- Waiting for invisibility
    if(caster:IsInvisible()) then
        -- If autocasts trying to cast ability or casting already while caster got invisibility effect stops this attempt (to preserve invisibility effect)
        if(self:IsAutocastsAbility(currentCastingAbility)) then
            caster:Stop()
        end
    		--print("IsInvisible return")
        return
    end
    -- Casting something else, waiting for that
    if(currentCastingAbility ~= nil) then
    		--print("currentCastingAbility return")
        return
    end
    
    -- Abilities without cast time and instant cast should be castable while running (oracle E, np Q, etc)
    if(self:IsAbilityCanBeAutoCastedWhileRunning(ability) == false) then
        if(caster:IsMoving() and self:IsMovementAbility(ability) == false) then
    		--print("IsAbilityCanBeAutoCastedWhileRunning and IsMoving return")
            return
        end
    end
    
    -- target can be nil
    -- Caster should be fine and ready to cast any ability now so no need to check for that (at least only manacosts and cooldowns for desired abilities needs checking)
    if(self:IsUnitSupportAutoCasts(self.parentName)) then
        local status, result = pcall(function ()
            return self[self.autoCastsImplementations[self.parentName]](self, caster, ability, target)
        end)
    
        if(status ~= true) then
            print("modifier_auto_casts:GetNextAbilityForAutoCast error: ", result)
            return nil
        end
    
        return result
    end
end

function modifier_auto_casts:IsUnitSupportAutoCasts(unitName)
    if(self.autoCastsImplementations[unitName] ~= nil) then
		return true
	end
	
	return false
end

function modifier_auto_casts:SetLastAutoCastTarget(target)
    self._autoCastLastAutoCastTarget = target
end

function modifier_auto_casts:GetLastAutoCastTarget()
    return self._autoCastLastAutoCastTarget
end

function modifier_auto_casts:IsOrderFromAutoCast()
    if(self._isOrderFromAutoCast ~= nil) then
        return self._isOrderFromAutoCast
    end
    
    return false
end

function modifier_auto_casts:SetIsOrderFromAutoCast(state)
    self._isOrderFromAutoCast = state
end

function modifier_auto_casts:GetAutoCastOrderForAbility(ability)
    if(not ability or ability.GetAutoCastState == nil) then
        return nil
    end
    
    if(ability._autoCastOrder ~= nil) then
        return ability._autoCastOrder
    end
    
    return nil
end

function modifier_auto_casts:IsMovementAbility(ability)
    if(not ability) then
        return false
    end
    
    if(ability._autoCastMovementAbility ~= nil) then
        return ability._autoCastMovementAbility
    end
    
    return false
end

-- Internal timer that can be used as delay for perfomance reasons
function modifier_auto_casts:IsInternalTimerReady(interval)
    local currentTime = GameRules:GetGameTime()
    if(self._autoCastsTimer == nil) then
    	self._autoCastsTimer = currentTime
    end
    
    local currentTime = GameRules:GetGameTime()
    if(currentTime - self._autoCastsTimer < interval) then
    	return false
    end		
	
    self._autoCastsTimer = currentTime
	
	return true
end

function modifier_auto_casts:IsAbilityCanBeAutoCastedWhileRunning(ability)
    if(not ability) then
        return false
    end
    
    if(ability._autoCastWhileRunning ~= nil) then
        return ability._autoCastWhileRunning
    end
    
    return false
end

function modifier_auto_casts:DetermineAutoCastBehaviorForAbility(ability)
    if(not ability or ability.GetAutoCastState == nil) then
        return
    end
    
    local abilityName = ability:GetAbilityName()
    local abilityBehavior = COverthrowGameMode:GetAbilityBehaviorSafe(ability)
    
    -- Special behaviors that allow abilities to be casted while running: DOTA_ABILITY_BEHAVIOR_DONT_CANCEL_MOVEMENT, DOTA_ABILITY_BEHAVIOR_IMMEDIATE?
    if(ability._autoCastWhileRunning == nil) then
        if(bit.band(abilityBehavior, DOTA_ABILITY_BEHAVIOR_DONT_CANCEL_MOVEMENT) == DOTA_ABILITY_BEHAVIOR_DONT_CANCEL_MOVEMENT) then
            ability._autoCastWhileRunning = true
        end
        if(ability._autoCastWhileRunning == nil and bit.band(abilityBehavior, DOTA_ABILITY_BEHAVIOR_IMMEDIATE) == DOTA_ABILITY_BEHAVIOR_IMMEDIATE) then
            ability._autoCastWhileRunning = true
        end
        if(self.cantBeCastedWhileRunning[abilityName] == true) then
            ability._autoCastWhileRunning = false
        end
    end
    
    if(self.movementAbilities[abilityName] == true) then
    	ability._autoCastMovementAbility = true
    end
    
    -- Determine cast targets allowed (fix for things like DK spam W on allies after using protection ability)
    local abilityTargetTeam = ability:GetAbilityTargetTeam()

    -- Must be in that order (friendly -> enemy -> fallback) to fix issues with pudge like abilities that can target both teams
    if(bit.band(abilityTargetTeam, DOTA_UNIT_TARGET_TEAM_FRIENDLY) == DOTA_UNIT_TARGET_TEAM_FRIENDLY) then
    	ability._autoCastsTargetTeam = DOTA_TEAM_GOODGUYS
    end
	if(bit.band(abilityTargetTeam, DOTA_UNIT_TARGET_TEAM_ENEMY) == DOTA_UNIT_TARGET_TEAM_ENEMY) then
    	ability._autoCastsTargetTeam = DOTA_TEAM_BADGUYS
    end
	if(ability._autoCastsTargetTeam == nil) then
    	ability._autoCastsTargetTeam = DOTA_TEAM_NOTEAM
    end
	
    -- Grimstroke Hellfire, maybe something else
    if(bit.band(abilityBehavior, DOTA_ABILITY_BEHAVIOR_NO_TARGET) == DOTA_ABILITY_BEHAVIOR_NO_TARGET) then
        ability._autoCastOrder = DOTA_UNIT_ORDER_CAST_NO_TARGET
        return
    end
    
    if(bit.band(abilityBehavior, DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) == DOTA_ABILITY_BEHAVIOR_UNIT_TARGET) then
        ability._autoCastOrder = DOTA_UNIT_ORDER_CAST_TARGET
        return
    end
    
    -- Lina abilities, maybe something else
    if(bit.band(abilityBehavior, DOTA_ABILITY_BEHAVIOR_POINT) == DOTA_ABILITY_BEHAVIOR_POINT) then
        ability._autoCastOrder = DOTA_UNIT_ORDER_CAST_POSITION
        return
    end
end

function modifier_auto_casts:GetAbilityTargetTeam(ability)
    if(not ability or ability._autoCastsTargetTeam == nil) then
		--print("ability", ability)
		--print("ability._autoCastsTargetTeam", ability._autoCastsTargetTeam)
        return DOTA_TEAM_NOTEAM
    end

	return ability._autoCastsTargetTeam
end

function modifier_auto_casts:IsAbilityReadyForAutoCast(ability)
    if(not ability or ability.GetAutoCastState == nil) then
        return false
    end
    
    local caster = nil
    if(ability._autoCastCaster ~= nil) then
    	caster = ability._autoCastCaster
    else
    	caster = ability:GetCaster()
    	ability._autoCastCaster = caster
    end
	
	local lastAutoCastTarget = self:GetLastAutoCastTarget()
	if(lastAutoCastTarget == nil) then
		if(self:IsAbilityCanBeAutoCastedWhileRunning(ability) == false) then
			return false
		end
	else		
		if(self:GetAbilityTargetTeam(ability) ~= lastAutoCastTarget:GetTeamNumber()) then
			return false
		end
	end
	
    
    -- IsActivated() = not hidden by stance/shapeshift/etc
    return ability:GetAutoCastState() and ability:GetLevel() > 0 and ability._autoCastCaster:GetMana() >= ability:GetManaCost(-1) and ability:IsActivated() and ability:GetCooldownTimeRemaining() < 0.01
end

-- Pugna: Q E combo with W sometimes for debuff
function modifier_auto_casts:GetNextAbilityForPugnaAutoCasts(caster, ability, target)
    if(caster._autoCastPugnaSoulFlame == nil) then
        caster._autoCastPugnaSoulFlame = caster:FindAbilityByName("destro1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPugnaSoulFlame)
    end
    if(caster._autoCastPugnaIgnite == nil) then
        caster._autoCastPugnaIgnite = caster:FindAbilityByName("destro2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPugnaIgnite)
    end
    if(caster._autoCastPugnaChaosBlast == nil) then
        caster._autoCastPugnaChaosBlast = caster:FindAbilityByName("destro3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPugnaChaosBlast)
    end
    
    if(ability == caster._autoCastPugnaSoulFlame or ability == caster._autoCastPugnaIgnite or ability == caster._autoCastPugnaChaosBlast) then
        local isPugnaSoulFlameReadyForAutoCast = self:IsAbilityReadyForAutoCast(caster._autoCastPugnaSoulFlame)
        local isPugnaIgniteReadyForAutoCast = self:IsAbilityReadyForAutoCast(caster._autoCastPugnaIgnite)
        local isPugnaChaosBlastReadyForAutoCast = self:IsAbilityReadyForAutoCast(caster._autoCastPugnaChaosBlast)
    
        -- If ignire refreshed spam it because dot stacks?
        if(isPugnaIgniteReadyForAutoCast) then
            return caster._autoCastPugnaIgnite
        end
    
        if(isPugnaChaosBlastReadyForAutoCast and caster:GetModifierStackCount("modifier_souls", nil) >= 2) then
            return caster._autoCastPugnaChaosBlast
        end
    
        if(isPugnaSoulFlameReadyForAutoCast) then
            return caster._autoCastPugnaSoulFlame
        end
    end
    
    return nil
end

-- Oracle: Q E spam
function modifier_auto_casts:GetNextAbilityForOracleAutoCasts(caster, ability, target)
    if(caster._autoCastOracleHolyLight == nil) then
        caster._autoCastOracleHolyLight = caster:FindAbilityByName("holy1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastOracleHolyLight)
    end
    if(caster._autoCastOracleDivineNova == nil) then
        caster._autoCastOracleDivineNova = caster:FindAbilityByName("holy3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastOracleDivineNova)
    end

    local isOracleDivineNovaReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastOracleDivineNova)

    if(ability == caster._autoCastOracleHolyLight or ability == caster._autoCastOracleDivineNova) then
        local isOracleHolyLightReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastOracleHolyLight)
        if(isOracleDivineNovaReadyForAutocast) then
            return caster._autoCastOracleDivineNova
        end 
        if(isOracleHolyLightReadyForAutocast) then
            return caster._autoCastOracleHolyLight
        end
    end

    return nil
end

-- Grimstroke: Q W or Q E spam
function modifier_auto_casts:GetNextAbilityForGrimstrokeAutoCasts(caster, ability, target)
    if(caster._autoCastDemo1 == nil) then
        caster._autoCastDemo1 = caster:FindAbilityByName("demo1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDemo1)
    end
    if(caster._autoCastDemo2 == nil) then
        caster._autoCastDemo2 = caster:FindAbilityByName("demo2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDemo2)
    end
    if(caster._autoCastDemo3 == nil) then
        caster._autoCastDemo3 = caster:FindAbilityByName("demo3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDemo3)
    end

    if(ability == caster._autoCastDemo1 or ability == caster._autoCastDemo2 or ability == caster._autoCastDemo3) then
        local isGrimstrokeQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastDemo1)
        local isGrimstrokeWReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastDemo2)
        local isGrimstrokeEReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastDemo3)
        local soulsCount = caster:GetModifierStackCount("modifier_souls", nil)

        if(isGrimstrokeWReadyForAutocast and soulsCount >= 2) then
            return caster._autoCastDemo2
        end

        if(isGrimstrokeEReadyForAutocast and soulsCount >= 2) then
            return caster._autoCastDemo3
        end

        if(isGrimstrokeQReadyForAutocast) then
            return caster._autoCastDemo1
        end
    end

    return nil
end

-- Warlock: Q W dots upkeep, D spam during downtime
function modifier_auto_casts:GetNextAbilityForWarlockAutoCasts(caster, ability, target)
    if(caster._autoCastWarlockQ == nil) then
        caster._autoCastWarlockQ = caster:FindAbilityByName("Agony")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWarlockQ)
    end
    if(caster._autoCastWarlockW == nil) then
        caster._autoCastWarlockW = caster:FindAbilityByName("Pain_Warlock")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWarlockW)
    end
    if(caster._autoCastWarlockD == nil) then
        caster._autoCastWarlockD = caster:FindAbilityByName("dark_ranger_life_drain")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWarlockD)
    end
	
    if(target == nil) then
        return nil
    end
	
    if(ability == caster._autoCastWarlockQ or ability == caster._autoCastWarlockW or ability == caster._autoCastWarlockD) then
        local isWarlockQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastWarlockQ)
        local isWarlockWReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastWarlockW)
        local isWarlockDReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastWarlockD)

        if(isWarlockQReadyForAutocast) then
            local dotModifier = target:FindModifierByName("modifier_dot1")
			
            -- Due to instant cast time trying prevent issues with low spell haste upkeep		
            if(dotModifier == nil or dotModifier:GetRemainingTime() / dotModifier:GetDuration() < 0.8) then
                return caster._autoCastWarlockQ
            end
        end

        if(isWarlockWReadyForAutocast) then
            local dotModifier = target:FindModifierByName("modifier_dot2")
            local stacksCount = 0
			local maxStacksCount = 2 + GetMaxDebuffStackBonus(caster)
            local isDotAlmostEnded = false

			if(dotModifier) then
				stacksCount = dotModifier:GetStackCount()
				isDotAlmostEnded = dotModifier:GetRemainingTime() / dotModifier:GetDuration() < 0.5
			end
			
            if(isDotAlmostEnded) then
                return caster._autoCastWarlockW
            end

            if(caster._autoCastWarlockW:GetLevel() >= 3 and stacksCount < maxStacksCount) then
                return caster._autoCastWarlockW
            else
                if(dotModifier == nil) then
                    return caster._autoCastWarlockW
                end
            end
        end

        if(isWarlockDReadyForAutocast) then
            return caster._autoCastWarlockD
        end
    end

    return nil
end

-- Shadow Shaman: Q E D spam
function modifier_auto_casts:GetNextAbilityForShadowShamanAutoCasts(caster, ability, target)
    if(caster._autoCastShadowShamanQ == nil) then
        caster._autoCastShadowShamanQ = caster:FindAbilityByName("Lightning_Bolt")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastShadowShamanQ)
    end
    if(caster._autoCastShadowShamanE == nil) then
        caster._autoCastShadowShamanE = caster:FindAbilityByName("Spirit_Shock")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastShadowShamanE)
    end
    if(caster._autoCastShadowShamanD == nil) then
        caster._autoCastShadowShamanD = caster:FindAbilityByName("Lavaburst")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastShadowShamanD)
    end

    if(ability == caster._autoCastShadowShamanQ or ability == caster._autoCastShadowShamanE or ability == caster._autoCastShadowShamanD) then
        local isShadowShamanQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastShadowShamanQ)
        local isShadowShamanEReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastShadowShamanE)
        local isShadowShamanDReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastShadowShamanD)

        if(target == nil) then
            return nil
        end

        if(isShadowShamanEReadyForAutocast) then
            return caster._autoCastShadowShamanE
        end

        if(isShadowShamanDReadyForAutocast and target:HasModifier("modifier_lavashock")) then
            return caster._autoCastShadowShamanD
        end

        if(isShadowShamanQReadyForAutocast) then
            return caster._autoCastShadowShamanQ
        end
    end

    return nil
end

-- Lina: Q W E D spam
function modifier_auto_casts:GetNextAbilityForLinaAutoCasts(caster, ability, target)
    if(caster._autoCastLinaQ == nil) then
        caster._autoCastLinaQ = caster:FindAbilityByName("Magma_Bolt")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLinaQ)
    end
    if(caster._autoCastLinaW == nil) then
        caster._autoCastLinaW = caster:FindAbilityByName("Fire_Lance")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLinaW)
    end
    if(caster._autoCastLinaE == nil) then
        caster._autoCastLinaE = caster:FindAbilityByName("Molten_Lava")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLinaE)
    end
    if(caster._autoCastLinaD == nil) then
        caster._autoCastLinaD = caster:FindAbilityByName("Dragon_Claw")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLinaD)
    end

    if(ability == caster._autoCastLinaQ or ability == caster._autoCastLinaW or ability == caster._autoCastLinaE or ability == caster._autoCastLinaD) then
        local isLinaQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastLinaQ)
        local isLinaWReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastLinaW)
        local isLinaEReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastLinaE)
        local isLinaDReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastLinaD)

        if(isLinaWReadyForAutocast) then
            return caster._autoCastLinaW
        end

        if(isLinaEReadyForAutocast) then
            return caster._autoCastLinaE
        end

        if(isLinaDReadyForAutocast) then
            return caster._autoCastLinaD
        end

        if(isLinaQReadyForAutocast) then
            return caster._autoCastLinaQ
        end
    end

    return nil
end

-- Invoker: Q W spam
function modifier_auto_casts:GetNextAbilityForInvokerAutoCasts(caster, ability, target)
    if(caster._autoCastInvokerQ == nil) then
        caster._autoCastInvokerQ = caster:FindAbilityByName("Arcane1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastInvokerQ)
    end
    if(caster._autoCastInvokerW == nil) then
        caster._autoCastInvokerW = caster:FindAbilityByName("Arcane2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastInvokerW)
    end

    if(ability == caster._autoCastInvokerQ or ability == caster._autoCastInvokerW) then
        local isInvokerQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastInvokerQ)
        local isInvokerWReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastInvokerW)

        if(isInvokerWReadyForAutocast) then
            return caster._autoCastInvokerW
        end

        if(isInvokerQReadyForAutocast) then
            return caster._autoCastInvokerQ
        end
    end

    return nil
end

-- Dark Seer: Q W D spam
function modifier_auto_casts:GetNextAbilityForDarkSeerAutoCasts(caster, ability, target)
    if(caster._autoCastMindstorm == nil) then
        caster._autoCastMindstorm = caster:FindAbilityByName("shadow1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastMindstorm)
    end
    if(caster._autoCastMindshatter == nil) then
        caster._autoCastMindshatter = caster:FindAbilityByName("shadow11")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastMindshatter)
    end
    if(caster._autoCastDreamFeast == nil) then
        caster._autoCastDreamFeast = caster:FindAbilityByName("shadow3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDreamFeast)
    end
	
    if(ability == caster._autoCastMindstorm or ability == caster._autoCastMindshatter or ability == caster._autoCastDreamFeast) then
		local isQReady = self:IsAbilityReadyForAutoCast(caster._autoCastMindstorm)
		local isWReady = self:IsAbilityReadyForAutoCast(caster._autoCastMindshatter)
		local isDReady = self:IsAbilityReadyForAutoCast(caster._autoCastDreamFeast)
		
		if(isDReady) then
			return caster._autoCastDreamFeast
		end
		if(isWReady) then
			return caster._autoCastMindshatter
		end
		if(isQReady) then
			return caster._autoCastMindstorm
		end
    end

    return nil
end

-- Omni: Q spam
function modifier_auto_casts:GetNextAbilityForOmniknightAutoCasts(caster, ability, target)
    if(caster._autoCastDivineLight == nil) then
        caster._autoCastDivineLight = caster:FindAbilityByName("Divine_Light")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDivineLight)
    end

    if(ability == caster._autoCastDivineLight and self:IsAbilityReadyForAutoCast(caster._autoCastDivineLight)) then
        return caster._autoCastDivineLight
    end

    return nil
end

-- Crystal Maiden: Q Q W combo
function modifier_auto_casts:GetNextAbilityForCrystalMaidenAutoCasts(caster, ability, target)
    if(caster._autoCastCMIceBolt == nil) then
        caster._autoCastCMIceBolt = caster:FindAbilityByName("Ice_Bolt")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastCMIceBolt)
    end
    if(caster._autoCastCMFrostShatter == nil) then
        caster._autoCastCMFrostShatter = caster:FindAbilityByName("Frost_Shatter")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastCMFrostShatter)
    end
    
    if(target == nil) then
    	return nil
    end
	
	if(ability == caster._autoCastCMIceBolt or ability == caster._autoCastCMFrostShatter) then
    	local isWinterChillStacksEnough = false
    	
    	if(caster:GetModifierStackCount("modifier_winterschill", nil) >= 2) then
    		isWinterChillStacksEnough = true
    	end
    	
    	if(target:HasModifier("modifier_icenova") or target:HasModifier("modifier_deepfreeze")) then
    		isWinterChillStacksEnough = true
    	end
    		
    	if(isWinterChillStacksEnough) then
    		local isFrostShatterReady = self:IsAbilityReadyForAutoCast(caster._autoCastCMFrostShatter)
    		
    		if(isFrostShatterReady) then
    	        return caster._autoCastCMFrostShatter
    		end
    		
    		if(self:IsAbilityReadyForAutoCast(caster._autoCastCMIceBolt) and isFrostShatterReady == false) then
    			return caster._autoCastCMIceBolt
    		end
    	else
    		if(self:IsAbilityReadyForAutoCast(caster._autoCastCMIceBolt)) then
    			return caster._autoCastCMIceBolt
    		end
    		
    		return nil
    	end
	end
	
	return nil
end

-- Crystal Maiden Pet: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForCrystalMaidenPetAutoCasts(caster, ability, target)
    if(caster._autoCastWaterElementalQ == nil) then
        caster._autoCastWaterElementalQ = caster:FindAbilityByName("Ice_Bolt_Pet")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWaterElementalQ)
    end
	
    if(ability == caster._autoCastWaterElementalQ and self:IsAbilityReadyForAutoCast(caster._autoCastWaterElementalQ)) then
        return caster._autoCastWaterElementalQ
    end
	
    return nil
end

-- Nature Phophet: Q spam if required
function modifier_auto_casts:GetNextAbilityForNatureProphetAutoCasts(caster, ability, target)
    if(caster._autoCastNatureProphetQ == nil) then
        caster._autoCastNatureProphetQ = caster:FindAbilityByName("Lifebloom")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastNatureProphetQ)
    end
            
    if(ability == caster._autoCastNatureProphetQ and self:IsAbilityReadyForAutoCast(caster._autoCastNatureProphetQ)) then
        if(self:IsInternalTimerReady(0.05) == false) then
        	return nil
        end
		
        local position = caster:GetAbsOrigin()
        local allies = FindNearbyAllies(caster, caster:GetAbsOrigin(), ability:GetEffectiveCastRange(position, caster))
        local isCastRequired = false
        local maxStacks = GetMaxBuffStackBonus(caster) + 3

        for _, ally in pairs(allies) do
            local firstModifier = ally:FindModifierByName("modifier_lifebloom")
            local secondModifier = ally:FindModifierByName("modifier_lifebloomfull")
            local allyStacks = (firstModifier and firstModifier:GetStackCount() or 0) + (secondModifier and secondModifier:GetStackCount() or 0)
            local isHotAlmostEnded = (firstModifier and firstModifier:GetRemainingTime() / firstModifier:GetDuration() < 0.5 or false) 
                or (secondModifier and secondModifier:GetRemainingTime() / secondModifier:GetDuration() < 0.5 or false)
                
            if(allyStacks < maxStacks or isHotAlmostEnded) then
                isCastRequired = true
                break
            end
        end
        
        if(isCastRequired == true) then
            return caster._autoCastNatureProphetQ
        end
    end

    return nil
end

-- Witch Doctor: Q spam
function modifier_auto_casts:GetNextAbilityForWitchDoctorAutoCasts(caster, ability, target)
    if(caster._autoCastWitchDoctorQ == nil) then
        caster._autoCastWitchDoctorQ = caster:FindAbilityByName("resto1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWitchDoctorQ)
    end
            
    if(ability == caster._autoCastWitchDoctorQ and self:IsAbilityReadyForAutoCast(caster._autoCastWitchDoctorQ)) then
        return caster._autoCastWitchDoctorQ
    end

    return nil
end

-- Silener: Q spam
function modifier_auto_casts:GetNextAbilityForSilencerAutoCasts(caster, ability, target)
    if(caster._autoCastSilencerQ == nil) then
        caster._autoCastSilencerQ = caster:FindAbilityByName("Light_of_Heaven")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastSilencerQ)
    end
            
    if(ability == caster._autoCastSilencerQ and self:IsAbilityReadyForAutoCast(caster._autoCastSilencerQ)) then
        return caster._autoCastSilencerQ
    end

    return nil
end

-- Enchantress: Q spam
function modifier_auto_casts:GetNextAbilityForEnchantressAutoCasts(caster, ability, target)
    if(caster._autoCastEnchantressQ == nil) then
        caster._autoCastEnchantressQ = caster:FindAbilityByName("ench1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastEnchantressQ)
    end
            
    if(ability == caster._autoCastEnchantressQ and self:IsAbilityReadyForAutoCast(caster._autoCastEnchantressQ)) then
        return caster._autoCastEnchantressQ
    end

    return nil
end

-- Phantom Assassin: D E spam
function modifier_auto_casts:GetNextAbilityForPhantomAssassinAutoCasts(caster, ability, target)
    if(caster._autoCastPhantomAssassinE == nil) then
        caster._autoCastPhantomAssassinE = caster:FindAbilityByName("Fatal_Throw")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPhantomAssassinE)
    end
    if(caster._autoCastPhantomAssassinD == nil) then
        caster._autoCastPhantomAssassinD = caster:FindAbilityByName("Ambush")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPhantomAssassinD)
    end
		
	if(ability == caster._autoCastPhantomAssassinD or ability == caster._autoCastPhantomAssassinE) then
		if(self:IsAbilityReadyForAutoCast(caster._autoCastPhantomAssassinE) and caster:GetModifierStackCount("modifier_combopoint", nil) >= 3) then
			return caster._autoCastPhantomAssassinE
		end
		
		if(self:IsAbilityReadyForAutoCast(caster._autoCastPhantomAssassinD)) then
			return caster._autoCastPhantomAssassinD
		end
	end
	
    return nil
end

-- Juggernaut: Q W E spam
function modifier_auto_casts:GetNextAbilityForJuggernautAutoCasts(caster, ability, target)
    if(caster._autoCastJuggernautQ == nil) then
        caster._autoCastJuggernautQ = caster:FindAbilityByName("deadly1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastJuggernautQ)
    end
    if(caster._autoCastJuggernautW == nil) then
        caster._autoCastJuggernautW = caster:FindAbilityByName("deadly2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastJuggernautW)
    end
    if(caster._autoCastJuggernautE == nil) then
        caster._autoCastJuggernautE = caster:FindAbilityByName("deadly3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastJuggernautE)
    end
    
    if(not caster.yinyangsystem) then
        return nil
    end

    local isJuggernautQReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastJuggernautQ)
    local isJuggernautWReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastJuggernautW)
    local isJuggernautEReadyForAutocast = self:IsAbilityReadyForAutoCast(caster._autoCastJuggernautE)

    local yin = caster.yinyangsystem[1]
    local yang = caster.yinyangsystem[2]
    local yin2yang1modifier = caster:FindModifierByName("modifier_molten_blade")
    local yin2yang1modifierAlmostEnded = (yin2yang1modifier and yin2yang1modifier:GetRemainingTime() / yin2yang1modifier:GetDuration() < 0.5 or false) 

    -- Fallback
    if(yin + yang >= 3 and isJuggernautEReadyForAutocast) then
        return caster._autoCastJuggernautE
    end

    -- Q Q E combo
    if(yin2yang1modifier == nil or yin2yang1modifierAlmostEnded) then
        if(yin >= 2 and yang >= 1 and isJuggernautEReadyForAutocast) then
            return caster._autoCastJuggernautE
        else
            if(yin < 2 and isJuggernautQReadyForAutocast) then
                return caster._autoCastJuggernautQ
            end

            if(yang < 1 and isJuggernautWReadyForAutocast) then
                return caster._autoCastJuggernautW
            end
        end
    end

    -- Q W W combo
    local yin1yang2modifier = caster:FindModifierByName("modifier_frozen_blade")
    local yin1yang2modifierAlmostEnded = (yin1yang2modifier and yin1yang2modifier:GetRemainingTime() / yin1yang2modifier:GetDuration() < 0.5 or false) 

    if(yin1yang2modifier == nil or yin1yang2modifierAlmostEnded) then
        if(yin >= 1 and yang >= 2 and isJuggernautEReadyForAutocast) then
            return caster._autoCastJuggernautE
        else
            if(yin < 1 and isJuggernautQReadyForAutocast) then
                return caster._autoCastJuggernautQ
            end

            if(yang < 2 and isJuggernautWReadyForAutocast) then
                return caster._autoCastJuggernautW
            end
        end
    end

    -- Q Q Q combo
    if(yin >= 3 and isJuggernautEReadyForAutocast) then
        return caster._autoCastJuggernautE
    else
        if(yin < 3 and isJuggernautQReadyForAutocast) then
            return caster._autoCastJuggernautQ
        end
    end

    return nil
end

-- Riki: Q W spam
function modifier_auto_casts:GetNextAbilityForRikiAutoCasts(caster, ability, target)
    if(caster._autoCastRikiQ == nil) then
        caster._autoCastRikiQ = caster:FindAbilityByName("hawk1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastRikiQ)
    end
    if(caster._autoCastRikiW == nil) then
        caster._autoCastRikiW = caster:FindAbilityByName("hawk2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastRikiW)
    end
    
	if(ability == caster._autoCastRikiW or ability == caster._autoCastRikiW) then
		local focusPoints = caster:GetModifierStackCount("modifier_combopoint", nil)
		
		if(self:IsAbilityReadyForAutoCast(caster._autoCastRikiW) and focusPoints >= 3) then
		    return caster._autoCastRikiW
		end
		
		if(self:IsAbilityReadyForAutoCast(caster._autoCastRikiQ)) then
		    return caster._autoCastRikiQ
		end
	end
		
    return nil
end

-- Bounty Hunter: Q W E spam
function modifier_auto_casts:GetNextAbilityForBountyHunterAutoCasts(caster, ability, target)
    if(caster._autoCastBountyHunterQ == nil) then
        caster._autoCastBountyHunterQ = caster:FindAbilityByName("combat1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBountyHunterQ)
    end
    if(caster._autoCastBountyHunterW == nil) then
        caster._autoCastBountyHunterW = caster:FindAbilityByName("combat3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBountyHunterW)
    end
    if(caster._autoCastBountyHunterE == nil) then
        caster._autoCastBountyHunterE = caster:FindAbilityByName("combat2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBountyHunterE)
    end
	
	if(ability == caster._autoCastBountyHunterQ or ability == caster._autoCastBountyHunterW or ability == caster._autoCastBountyHunterE) then
        local isQReady = self:IsAbilityReadyForAutoCast(caster._autoCastBountyHunterQ)
        local isWReady = self:IsAbilityReadyForAutoCast(caster._autoCastBountyHunterW)
        local isEReady = self:IsAbilityReadyForAutoCast(caster._autoCastBountyHunterE)
                
        if(isWReady and caster:GetModifierStackCount("modifier_combopoint", nil) >= 3) then
        	return caster._autoCastBountyHunterW
        end
		
        if(isEReady) then
        	return caster._autoCastBountyHunterE
        end
		
        if(isQReady) then
        	return caster._autoCastBountyHunterQ
        end
	end

    return nil
end

-- Windrunner: Q W R spam
function modifier_auto_casts:GetNextAbilityForWindRunnerAutoCasts(caster, ability, target)
    if(caster._autoCastWindrunnerQ == nil) then
        caster._autoCastWindrunnerQ = caster:FindAbilityByName("wind1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWindrunnerQ)
    end
    if(caster._autoCastWindrunnerW == nil) then
        caster._autoCastWindrunnerW = caster:FindAbilityByName("wind2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWindrunnerW)
    end
    if(caster._autoCastWindrunnerR == nil) then
        caster._autoCastWindrunnerR = caster:FindAbilityByName("wind7")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWindrunnerR)
    end

	if(ability == caster._autoCastWindrunnerQ or ability == caster._autoCastWindrunnerW or ability == caster._autoCastWindrunnerR) then
		local isQReady = self:IsAbilityReadyForAutoCast(caster._autoCastWindrunnerQ)
		local isWReady = self:IsAbilityReadyForAutoCast(caster._autoCastWindrunnerW)
		local isRReady = self:IsAbilityReadyForAutoCast(caster._autoCastWindrunnerR)
		
		-- If fire arrow learned try smart use lock and reload stacks
		local fireArrowLevel = caster._autoCastWindrunnerW:GetLevel()
		if(fireArrowLevel > 0) then
		    if(isRReady and caster:GetModifierStackCount("modifier_lockreload", nil) >= 10) then
		        return caster._autoCastWindrunnerR
		    end
		
		    -- Try consider fire arrow buff
		    if(fireArrowLevel >= 3) then
		        local fireArrowBuffModifier = caster:FindModifierByName("modifier_fire_shots_jungle")
		        local isFireArrowBuffModifierAlmostEnded = fireArrowBuffModifier and fireArrowBuffModifier:GetRemainingTime() / fireArrowBuffModifier:GetDuration() < 0.5 or false
		
		        if(fireArrowBuffModifier == nil) then
		            if(isWReady) then
		                return caster._autoCastWindrunnerW
		            end
		        else
		            if(isWReady and isFireArrowBuffModifierAlmostEnded) then
		                return caster._autoCastWindrunnerW
		            end
		        end
		    else
		        if(isWReady) then
		            return caster._autoCastWindrunnerW
		        end
		    end
		else
		    if(isRReady) then
		        return caster._autoCastWindrunnerR
		    end
		
		    if(isWReady) then
		        return caster._autoCastWindrunnerW
		    end
		end
		
		if(isQReady) then
		    return caster._autoCastWindrunnerQ
		end
	end
	    
    return nil
end

-- Bloodseeker: Q W E D spam
function modifier_auto_casts:GetNextAbilityForBloodseekerAutoCasts(caster, ability, target)
    if(caster._autoCastBloodseekerQ == nil) then
        caster._autoCastBloodseekerQ = caster:FindAbilityByName("Ghost1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBloodseekerQ)
    end
    if(caster._autoCastBloodseekerW == nil) then
        caster._autoCastBloodseekerW = caster:FindAbilityByName("Ghost2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBloodseekerW)
    end
    if(caster._autoCastBloodseekerE == nil) then
        caster._autoCastBloodseekerE = caster:FindAbilityByName("Ghost3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBloodseekerE)
    end
    if(caster._autoCastBloodseekerD == nil) then
        caster._autoCastBloodseekerD = caster:FindAbilityByName("Ghost5")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBloodseekerD)
    end
	
	if(ability == caster._autoCastBloodseekerQ or ability == caster._autoCastBloodseekerW or ability == caster._autoCastBloodseekerE or ability == caster._autoCastBloodseekerD) then
        if(self:IsAbilityReadyForAutoCast(caster._autoCastBloodseekerD) and caster:GetModifierStackCount("modifier_elementalfury", nil) >= 10) then
            return caster._autoCastBloodseekerD
        end
        
        if(self:IsAbilityReadyForAutoCast(caster._autoCastBloodseekerQ)) then
            return caster._autoCastBloodseekerQ
        end
        
        if(self:IsAbilityReadyForAutoCast(caster._autoCastBloodseekerW)) then
            return caster._autoCastBloodseekerW
        end
        
        if(self:IsAbilityReadyForAutoCast(caster._autoCastBloodseekerE)) then
            return caster._autoCastBloodseekerE
        end
	end
	
    return nil
end

-- Drow Ranger: Q E D spam
function modifier_auto_casts:GetNextAbilityForDrowRangerAutoCasts(caster, ability, target)
    if(caster._autoCastDrowRangerQ == nil) then
        caster._autoCastDrowRangerQ = caster:FindAbilityByName("Focussed_Shot")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDrowRangerQ)
    end
    if(caster._autoCastDrowRangerE == nil) then
        caster._autoCastDrowRangerE = caster:FindAbilityByName("Inspiring_Shot")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDrowRangerE)
    end
    if(caster._autoCastDrowRangerD == nil) then
        caster._autoCastDrowRangerD = caster:FindAbilityByName("Mindfreezing_Shot")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDrowRangerD)
    end
	
    if(ability == caster._autoCastDrowRangerQ or ability == caster._autoCastDrowRangerE or ability == caster._autoCastDrowRangerD) then
		local isQReady = self:IsAbilityReadyForAutoCast(caster._autoCastDrowRangerQ)
		local isEReady = self:IsAbilityReadyForAutoCast(caster._autoCastDrowRangerE)
		local isDReady = self:IsAbilityReadyForAutoCast(caster._autoCastDrowRangerD)
		
		if(isDReady) then
			return caster._autoCastDrowRangerD
		end
		
		if(isQReady) then
			return caster._autoCastDrowRangerQ
		end
		
		if(isEReady) then
			return caster._autoCastDrowRangerE
		end
    end
	
    return nil
end

-- Dazzle: W Q E spam
function modifier_auto_casts:GetNextAbilityForDazzleAutoCasts(caster, ability, target)
    if(caster._autoCastDazzleQ == nil) then
        caster._autoCastDazzleQ = caster:FindAbilityByName("Feral2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDazzleQ)
    end
    if(caster._autoCastDazzleW == nil) then
        caster._autoCastDazzleW = caster:FindAbilityByName("Feral3")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDazzleW)
    end
    if(caster._autoCastDazzleE == nil) then
        caster._autoCastDazzleE = caster:FindAbilityByName("Feral4")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDazzleE)
    end
    
    if(ability == caster._autoCastDazzleQ or ability == caster._autoCastDazzleW or ability == caster._autoCastDazzleE) then
		local isQReady = self:IsAbilityReadyForAutoCast(caster._autoCastDazzleQ)
		local isWReady = self:IsAbilityReadyForAutoCast(caster._autoCastDazzleW)
		local isEReady = self:IsAbilityReadyForAutoCast(caster._autoCastDazzleE)
		
		local focusPoints = caster:GetModifierStackCount("modifier_combopoint", nil)
	
		if(isWReady and focusPoints >= 4) then
			local tigerFuryBuffModifier = caster:FindModifierByName("modifier_tigerfury")
			
			if(tigerFuryBuffModifier == nil) then
				return caster._autoCastDazzleW
			else
				local isTigerFuryBuffModifierAlmostEnded = tigerFuryBuffModifier:GetRemainingTime() / tigerFuryBuffModifier:GetDuration() < 0.5 
				
				if(isTigerFuryBuffModifierAlmostEnded) then
					return caster._autoCastDazzleW
				end
			end
		end
		
		if(isQReady and focusPoints < 4) then
			return caster._autoCastDazzleQ
		end
		
		if(isEReady and focusPoints >= 4) then
			return caster._autoCastDazzleE
		end
    end
	    
    return nil
end

-- Venge: Q spam, TODO: Make it smarter...
function modifier_auto_casts:GetNextAbilityForVengefulSpiritAutoCasts(caster, ability, target)
    if(caster._autoCastVengefulSpiritMoonQ == nil) then
        caster._autoCastVengefulSpiritMoonQ = caster:FindAbilityByName("moon11")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastVengefulSpiritMoonQ)
    end
    if(caster._autoCastVengefulSpiritSunQ == nil) then
        caster._autoCastVengefulSpiritSunQ = caster:FindAbilityByName("moon1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastVengefulSpiritSunQ)
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastVengefulSpiritMoonQ)) then
        return caster._autoCastVengefulSpiritMoonQ
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastVengefulSpiritSunQ)) then
        return caster._autoCastVengefulSpiritSunQ
    end

    return nil
end

-- Sven: Q W spam
function modifier_auto_casts:GetNextAbilityForSvenAutoCasts(caster, ability, target)
    if(caster._autoCastSvenQ == nil) then
        caster._autoCastSvenQ = caster:FindAbilityByName("frostdk1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastSvenQ)
    end
    if(caster._autoCastSvenW == nil) then
        caster._autoCastSvenW = caster:FindAbilityByName("frostdk2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastSvenW)
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastSvenW)) then
        return caster._autoCastSvenW
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastSvenQ)) then
        return caster._autoCastSvenQ
    end

    return nil
end

-- Axe: Q W spam
function modifier_auto_casts:GetNextAbilityForAxeAutoCasts(caster, ability, target)
    if(caster._autoCastAxeQ == nil) then
        caster._autoCastAxeQ = caster:FindAbilityByName("Wounding_Strike")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastAxeQ)
    end
    if(caster._autoCastAxeW == nil) then
        caster._autoCastAxeW = caster:FindAbilityByName("Mortal_Swing")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastAxeW)
    end

    if(target == nil) then
		return
    end
	
	if(self:IsAbilityReadyForAutoCast(caster._autoCastAxeQ) and target:HasModifier("modifier_wounding_strike_bleed_debuff") == false) then
		return caster._autoCastAxeQ
	end
		
    if(self:IsAbilityReadyForAutoCast(caster._autoCastAxeW)) then
        if(self:IsInternalTimerReady(0.05) == false) then
        	return nil
        end
        
        local casterPosition = caster:GetAbsOrigin()
        local enemiesAround = FindNearbyEnemies(caster, casterPosition, caster._autoCastAxeW:GetSpecialValueFor("radius"))

        if(#enemiesAround > 0) then
            return caster._autoCastAxeW
        end

        return nil
    end

    return nil
end

-- Legion Commander: Q W spam
function modifier_auto_casts:GetNextAbilityForLegionCommanderAutoCasts(caster, ability, target)
    if(caster._autoCastLegionCommanderQ == nil) then
        caster._autoCastLegionCommanderQ = caster:FindAbilityByName("Retri1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLegionCommanderQ)
    end
    if(caster._autoCastLegionCommanderW == nil) then
        caster._autoCastLegionCommanderW = caster:FindAbilityByName("Retri2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastLegionCommanderW)
    end
    if(caster._autoCastLegionCommanderD == nil) then
        caster._autoCastLegionCommanderD = caster:FindAbilityByName("Retri4")
        --self:DetermineAutoCastBehaviorForAbility(caster._autoCastLegionCommanderD)
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastLegionCommanderW)) then
        return caster._autoCastLegionCommanderW
    end
	
	if(self:IsAbilityReadyForAutoCast(caster._autoCastLegionCommanderQ)) then
        -- Always spam when possible and required for cdr
        if(caster._autoCastLegionCommanderD:GetCooldownTimeRemaining() > 1) then
            return caster._autoCastLegionCommanderQ
        end
		
        -- Spam only when enemies around
        if(self:IsAbilityReadyForAutoCast(caster._autoCastLegionCommanderQ)) then
            if(self:IsInternalTimerReady(0.05) == false) then
            	return nil
            end
            
            local casterPosition = caster:GetAbsOrigin()
            local enemiesAround = FindNearbyEnemies(caster, casterPosition, caster._autoCastLegionCommanderQ:GetSpecialValueFor("range"))
            if(#enemiesAround > 0) then
                return caster._autoCastLegionCommanderQ
            end
            
            return nil
        end
	end

    return nil
end

-- Beastmaster: Q D spam
function modifier_auto_casts:GetNextAbilityForBeastmasterAutoCasts(caster, ability, target)
    if(caster._autoCastBeastmasterQ == nil) then
        caster._autoCastBeastmasterQ = caster:FindAbilityByName("fury1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBeastmasterQ)
    end
    if(caster._autoCastBeastmasterD == nil) then
        caster._autoCastBeastmasterD = caster:FindAbilityByName("fury4")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBeastmasterD)
    end

    if(target == nil) then
    	return nil
    end

    -- Bonus Q W E damage based on current rage/mana with Q5. Maintain 40 rage for rest abilities usage
    local slaughterRageCost = caster._autoCastBeastmasterD:GetManaCost(-1)
    local minRageToMaintain = caster._autoCastBeastmasterQ:GetLevel() >= 5 and (caster:GetMaxMana() - slaughterRageCost) or 40
    local currentRage = caster:GetMana()

    if(self:IsAbilityReadyForAutoCast(caster._autoCastBeastmasterD) and currentRage >= minRageToMaintain) then
        if(caster._autoCastBeastmasterD:GetLevel() >= 4) then
            if(target:GetHealth() / target:GetMaxHealth() > 0.5) then
                if(caster:GetMana() >= 40 + slaughterRageCost) then
                    -- Bonus D damage when D used on enemies above 50% max health with at least 40 rage
                    return caster._autoCastBeastmasterD
                else
                    return nil
                end
            else
                -- Bonus damage can't be used anymore, spam D when possible
                return caster._autoCastBeastmasterD
            end
        else
            -- Spam D when possible
            return caster._autoCastBeastmasterD
        end
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastBeastmasterQ)) then
        return caster._autoCastBeastmasterQ
    end

    return nil
end

-- Ursa: Q spam
function modifier_auto_casts:GetNextAbilityForUrsaAutoCasts(caster, ability, target)
    if(caster._autoCastBearQ == nil) then
        caster._autoCastBearQ = caster:FindAbilityByName("bear1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBearQ)
    end

    if(ability == caster._autoCastBearQ and self:IsAbilityReadyForAutoCast(caster._autoCastBearQ)) then
        return caster._autoCastBearQ
    end

    return nil
end

-- Pudge: Q W spam
function modifier_auto_casts:GetNextAbilityForPudgeAutoCasts(caster, ability, target)
    if(caster._autoCastPudgeQ == nil) then
        caster._autoCastPudgeQ = caster:FindAbilityByName("unholy_1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPudgeQ)
    end
    if(caster._autoCastPudgeW == nil) then
        caster._autoCastPudgeW = caster:FindAbilityByName("unholy_2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPudgeW)
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastPudgeW)) then
        return caster._autoCastPudgeW
    end

    if(self:IsAbilityReadyForAutoCast(caster._autoCastPudgeQ)) then
        return caster._autoCastPudgeQ
    end

    return nil
end

-- Wraith King: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForWraithKingAutoCasts(caster, ability, target)
    if(caster._autoCastWraithKingQ == nil) then
        caster._autoCastWraithKingQ = caster:FindAbilityByName("Corrupting_Strike")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastWraithKingQ)
    end

    if(ability == caster._autoCastWraithKingQ and self:IsAbilityReadyForAutoCast(caster._autoCastWraithKingQ)) then
        return caster._autoCastWraithKingQ
    end

    return nil
end

-- Mars: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForMarsAutoCasts(caster, ability, target)
    if(caster._autoCastMarsQ == nil) then
        caster._autoCastMarsQ = caster:FindAbilityByName("mars1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastMarsQ)
    end

    if(ability == caster._autoCastMarsQ and self:IsAbilityReadyForAutoCast(caster._autoCastMarsQ)) then
        return caster._autoCastMarsQ
    end

    return nil
end

-- Dragon Knight: Q W spam
function modifier_auto_casts:GetNextAbilityForDragonKnightAutoCasts(caster, ability, target)
    if(caster._autoCastDragonKnightQ == nil) then
        caster._autoCastDragonKnightQ = caster:FindAbilityByName("Protect1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDragonKnightQ)
    end
	
    if(caster._autoCastDragonKnightW == nil) then
        caster._autoCastDragonKnightW = caster:FindAbilityByName("Protect2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastDragonKnightW)
    end
	
	--print("self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightW)", self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightW))
	--print("self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightQ)", self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightQ))
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightW)) then
        return caster._autoCastDragonKnightW
    end
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastDragonKnightQ)) then
        return caster._autoCastDragonKnightQ
    end

    return nil
end

-- Phantom Lancer: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForPhantomLancerAutoCasts(caster, ability, target)
    if(caster._autoCastPhantomLancerQ == nil) then
        caster._autoCastPhantomLancerQ = caster:FindAbilityByName("pala1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastPhantomLancerQ)
    end

    if(ability == caster._autoCastPhantomLancerQ and self:IsAbilityReadyForAutoCast(caster._autoCastPhantomLancerQ)) then
        return caster._autoCastPhantomLancerQ
    end

    return nil
end

-- Terrorblade: Q W spam
function modifier_auto_casts:GetNextAbilityForTerrorbladeAutoCasts(caster, ability, target)
    if(caster._autoCastTerrorbladeQ == nil) then
        caster._autoCastTerrorbladeQ = caster:FindAbilityByName("terror1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastTerrorbladeQ)
    end
	
    if(caster._autoCastTerrorbladeW == nil) then
        caster._autoCastTerrorbladeW = caster:FindAbilityByName("terror2")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastTerrorbladeW)
    end
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastTerrorbladeW)) then
        return caster._autoCastTerrorbladeW
    end
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastTerrorbladeQ)) then
        return caster._autoCastTerrorbladeQ
    end
	
    return nil
end

-- Antimage: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForAntimageAutoCasts(caster, ability, target)
    if(caster._autoCastAntimageQ == nil) then
        caster._autoCastAntimageQ = caster:FindAbilityByName("dh1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastAntimageQ)
    end
	
    if(ability == caster._autoCastAntimageQ and self:IsAbilityReadyForAutoCast(caster._autoCastAntimageQ)) then
        return caster._autoCastAntimageQ
    end
	
    return nil
end

-- Brewmaster: Q spam, TODO: Something smarter?
function modifier_auto_casts:GetNextAbilityForBrewmasterAutoCasts(caster, ability, target)
    if(caster._autoCastBrewmasterQ == nil) then
        caster._autoCastBrewmasterQ = caster:FindAbilityByName("brew1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastBrewmasterQ)
    end
	
    if(ability == caster._autoCastBrewmasterQ and self:IsAbilityReadyForAutoCast(caster._autoCastBrewmasterQ)) then
        return caster._autoCastBrewmasterQ
    end
	
    return nil
end

-- Sniper: Q W spam
function modifier_auto_casts:GetNextAbilityForSniperAutoCasts(caster, ability, target)
    if(caster._autoCastSniperQ == nil) then
        caster._autoCastSniperQ = caster:FindAbilityByName("beast1")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastSniperQ)
    end
	
    if(caster._autoCastSniperW == nil) then
        caster._autoCastSniperW = caster:FindAbilityByName("Hunter_Assassinate")
        self:DetermineAutoCastBehaviorForAbility(caster._autoCastSniperW)
    end
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastSniperQ)) then
        return caster._autoCastSniperQ
    end
	
    if(self:IsAbilityReadyForAutoCast(caster._autoCastSniperW)) then
        return caster._autoCastSniperW
    end
	
    return nil
end

