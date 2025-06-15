item_neutral_base_custom = class({})

function item_neutral_base_custom:OnSpellStart()
    self:GetActiveNeutralItemName()
end

function item_neutral_base_custom:GetActiveNeutralItemName()
    local activeNeutralItemName = self:GetAbilityName():gsub("item_neutral", "item_neutral_active")
    print(activeNeutralItemName)
end

for i=1,40 do 
    _G["item_neutral_"..tostring(i)] = class(item_neutral_base_custom)
    _G["item_neutral_active"..tostring(i)] = class(item_neutral_base_custom)
end